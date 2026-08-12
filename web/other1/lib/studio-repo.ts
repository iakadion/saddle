// ─────────────────────────────────────────────────────────────────────────────
// STUDIO REPOSITORY — projects, per-second segments, local model training.
// Primary store: PostgreSQL via Drizzle. Resilient in-memory fallback keeps
// the product usable even while the schema push is pending.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/db";
import { modelState, projects, segments } from "@/db/schema";
import { cosineSimilarity, meanEmbedding } from "@/lib/audio/dsp";
import { embedProject } from "@/lib/audio/embedding";
import {
  ModelStateSchema,
  ProjectDocSchema,
  emptyModel,
  type ModelState,
  type ProjectDoc,
} from "@/lib/audio/schema";
import { desc, eq } from "drizzle-orm";

export interface ProjectDTO {
  id: number;
  name: string;
  kind: string;
  prompt: string;
  bpm: number;
  root: number;
  scale: string;
  mood: string;
  doc: unknown;
  embedding: number[];
  parentId: number | null;
  createdAt: string;
  similarCount?: number;
}

interface MemStore {
  projects: ProjectDTO[];
  segments: { id: number; projectId: number; second: number; rms: number; centroid: number; events: unknown; embedding: number[] }[];
  model: ModelState;
  nextId: number;
}

const g = globalThis as typeof globalThis & { __voneMem?: MemStore };
function mem(): MemStore {
  if (!g.__voneMem) {
    g.__voneMem = { projects: [], segments: [], model: emptyModel(), nextId: 1 };
  }
  return g.__voneMem;
}

async function dbSelectMany<T>(fn: () => Promise<T[]>): Promise<T[] | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<ProjectDTO[]> {
  const rows = await dbSelectMany(() => db.select().from(projects).orderBy(desc(projects.id)).limit(200));
  if (rows !== null) {
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind,
      prompt: r.prompt ?? "",
      bpm: r.bpm,
      root: r.root,
      scale: r.scale,
      mood: r.mood ?? "neutral",
      doc: r.doc,
      embedding: (r.embedding as number[]) ?? [],
      parentId: r.parentId,
      createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
    }));
  }
  return [...mem().projects].sort((a, b) => b.id - a.id).slice(0, 200);
}

export interface NewProject {
  name: string;
  kind: string;
  prompt: string;
  doc: unknown;
  embedding: number[];
  parentId?: number | null;
}

function metaFromDoc(doc: unknown, kind: string): { bpm: number; root: number; scale: string; mood: string } {
  const anyDoc = doc as { bpm?: number; root?: number; scale?: string; mood?: string } | null;
  return {
    bpm: Math.round(anyDoc?.bpm ?? 120),
    root: anyDoc?.root ?? 0,
    scale: anyDoc?.scale ?? "minor",
    mood: anyDoc?.mood ?? (kind === "import" ? "imported" : "neutral"),
  };
}

export async function createProject(input: NewProject): Promise<ProjectDTO | null> {
  const meta = metaFromDoc(input.doc, input.kind);
  const base = {
    name: input.name.slice(0, 128),
    kind: input.kind,
    prompt: input.prompt.slice(0, 2000),
    bpm: meta.bpm,
    root: meta.root,
    scale: meta.scale,
    mood: meta.mood,
    doc: input.doc as Record<string, unknown>,
    embedding: input.embedding,
    parentId: input.parentId ?? null,
  };
  try {
    const rows = await db.insert(projects).values(base).returning();
    const r = rows[0];
    if (r) {
      return {
        id: r.id,
        ...base,
        doc: r.doc,
        createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
      } as ProjectDTO;
    }
  } catch {
    // fall through to memory
  }
  const m = mem();
  const dto: ProjectDTO = {
    id: m.nextId++,
    ...base,
    createdAt: new Date().toISOString(),
  };
  m.projects.push(dto);
  return dto;
}

export async function getProject(id: number): Promise<ProjectDTO | null> {
  try {
    const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    const r = rows[0];
    if (r) {
      return {
        id: r.id,
        name: r.name,
        kind: r.kind,
        prompt: r.prompt ?? "",
        bpm: r.bpm,
        root: r.root,
        scale: r.scale,
        mood: r.mood ?? "neutral",
        doc: r.doc,
        embedding: (r.embedding as number[]) ?? [],
        parentId: r.parentId,
        createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
      };
    }
  } catch {
    // ignore
  }
  return mem().projects.find((p) => p.id === id) ?? null;
}

