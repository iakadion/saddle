/**
 * EMBEDDING BUILDERS — symbolic projects and imported-audio frames live in the
 * same 32-dim vector space (layout documented in dsp.ts), enabling cosine
 * similarity between what users compose and what they import.
 *
 * Also hosts `timelineToProject`, the audio→project template converter with
 * key detection, scale quantization and register folding (no out-of-tune
 * transcriptions), mapping the FULL length of the source — never truncated.
 * @module lib/audio/embedding
 */

import type { ProjectDoc } from "@/lib/audio/schema";
import { meanEmbedding, normalizeEmbedding, zeroEmbedding } from "@/lib/audio/dsp";

function stats(values: number[]): { mean: number; std: number; min: number; max: number } {
  if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length;
  return { mean, std: Math.sqrt(variance), min: Math.min(...values), max: Math.max(...values) };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Symbolic score → 32-dim vector. Deterministic: same score ⇒ same vector. */
export function embedProject(doc: ProjectDoc): number[] {
  const v = zeroEmbedding();
  const totalSteps = Math.max(1, doc.bars * 16);

  let chromaSum = 0;
  for (const n of doc.notes) {
    const pc = ((Math.round(n.pitch) % 12) + 12) % 12;
    v[pc] += n.vel * Math.min(4, n.dur);
    chromaSum += n.vel * Math.min(4, n.dur);
  }
  for (let i = 0; i < 12; i++) v[i] = chromaSum > 0 ? v[i] / chromaSum : 0;

  const lead = doc.notes.filter((n) => n.voice === "lead");
  const bass = doc.notes.filter((n) => n.voice === "bass");
  const pad = doc.notes.filter((n) => n.voice === "pad");
  const hatDensity = doc.drums.hat.reduce((a, b) => a + b, 0) / 16;
  const drumDensity = (doc.drums.kick.reduce((a, b) => a + b, 0) + doc.drums.snare.reduce((a, b) => a + b, 0) + doc.drums.hat.reduce((a, b) => a + b, 0) + doc.drums.clap.reduce((a, b) => a + b, 0)) / 64;

  v[12] = lead.length ? stats(lead.map((n) => n.pitch)).mean / 127 : 0;
  v[13] = Math.min(1, hatDensity * 1.6);
  v[14] = 1 - Math.min(1, (pad.length / totalSteps) * 8);
  v[15] = hatDensity;

  const noteDensity = lead.length / totalSteps;
  const offbeats = lead.filter((n) => n.step % 2 === 1).length;
  v[16] = Math.min(1, noteDensity * 1.8);
  v[17] = drumDensity;
  v[18] = stats(lead.map((n) => n.dur)).mean / 8;
  v[19] = lead.length > 1 ? offbeats / lead.length : 0;

  const vs = stats(doc.notes.map((n) => n.vel));
  v[20] = vs.mean;
  v[21] = vs.std * 2;
  v[22] = vs.mean;
  v[23] = vs.std * 2;

  const ps = stats(lead.map((n) => n.pitch));
  v[24] = ps.mean / 127;
  v[25] = ps.std / 48;
  v[26] = lead.length ? ps.min / 127 : 0;
  v[27] = lead.length ? ps.max / 127 : 0;

  v[28] = doc.bpm / 220;
  v[29] = Math.min(1, Math.log10(doc.notes.length + 1) / 2.5);
  v[30] = bass.length / totalSteps;
  v[31] = hatDensity;

  return normalizeEmbedding(v);
}

/** Acoustic features of one analyzed second. */
export interface FrameFeatures {
  rms: number;
  centroid: number;
  rolloff: number;
  flatness: number;
  zcr: number;
  flux: number;
  onsetCount: number;
  onsetStrength: number;
  pitch: number | null;
  chroma: number[];
  bands: [number, number, number];
  bpm?: number;
}

/** One second of real audio → same 32-dim layout as symbolic docs. */
export function embedFrame(f: FrameFeatures): number[] {
  const v = zeroEmbedding();
  for (let i = 0; i < 12; i++) v[i] = f.chroma[i] ?? 0;
  v[12] = Math.min(1, f.centroid / 8000);
  v[13] = Math.min(1, f.rolloff / 12000);
  v[14] = Math.min(1, f.flatness * 2);
  v[15] = Math.min(1, f.zcr * 8);
  v[16] = Math.min(1, f.onsetCount / 3);
  v[17] = Math.min(1, f.onsetStrength * 4);
  v[18] = 0.3;
  v[19] = Math.min(1, f.flux * 6);
  v[20] = Math.min(1, f.rms * 2.4);
  v[21] = 0.15;
  v[22] = v[20];
  v[23] = 0.15;
  if (f.pitch && f.pitch > 0) {
    const midi = 69 + 12 * Math.log2(f.pitch / 440);
    v[24] = Math.min(1, Math.max(0, midi / 127));
    v[25] = 0.1;
    v[26] = v[24];
    v[27] = v[24];
  }
  v[28] = (f.bpm ?? 120) / 220;
  v[29] = 0.4;
  v[30] = f.bands[0];
  v[31] = f.bands[2];
  return normalizeEmbedding(v);
}

/** Song-level embedding: mean over frames with spread + duration folded in. */
export function embedSong(frames: number[][], bpm: number, seconds: number): number[] {
  const mean = meanEmbedding(frames);
  if (frames.length > 1) {
    const s = stats(frames.map((f) => f[20] ?? 0));
    mean[21] = s.std * 2;
    mean[23] = s.std * 2;
  }
  mean[28] = bpm / 220;
  mean[29] = Math.min(1, Math.log10(seconds + 1) / 2);
  return normalizeEmbedding(mean);
}

// ── audio → template (key-aware, pitch-stable, full length) ─────────────────

export interface TimelineFrameLite {
  s: number;
  rms: number;
  pitch: number | null; // dominant Hz for this second
  bassHit: boolean;
  snareHit: boolean;
  hatHit: boolean;
}

const SCALE_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const SCALE_MINOR = [0, 2, 3, 5, 7, 8, 10];

/**
 * Converts a dissected audio timeline into a playable, in-tune ProjectDoc:
 *
 * 1. Key detection from the 12-dim chroma profile (major vs minor thirds).
 * 2. Dominant pitch per second → median-smoothed (3-window) → **quantized to
 *    the detected scale** → folded into the C3–C5 register (kills octave
 *    jumps / out-of-tune transcriptions).
 * 3. Consecutive identical pitches merge into longer notes (musical phrasing
 *    instead of machine-gun 16ths); max 1 lead note per step.
 * 4. Percussion onsets are *learned* into the 16-step groove loop by
 *    probability threshold (bassHit→kick, snareHit→snare, hatHit→hat).
 * 5. FULL LENGTH: bars scale with source duration (up to 96 bars) — nothing
 *    is truncated or folded into 2 bars anymore.
 *
 * @param frames per-second analysis rows
 * @param bpm estimated tempo
 * @param chromaProfile song-level 12-dim chroma for key detection
 */
export function timelineToProject(frames: TimelineFrameLite[], bpm: number, chromaProfile: number[]): Omit<ProjectDoc, "embedding"> & { embedding?: number[] } {
  // 1 — key detection
  const root = chromaProfile.length === 12 ? chromaProfile.indexOf(Math.max(...chromaProfile)) : 0;
  const thirdMinor = chromaProfile[(root + 3) % 12] ?? 0;
  const thirdMajor = chromaProfile[(root + 4) % 12] ?? 0;
  const scaleTones = thirdMinor > thirdMajor * 0.82 ? SCALE_MINOR : SCALE_MAJOR;
  const scaleName: ProjectDoc["scale"] = thirdMinor > thirdMajor * 0.82 ? "minor" : "major";
  const inScale = new Set(scaleTones.map((iv) => (root + iv) % 12));

  // 2 — pitch pipeline: clamp bpm sane, midi per second, median smoothing
  const tempo = Math.min(200, Math.max(70, bpm || 120));
  const stepsPerSecond = 4 * (tempo / 60);
  const seconds = frames.length;
  const totalBars = Math.min(96, Math.max(2, Math.ceil((seconds * stepsPerSecond) / 16)));
  const totalSteps = totalBars * 16;

  const rawMidis = frames.map((f) => {
    if (!f.pitch || f.pitch <= 0 || f.rms < 0.045) return null;
    return Math.round(69 + 12 * Math.log2(f.pitch / 440));
  });
  const globalMid = median(rawMidis.filter((x): x is number => x !== null));

  const quantize = (midi: number): number => {
    // fold into register around the global median, then snap to scale
    let m = midi;
    while (m > globalMid + 6) m -= 12;
    while (m < globalMid - 6) m += 12;
    m = Math.min(84, Math.max(48, m));
    if (inScale.has(((m % 12) + 12) % 12)) return m;
    // nearest scale tone within ±2 semitones
    for (const d of [1, -1, 2, -2]) {
      const cand = m + d;
      if (inScale.has(((cand % 12) + 12) % 12)) return cand;
    }
    return m;
  };

  const smoothed = rawMidis.map((m, i) => {
    if (m === null) return null;
    const win = [i - 1, i, i + 1].map((k) => rawMidis[k]).filter((x): x is number => x !== null);
    return quantize(median(win));
  });

  // 3 — notes: at most one lead per step, merge repeats
  const byStep = new Map<number, { pitch: number; vel: number }>();
  for (const f of frames) {
    const mid = smoothed[f.s];
    if (mid === null) continue;
    const step = Math.round(f.s * stepsPerSecond) % totalSteps;
    if (!byStep.has(step)) byStep.set(step, { pitch: mid, vel: Math.min(1, f.rms * 2.4 + 0.3) });
  }
  const ordered = [...byStep.entries()].sort((a, b) => a[0] - b[0]);
  const notes: { step: number; pitch: number; vel: number; dur: number; voice: "lead" | "bass" | "pad" }[] = [];
  for (const [step, n] of ordered) {
    const last = notes[notes.length - 1];
    if (last && last.voice === "lead" && last.pitch === n.pitch && last.step + last.dur === step) {
      last.dur = Math.min(8, last.dur + 1);
      last.vel = Math.max(last.vel, n.vel);
      continue;
    }
    notes.push({ step, pitch: n.pitch, vel: n.vel, dur: 1, voice: "lead" });
  }
  // bass from the tonal center every 2 bars; pads every 4 bars
  const bassMidi = Math.max(30, root + 36);
  for (let bar = 0; bar < totalBars; bar += 2) {
    notes.push({ step: (bar * 16) % totalSteps, pitch: bassMidi, vel: 0.85, dur: 8, voice: "bass" });
  }
  const padThird = inScale.has((root + 3) % 12) && thirdMinor > thirdMajor * 0.82 ? 3 : 4;
  for (let bar = 0; bar < totalBars; bar += 4) {
    notes.push({ step: (bar * 16) % totalSteps, pitch: root + 48, vel: 0.42, dur: 16, voice: "pad" });
    notes.push({ step: (bar * 16) % totalSteps, pitch: root + 48 + padThird + 12, vel: 0.38, dur: 16, voice: "pad" });
  }
  notes.sort((a, b) => a.step - b.step);

  // 4 — groove learning into the 16-step loop
  const zeros16 = (): number[] => new Array<number>(16).fill(0);
  const groove = { kick: zeros16(), snare: zeros16(), hat: zeros16(), clap: zeros16() };
  const counts = { kick: zeros16(), snare: zeros16(), hat: zeros16() };
  for (const f of frames) {
    const step = Math.round(f.s * stepsPerSecond) % 16;
    if (f.bassHit) counts.kick[step]++;
    if (f.snareHit) counts.snare[step]++;
    if (f.hatHit) counts.hat[step]++;
  }
  const sec = Math.max(1, seconds);
  for (let s = 0; s < 16; s++) {
    groove.kick[s] = counts.kick[s] / sec > 0.22 ? 1 : 0;
    groove.snare[s] = counts.snare[s] / sec > 0.22 ? 1 : 0;
    groove.hat[s] = counts.hat[s] / sec > 0.22 ? 1 : 0;
    groove.clap[s] = groove.snare[s] === 1 && counts.snare[s] / sec > 0.3 ? 1 : 0;
  }
  if (!groove.kick.includes(1)) groove.kick[0] = 1; // safety downbeat

  return {
    schema: "vector-one/project@5.0",
    bpm: tempo,
    root,
    scale: scaleName,
    bars: totalBars,
    mood: "imported",
    prompt: "importado de áudio",
    drums: groove,
    notes,
  };
}
