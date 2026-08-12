// ─────────────────────────────────────────────────────────────────────────────
// VECTOR-ONE AUDIO ENGINE — Web Audio synthesis + transport scheduler.
// Instruments are hand-built DSP patches (oscillators, noise, filters, envelopes)
// through a master chain: dry → compressor → destination, with delay and a
// generated-impulse convolver reverb as sends. No samples required.
// ─────────────────────────────────────────────────────────────────────────────

import { Mp3Encoder } from "lamejs";
import type { DrumLanes, NoteEvent } from "@/lib/audio/schema";
import { midiToHz } from "@/lib/audio/dsp";

export type DrumKind = keyof DrumLanes;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let comp: DynamicsCompressorNode | null = null;
let delaySend: GainNode | null = null;
let reverbSend: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

export function ensureContext(): AudioContext {
  if (ctx && ctx.state !== "closed") {
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }
  const Ctor: typeof AudioContext =
    typeof window !== "undefined"
      ? window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      : (undefined as unknown as typeof AudioContext);
  ctx = new Ctor();

  master = ctx.createGain();
  master.gain.value = 0.9;
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 24;
  comp.ratio.value = 5;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;

  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;

  master.connect(comp);
  comp.connect(analyser!);
  analyser!.connect(ctx.destination);

  // tempo feedback delay
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.28;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const damp = ctx.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 3200;
  delaySend = ctx.createGain();
  delaySend.gain.value = 1;
  delaySend.connect(delay);
  delay.connect(damp);
  damp.connect(fb);
  fb.connect(delay);
  const delayOut = ctx.createGain();
  delayOut.gain.value = 0.35;
  damp.connect(delayOut);
  delayOut.connect(master);

  // reverb: generated exponential-decay noise impulse (1.6s stereo)
  const len = Math.floor(ctx.sampleRate * 1.6);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  reverbSend = ctx.createGain();
  reverbSend.gain.value = 1;
  const revOut = ctx.createGain();
  revOut.gain.value = 0.28;
  reverbSend.connect(conv);
  conv.connect(revOut);
  revOut.connect(master);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  return ctx;
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}
export function setMasterGain(v: number): void {
  if (master && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.02);
}
export function setSendMix(which: "delay" | "reverb", v: number): void {
  const node = which === "delay" ? delaySend : reverbSend;
  if (node && ctx) node.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
}

function out(t: number, level: number, pan = 0, wet = 0.15): GainNode {
  const c = ensureContext();
  const g = c.createGain();
  g.gain.value = level;
  const p = c.createStereoPanner();
  p.pan.value = pan;
  g.connect(p);
  p.connect(master!);
  if (wet > 0.01) {
    const ws = c.createGain();
    ws.gain.value = wet;
    p.connect(ws);
    ws.connect(reverbSend!);
    const ds = c.createGain();
    ds.gain.value = wet * 0.7;
    p.connect(ds);
    ds.connect(delaySend!);
  }
  void t;
  return g;
}

// ── drum voices ──────────────────────────────────────────────────────────────

export function playKick(t: number, vel = 1, tune = 1): void {
  const c = ensureContext();
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150 * tune, t);
  osc.frequency.exponentialRampToValueAtTime(38 * tune, t + 0.11);
  const g = out(t, 0, -0.05, 0.04);
  g.gain.setValueAtTime(vel, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.36);
  // click transient
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1400;
  const ng = out(t, 0, 0, 0);
  ng.gain.setValueAtTime(vel * 0.35, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  n.connect(hp);
  hp.connect(ng);
  n.start(t, Math.random() * 0.4, 0.05);
}

