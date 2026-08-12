"use client";

import { ArrowDown, Binary, Cpu, Layers, ScanLine, Sparkles, Workflow } from "lucide-react";
import Reveal from "@/components/reveal";

/* ─────────────────────────── layer stack ─────────────────────────── */

interface Layer {
  id: string;
  name: string;
  thread: string;
  accent: string;
  items: string[];
}

const LAYERS: Layer[] = [
  {
    id: "L7", name: "INTERFACE & VISUALIZATION", thread: "UI THREAD", accent: "#ff6fb3",
    items: ["pixi.js", "@shopify/react-native-skia", "SwiftUI", "Jetpack Compose", "wavesurfer.js", "bbc/peaks.js"],
  },
  {
    id: "L6", name: "STATE & SYNCHRONIZATION", thread: "UI THREAD", accent: "#5effc3",
    items: ["zustand", "immer", "xstate", "yjs", "automerge", "comlink", "eventemitter3"],
  },
  {
    id: "L5", name: "DATA CONTRACT · JSON TIMELINE", thread: "WORKER", accent: "#ffb454",
    items: ["zod", "ajv", "protobufjs", "@msgpack/msgpack", "flatbuffers", "cbor-x", "fast-json-patch"],
  },
  {
    id: "L4", name: "AI · NLP COMMAND SURFACE", thread: "WORKER / NPU", accent: "#b79bff",
    items: ["@spotify/basic-pitch", "marl/crepe", "essentia.js", "aubio", "@huggingface/transformers", "@mlc-ai/web-llm", "llama.cpp", "wink-nlp"],
  },
  {
    id: "L3", name: "DSP ENGINE CORE", thread: "AUDIO RT", accent: "#c8f94e",
    items: ["JUCE 8", "Superpowered SDK", "Rubber Band", "Soundpipe", "tone", "standardized-audio-context", "libsamplerate"],
  },
  {
    id: "L2", name: "RUNTIME & CROSS-BINDINGS", thread: "MIXED", accent: "#7dd6ff",
    items: ["onnxruntime", "tensorflow-lite", "emscripten", "wasm-bindgen", "google/skia", "ringbuffer.js"],
  },
  {
    id: "L1", name: "DRIVERS & OS AUDIO", thread: "AUDIO RT", accent: "#ff8a3d",
    items: ["AVAudioEngine", "TAAE2", "com.google.oboe", "rtaudio", "portaudio"],
  },
  {
    id: "L0", name: "CODEC & TOOLCHAIN", thread: "BUILD / I/O", accent: "#9aa7ff",
    items: ["libsndfile", "FFmpeg", "ffmpeg-kit", "lame", "cmake", "conan", "perfetto"],
  },
];

function SectionHeading({
  index, title, sub, icon: Icon,
}: { index: string; title: string; sub: string; icon: typeof Layers }) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-[#c8f94e]">
            <Icon className="h-3.5 w-3.5" />
            SECTION {index}
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-zinc-100 sm:text-5xl lg:text-6xl">
            {title}
          </h2>
        </div>
        <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">{sub}</p>
      </div>
    </Reveal>
  );
}

