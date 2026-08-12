"use client";

/**
 * STUDIO PANELS — compact controls with minimal copy:
 * GeneratorPanel (prompt + duration + variation + save-train),
 * ImportPanel (audio → JSON + embeddings + template),
 * ModelPanel (local training stats) and ProjectsPanel (library).
 * @module components/studio/panels
 */

import { useRef, type ReactNode } from "react";
import { Download, RefreshCcw, Sparkles, Trash2, Upload, Wand2 } from "lucide-react";
import { DURATIONS, useStudio } from "@/lib/studio-store";
import type { ProjectDTO } from "@/lib/studio-repo";
import { NOTE_NAMES } from "@/lib/audio/dsp";

const KIND_STYLE: Record<string, string> = {
  generated: "text-[#c8f94e] bg-[#c8f94e]/10",
  import: "text-[#7dd6ff] bg-[#7dd6ff]/10",
  variation: "text-[#b79bff] bg-[#b79bff]/10",
};

/** Compact 32-dim embedding visualizer (rounded bars). */
export function EmbeddingBars({ vector, color = "#c8f94e", compact = false }: { vector: number[]; color?: string; compact?: boolean }) {
  return (
    <div className={`flex items-end gap-[2px] ${compact ? "h-7" : "h-12"}`}>
      {vector.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px]"
          style={{ height: `${Math.max(5, Math.min(100, v * 85))}%`, background: color, opacity: 0.3 + Math.min(0.7, v * 0.8) }}
        />
      ))}
    </div>
  );
}