export function playSnare(t: number, vel = 1): void {
  const c = ensureContext();
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1900;
  bp.Q.value = 0.8;
  const g = out(t, 0, 0.08, 0.22);
  g.gain.setValueAtTime(vel * 0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  n.connect(bp);
  bp.connect(g);
  n.start(t, Math.random() * 0.5, 0.25);
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(196, t);
  const og = out(t, 0, 0, 0.1);
  og.gain.setValueAtTime(vel * 0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.connect(og);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playHat(t: number, vel = 1, open = false): void {
  const c = ensureContext();
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 8200;
  const dur = open ? 0.24 : 0.05;
  const g = out(t, 0, 0.15, 0.12);
  g.gain.setValueAtTime(vel * 0.36, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  n.connect(hp);
  hp.connect(g);
  n.start(t, Math.random() * 0.6, dur + 0.02);
}

export function playClap(t: number, vel = 1): void {
  const c = ensureContext();
  for (let i = 0; i < 3; i++) {
    const tt = t + i * 0.011;
    const n = c.createBufferSource();
    n.buffer = noiseBuf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1300;
    bp.Q.value = 1.4;
    const g = out(tt, 0, -0.1, 0.3);
    g.gain.setValueAtTime(vel * (i === 2 ? 0.5 : 0.28), tt);
    g.gain.exponentialRampToValueAtTime(0.001, tt + (i === 2 ? 0.24 : 0.05));
    n.connect(bp);
    bp.connect(g);
    n.start(tt, Math.random() * 0.5, 0.3);
  }
}

// ── melodic voices ───────────────────────────────────────────────────────────

function envADSR(g: GainNode, t: number, peak: number, a: number, d: number, s: number, r: number, dur: number): void {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * s), t + a + d);
  const end = t + dur;
  g.gain.setValueAtTime(Math.max(0.0002, peak * s), end);
  g.gain.exponentialRampToValueAtTime(0.0001, end + r);
}

export function playLead(t: number, midi: number, durSec: number, vel = 0.8): void {
  const c = ensureContext();
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = midiToHz(midi);
  const osc2 = c.createOscillator();
  osc2.type = "square";
  osc2.frequency.value = midiToHz(midi) * 1.004;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(5200, t);
  lp.frequency.exponentialRampToValueAtTime(900, t + durSec + 0.15);
  lp.Q.value = 3.5;
  const g = c.createGain();
  envADSR(g, t, vel * 0.42, 0.008, 0.1, 0.5, 0.14, durSec);
  const og = out(t, 1, 0.1, 0.34);
  osc.connect(lp);
  osc2.connect(lp);
  lp.connect(g);
  g.connect(og);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + durSec + 0.4);
  osc2.stop(t + durSec + 0.4);
}

export function playBass(t: number, midi: number, durSec: number, vel = 0.9): void {
  const c = ensureContext();
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = midiToHz(midi);
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.value = midiToHz(midi) / 2;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  lp.Q.value = 1.2;
  const g = c.createGain();
  envADSR(g, t, vel * 0.6, 0.006, 0.08, 0.7, 0.1, durSec);
  const og = out(t, 1, -0.05, 0.03);
  osc.connect(lp);
  sub.connect(lp);
  lp.connect(g);
  g.connect(og);
  osc.start(t);
  sub.start(t);
  osc.stop(t + durSec + 0.3);
  sub.stop(t + durSec + 0.3);
}

export function playPad(t: number, midi: number, durSec: number, vel = 0.5): void {
  const c = ensureContext();
  const g = c.createGain();
  envADSR(g, t, vel * 0.16, Math.min(0.5, durSec * 0.3), 0.4, 0.8, 0.8, durSec);
  const og = out(t, 1, 0, 0.5);
  g.connect(og);
  for (const det of [-7, 4]) {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = midiToHz(midi);
    osc.detune.value = det;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2000;
    osc.connect(lp);
    lp.connect(g);
    osc.start(t);
    osc.stop(t + durSec + 1);
  }
}

export function scheduleDrum(kind: DrumKind, t: number, vel = 1): void {
  if (kind === "kick") playKick(t, vel);
  else if (kind === "snare") playSnare(t, vel);
  else if (kind === "hat") playHat(t, vel, false);
  else playClap(t, vel);
}

// ── transport scheduler ──────────────────────────────────────────────────────

export interface PlayableDoc {
  bpm: number;
  bars: number;
  drums: DrumLanes;
  notes: NoteEvent[];
}

export class Transport {
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private step = 0;
  private startedAt = 0;
  playing = false;
  onStep: ((step: number, time: number) => void) | null = null;

  get currentStep(): number {
    return this.step;
  }
  get playheadSeconds(): number {
    if (!ctx || !this.playing) return 0;
    return ctx.currentTime - this.startedAt;
  }

  start(doc: PlayableDoc): void {
    const c = ensureContext();
    this.stop();
    this.playing = true;
    this.step = 0;
    this.startedAt = c.currentTime + 0.06;
    this.nextStepTime = this.startedAt;
    const stepDur = () => 60 / doc.bpm / 4;
    const totalSteps = doc.bars * 16;

    const tick = () => {
      if (!ctx || !this.playing) return;
      while (this.nextStepTime < ctx.currentTime + 0.14) {
        const s = this.step % totalSteps;
        const t = this.nextStepTime;
        const lane = s % 16;
        if (doc.drums.kick[lane]) scheduleDrum("kick", t, 0.95);
        if (doc.drums.snare[lane]) scheduleDrum("snare", t, 0.85);
        if (doc.drums.hat[lane]) scheduleDrum("hat", t, s % 4 === 2 ? 0.9 : 0.7);
        if (doc.drums.clap[lane]) scheduleDrum("clap", t, 0.8);
        for (const n of doc.notes) {
          if (n.step % totalSteps === s) {
            const durSec = n.dur * stepDur();
            if (n.voice === "lead") playLead(t, n.pitch, durSec, n.vel);
            else if (n.voice === "bass") playBass(t, n.pitch, durSec, n.vel);
            else playPad(t, n.pitch, durSec, n.vel);
          }
        }
        this.onStep?.(s, t);
        this.step++;
        this.nextStepTime += stepDur();
      }
    };
    tick();
    this.timer = setInterval(tick, 30);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    this.step = 0;
  }
}

// ── offline renders (WAV + MP3, no server needed) ────────────────────────────

/**
 * Renders the document to an AudioBuffer via OfflineAudioContext with a light
 * mirror of the live graph. Duration follows doc.bars (long songs included).
 */
export async function renderToBuffer(doc: PlayableDoc): Promise<AudioBuffer | null> {
  if (typeof window === "undefined") return null;
  const dur = (60 / doc.bpm) * 4 * doc.bars + 1.2;
  const sampleRate = 44100;
  const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offline = new Offline(2, Math.ceil(dur * sampleRate), sampleRate);

  // rebuild a light graph inside the offline context
  const mg = offline.createGain();
  mg.gain.value = 0.9;
  const oc = offline.createDynamicsCompressor();
  mg.connect(oc);
  oc.connect(offline.destination);

  const noise = offline.createBuffer(1, sampleRate, sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const stepDur = 60 / doc.bpm / 4;
  const totalSteps = doc.bars * 16;
  const scheduleOsc = (t: number, type: OscillatorType, f0: number, f1: number, durv: number, vel: number) => {
    const o = offline.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + durv * 0.4);
    const g = offline.createGain();
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + durv);
    o.connect(g);
    g.connect(mg);
    o.start(t);
    o.stop(t + durv + 0.05);
  };
  const scheduleNoise = (t: number, freq: number, type: BiquadFilterType, durv: number, vel: number) => {
    const n = offline.createBufferSource();
    n.buffer = noise;
    const f = offline.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = offline.createGain();
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + durv);
    n.connect(f);
    f.connect(g);
    g.connect(mg);
    n.start(t, Math.random() * 0.5, durv + 0.05);
  };

  for (let s = 0; s < totalSteps; s++) {
    const t = s * stepDur + 0.05;
    const lane = s % 16;
    if (doc.drums.kick[lane]) scheduleOsc(t, "sine", 150, 38, 0.32, 0.9);
    if (doc.drums.snare[lane]) {
      scheduleNoise(t, 1900, "bandpass", 0.18, 0.65);
      scheduleOsc(t, "triangle", 196, 196, 0.09, 0.4);
    }
    if (doc.drums.hat[lane]) scheduleNoise(t, 8200, "highpass", 0.05, 0.3);
    if (doc.drums.clap[lane]) scheduleNoise(t, 1300, "bandpass", 0.22, 0.45);
    for (const n of doc.notes) {
      if (n.step % totalSteps === s) {
        const d = n.dur * stepDur;
        const hz = midiToHz(n.pitch);
        if (n.voice === "bass") scheduleOsc(t, "sawtooth", hz, hz, d + 0.1, n.vel * 0.5);
        else if (n.voice === "pad") scheduleOsc(t, "sawtooth", hz, hz, d + 0.5, n.vel * 0.14);
        else scheduleOsc(t, "sawtooth", hz, hz, d, n.vel * 0.34);
      }
    }
  }

  const rendered = await offline.startRendering();
  return rendered;
}