export function Infrastructure() {
  return (
    <section id="architecture" className="relative border-b border-white/10 py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <SectionHeading
          index="00" icon={Layers}
          title="ONE CODEBASE. EIGHT LAYERS."
          sub="Signal flows down the stack, state flows up. The audio thread never allocates, never locks, and never talks to the network — telemetry is structurally absent."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* signal flow rail */}
          <Reveal className="hidden lg:block">
            <div className="sticky top-24 space-y-6 border-l border-white/15 pl-5">
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">FLOW</p>
                <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-[#c8f94e]">
                  <ArrowDown className="h-3.5 w-3.5" /> PCM × CMD DOWN
                </p>
                <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#7dd6ff]">
                  <ArrowDown className="h-3.5 w-3.5 rotate-180" /> EVENTS × JSON UP
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">THREADS</p>
                {[
                  ["AUDIO RT", "#c8f94e"],
                  ["UI THREAD", "#5effc3"],
                  ["WORKER", "#ffb454"],
                  ["BUILD", "#9aa7ff"],
                ].map(([t, c]) => (
                  <p key={t} className="mt-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                    {t}
                  </p>
                ))}
              </div>
              <p className="font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-600">
                REALTIME PATH:
                <br />NO MALLOC
                <br />NO MUTEX
                <br />NO NETWORK
              </p>
            </div>
          </Reveal>

          {/* stack rows */}
          <div className="space-y-2.5">
            {LAYERS.map((layer, i) => (
              <Reveal key={layer.id} delay={i * 40}>
                <div
                  className="group grid gap-4 border border-white/10 bg-[#0a0c0e] p-5 transition-all duration-300 hover:bg-[#0d1114] sm:grid-cols-[72px_1fr_auto] sm:items-center lg:p-6"
                  style={{ borderLeft: `2px solid ${layer.accent}` }}
                >
                  <div className="font-mono text-2xl font-bold tracking-tight" style={{ color: layer.accent }}>
                    {layer.id}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-mono text-sm font-semibold tracking-[0.18em] text-zinc-100">{layer.name}</h3>
                      <span
                        className="border px-1.5 py-0.5 font-mono text-[8px] tracking-[0.22em]"
                        style={{ borderColor: `${layer.accent}55`, color: layer.accent }}
                      >
                        {layer.thread}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {layer.items.map((it) => (
                        <span
                          key={it}
                          className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-zinc-400 transition-colors group-hover:border-white/20 group-hover:text-zinc-300"
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ScanLine className="hidden h-4 w-4 text-zinc-700 transition-colors group-hover:text-zinc-400 sm:block" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── ai pipeline ─────────────────────────── */

const STEPS = [
  { n: "01", t: "CAPTURE", d: "AudioWorklet / AAudio callbacks hand 128-frame PCM blocks to a lock-free SAB ring buffer — the analysis tap adds zero risk to the render path.", c: "#ff8a3d" },
  { n: "02", t: "FEATURES", d: "kissFFT spectra, aubio onset candidates and Meyda spectral descriptors are computed per buffer to anchor the transient lattice.", c: "#c8f94e" },
  { n: "03", t: "TRANSCRIBE", d: "Basic Pitch resolves polyphonic note events; CREPE tracks monophonic f0 with cents drift. Both run on onnxruntime — fully on-device.", c: "#7dd6ff" },
  { n: "04", t: "SEMANTIC TAG", d: "The NLP layer labels each second — section energy, instrument hints, command intents — using a quantized local model. Nothing leaves the machine.", c: "#b79bff" },
  { n: "05", t: "VALIDATE", d: "zod + Ajv precompiled validators gate every frame. Hallucinated keys, out-of-range velocities and negative onsets are rejected before state.", c: "#ffb454" },
  { n: "06", t: "SERIALIZE", d: "Validated frames stream to the UI as MessagePack and autosave as canonical CBOR — the second-by-second JSON timeline is the single source of truth.", c: "#5effc3" },
];

/** deterministic visual note map across 24 one-second cells */
const NOTE_MAP: Record<number, { p: number; v: number; n?: string }[]> = {
  0: [{ p: 0.32, v: 0.95, n: "C4" }],
  1: [{ p: 0.32, v: 0.6 }],
  2: [{ p: 0.46, v: 0.84, n: "E4" }],
  3: [{ p: 0.58, v: 0.79 }, { p: 0.12, v: 0.7 }],
  4: [{ p: 0.12, v: 0.5 }],
  5: [{ p: 0.52, v: 0.88, n: "A4" }],
  6: [{ p: 0.44, v: 0.7 }],
  7: [{ p: 0.68, v: 0.96, n: "C5" }, { p: 0.12, v: 0.72 }],
  8: [{ p: 0.58, v: 0.64 }],
  9: [{ p: 0.5, v: 0.42 }],
  10: [{ p: 0.4, v: 0.82, n: "D4" }],
  11: [{ p: 0.32, v: 0.74 }, { p: 0.12, v: 0.66 }],
  12: [{ p: 0.12, v: 0.44 }],
  13: [{ p: 0.5, v: 0.9, n: "F4" }],
  14: [{ p: 0.58, v: 0.78 }],
  15: [{ p: 0.74, v: 0.97, n: "D5" }, { p: 0.12, v: 0.7 }],
  16: [{ p: 0.6, v: 0.5 }],
  17: [{ p: 0.32, v: 0.8 }],
  18: [{ p: 0.46, v: 0.86, n: "E4" }],
  19: [{ p: 0.56, v: 0.7 }, { p: 0.12, v: 0.62 }],
  20: [{ p: 0.44, v: 0.6 }],
  21: [{ p: 0.62, v: 0.9, n: "B4" }],
  22: [{ p: 0.7, v: 0.85 }],
  23: [{ p: 0.78, v: 0.98, n: "E5" }, { p: 0.12, v: 0.74 }],
};
const ONSETS = new Set([0, 2, 3, 5, 7, 10, 11, 13, 15, 18, 19, 21, 23]);

function TimelineGrid() {
  const cells = Array.from({ length: 24 }, (_, s) => s);
  return (
    <div className="relative overflow-hidden border border-white/12 bg-[#08090b]">
      {/* lane header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[9px] tracking-[0.24em] text-zinc-500">
        <span>AI TIMELINE — SECOND-BY-SECOND NOTE LATTICE</span>
        <span className="text-[#c8f94e]">BASIC-PITCH × CREPE × AUBIO</span>
      </div>

      <div className="relative">
        {/* pitch grid */}
        <div className="relative grid h-44 grid-cols-24 border-b border-white/10">
          {cells.map((s) => {
            const notes = NOTE_MAP[s] ?? [];
            return (
              <div key={s} className="relative border-r border-white/[0.06]">
                {notes.map((note, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-[2px] h-2.5"
                    style={{
                      bottom: `${note.p * 88 + 4}%`,
                      background: `rgba(200,249,78,${0.25 + note.v * 0.75})`,
                      boxShadow: note.n ? "0 0 12px rgba(200,249,78,0.35)" : "none",
                    }}
                    title={note.n}
                  />
                ))}
              </div>
            );
          })}
          {/* sweep playhead */}
          <div className="anim-playhead absolute top-0 h-full w-px bg-[#7dd6ff]" style={{ boxShadow: "0 0 14px rgba(125,214,255,0.8)" }} />
        </div>

        {/* onset strip */}
        <div className="grid h-7 grid-cols-24 border-b border-white/10">
          {cells.map((s) => (
            <div key={s} className="flex items-center justify-center border-r border-white/[0.06]">
              {ONSETS.has(s) && <span className="h-1.5 w-1.5 rotate-45 bg-[#ffb454]" style={{ boxShadow: "0 0 8px rgba(255,180,84,0.7)" }} />}
            </div>
          ))}
        </div>

        {/* seconds ruler */}
        <div className="grid grid-cols-24 px-0 py-2 font-mono text-[8px] text-zinc-600">
          {cells.map((s) => (
            <span key={s} className="text-center tabular-nums">{String(s).padStart(2, "0")}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/10 px-4 py-2.5 font-mono text-[9px] tracking-[0.18em] text-zinc-500">
        <span className="flex items-center gap-2"><span className="h-1.5 w-3 bg-[#c8f94e]" /> NOTE EVENT</span>
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rotate-45 bg-[#ffb454]" /> ONSET</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-px bg-[#7dd6ff]" /> PLAYHEAD</span>
        <span className="ml-auto hidden sm:block">WINDOW 00:00–00:24 · 120 BPM · 60FPS SYNC</span>
      </div>
    </div>
  );
}

function JsonBlock() {
  return (
    <div className="flex h-full flex-col overflow-hidden border border-white/12 bg-[#08090b]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[9px] tracking-[0.24em] text-zinc-500">
        <span>timeline/frames/00-12.json</span>
        <span className="flex items-center gap-1.5 text-[#5effc3]"><Binary className="h-3 w-3" /> ZOD ✓ AJV ✓</span>
      </div>
      <pre className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-[1.75] text-zinc-400">
        <code>
          <span className="json-punct">{"{"}</span>{"\n"}
          {"  "}<span className="json-key">"schema"</span><span className="json-punct">:</span> <span className="json-str">"vector-one/timeline@4.2"</span><span className="json-punct">,</span>{"\n"}
          {"  "}<span className="json-key">"window"</span><span className="json-punct">:</span> {"{"} <span className="json-key">"from"</span><span className="json-punct">:</span> <span className="json-num">12.0</span><span className="json-punct">,</span> <span className="json-key">"to"</span><span className="json-punct">:</span> <span className="json-num">15.0</span> {"}"}<span className="json-punct">,</span>{"\n"}
          {"  "}<span className="json-key">"frames"</span><span className="json-punct">:</span> <span className="json-punct">[</span>{"\n"}
          {"    "}<span className="json-punct">{"{"}</span> <span className="json-key">"s"</span><span className="json-punct">:</span> <span className="json-num">12</span><span className="json-punct">,</span> <span className="json-key">"pitch"</span><span className="json-punct">:</span> <span className="json-num">60</span><span className="json-punct">,</span> <span className="json-key">"note"</span><span className="json-punct">:</span> <span className="json-str">"C4"</span><span className="json-punct">,</span>{"\n"}
          {"      "}<span className="json-key">"onset"</span><span className="json-punct">:</span> <span className="json-num">0.021</span><span className="json-punct">,</span> <span className="json-key">"velocity"</span><span className="json-punct">:</span> <span className="json-num">0.87</span><span className="json-punct">,</span> <span className="json-key">"conf"</span><span className="json-punct">:</span> <span className="json-num">0.98</span> <span className="json-punct">{"}"},</span>{"\n"}
          {"    "}<span className="json-punct">{"{"}</span> <span className="json-key">"s"</span><span className="json-punct">:</span> <span className="json-num">13</span><span className="json-punct">,</span> <span className="json-key">"pitch"</span><span className="json-punct">:</span> <span className="json-num">64</span><span className="json-punct">,</span> <span className="json-key">"note"</span><span className="json-punct">:</span> <span className="json-str">"E4"</span><span className="json-punct">,</span>{"\n"}
          {"      "}<span className="json-key">"onset"</span><span className="json-punct">:</span> <span className="json-num">0.004</span><span className="json-punct">,</span> <span className="json-key">"velocity"</span><span className="json-punct">:</span> <span className="json-num">0.74</span><span className="json-punct">,</span> <span className="json-key">"conf"</span><span className="json-punct">:</span> <span className="json-num">0.96</span> <span className="json-punct">{"}"},</span>{"\n"}
          {"    "}<span className="json-punct">{"{"}</span> <span className="json-key">"s"</span><span className="json-punct">:</span> <span className="json-num">14</span><span className="json-punct">,</span> <span className="json-key">"transient"</span><span className="json-punct">:</span> <span className="json-str">"hat"</span><span className="json-punct">,</span> <span className="json-key">"onset"</span><span className="json-punct">:</span> <span className="json-num">0.518</span><span className="json-punct">,</span>{"\n"}
          {"      "}<span className="json-key">"velocity"</span><span className="json-punct">:</span> <span className="json-num">0.52</span><span className="json-punct">,</span> <span className="json-key">"centroid"</span><span className="json-punct">:</span> <span className="json-num">6240.7</span> <span className="json-punct">{"}"}</span>{"\n"}
          {"  "}<span className="json-punct">],</span>{"\n"}
          {"  "}<span className="json-key">"tags"</span><span className="json-punct">:</span> <span className="json-punct">[</span><span className="json-str">"verse"</span><span className="json-punct">,</span> <span className="json-str">"build"</span><span className="json-punct">],</span>{"\n"}
          {"  "}<span className="json-key">"cursor"</span><span className="json-punct">:</span> <span className="json-str">"t+12.000 → msgpack@0x3F2A"</span>{"\n"}
          <span className="json-punct">{"}"}</span>
        </code>
      </pre>
    </div>
  );
}

export function AIPipeline() {
  return (
    <section id="ai" className="relative border-b border-white/10 bg-[#07080a] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_20%,rgba(183,155,255,0.06),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <SectionHeading
          index="02" icon={Sparkles}
          title="AUDIO IN. JSON OUT."
          sub="The tracking system dissects incoming audio second-by-second — every note, pitch deviation, onset transient and velocity — into a schema-guarded timeline. Fully on-device; there is no tracking of the user, only of the music."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          {/* steps */}
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 50}>
                <div className="group flex gap-5 border border-white/10 bg-[#0a0c0e] p-4 transition-colors hover:bg-[#0d1114]" style={{ borderLeft: `2px solid ${s.c}` }}>
                  <span className="font-mono text-lg font-bold" style={{ color: s.c }}>{s.n}</span>
                  <div>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-zinc-100">{s.t}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* visualizer + json */}
          <div className="flex flex-col gap-6">
            <Reveal delay={120}>
              <TimelineGrid />
            </Reveal>
            <Reveal delay={220} className="flex-1">
              <JsonBlock />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── latency budgets ─────────────────────────── */

const BUDGETS = [
  { stage: "AUDIO CALLBACK — 64 SPL @ 48 KHZ", ms: 1.33, max: 8.3, note: "CoreAudio device period", c: "#c8f94e" },
  { stage: "WORKLET QUANTUM — 128 SPL @ 48 KHZ", ms: 2.67, max: 8.3, note: "web render window", c: "#c8f94e" },
  { stage: "FX CHAIN — EQ · COMP · VERB · LIMIT", ms: 1.2, max: 8.3, note: "p95 measured, per strip", c: "#5effc3" },
  { stage: "AI FRAME — ONSET + PITCH (WORKER)", ms: 3.0, max: 8.3, note: "amortized per second", c: "#7dd6ff" },
  { stage: "SRC ALIGN — IMPORT RESAMPLE", ms: 0.4, max: 8.3, note: "libsamplerate sinc-fast", c: "#5effc3" },
  { stage: "UI FRAME — 120 HZ TIMELINE", ms: 8.3, max: 8.3, note: "pixi.js / skia vsync budget", c: "#ffb454" },
];

const TARGETS = [
  { k: "WEB", lines: ["audio worklet · 128-frame", "wasm-simd + threads", "sab ring buffer", "gpu: webgl2 / webgpu"] },
  { k: "IOS", lines: ["coreaudio · 64-frame", "auv3 host + metal ui", "ane via coreml", "swiftui console"] },
  { k: "ANDROID", lines: ["aaudio burst 2×96", "neon dsp + nnapi", "oboe latency tuner", "compose + skia"] },
  { k: "BUILD", lines: ["cmake 3.30 orchestration", "conan 2 lockfiles", "perfetto traces", "tsan on rt path"] },
];

export function Budgets() {
  return (
    <section id="budget" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <SectionHeading
          index="03" icon={Cpu}
          title="LATENCY AS A CONTRACT."
          sub="Every stage carries a hard millisecond budget enforced in CI by Google Benchmark and Perfetto traces. A regression of more than two percent on any realtime path fails the build."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <div className="border border-white/12 bg-[#0a0c0e]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[9px] tracking-[0.24em] text-zinc-500">
                <span>STAGE BUDGETS — MILLISECONDS</span>
                <span className="text-[#ffb454]">CEILING 8.3MS</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {BUDGETS.map((b) => (
                  <div key={b.stage} className="group px-5 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-mono text-[11px] tracking-[0.14em] text-zinc-300">{b.stage}</p>
                      <p className="font-mono text-[11px] tabular-nums" style={{ color: b.c }}>
                        {b.ms.toFixed(2)}ms
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-1.5 flex-1 bg-white/[0.06]">
                        <div
                          className="h-full transition-all duration-700 group-hover:brightness-125"
                          style={{ width: `${(b.ms / b.max) * 100}%`, background: b.c }}
                        />
                      </div>
                      <span className="w-40 text-right font-mono text-[9px] tracking-[0.12em] text-zinc-600">{b.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {TARGETS.map((t, i) => (
              <Reveal key={t.k} delay={i * 60}>
                <div className="h-full border border-white/12 bg-[#0a0c0e] p-5 transition-colors hover:border-[#c8f94e]/40">
                  <p className="flex items-center justify-between font-mono text-[12px] font-semibold tracking-[0.28em] text-zinc-100">
                    {t.k}
                    <Workflow className="h-3.5 w-3.5 text-zinc-600" />
                  </p>
                  <ul className="mt-4 space-y-2 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-zinc-500">
                    {t.lines.map((l) => (
                      <li key={l} className="flex items-start gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 bg-[#c8f94e]/70" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
