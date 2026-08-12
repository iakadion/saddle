import { z } from "zod";

// ── The AI timeline contract: audio dissected second-by-second ───────────────

export const FrameEventSchema = z.object({
  kind: z.enum(["note", "transient"]),
  note: z.string().optional(), // e.g. "C4"
  pitch: z.number().min(0).max(127).optional(), // MIDI (float, cents precision)
  onset: z.number().min(0).max(1), // seconds offset inside the 1s cell
  velocity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  hz: z.number().optional(),
});

export const TimelineFrameSchema = z.object({
  s: z.number().int().min(0), // second index
  rms: z.number().min(0).max(1),
  centroid: z.number().min(0),
  flux: z.number().min(0),
  chroma: z.array(z.number()).length(12),
  embedding: z.array(z.number()).length(32),
  events: z.array(FrameEventSchema),
  tags: z.array(z.string()).default([]),
});

export const TimelineSchema = z.object({
  schema: z.literal("vector-one/timeline@5.0"),
  source: z.enum(["import", "generated", "variation"]),
  bpm: z.number().min(30).max(300),
  seconds: z.number().min(0),
  embedding: z.array(z.number()).length(32), // song-level vector
  frames: z.array(TimelineFrameSchema),
});

export type FrameEvent = z.infer<typeof FrameEventSchema>;
export type TimelineFrame = z.infer<typeof TimelineFrameSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;

// ── Project document (symbolic score the studio edits + schedules) ──────────

export const DrumLanesSchema = z.object({
  kick: z.array(z.number().int().min(0).max(1)).length(16),
  snare: z.array(z.number().int().min(0).max(1)).length(16),
  hat: z.array(z.number().int().min(0).max(1)).length(16),
  clap: z.array(z.number().int().min(0).max(1)).length(16),
});

export const NoteEventSchema = z.object({
  step: z.number().int().min(0), // 16th-note index (can exceed 16 for multi-bar)
  pitch: z.number().min(0).max(127), // MIDI
  vel: z.number().min(0).max(1),
  dur: z.number().min(0.25).max(16), // in steps
  voice: z.enum(["lead", "bass", "pad"]).default("lead"),
});

export const ProjectDocSchema = z.object({
  schema: z.literal("vector-one/project@5.0"),
  bpm: z.number().min(40).max(240),
  root: z.number().int().min(0).max(11),
  scale: z.enum(["minor", "major", "dorian", "phrygian", "pent_minor"]),
  bars: z.number().int().min(1).max(128),
  mood: z.string(),
  prompt: z.string().default(""),
  drums: DrumLanesSchema,
  notes: z.array(NoteEventSchema),
  embedding: z.array(z.number()).length(32),
});

export type DrumLanes = z.infer<typeof DrumLanesSchema>;
export type NoteEvent = z.infer<typeof NoteEventSchema>;
export type ProjectDoc = z.infer<typeof ProjectDocSchema>;

// ── Trained model state (learned locally from the user's own projects) ──────

export const ModelStateSchema = z.object({
  version: z.number().int(),
  trainedOn: z.number().int(), // number of projects/imports seen
  noteBigram: z.record(z.string(), z.record(z.string(), z.number())), // pitch -> pitch -> count
  drumHistogram: z.record(z.string(), z.array(z.number()).length(16)), // lane -> step probs
  centroid: z.array(z.number()).length(32), // global embedding centroid
  scaleAffinity: z.record(z.string(), z.number()),
  bpmHistogram: z.record(z.string(), z.number()), // bucket -> count
  updatedAt: z.string(),
});

export type ModelState = z.infer<typeof ModelStateSchema>;

export function emptyModel(): ModelState {
  return {
    version: 1,
    trainedOn: 0,
    noteBigram: {},
    drumHistogram: { kick: new Array(16).fill(0), snare: new Array(16).fill(0), hat: new Array(16).fill(0), clap: new Array(16).fill(0) },
    centroid: new Array(32).fill(0),
    scaleAffinity: {},
    bpmHistogram: {},
    updatedAt: new Date().toISOString(),
  };
}
