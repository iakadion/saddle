// ─────────────────────────────────────────────────────────────────────────────
// VECTOR-ONE DSP CORE — pure TypeScript signal processing (browser + Node).
// FFT (fft.js), spectral-flux onset detection, autocorrelation pitch tracking,
// RMS velocity, chroma, band energies and the 32-dim embedding space shared by
// symbolic projects and imported audio.
// ─────────────────────────────────────────────────────────────────────────────

import FFT from "fft.js";
import cosine from "compute-cosine-similarity";

export const FFT_SIZE = 2048;
export const HOP = 512;

const fftCache = new Map<number, FFT>();
function getFFT(size: number): FFT {
  let f = fftCache.get(size);
  if (!f) {
    f = new FFT(size);
    fftCache.set(size, f);
  }
  return f;
}

const hann = new Float32Array(FFT_SIZE);
for (let i = 0; i < FFT_SIZE; i++) {
  hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));
}

/** Magnitude spectrum of a mono frame (uses global hann window). */
export function spectrum(frame: Float32Array): Float32Array {
  const f = getFFT(FFT_SIZE);
  const out = f.createComplexArray();
  const input = new Float32Array(FFT_SIZE);
  const n = Math.min(frame.length, FFT_SIZE);
  for (let i = 0; i < n; i++) input[i] = frame[i] * hann[i];
  f.realTransform(out, input);
  f.completeSpectrum(out);
  const mags = new Float32Array(FFT_SIZE / 2);
  for (let i = 0; i < mags.length; i++) {
    const re = out[2 * i];
    const im = out[2 * i + 1];
    mags[i] = Math.sqrt(re * re + im * im);
  }
  return mags;
}

export function rms(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / Math.max(1, frame.length));
}

export function zeroCrossingRate(frame: Float32Array): number {
  let zc = 0;
  for (let i = 1; i < frame.length; i++) {
    if ((frame[i - 1] >= 0 && frame[i] < 0) || (frame[i - 1] < 0 && frame[i] >= 0)) zc++;
  }
  return zc / Math.max(1, frame.length);
}

export function spectralCentroid(mags: Float32Array, sampleRate: number): number {
  let num = 0;
  let den = 0;
  const binHz = sampleRate / FFT_SIZE;
  for (let i = 0; i < mags.length; i++) {
    num += i * binHz * mags[i];
    den += mags[i];
  }
  return den > 0 ? num / den : 0;
}

export function spectralRolloff(mags: Float32Array, sampleRate: number, pct = 0.85): number {
  let total = 0;
  for (let i = 0; i < mags.length; i++) total += mags[i];
  const target = total * pct;
  let cum = 0;
  const binHz = sampleRate / FFT_SIZE;
  for (let i = 0; i < mags.length; i++) {
    cum += mags[i];
    if (cum >= target) return i * binHz;
  }
  return (mags.length - 1) * binHz;
}

export function spectralFlux(prev: Float32Array | null, cur: Float32Array): number {
  if (!prev) return 0;
  let flux = 0;
  for (let i = 0; i < cur.length; i++) {
    const d = cur[i] - prev[i];
    if (d > 0) flux += d;
  }
  return flux / cur.length;
}

/** Spectral flatness — noise vs tonality measure. */
export function spectralFlatness(mags: Float32Array): number {
  let logSum = 0;
  let linSum = 0;
  const n = mags.length;
  for (let i = 0; i < n; i++) {
    const v = mags[i] + 1e-10;
    logSum += Math.log(v);
    linSum += v;
  }
  const geo = Math.exp(logSum / n);
  const ari = linSum / n;
  return ari > 0 ? geo / ari : 0;
}

/** Energy ratio for [low, mid, high] bands in Hz. */
export function bandEnergies(mags: Float32Array, sampleRate: number): [number, number, number] {
  const binHz = sampleRate / FFT_SIZE;
  let lo = 0;
  let mid = 0;
  let hi = 0;
  for (let i = 0; i < mags.length; i++) {
    const hz = i * binHz;
    const e = mags[i] * mags[i];
    if (hz < 250) lo += e;
    else if (hz < 2000) mid += e;
    else hi += e;
  }
  const total = lo + mid + hi + 1e-12;
  return [lo / total, mid / total, hi / total];
}

