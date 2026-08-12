"use client";

/**
 * VECTOR-ONE STUDIO STORE — client orchestration (zustand).
 * Long-form generation (section-chained variations), variation engine,
 * audio dissection ingest, local model training and WAV/MP3/MIDI/JSON export.
 * @module lib/studio-store
 */

import { create } from "zustand";
import { Midi } from "@tonejs/midi";
import type { ModelState, ProjectDoc, Timeline } from "@/lib/audio/schema";
import { ProjectDocSchema } from "@/lib/audio/schema";
import { composeLong, vary, noteName } from "@/lib/audio/generator";
import { embedProject } from "@/lib/audio/embedding";
import { Transport, ensureContext, renderToMp3, renderToWav, setMasterGain, setSendMix } from "@/lib/audio/engine";
import type { ProjectDTO } from "@/lib/studio-repo";

/** Single shared transport instance (audio clock lives in the engine). */
export const transport = new Transport();

export interface AnalyzeResult {
  seconds: number;
  frames: number;
  events: number;
  templateDoc: ProjectDoc | null;
  templateId: number | null;
  similar: { id: number; name: string; kind: string; score: number }[];
}

export type AnalyzePhase = "idle" | "decoding" | "analyzing" | "uploading" | "done" | "error";

/** Target durations offered in the UI (seconds). */
export const DURATIONS = [30, 60, 90, 120, 180] as const;

interface StudioState {
  doc: ProjectDoc | null;
  playing: boolean;
  prompt: string;
  projectName: string;
  bpm: number;
  /** target song length in seconds (30–180) */
  duration: number;
  /** sections of the last generated song */
  sections: number;
  model: ModelState | null;
  projects: ProjectDTO[];
  selectedProjectId: number | null;
  timeline: Timeline | null;
  timelineName: string;
  analyzePhase: AnalyzePhase;
  analyzeResult: AnalyzeResult | null;
  status: string;
  variationT: number;
  activePanel: "gerar" | "importar" | "modelo" | "projetos";
  exporting: boolean;

  setPrompt: (v: string) => void;
  setProjectName: (v: string) => void;
  setPanel: (p: StudioState["activePanel"]) => void;
  setStatus: (s: string) => void;
  setBpm: (bpm: number) => void;
  setDuration: (s: number) => void;
  setVariationT: (t: number) => void;

  generate: () => Promise<void>;
  makeVariation: () => void;
  toggleNote: (step: number, pitch: number) => void;
  toggleDrum: (lane: "kick" | "snare" | "hat" | "clap", idx: number) => void;
  play: () => void;
  stop: () => void;

  saveAndTrain: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshModel: () => Promise<void>;
  retrainAll: () => Promise<void>;
  loadProject: (id: number) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
  loadTemplate: () => void;

  analyzeFile: (file: File) => Promise<void>;
  exportWav: () => Promise<void>;
  exportMp3: () => Promise<void>;
  exportJson: () => void;
  exportMidi: () => Promise<void>;
}