/** Render + encode as 16-bit stereo WAV blob. */
export async function renderToWav(doc: PlayableDoc): Promise<Blob | null> {
  const rendered = await renderToBuffer(doc);
  return rendered ? bufferToWavBlob(rendered) : null;
}

/** Render + encode as 128 kbps stereo MP3 blob (lamejs, fully client-side). */
export async function renderToMp3(doc: PlayableDoc): Promise<Blob | null> {
  const rendered = await renderToBuffer(doc);
  if (!rendered) return null;
  const sr = rendered.sampleRate;
  const left = rendered.getChannelData(0);
  const right = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : left;
  const toI16 = (ch: Float32Array): Int16Array => {
    const out = new Int16Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };
  const l = toI16(left);
  const r = toI16(right);
  const enc = new Mp3Encoder(2, sr, 128);
  const chunks: Uint8Array[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < l.length; i += BLOCK) {
    const lb = l.subarray(i, i + BLOCK);
    const rb = r.subarray(i, i + BLOCK);
    const data = enc.encodeBuffer(lb, rb);
    if (data.length > 0) chunks.push(new Uint8Array(data));
  }
  const tail = enc.flush();
  if (tail.length > 0) chunks.push(new Uint8Array(tail));
  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

export function bufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const len = buffer.length * numCh * 2 + 44;
  const view = new DataView(new ArrayBuffer(len));
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, len - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, len - 44, true);
  let offset = 44;
  const chans: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const sample = Math.max(-1, Math.min(1, chans[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}