function Chip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] tracking-wide ${accent ? "bg-[#c8f94e] text-[#060708] font-semibold" : "bg-white/[0.06] text-zinc-400"}`}>
      {children}
    </span>
  );
}

// ── GERAR ────────────────────────────────────────────────────────────────────

export function GeneratorPanel() {
  const s = useStudio();
  return (
    <div className="space-y-3">
      <textarea
        value={s.prompt}
        onChange={(e) => s.setPrompt(e.target.value)}
        rows={2}
        placeholder={"trap sombrio 92 bpm em C#…"}
        className="w-full resize-none rounded-2xl border border-white/10 bg-[#0b0d10] p-3 font-mono text-[12px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-[#c8f94e]/50 focus:outline-none"
      />

      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[9px] text-zinc-600">DURAÇÃO</span>
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => s.setDuration(d)}
            className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] transition-all ${s.duration === d ? "bg-[#c8f94e] text-[#060708] font-semibold scale-105" : "bg-white/[0.05] text-zinc-500 hover:bg-white/[0.1] hover:text-zinc-300"}`}
          >
            {d >= 60 ? `${(d / 60).toFixed(d % 60 ? 1 : 0)}m` : `${d}s`}
          </button>
        ))}
      </div>

      <button
        onClick={() => void s.generate()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c8f94e] py-3 font-mono text-[11px] font-semibold tracking-[0.18em] text-[#060708] shadow-[0_0_24px_rgba(200,249,78,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(200,249,78,0.4)] active:translate-y-0"
      >
        <Sparkles className="h-4 w-4" />
        GERAR
      </button>

      {s.doc && (
        <div className="flex flex-wrap gap-1.5">
          <Chip accent>{s.bpm} BPM</Chip>
          <Chip>{NOTE_NAMES[s.doc.root]} {s.doc.scale}</Chip>
          <Chip>{s.doc.notes.length} notas</Chip>
          <Chip>{s.doc.bars} comp.</Chip>
          {s.sections > 0 && <Chip>{s.sections} seções</Chip>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="range" min={0.05} max={0.9} step={0.05} value={s.variationT}
          onChange={(e) => s.setVariationT(Number(e.target.value))}
          className="flex-1 accent-[#b79bff]"
          aria-label="Intensidade da variação"
        />
        <span className="w-9 text-right font-mono text-[10px] text-[#b79bff] tabular-nums">{Math.round(s.variationT * 100)}%</span>
        <button
          onClick={s.makeVariation}
          disabled={!s.doc}
          className="flex items-center gap-1.5 rounded-full border border-[#b79bff]/40 px-3.5 py-2 font-mono text-[9.5px] text-[#b79bff] transition-all hover:bg-[#b79bff] hover:text-[#060708] disabled:opacity-30"
        >
          <Wand2 className="h-3 w-3" /> VARIAR
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={s.projectName}
          onChange={(e) => s.setProjectName(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#0b0d10] px-3.5 py-2.5 font-mono text-[11px] text-zinc-200 focus:border-[#5effc3]/50 focus:outline-none"
          placeholder="nome"
        />
        <button
          onClick={() => void s.saveAndTrain()}
          disabled={!s.doc}
          className="rounded-full border border-[#5effc3]/40 px-4 py-2.5 font-mono text-[9.5px] tracking-[0.14em] text-[#5effc3] transition-all hover:bg-[#5effc3] hover:text-[#060708] disabled:opacity-30"
        >
          SALVAR+TREINAR
        </button>
      </div>
      <p className="font-mono text-[8.5px] leading-relaxed text-zinc-600">
        cada save ensina o modelo: bigramas, groove e embeddings condicionam a próxima geração.
      </p>
    </div>
  );
}

// ── IMPORTAR ─────────────────────────────────────────────────────────────────

export function ImportPanel() {
  const s = useStudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = s.analyzePhase === "decoding" || s.analyzePhase === "analyzing" || s.analyzePhase === "uploading";
  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void s.analyzeFile(f);
  };

  const phases = ["idle", "decoding", "analyzing", "uploading"];
  const phaseIdx = phases.indexOf(s.analyzePhase === "error" ? "uploading" : s.analyzePhase);

  return (
    <div className="space-y-3">
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed px-4 py-7 transition-all ${
          busy ? "border-[#7dd6ff]/60 text-[#7dd6ff] bg-[#7dd6ff]/5" : "border-white/15 text-zinc-500 hover:border-[#7dd6ff]/50 hover:bg-white/[0.02] hover:text-[#7dd6ff]"
        }`}
      >
        {busy ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        <span className="font-mono text-[10px] tracking-[0.16em]">{busy ? "PROCESSANDO…" : "ARRASTE O ÁUDIO"}</span>
        <span className="font-mono text-[8.5px] text-zinc-600">wav · mp3 · ogg · m4a · completo, sem corte</span>
      </button>
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <div className="flex items-center justify-center gap-1.5">
        {["DECODE", "FFT/ONSET", "PITCH", "VETOR"].map((p, i) => (
          <span
            key={p}
            className={`rounded-full px-2 py-0.5 font-mono text-[8px] transition-colors ${
              s.analyzePhase === "done" || phaseIdx > i ? "bg-[#c8f94e]/15 text-[#c8f94e]" : phaseIdx === i && busy ? "bg-[#7dd6ff]/15 text-[#7dd6ff]" : "bg-white/[0.04] text-zinc-600"
            }`}
          >
            {p}
          </span>
        ))}
      </div>

      {s.timeline && (
        <div className="rounded-2xl border border-white/10 bg-[#0b0d10] p-3">
          <div className="flex flex-wrap gap-1.5">
            <Chip accent>{s.timeline.frames.length}s</Chip>
            <Chip>{s.timeline.bpm} bpm</Chip>
            <Chip>{s.timeline.frames.reduce((a, f) => a + f.events.length, 0)} eventos</Chip>
          </div>
          <div className="mt-2.5">
            <EmbeddingBars vector={s.timeline.embedding} color="#7dd6ff" compact />
          </div>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(s.timeline, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "timeline.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
            }}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#7dd6ff]/40 py-2 font-mono text-[9px] tracking-[0.18em] text-[#7dd6ff] transition-all hover:bg-[#7dd6ff] hover:text-[#060708]"
          >
            <Download className="h-3 w-3" /> TIMELINE.JSON
          </button>
        </div>
      )}

      {s.analyzeResult?.templateDoc && (
        <button
          onClick={s.loadTemplate}
          className="w-full rounded-full bg-[#b79bff]/15 py-2.5 font-mono text-[9.5px] tracking-[0.16em] text-[#b79bff] transition-all hover:bg-[#b79bff] hover:text-[#060708]"
        >
          TEMPLATE IA · {s.analyzeResult.templateDoc.notes.length} NOTAS
        </button>
      )}

      {s.analyzeResult && s.analyzeResult.similar.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[8.5px] tracking-[0.2em] text-zinc-600">SIMILARES</p>
          <ul className="space-y-1">
            {s.analyzeResult.similar.slice(0, 4).map((sim) => (
              <li key={sim.id} className="flex items-center justify-between rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 font-mono text-[9.5px]">
                <span className="truncate text-zinc-300">{sim.name}</span>
                <span className="ml-2 shrink-0 tabular-nums text-[#c8f94e]">{(sim.score * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── MODELO ───────────────────────────────────────────────────────────────────

export function ModelPanel() {
  const s = useStudio();
  if (!s.model) return <p className="font-mono text-[10px] text-zinc-600">…</p>;

  const bigrams = Object.entries(s.model.noteBigram)
    .flatMap(([from, tos]) => Object.entries(tos).map(([to, count]) => ({ from: Number(from), to: Number(to), count })))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { k: "aprendidos", v: s.model.trainedOn, c: "#c8f94e" },
          { k: "transições", v: Object.keys(s.model.noteBigram).length, c: "#b79bff" },
        ].map((t) => (
          <div key={t.k} className="rounded-2xl bg-white/[0.04] p-3 text-center">
            <div className="text-2xl font-bold tabular-nums" style={{ color: t.c }}>{t.v}</div>
            <div className="mt-0.5 font-mono text-[8px] tracking-[0.16em] text-zinc-500">{t.k.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/[0.04] p-2.5">
        <EmbeddingBars vector={s.model.centroid} color="#5effc3" />
      </div>

      {bigrams.length > 0 && (
        <ul className="space-y-1 font-mono text-[9.5px]">
          {bigrams.map((b, i) => (
            <li key={i} className="flex justify-between rounded-full bg-white/[0.03] px-3 py-1.5 text-zinc-400">
              <span>
                {NOTE_NAMES[((b.from % 12) + 12) % 12]}{Math.floor(b.from / 12) - 1} → {NOTE_NAMES[((b.to % 12) + 12) % 12]}{Math.floor(b.to / 12) - 1}
              </span>
              <span className="text-zinc-600 tabular-nums">×{b.count}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(s.model.scaleAffinity).map(([k, v]) => (
          <Chip key={k}>{k} ·{v}</Chip>
        ))}
      </div>

      <button
        onClick={() => void s.retrainAll()}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#5effc3]/40 py-2.5 font-mono text-[9.5px] tracking-[0.18em] text-[#5effc3] transition-all hover:bg-[#5effc3] hover:text-[#060708]"
      >
        <RefreshCcw className="h-3.5 w-3.5" /> RETREINAR
      </button>
    </div>
  );
}

// ── PROJETOS ─────────────────────────────────────────────────────────────────

export function ProjectsPanel() {
  const s = useStudio();
  if (s.projects.length === 0) {
    return <p className="font-mono text-[10px] leading-relaxed text-zinc-600">vazio — gere ou importe e salve.</p>;
  }
  return (
    <ul className="space-y-2">
      {s.projects.map((p: ProjectDTO) => (
        <li
          key={p.id}
          className={`rounded-2xl border p-3 transition-all ${s.selectedProjectId === p.id ? "border-[#c8f94e]/40 bg-[#c8f94e]/5" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-mono text-[11px] text-zinc-200">{p.name}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] ${KIND_STYLE[p.kind] ?? "bg-white/10 text-zinc-400"}`}>{p.kind}</span>
          </div>
          <p className="mt-0.5 font-mono text-[8.5px] text-zinc-600">{p.bpm} bpm · {p.mood}</p>
          <div className="mt-1.5">
            <EmbeddingBars vector={Array.isArray(p.embedding) ? p.embedding : []} color={p.kind === "import" ? "#7dd6ff" : p.kind === "variation" ? "#b79bff" : "#c8f94e"} compact />
          </div>
          <div className="mt-2 flex gap-1.5">
            <button
              onClick={() => void s.loadProject(p.id)}
              className="flex-1 rounded-full border border-white/12 py-1.5 font-mono text-[8.5px] tracking-[0.16em] text-zinc-300 transition-all hover:border-[#c8f94e]/50 hover:text-[#c8f94e]"
            >
              ABRIR
            </button>
            <button
              onClick={() => void s.removeProject(p.id)}
              className="rounded-full border border-white/12 px-2.5 py-1.5 text-zinc-500 transition-all hover:border-[#ff6f6f]/50 hover:text-[#ff6f6f]"
              aria-label="Excluir"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