function seedDoc(): ProjectDoc {
  return composeLong("dark trap 92 bpm fl studio", null, 12).doc;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function suggestName(prompt: string): string {
  const words = prompt.toLowerCase().replace(/[^a-zà-ú0-9 ]/gi, "").split(/\s+/).filter(Boolean).slice(0, 3);
  return (words.join("-") || "faixa").slice(0, 40);
}

export const useStudio = create<StudioState>((set, get) => ({
  doc: null,
  playing: false,
  prompt: "",
  projectName: "minha-faixa-01",
  bpm: 96,
  duration: 45,
  sections: 0,
  model: null,
  projects: [],
  selectedProjectId: null,
  timeline: null,
  timelineName: "",
  analyzePhase: "idle",
  analyzeResult: null,
  status: "pronto",
  variationT: 0.35,
  activePanel: "gerar",
  exporting: false,

  setPrompt: (v) => set({ prompt: v }),
  setProjectName: (v) => set({ projectName: v }),
  setPanel: (p) => set({ activePanel: p }),
  setStatus: (s) => set({ status: s }),
  setVariationT: (t) => set({ variationT: t }),
  setDuration: (s) => set({ duration: s }),
  setBpm: (bpm) => {
    const { doc, playing } = get();
    const clamped = Math.min(220, Math.max(50, Math.round(bpm)));
    set({ bpm: clamped, doc: doc ? { ...doc, bpm: clamped } : null });
    if (playing) {
      const d = get().doc;
      if (d) transport.start(d);
    }
  },

  generate: async () => {
    const { prompt, model, duration } = get();
    const text = prompt.trim() || "dark trap beat 96 bpm";
    set({ status: "gerando…" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, seconds: duration }),
      });
      if (!res.ok) throw new Error("api");
      const json = (await res.json()) as { data: ProjectDoc; sections: number; seconds: number; conditionedOn: number };
      const doc = ProjectDocSchema.parse(json.data);
      set({
        doc,
        bpm: doc.bpm,
        sections: json.sections,
        projectName: suggestName(text),
        status: `${doc.notes.length} notas · ${json.sections} seções`,
      });
    } catch {
      const { doc, sections } = composeLong(text, model, duration);
      set({ doc, bpm: doc.bpm, sections, projectName: suggestName(text), status: `${doc.notes.length} notas · ${sections} seções (local)` });
    }
  },

  makeVariation: () => {
    const { doc, model, variationT } = get();
    if (!doc) return;
    const out = vary(doc, model?.centroid ?? null, model, variationT);
    set({ doc: out, projectName: `${get().projectName}-v${Math.round(variationT * 100)}`, status: `variação ${(variationT * 100).toFixed(0)}%` });
  },

  toggleNote: (step, pitch) => {
    const { doc, playing } = get();
    const base = doc ?? seedDoc();
    const i = base.notes.findIndex((n) => n.step === step && n.pitch === pitch && n.voice === "lead");
    const notes = i >= 0 ? base.notes.filter((_, k) => k !== i) : [...base.notes, { step, pitch, vel: 0.8, dur: 1, voice: "lead" as const }];
    const next = { ...base, notes };
    next.embedding = embedProject(next);
    set({ doc: next });
    if (playing) transport.start(next);
  },

  toggleDrum: (lane, idx) => {
    const { doc, playing } = get();
    const base = doc ?? seedDoc();
    const drums = {
      kick: [...base.drums.kick],
      snare: [...base.drums.snare],
      hat: [...base.drums.hat],
      clap: [...base.drums.clap],
    };
    drums[lane][idx] = drums[lane][idx] ? 0 : 1;
    const next = { ...base, drums };
    next.embedding = embedProject(next);
    set({ doc: next });
    if (playing) transport.start(next);
  },

  play: () => {
    const { doc } = get();
    const d = doc ?? seedDoc();
    ensureContext();
    transport.start(d);
    set({ playing: true, doc: d, bpm: d.bpm, status: `${d.bpm} bpm · ${d.notes.length} notas · ${d.bars} compassos` });
  },

  stop: () => {
    transport.stop();
    set({ playing: false, status: "parado" });
  },

  saveAndTrain: async () => {
    const { doc, projectName, prompt, selectedProjectId } = get();
    if (!doc) return;
    set({ status: "salvando…" });
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, kind: doc.mood.includes("var") ? "variation" : "generated", prompt, doc, embedding: doc.embedding, parentId: selectedProjectId }),
      });
      const res = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainDoc: doc }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data: ModelState };
        set({ model: json.data, status: `treinado · ${json.data.trainedOn}` });
      }
    } catch {
      set({ status: "falha ao salvar" });
    }
    void get().refreshProjects();
  },

  refreshProjects: async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const json = (await res.json()) as { data: ProjectDTO[] };
      set({ projects: json.data });
    } catch {
      // offline
    }
  },

  refreshModel: async () => {
    try {
      const res = await fetch("/api/model");
      if (!res.ok) return;
      const json = (await res.json()) as { data: ModelState };
      set({ model: json.data });
    } catch {
      // offline
    }
  },

  retrainAll: async () => {
    set({ status: "retreinando…" });
    try {
      const res = await fetch("/api/model", { method: "PUT" });
      if (res.ok) {
        const json = (await res.json()) as { data: ModelState };
        set({ model: json.data, status: `${json.data.trainedOn} projetos` });
      }
    } catch {
      set({ status: "falha no retreino" });
    }
  },

  loadProject: async (id) => {
    const { projects, playing } = get();
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    const parsed = ProjectDocSchema.safeParse(p.doc);
    if (parsed.success) {
      const doc = parsed.data;
      set({ doc, bpm: doc.bpm, selectedProjectId: id, projectName: p.name, timeline: null, status: p.name });
      if (playing) transport.start(doc);
    } else {
      set({ status: "import — abra na aba importar" });
    }
  },

  removeProject: async (id) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    void get().refreshProjects();
  },

  loadTemplate: () => {
    const { analyzeResult } = get();
    if (!analyzeResult?.templateDoc) return;
    const doc = analyzeResult.templateDoc;
    set({ doc, bpm: doc.bpm, selectedProjectId: analyzeResult.templateId, projectName: "template-importado", status: `template · ${doc.notes.length} notas · ${doc.bars} comp.` });
  },

  analyzeFile: async (file) => {
    set({ analyzePhase: "decoding", timeline: null, analyzeResult: null, status: `decodificando…` });
    try {
      const { analyzeAudioBuffer } = await import("@/lib/audio/analysis");
      const arrayBuf = await file.arrayBuffer();
      const ac = ensureContext();
      const audioBuf = await ac.decodeAudioData(arrayBuf.slice(0));
      set({ analyzePhase: "analyzing", status: "destrinchando…" });
      const timeline = await analyzeAudioBuffer(audioBuf);
      set({ timeline, timelineName: file.name, analyzePhase: "uploading", status: "vetorizando…" });

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(/\.[^.]+$/, ""), timeline }),
      });
      if (!res.ok) throw new Error("analyze api");
      const json = (await res.json()) as {
        frames: number;
        events: number;
        seconds: number;
        templateId: number | null;
        template: { doc?: unknown } | null;
        similar: { id: number; name: string; kind: string; score: number }[];
      };
      let templateDoc: ProjectDoc | null = null;
      const parsed = ProjectDocSchema.safeParse(json.template?.doc);
      if (parsed.success) templateDoc = parsed.data;
      set({
        analyzePhase: "done",
        analyzeResult: { seconds: json.seconds, frames: json.frames, events: json.events, templateDoc, templateId: json.templateId, similar: json.similar },
        status: `${json.frames}s · ${json.events} eventos`,
      });
      void get().refreshProjects();
    } catch (e) {
      set({ analyzePhase: "error", status: `falha: ${e instanceof Error ? e.message : "erro"}` });
    }
  },

  exportWav: async () => {
    const { doc, projectName } = get();
    if (!doc) return;
    set({ exporting: true, status: "wav…" });
    const blob = await renderToWav(doc);
    if (blob) download(blob, `${projectName}.wav`);
    set({ exporting: false, status: "wav ok" });
  },

  exportMp3: async () => {
    const { doc, projectName } = get();
    if (!doc) return;
    set({ exporting: true, status: "mp3…" });
    const blob = await renderToMp3(doc);
    if (blob) download(blob, `${projectName}.mp3`);
    set({ exporting: false, status: "mp3 ok" });
  },

  exportJson: () => {
    const { doc, projectName } = get();
    if (!doc) return;
    download(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `${projectName}.json`);
    set({ status: "json ok" });
  },

  exportMidi: async () => {
    const { doc, projectName } = get();
    if (!doc) return;
    const midi = new Midi();
    midi.header.setTempo(doc.bpm);
    const track = midi.addTrack();
    track.name = projectName;
    const stepTicks = midi.header.ppq / 4;
    for (const n of doc.notes) {
      track.addNote({
        midi: Math.round(n.pitch),
        ticks: Math.round(n.step * stepTicks),
        durationTicks: Math.round(n.dur * stepTicks),
        velocity: n.vel,
        name: noteName(n.pitch),
      });
    }
    const drumTrack = midi.addTrack();
    drumTrack.name = "drums";
    const map: [number[], number][] = [
      [doc.drums.kick, 36],
      [doc.drums.snare, 38],
      [doc.drums.hat, 42],
      [doc.drums.clap, 39],
    ];
    for (let bar = 0; bar < doc.bars; bar++) {
      for (const [lane, pitch] of map) {
        lane.forEach((on, s) => {
          if (on) drumTrack.addNote({ midi: pitch, ticks: Math.round((bar * 16 + s) * stepTicks), durationTicks: Math.round(stepTicks), velocity: 0.9 });
        });
      }
    }
    const bytes = midi.toArray();
    download(new Blob([bytes.buffer as ArrayBuffer], { type: "audio/midi" }), `${projectName}.mid`);
    set({ status: "midi ok" });
  },
}));

export { setMasterGain, setSendMix };
