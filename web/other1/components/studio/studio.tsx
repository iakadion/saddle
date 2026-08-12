"use client";

/**
 * STUDIO — the workspace shell.
 * Rounded glass panels, tight spacing, mouse-follow spotlight and a floating
 * transport pill. Left rail tabs (gerar/importar/modelo/projetos), center
 * sequencer, right JSON/embedding inspector.
 * @module components/studio/studio
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  AudioWaveform,
  BrainCircuit,
  FileAudio,
  FolderOpen,
  Minus,
  Music4,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useStudio, transport, setMasterGain } from "@/lib/studio-store";
import { getAnalyser } from "@/lib/audio/engine";
import Sequencer from "@/components/studio/sequencer";
import { EmbeddingBars, GeneratorPanel, ImportPanel, ModelPanel, ProjectsPanel } from "@/components/studio/panels";
import { NOTE_NAMES } from "@/lib/audio/dsp";

function Spectrum() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv) return;
      const g = cv.getContext("2d");
      if (!g) return;
      const an = getAnalyser();
      const w = cv.width;
      const h = cv.height;
      g.clearRect(0, 0, w, h);
      if (!an) return;
      const data = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(data);
      const bars = 32;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const v = data[Math.floor((i / bars) * 220)] / 255;
        const bh = Math.max(1.5, v * (h - 4));
        g.fillStyle = v > 0.75 ? "#ff8a3d" : "#c8f94e";
        g.globalAlpha = 0.2 + v * 0.8;
        g.beginPath();
        g.roundRect(i * bw + 1, h - bh - 2, bw - 2.5, bh, 2);
        g.fill();
      }
      g.globalAlpha = 1;
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={180} height={32} className="h-8 w-[180px]" />;
}

const TABS = [
  { key: "gerar", label: "GERAR", icon: Sparkles },
  { key: "importar", label: "IMPORT", icon: FileAudio },
  { key: "modelo", label: "MODELO", icon: BrainCircuit },
  { key: "projetos", label: "ARQUIVO", icon: FolderOpen },
] as const;

export default function Studio() {
  const s = useStudio();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void s.refreshProjects();
    void s.refreshModel();
    transport.onStep = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spotlight = (e: React.MouseEvent) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={rootRef}
      onMouseMove={spotlight}
      className="relative min-h-screen bg-[#070809] font-sans text-zinc-200"
      style={{ "--mx": "50%", "--my": "0%" } as React.CSSProperties}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx) var(--my), rgba(200,249,78,0.055), transparent 70%), radial-gradient(900px circle at 85% 110%, rgba(125,214,255,0.045), transparent 65%)",
        }}
      />

      {/* floating transport pill */}
      <header className="sticky top-3 z-40 mx-auto w-fit max-w-[96vw]">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b0d10]/85 p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <Link href="/" className="mr-1 grid h-8 w-8 place-items-center rounded-full bg-[#c8f94e] text-[#060708] transition-transform hover:scale-105" title="VECTOR-ONE">
            <Music4 className="h-4 w-4" />
          </Link>
          <button
            onClick={s.playing ? s.stop : s.play}
            className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
              s.playing ? "bg-[#7dd6ff]/20 text-[#7dd6ff]" : "bg-[#c8f94e] text-[#060708] hover:scale-105 shadow-[0_0_20px_rgba(200,249,78,0.35)]"
            }`}
            aria-label={s.playing ? "Parar" : "Tocar"}
          >
            {s.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
          </button>
          <div className="flex items-center rounded-full bg-white/[0.05] px-1">
            <button onClick={() => s.setBpm(s.bpm - 1)} className="grid h-7 w-6 place-items-center text-zinc-500 hover:text-zinc-200" aria-label="BPM -">
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-14 text-center font-mono text-[11px] tabular-nums text-zinc-200">
              {s.bpm}<span className="text-[8px] text-zinc-600"> bpm</span>
            </span>
            <button onClick={() => s.setBpm(s.bpm + 1)} className="grid h-7 w-6 place-items-center text-zinc-500 hover:text-zinc-200" aria-label="BPM +">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="hidden md:block">
            <Spectrum />
          </div>

          <p className="hidden max-w-44 truncate px-1 font-mono text-[9px] text-zinc-500 xl:block">
            <span className="text-[#c8f94e]">▸</span> {s.status}
          </p>

          <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />

          {(
            [
              ["WAV", s.exportWav],
              ["MP3", s.exportMp3],
              ["MID", s.exportMidi],
            ] as const
          ).map(([label, fn]) => (
            <button
              key={label}
              onClick={() => void fn()}
              disabled={!s.doc || s.exporting}
              className="rounded-full bg-white/[0.05] px-3 py-1.5 font-mono text-[8.5px] tracking-[0.14em] text-zinc-400 transition-all hover:bg-white/[0.1] hover:text-zinc-100 disabled:opacity-30"
            >
              {label}
            </button>
          ))}
          <button
            onClick={s.exportJson}
            disabled={!s.doc}
            className="rounded-full bg-white/[0.05] px-3 py-1.5 font-mono text-[8.5px] tracking-[0.14em] text-zinc-400 transition-all hover:bg-white/[0.1] hover:text-zinc-100 disabled:opacity-30"
          >
            JSON
          </button>
          <input
            type="range" min={0} max={1} step={0.01} defaultValue={0.9}
            onChange={(e) => setMasterGain(Number(e.target.value))}
            className="hidden w-14 accent-[#c8f94e] 2xl:block"
            aria-label="Volume"
          />
          <span className="hidden items-center gap-1 rounded-full border border-[#c8f94e]/25 px-2.5 py-1 font-mono text-[8px] text-[#c8f94e] lg:flex">
            <ShieldCheck className="h-3 w-3" /> 0 trk
          </span>
        </div>
      </header>

      {/* workspace */}
      <div className="relative mx-auto grid max-w-[1500px] gap-2.5 p-2.5 lg:grid-cols-[310px_1fr_300px]">
        <aside className="rounded-3xl border border-white/[0.08] bg-[#0b0d10]/80 p-3.5 backdrop-blur-sm">
          <div className="mb-3 grid grid-cols-4 gap-1 rounded-full bg-white/[0.04] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => s.setPanel(t.key)}
                className={`flex items-center justify-center gap-1 rounded-full py-1.5 font-mono text-[7.5px] tracking-[0.1em] transition-all ${
                  s.activePanel === t.key ? "bg-[#c8f94e] text-[#060708] font-semibold" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                <t.icon className="h-3 w-3" />
                <span className="hidden xl:inline">{t.label}</span>
              </button>
            ))}
          </div>
          {s.activePanel === "gerar" && <GeneratorPanel />}
          {s.activePanel === "importar" && <ImportPanel />}
          {s.activePanel === "modelo" && <ModelPanel />}
          {s.activePanel === "projetos" && <ProjectsPanel />}
        </aside>

        <section className="rounded-3xl border border-white/[0.08] bg-[#0b0d10]/80 p-2.5 backdrop-blur-sm">
          <Sequencer />
          <DocStrip />
        </section>

        <aside className="rounded-3xl border border-white/[0.08] bg-[#0b0d10]/80 p-3.5 backdrop-blur-sm">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}

