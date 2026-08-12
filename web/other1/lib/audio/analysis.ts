// ─────────────────────────────────────────────────────────────────────────────
// AUDIO DISSECTION — turns any imported audio (wav/mp3/ogg/m4a via the browser
// decoder) into the signed vector-one/timeline JSON: per-second frames with
// onsets, dominant pitch (hz + MIDI + name), velocity (RMS), chroma, spectral
// descriptors, and 32-dim embedding vectors per second and for the whole file.
// Runs 100% locally in the browser. Meyda enriches frames with MFCC when the
// signal buffers allow; every failure path degrades gracefully.
// ─────────────────────────────────────────────────────────────────────────────

import Meyda from "meyda";
import {
  FFT_SIZE,
  HOP,
  bandEnergies,
  chroma,
  detectPitch,
  midiToNoteName,
  normalizeEmbedding,
  rms,
  spectralCentroid,
  spectralFlatness,
  spectralFlux,
  spectralRolloff,
  spectrum,
  zeroCrossingRate,
} from "@/lib/audio/dsp";
import { embedFrame, embedSong, type FrameFeatures } from "@/lib/audio/embedding";
import { TimelineSchema, type FrameEvent, type Timeline, type TimelineFrame } from "@/lib/audio/schema";

export function mixDown(buffer: AudioBuffer): Float32Array {
  const len = buffer.length;
  const out = new Float32Array(len);
  const chs = buffer.numberOfChannels;
  for (let c = 0; c < chs; c++) {
    const data = buffer.getChannelData(c);
    const g = 1 / chs;
    for (let i = 0; i < len; i++) out[i] += data[i] * g;
  }
  return out;
}

/** Onset-per-second density → crude BPM estimate via interval histogram. */
function estimateBpm(onsets: { t: number; s: number }[]): number {
  if (onsets.length < 4) return 120;
  const ioi: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    const d = onsets[i].t - onsets[i - 1].t;
    if (d > 0.12 && d < 1.2) ioi.push(d);
  }
  if (ioi.length < 3) return 120;
  ioi.sort((a, b) => a - b);
  const median = ioi[Math.floor(ioi.length / 2)];
  let bpm = 60 / median;
  while (bpm < 80) bpm *= 2;
  while (bpm > 190) bpm /= 2;
  return Math.round(bpm);
}

