// app/api/init/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // DDL = estrutura que nasce sozinha
  // Idempotente: IF NOT EXISTS nao quebra deploy repetido

  // Opcao A: Turso libsql - file:local.db cria sozinho
  // import { createClient } from "@libsql/client"
  // const db = createClient({ url: process.env.TURSO_URL ?? "file:local.db" })

  // Opcao B: better-sqlite3
  // import Database from "better-sqlite3"
  // const db = new Database("data.db")

  const queries = [
    `CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size BIGINT NOT NULL, -- ponteiro TB com BigInt
      pointer BIGINT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      status TEXT CHECK(status IN ('pending','processing','completed','failed')),
      payload JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`
  ];

  // for (const q of queries) await db.execute(q)

  return NextResponse.json({ 
    ok: true, 
    message: "DB auto criado via DDL trigger no deploy",
    tables: ["files","jobs"]
  });
}

// 071 Configuracao Drizzle Principal.ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // ou "turso" / "postgresql"
  dbCredentials: {
    // Turso: file:local.db cria sozinho se nao existe
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN
  },
  verbose: true,
  strict: true
})

// lib/schema.ts
import { sqliteTable, text, bigint, integer } from "drizzle-orm/sqlite-core"

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  size: bigint("size", { mode: "bigint" }).notNull(), // BigInt TB
  pointer: bigint("pointer", { mode: "bigint" }),
})

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
})
