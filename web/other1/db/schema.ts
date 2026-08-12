import { integer, jsonb, pgTable, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Blueprint registry (section: dependency specification)
export const dependencies = pgTable("dependencies", {
  id: serial("id").primaryKey(),
  ordinal: integer("ordinal").notNull().unique(),
  category: varchar("category", { length: 32 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  pkg: varchar("pkg", { length: 255 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  purpose: text("purpose").notNull(),
  description: text("description").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(),
  license: varchar("license", { length: 64 }).notNull(),
});

// ── STUDIO: user projects (local product data — no tracking, no analytics) ───
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  kind: varchar("kind", { length: 24 }).notNull(), // generated | import | variation
  prompt: text("prompt").default(""),
  bpm: integer("bpm").notNull(),
  root: integer("root").notNull().default(0),
  scale: varchar("scale", { length: 24 }).notNull().default("minor"),
  mood: varchar("mood", { length: 48 }).default("neutral"),
  doc: jsonb("doc").notNull(), // ProjectDoc | Timeline envelope
  embedding: jsonb("embedding").$type<number[]>().notNull(),
  parentId: integer("parent_id"), // variation lineage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── STUDIO: per-second analysis segments with embedding vectors ─────────────
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  second: integer("second").notNull(),
  rms: real("rms").notNull().default(0),
  centroid: real("centroid").notNull().default(0),
  events: jsonb("events").notNull().default([]),
  embedding: jsonb("embedding").$type<number[]>().notNull(),
});

// ── STUDIO: single-row trained model state (learned from local projects) ────
export const modelState = pgTable("model_state", {
  id: serial("id").primaryKey(),
  state: jsonb("state").notNull(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type SegmentRow = typeof segments.$inferSelect;