export async function analyzeAudioBuffer(buffer: AudioBuffer): Promise<Timeline> {
  const sr = buffer.sampleRate;
  const mono = mixDown(buffer);
  const seconds = buffer.duration;
  const totalSeconds = Math.max(1, Math.ceil(seconds));

  // global hop passes: onset detection across the whole file
  const globalOnsets: { t: number; s: number }[] = [];
  let prevSpec: Float32Array | null = null;
  let fluxAvg = 0;
  let fluxCount = 0;
  const hopFrames = Math.floor(mono.length / HOP);
  const fluxSeries = new Float32Array(hopFrames);
  for (let h = 0; h < hopFrames; h++) {
    const frame = mono.subarray(h * HOP, h * HOP + FFT_SIZE);
    const newFrame = frame.length < FFT_SIZE ? pad(frame) : frame;
    const spec = spectrum(newFrame as Float32Array);
    const flux = spectralFlux(prevSpec, spec);
    fluxSeries[h] = flux;
    fluxAvg += flux;
    fluxCount++;
    prevSpec = spec;
  }
  fluxAvg = fluxCount ? fluxAvg / fluxCount : 0;
  // adaptive peak picking
  for (let h = 1; h < hopFrames - 1; h++) {
    if (fluxSeries[h] > fluxAvg * 1.8 && fluxSeries[h] > 0.004 && fluxSeries[h] >= fluxSeries[h - 1] && fluxSeries[h] >= fluxSeries[h + 1]) {
      const t = (h * HOP) / sr;
      const last = globalOnsets[globalOnsets.length - 1];
      if (!last || t - last.t > 0.05) globalOnsets.push({ t, s: fluxSeries[h] });
    }
  }
  const bpm = estimateBpm(globalOnsets);

  const frames: TimelineFrame[] = [];

  for (let s = 0; s < totalSeconds; s++) {
    const start = Math.floor(s * sr);
    const end = Math.min(mono.length, Math.floor((s + 1) * sr));
    const cell = mono.subarray(start, end);
    if (cell.length < 64) break;

    // aggregate sub-frames inside the second
    let cRms = 0;
    let cCentroid = 0;
    let cZcr = 0;
    let cFlat = 0;
    let cRolloff = 0;
    let chromaAcc = new Array<number>(12).fill(0);
    let bands: [number, number, number] = [0, 0, 0];
    let mfccAcc: number[] | null = null;
    let sub = 0;
    let pitchHz: number | null = null;
    let bestPitchRms = 0;

    const subCount = Math.max(1, Math.floor(cell.length / FFT_SIZE));
    for (let i = 0; i < subCount; i++) {
      const raw = cell.subarray(i * FFT_SIZE, (i + 1) * FFT_SIZE);
      const frame = raw.length < FFT_SIZE ? pad(raw) : raw;
      const fr = frame as Float32Array;
      const spec = spectrum(fr);
      const level = rms(fr);
      cRms += level;
      cCentroid += spectralCentroid(spec, sr);
      cZcr += zeroCrossingRate(fr);
      cFlat += spectralFlatness(spec);
      cRolloff += spectralRolloff(spec, sr);
      const ch = chroma(spec, sr);
      chromaAcc = chromaAcc.map((x, k) => x + ch[k]);
      const b = bandEnergies(spec, sr);
      bands = [bands[0] + b[0], bands[1] + b[1], bands[2] + b[2]];
      sub++;

      const p = detectPitch(fr, sr);
      if (p && level > bestPitchRms) {
        bestPitchRms = level;
        pitchHz = p;
      }

      // Meyda MFCC enrichment (best-effort, degrades silently)
      if (fr.length >= 512) {
        try {
          const feats = Meyda.extract(["mfcc"], fr);
          const mfcc = feats?.mfcc as number[] | undefined;
          if (Array.isArray(mfcc)) {
            if (!mfccAcc) mfccAcc = new Array(mfcc.length).fill(0);
            mfcc.forEach((m, k) => (mfccAcc![k] += m));
          }
        } catch {
          mfccAcc = mfccAcc ?? null;
        }
      }
    }

    const n = Math.max(1, sub);
    cRms /= n;
    cCentroid /= n;
    cZcr /= n;
    cFlat /= n;
    cRolloff /= n;
    bands = [bands[0] / n, bands[1] / n, bands[2] / n];
    const chSum = chromaAcc.reduce((a, b) => a + b, 0) || 1;
    chromaAcc = chromaAcc.map((x) => x / chSum);

    // onsets inside this second
    const cellOnsets = globalOnsets.filter((o) => o.t >= s && o.t < s + 1);
    const onsetStrength = cellOnsets.reduce((a, o) => a + o.s, 0) / Math.max(1, cellOnsets.length);

    const events: FrameEvent[] = [];
    for (const o of cellOnsets) {
      // classify by band energy: low→kick, mid→snare/melodic, high→hat
      const localStart = Math.max(0, Math.floor((o.t - s) * sr) - 256);
      const local = cell.subarray(localStart, Math.min(cell.length, localStart + FFT_SIZE));
      const lspec = local.length >= 512 ? spectrum(pad(local) as Float32Array) : null;
      const lb = lspec ? bandEnergies(lspec, sr) : bands;
      const isKick = lb[0] > 0.62;
      const isHat = lb[2] > 0.5 && lb[0] < 0.4;
      events.push({
        kind: "transient",
        note: isKick ? "kick" : isHat ? "hat" : "hit",
        onset: round4(o.t - s),
        velocity: round4(Math.min(1, o.s * 8 + cRms * 1.6)),
        confidence: round4(Math.min(1, o.s / Math.max(1e-9, fluxAvg * 2))),
      });
    }
    if (pitchHz) {
      const midi = 69 + 12 * Math.log2(pitchHz / 440);
      events.push({
        kind: "note",
        note: midiToNoteName(midi),
        pitch: round4(midi),
        hz: round4(pitchHz),
        onset: 0,
        velocity: round4(Math.min(1, bestPitchRms * 2.6)),
        confidence: round4(Math.min(1, 0.55 + cRms * 1.5)),
      });
    }

    const feats: FrameFeatures = {
      rms: Math.min(1, cRms * 1.6),
      centroid: cCentroid,
      rolloff: cRolloff,
      flatness: cFlat,
      zcr: cZcr,
      flux: fluxAvg,
      onsetCount: cellOnsets.length,
      onsetStrength: Number.isFinite(onsetStrength) ? onsetStrength : 0,
      pitch: pitchHz,
      chroma: chromaAcc,
      bands,
      bpm,
    };
    let embedding = embedFrame(feats);
    // fold 4 MFCC bands into unused dynamics/register residual slots when present
    if (mfccAcc) {
      const m = mfccAcc.map((x) => x / n);
      const squeeze = (x: number) => Math.min(1, Math.abs(x) / 400);
      embedding[25] = normalizeEmbedding([squeeze(m[1] ?? 0)])[0];
    }

    const tags: string[] = [];
    if (cellOnsets.length >= 3) tags.push("ritmico");
    if (pitchHz) tags.push("melodico");
    if (bands[0] > 0.5) tags.push("grave");
    if (cRms > 0.2) tags.push("energico");

    frames.push({
      s,
      rms: round4(cRms),
      centroid: Math.round(cCentroid),
      flux: round4(fluxAvg),
      chroma: chromaAcc.map(round4),
      embedding: embedding.map(round4),
      events,
      tags,
    });
  }

  const timeline: Timeline = {
    schema: "vector-one/timeline@5.0",
    source: "import",
    bpm,
    seconds: round4(seconds),
    embedding: embedSong(frames.map((f) => f.embedding), bpm, seconds).map(round4),
    frames,
  };
  // sign the document: throws if anything drifted out of contract
  return TimelineSchema.parse(timeline);
}

function pad(frame: Float32Array | Float32Array<ArrayBufferLike>): Float32Array {
  if (frame.length >= FFT_SIZE) return frame as Float32Array;
  const out = new Float32Array(FFT_SIZE);
  out.set(frame);
  return out;
}

function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}
