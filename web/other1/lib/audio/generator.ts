/**
 * AURORA COMPOSER — local generative engine.
 *
 * Songs are built the way real arrangements work: a short random seed section
 * is generated, then every subsequent section is a *variation of the previous
 * one* appended on the same timeline — exactly like pressing VARIAR between
 * chunks. Duration is user-selectable (30 s – 3 min), everything deterministic
 * from the prompt seed and conditioned on the locally-trained ModelState.
 * @module lib/audio/generator
 */

import seedrandom from "seedrandom";
import type { DrumLanes, ModelState, NoteEvent, ProjectDoc } from "@/lib/audio/schema";
import { blendEmbeddings, EMBEDDING_DIM, zeroEmbedding } from "@/lib/audio/dsp";
import { embedProject } from "@/lib/audio/embedding";

export type ScaleName = ProjectDoc["scale"];

export const SCALES: Record<ScaleName, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  pent_minor: [0, 3, 5, 7, 10],
};

/** Musical parameters derived from a natural-language prompt. */
export interface PromptSpec {
  bpm: number;
  mood: string;
  scale: ScaleName;
  root: number;
  /** Section length in bars (song grows in section chunks). */
  bars: number;
  intensity: number;
  seed: string;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Parses free text (pt/en) into a {@link PromptSpec}. */
export function parsePrompt(prompt: string): PromptSpec {
  const p = prompt.toLowerCase();
  const rng = seedrandom(p || "aurora");

  const bpmMatch = p.match(/(\d{2,3})\s?(bpm|batidas)/);
  const bpm = bpmMatch ? Math.min(200, Math.max(60, parseInt(bpmMatch[1], 10))) : Math.round(96 + rng() * 52);

  let mood = "neutral";
  if (/dark|sombrio|trevoso|trap|emo|tenebroso/.test(p)) mood = "dark";
  else if (/feliz|happy|bright|pop|alegre|ensolarado/.test(p)) mood = "happy";
  else if (/chill|lofi|lo-fi|calmo|relax|suave|smooth/.test(p)) mood = "chill";
  else if (/agress|hard|rage|punk|drill|pesado/.test(p)) mood = "aggressive";
  else if (/dream|sonho|ambient|etereo|space|cosmic/.test(p)) mood = "dreamy";
  else if (/funk|groove|dance|house|danca/.test(p)) mood = "groovy";

  let scale: ScaleName = "minor";
  if (/major|maior/.test(p)) scale = "major";
  else if (/dorian|dorico/.test(p)) scale = "dorian";
  else if (/phrygian|frigio/.test(p)) scale = "phrygian";
  else if (/pentat|pent/.test(p)) scale = "pent_minor";
  else if (mood === "happy" || mood === "groovy") scale = "major";
  else if (mood === "chill") scale = "dorian";
  else if (mood === "dreamy") scale = "pent_minor";

  const rootMatch = p.match(/\b([a-g])(#|b)?\b/);
  let root = Math.floor(rng() * 12);
  if (rootMatch) {
    const map: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    root = map[rootMatch[1]] ?? root;
    if (rootMatch[2] === "#") root = (root + 1) % 12;
    if (rootMatch[2] === "b") root = (root + 11) % 12;
  }

  const intensity =
    mood === "aggressive" ? 0.9 : mood === "dark" ? 0.72 : mood === "groovy" ? 0.8 : mood === "happy" ? 0.65 : mood === "chill" ? 0.35 : mood === "dreamy" ? 0.3 : 0.55;

  return { bpm, mood, scale, root, bars: 2, intensity, seed: p || "aurora" };
}

// chord degrees per mood (loops every 4 half-bars)
const PROGRESSIONS: Record<string, number[]> = {
  dark: [0, 0, 5, 3],
  happy: [0, 4, 5, 3],
  chill: [0, 3, 4, 4],
  aggressive: [0, 0, 1, 0],
  dreamy: [0, 0, 3, 4],
  groovy: [0, 3, 5, 4],
  neutral: [0, 5, 3, 4],
};

function humanize(v: number, rng: seedrandom.PRNG): number {
  return Math.max(0.3, Math.min(1, v + (rng() - 0.5) * 0.14));
}

export function generateDrums(model: ModelState | null, intensity: number, rng: seedrandom.PRNG): DrumLanes {
  const lanes: DrumLanes = { kick: new Array(16).fill(0), snare: new Array(16).fill(0), hat: new Array(16).fill(0), clap: new Array(16).fill(0) };
  const hist = model && model.trainedOn >= 2 ? model.drumHistogram : null;
  for (let s = 0; s < 16; s++) {
    if (hist) {
      lanes.kick[s] = rng() < hist.kick[s] * (0.7 + intensity * 0.6) ? 1 : 0;
      lanes.snare[s] = rng() < hist.snare[s] * (0.7 + intensity * 0.6) ? 1 : 0;
      lanes.hat[s] = rng() < hist.hat[s] * (0.7 + intensity * 0.6) ? 1 : 0;
      lanes.clap[s] = rng() < hist.clap[s] * (0.7 + intensity * 0.6) ? 1 : 0;
    } else {
      lanes.kick[s] = s === 0 || s === 7 || s === 10 || (intensity > 0.75 && s === 6) ? 1 : rng() < 0.06 ? 1 : 0;
      lanes.snare[s] = s === 4 || s === 12 ? 1 : rng() < 0.05 ? 1 : 0;
      lanes.hat[s] = rng() < 0.25 + intensity * 0.62 ? 1 : 0;
      lanes.clap[s] = intensity > 0.5 && (s === 4 || s === 12) && rng() < 0.7 ? 1 : s === 15 && rng() < 0.3 ? 1 : 0;
    }
  }
  return lanes;
}

function markovNext(current: number, model: ModelState | null, candidates: number[], rng: seedrandom.PRNG): number {
  if (model) {
    const row = model.noteBigram[String(Math.round(current))];
    if (row) {
      let total = 0;
      const weights = candidates.map((c) => {
        const w = row[String(Math.round(c))] ?? 0;
        total += w;
        return w;
      });
      if (total > 0) {
        let pick = rng() * total;
        for (let i = 0; i < candidates.length; i++) {
          pick -= weights[i];
          if (pick <= 0) return candidates[i];
        }
      }
    }
  }
  return candidates[Math.floor(rng() * candidates.length)];
}

export function generateMelody(spec: PromptSpec, model: ModelState | null, rng: seedrandom.PRNG): NoteEvent[] {
  const scale = SCALES[spec.scale];
  const totalSteps = spec.bars * 16;
  const notes: NoteEvent[] = [];
  const prog = PROGRESSIONS[spec.mood] ?? PROGRESSIONS.neutral;
  const density = 0.34 + spec.intensity * 0.5;
  let current = 60 + spec.root + scale[Math.floor(rng() * scale.length)];

  for (let bar = 0; bar < spec.bars; bar++) {
    const degree = prog[(bar * 2) % prog.length];
    const chordTone = spec.root + scale[degree % scale.length];
    for (let s = 0; s < 16; s++) {
      const step = bar * 16 + s;
      const onBeat = s % 4 === 0;
      const prob = (onBeat ? density + 0.28 : density) * (s % 2 === 1 ? 0.75 : 1);
      if (rng() > prob) continue;
      const pool: number[] = [];
      for (let oct = -1; oct <= 1; oct++) {
        for (const iv of scale) {
          const midi = 60 + chordTone + iv + oct * 12;
          if (midi >= 48 && midi <= 84) pool.push(midi);
        }
      }
      const next = markovNext(current, model, pool.length ? pool : [60 + spec.root], rng);
      current = next;
      notes.push({ step, pitch: next, vel: humanize(onBeat ? 0.85 : 0.65, rng), dur: rng() < 0.22 ? 2 : 1, voice: "lead" });
      if (s === 0) {
        notes.push({ step, pitch: 36 + chordTone, vel: 0.9, dur: 4, voice: "bass" });
        notes.push({ step, pitch: 48 + chordTone, vel: 0.45, dur: 8, voice: "pad" });
        notes.push({ step, pitch: 48 + chordTone + scale[2 % scale.length] + 12, vel: 0.4, dur: 8, voice: "pad" });
      }
    }
  }
  return notes.sort((a, b) => a.step - b.step);
}

/**
 * Generates one 2-bar base section from a prompt.
 * @param prompt free text
 * @param model locally-trained state (or null)
 */
export function compose(prompt: string, model: ModelState | null): ProjectDoc {
  const spec = parsePrompt(prompt);
  const rng = seedrandom(`${spec.seed}::${spec.bpm}::${spec.mood}`);
  const doc: ProjectDoc = {
    schema: "vector-one/project@5.0",
    bpm: spec.bpm,
    root: spec.root,
    scale: spec.scale,
    bars: 2,
    mood: spec.mood,
    prompt,
    drums: generateDrums(model, spec.intensity, rng),
    notes: generateMelody(spec, model, rng),
    embedding: zeroEmbedding(),
  };
  doc.embedding = embedProject(doc);
  return doc;
}

/**
 * Clone with a per-section energy scale applied to note velocities — creates
 * the build/drop arch across a long arrangement.
 */
export function shapeEnergy(doc: ProjectDoc, factor: number): ProjectDoc {
  const notes = doc.notes.map((n) => ({ ...n, vel: Math.max(0.25, Math.min(1, n.vel * factor)) }));
  return { ...doc, notes };
}

/** Variation intensities cycled across sections for musical drift. */
const DRIFT_CYCLE = [0.18, 0.32, 0.48, 0.24, 0.55, 0.3];
/** Energy curve cycled across sections (intro / build / peak / breathe). */
const ENERGY_CYCLE = [0.82, 1.0, 1.1, 0.94, 1.06, 0.88];

/**
 * LONG-FORM COMPOSITION — builds a complete song section-by-section:
 * section 0 is random from the prompt; section N is a variation of section
 * N-1 chained onto the same timeline (the VARIAR button, automated).
 *
 * @param prompt free text (pt/en)
 * @param model trained state or null
 * @param seconds target length (30–190 s); quantized to even bar counts
 * @returns a full-length {@link ProjectDoc}
 */
export function composeLong(prompt: string, model: ModelState | null, seconds: number): { doc: ProjectDoc; sections: number } {
  const spec = parsePrompt(prompt);
  const clamped = Math.min(190, Math.max(30, seconds));
  const barsPerSection = 2;
  // bars = seconds * bpm/60 / 4  → sections of 16 steps
  const targetBars = Math.max(barsPerSection, Math.min(128, Math.round((clamped * spec.bpm) / 240)));
  const sectionCount = Math.max(1, Math.round(targetBars / barsPerSection));

  const seed = compose(`${spec.seed}::long::${sectionCount}`, model);
  const rng = seedrandom(`${spec.seed}::sections::${sectionCount}::${spec.bpm}`);

  const allNotes: NoteEvent[] = [];
  let current: ProjectDoc = seed;
  let drums: DrumLanes = seed.drums;

  for (let i = 0; i < sectionCount; i++) {
    const t = DRIFT_CYCLE[i % DRIFT_CYCLE.length] + (rng() - 0.5) * 0.06;
    const energy = ENERGY_CYCLE[i % ENERGY_CYCLE.length];

    if (i > 0) {
      current = vary(current, model?.centroid ?? null, model, Math.min(0.9, Math.max(0.05, t)));
      if (i === Math.floor(sectionCount / 2)) drums = current.drums; // groove evolves mid-song
    }
    const shifted = shapeEnergy(current, energy).notes.map((n) => ({ ...n, step: n.step + i * barsPerSection * 16 }));
    allNotes.push(...shifted);
  }

  const doc: ProjectDoc = {
    ...seed,
    bars: sectionCount * barsPerSection,
    mood: spec.mood,
    prompt,
    drums,
    notes: allNotes.sort((a, b) => a.step - b.step),
    embedding: zeroEmbedding(),
  };
  doc.embedding = embedProject(doc);
  return { doc, sections: sectionCount };
}

/**
 * VARIATION — interpolates a document toward a target in embedding space and
 * re-voices the lead with the trained Markov chain. Bars beyond the base
 * section are preserved (long songs stay long).
 */
export function vary(source: ProjectDoc, target: number[] | null, model: ModelState | null, t: number): ProjectDoc {
  const dest = target && target.length === EMBEDDING_DIM ? target : model?.centroid ?? source.embedding;
  const blended = blendEmbeddings(source.embedding, dest, t);
  const rng = seedrandom(`${source.prompt}::var::${t.toFixed(2)}::${source.notes.length}`);
  const density = 0.3 + blended[16] * 0.5 + blended[20] * 0.25;
  const scaleSet = SCALES[source.scale];
  void scaleSet;
  const notes: NoteEvent[] = [];
  const chromaWeights = blended.slice(0, 12).map((w, pc) => ({ w, pc }));
  chromaWeights.sort((a, b) => b.w - a.w);
  const topPitchClasses = chromaWeights.slice(0, 5).map((c) => c.pc);

  for (const n of source.notes) {
    if (n.voice !== "lead") {
      notes.push({ ...n });
      continue;
    }
    if (rng() > density + 0.45) continue;
    if (rng() < t) {
      const candidates = topPitchClasses.flatMap((pc) => [48 + pc, 60 + pc, 72 + pc]).filter((m) => m >= 48 && m <= 84);
      const pitch = markovNext(n.pitch, model, candidates, rng);
      notes.push({ ...n, pitch, vel: Math.min(1, n.vel * (0.85 + blended[21] * 0.4)) });
    } else {
      notes.push(n);
    }
  }
  const strongStep = 16; // sprinkle fills section-relative
  void strongStep;
  let leadAt = (s: number) => notes.some((n) => n.voice === "lead" && n.step === s);
  for (let s = 0; s < source.bars * 16; s += 4) {
    if (!leadAt(s) && rng() < density * 0.4) {
      const pc = topPitchClasses[Math.floor(rng() * topPitchClasses.length)] ?? source.root;
      const note = { step: s, pitch: 60 + pc, vel: 0.7 + rng() * 0.25, dur: 1, voice: "lead" as const };
      notes.push(note);
      leadAt = (x: number) => x === s || leadAt(x);
    }
  }
  notes.sort((a, b) => a.step - b.step);

  const drums: DrumLanes = { kick: [...source.drums.kick], snare: [...source.drums.snare], hat: [...source.drums.hat], clap: [...source.drums.clap] };
  for (let s = 0; s < 16; s++) {
    if (rng() < t * 0.3) drums.hat[s] = drums.hat[s] ? 0 : 1;
    if (rng() < t * 0.15) drums.kick[s] = drums.kick[s] ? 0 : s % 4 === 0 ? 1 : 0;
  }
  return { ...source, mood: `${source.mood}-var`, notes, drums, embedding: blended, prompt: `${source.prompt} (var ${(t * 100).toFixed(0)}%)` };
}

/** MIDI number → note name like `C#4`. */
export function noteName(midi: number): string {
  const m = Math.round(midi);
  return `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}