export async function deleteProject(id: number): Promise<boolean> {
  try {
    await db.delete(segments).where(eq(segments.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  } catch {
    // ignore
  }
  const m = mem();
  const i = m.projects.findIndex((p) => p.id === id);
  if (i >= 0) m.projects.splice(i, 1);
  m.segments = m.segments.filter((s) => s.projectId !== id);
  return true;
}

export async function saveSegments(projectId: number, frames: { s: number; rms: number; centroid: number; events: unknown; embedding: number[] }[]): Promise<void> {
  const rows = frames.slice(0, 20000).map((f) => ({
    projectId,
    second: f.s,
    rms: f.rms,
    centroid: f.centroid,
    events: f.events as Record<string, unknown>,
    embedding: f.embedding,
  }));
  try {
    if (rows.length > 0) await db.insert(segments).values(rows).onConflictDoNothing();
  } catch {
    const m = mem();
    for (const r of rows) {
      m.segments.push({ id: m.segments.length + 1, projectId: r.projectId, second: r.second, rms: r.rms, centroid: r.centroid, events: r.events, embedding: r.embedding });
    }
  }
}

// ── similarity search over stored embeddings ─────────────────────────────────

export async function findSimilar(embedding: number[], excludeId: number | null, limit = 5): Promise<(ProjectDTO & { score: number })[]> {
  const all = await listProjects();
  return all
    .filter((p) => p.id !== excludeId && Array.isArray(p.embedding) && p.embedding.length === 32)
    .map((p) => ({ ...p, score: cosineSimilarity(embedding, p.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ── model state ──────────────────────────────────────────────────────────────

export async function getModel(): Promise<ModelState> {
  try {
    const rows = await db.select().from(modelState).orderBy(modelState.id).limit(1);
    const r = rows[0];
    if (r) return ModelStateSchema.parse(r.state);
  } catch {
    // ignore
  }
  return mem().model;
}

async function persistModel(state: ModelState): Promise<void> {
  try {
    const existing = await db.select().from(modelState).limit(1);
    if (existing[0]) {
      await db.update(modelState).set({ state }).where(eq(modelState.id, existing[0].id));
    } else {
      await db.insert(modelState).values({ state });
    }
  } catch {
    // ignore
  }
  mem().model = state;
}

function bpmBucket(bpm: number): string {
  const b = Math.round(bpm / 10) * 10;
  return String(b);
}

/** Incremental learning from one project document (call on every save). */
export async function trainOnProject(doc: ProjectDoc): Promise<ModelState> {
  const model = await getModel();
  const n = model.trainedOn;

  // note bigrams from lead melody
  const lead = doc.notes.filter((x) => x.voice === "lead").sort((a, b) => a.step - b.step);
  for (let i = 1; i < lead.length; i++) {
    const from = String(Math.round(lead[i - 1].pitch));
    const to = String(Math.round(lead[i].pitch));
    model.noteBigram[from] = model.noteBigram[from] ?? {};
    model.noteBigram[from][to] = (model.noteBigram[from][to] ?? 0) + 1;
  }

  // drum histograms → running probabilities
  const lanes = ["kick", "snare", "hat", "clap"] as const;
  for (const lane of lanes) {
    const hist = model.drumHistogram[lane] ?? new Array<number>(16).fill(0);
    const target = hist.slice();
    for (let s = 0; s < 16; s++) {
      const observed = doc.drums[lane][s] ?? 0;
      target[s] = n === 0 ? observed : (hist[s] * n + observed) / (n + 1);
    }
    model.drumHistogram[lane] = target.map((x) => Math.min(0.95, x));
  }

  // embedding centroid running mean
  const emb = doc.embedding.length === 32 ? doc.embedding : embedProject(doc);
  model.centroid = n === 0 ? emb : model.centroid.map((c, i) => (c * n + emb[i]) / (n + 1));

  // affinities
  model.scaleAffinity[doc.scale] = (model.scaleAffinity[doc.scale] ?? 0) + 1;
  const bucket = bpmBucket(doc.bpm);
  model.bpmHistogram[bucket] = (model.bpmHistogram[bucket] ?? 0) + 1;

  model.trainedOn = n + 1;
  model.updatedAt = new Date().toISOString();
  model.version = model.version + 1;

  await persistModel(model);
  return model;
}

/** Full retrain from every stored project (the "aprende com projetos" pass). */
export async function retrainFromAll(): Promise<ModelState> {
  const all = await listProjects();
  let model = emptyModel();
  await persistModel(model);
  for (const p of all) {
    try {
      const parsed = ProjectDocSchema.safeParse(p.doc);
      if (parsed.success) model = await trainOnProject(parsed.data);
    } catch {
      // skip malformed docs
    }
  }
  // recompute centroid defensively as the mean of all embeddings
  const embs = all.map((p) => p.embedding).filter((e) => Array.isArray(e) && e.length === 32);
  if (embs.length > 0) {
    model.centroid = meanEmbedding(embs);
    await persistModel(model);
  }
  return getModel();
}