function DocStrip() {
  const doc = useStudio((st) => st.doc);
  if (!doc) return null;
  const seconds = ((doc.bars * 4 * 60) / doc.bpm).toFixed(0);
  return (
    <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2">
      <AudioWaveform className="h-3.5 w-3.5 shrink-0 text-[#c8f94e]" />
      <div className="min-w-0 flex-1">
        <EmbeddingBars vector={doc.embedding} compact />
      </div>
      <div className="flex shrink-0 gap-1.5 font-mono text-[8px] text-zinc-500">
        <span>{seconds}s</span>
        <span className="text-zinc-700">·</span>
        <span>{NOTE_NAMES[doc.root]} {doc.scale}</span>
        <span className="hidden text-zinc-700 sm:inline">32-dim</span>
      </div>
    </div>
  );
}

function Inspector() {
  const timeline = useStudio((st) => st.timeline);
  const doc = useStudio((st) => st.doc);

  if (timeline) {
    return (
      <div>
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.22em] text-zinc-500">
          <FileAudio className="h-3 w-3 text-[#7dd6ff]" /> TIMELINE / SEGUNDO
        </p>
        <div className="max-h-[68vh] space-y-1.5 overflow-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {timeline.frames.map((f) => (
            <div key={f.s} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="flex items-center justify-between font-mono text-[9px]">
                <span className="text-zinc-300 tabular-nums">s{String(f.s).padStart(2, "0")}</span>
                <span className="text-zinc-600">{f.events.length} ev · {f.rms.toFixed(2)}</span>
              </div>
              {f.events.length > 0 && (
                <p className="mt-1 truncate font-mono text-[8px] text-zinc-500">
                  {f.events.slice(0, 3).map((e) => (e.kind === "note" ? e.note : "▪")).join(" ")}
                </p>
              )}
              <div className="mt-1">
                <EmbeddingBars vector={f.embedding} color="#7dd6ff" compact />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 font-mono text-[8.5px] tracking-[0.22em] text-zinc-500">DOC JSON</p>
      {doc ? (
        <pre className="max-h-[58vh] overflow-auto rounded-2xl bg-white/[0.03] p-3 font-mono text-[9px] leading-relaxed text-zinc-500" style={{ scrollbarWidth: "thin" }}>
{JSON.stringify(
  {
    bpm: doc.bpm,
    key: `${NOTE_NAMES[doc.root]} ${doc.scale}`,
    mood: doc.mood,
    bars: doc.bars,
    notas: doc.notes.length,
    bateria: { kick: doc.drums.kick.reduce((a, b) => a + b, 0), snare: doc.drums.snare.reduce((a, b) => a + b, 0), hat: doc.drums.hat.reduce((a, b) => a + b, 0), clap: doc.drums.clap.reduce((a, b) => a + b, 0) },
    emb: doc.embedding.slice(0, 12).map((x) => Number(x.toFixed(2))),
  },
  null,
  2,
)}
        </pre>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
          <p className="font-mono text-[9.5px] leading-relaxed text-zinc-600">gere ou importe p/ ver o JSON</p>
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 font-mono text-[8px] leading-relaxed text-zinc-600">
        <ShieldCheck className="h-3 w-3 shrink-0 text-[#c8f94e]" /> inferência & vetores locais — sem rastreamento
      </p>
    </div>
  );
}