/**
 * Autocorrelation pitch tracker (YIN-lite). Returns Hz or null when the frame
 * is unpitched / too quiet.
 */
export function detectPitch(frame: Float32Array, sampleRate: number): number | null {
  const level = rms(frame);
  if (level < 0.01) return null;
  const N = Math.min(frame.length, FFT_SIZE);
  const buf = new Float32Array(N);
  // remove DC
  let mean = 0;
  for (let i = 0; i < N; i++) mean += frame[i];
  mean /= N;
  for (let i = 0; i < N; i++) buf[i] = frame[i] - mean;

  const minLag = Math.floor(sampleRate / 1200); // 1200 Hz ceiling
  const maxLag = Math.min(Math.floor(sampleRate / 50), N - 2); // 50 Hz floor
  let bestLag = -1;
  let bestVal = 0;
  let e0 = 0;
  for (let i = 0; i < N; i++) e0 += buf[i] * buf[i];
  if (e0 === 0) return null;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    const limit = N - lag;
    for (let i = 0; i < limit; i++) sum += buf[i] * buf[i + lag];
    const norm = sum / e0;
    if (norm > bestVal) {
      bestVal = norm;
      bestLag = lag;
    }
  }
  if (bestLag <= 0 || bestVal < 0.45) return null;
  // parabolic refinement
  const l = bestLag;
  const corr = (lag: number) => {
    let sum = 0;
    const limit = N - lag;
    for (let i = 0; i < limit; i++) sum += buf[i] * buf[i + lag];
    return sum / e0;
  };
  const y0 = corr(l - 1);
  const y1 = corr(l);
  const y2 = corr(l + 1);
  const shift = (y2 - y0) / (2 * (2 * y1 - y2 - y0) || 1);
  const refined = l + Math.max(-0.5, Math.min(0.5, shift));
  return sampleRate / refined;
}

export function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}
export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function midiToNoteName(midi: number): string {
  const m = Math.round(midi);
  return `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

/** 12-bin chroma from a magnitude spectrum. */
export function chroma(mags: Float32Array, sampleRate: number): number[] {
  const bins = new Array<number>(12).fill(0);
  const binHz = sampleRate / FFT_SIZE;
  for (let i = 1; i < mags.length; i++) {
    const hz = i * binHz;
    if (hz < 55 || hz > 5000) continue;
    const midi = hzToMidi(hz);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    bins[pc] += mags[i];
  }
  const sum = bins.reduce((a, b) => a + b, 0) + 1e-12;
  return bins.map((b) => b / sum);
}

// ─────────────────────────── embedding space ───────────────────────────

export const EMBEDDING_DIM = 32;

/**
 * Shared 32-dimension embedding layout:
 *  0-11  chroma distribution (harmonic fingerprint)
 * 12-15  band/pitch energy shape (centroid, rolloff, flatness, zcr — normalized)
 * 16-19  rhythm (onset density, onset strength, dur density, syncopation)
 * 20-23  dynamics (rms mean, rms std, velocity mean, velocity std)
 * 24-27  register (pitch mean/128, pitch std/48, pitch min/128, pitch max/128)
 * 28-31  temporal (bpm/200, frame count log, low band, high band)
 */
export function zeroEmbedding(): number[] {
  return new Array<number>(EMBEDDING_DIM).fill(0);
}

export function normalizeEmbedding(v: number[]): number[] {
  return v.map((x) => Math.max(0, Math.min(1.5, Number.isFinite(x) ? x : 0)));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const s = cosine(a, b);
  return s === null || Number.isNaN(s) ? 0 : s;
}

export function meanEmbedding(vectors: number[][]): number[] {
  const out = zeroEmbedding();
  if (vectors.length === 0) return out;
  for (const v of vectors) for (let i = 0; i < EMBEDDING_DIM; i++) out[i] += v[i] ?? 0;
  return out.map((x) => x / vectors.length);
}

/** Linear interpolation in embedding space — used for variation generation. */
export function blendEmbeddings(a: number[], b: number[], t: number): number[] {
  return a.map((x, i) => x + ((b[i] ?? 0) - x) * t);
}
