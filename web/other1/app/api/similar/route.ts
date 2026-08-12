import { NextRequest } from "next/server";
import { findSimilar } from "@/lib/studio-repo";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { embedding?: number[]; excludeId?: number | null; limit?: number };
    if (!Array.isArray(body.embedding) || body.embedding.length !== 32) {
      return Response.json({ error: "embedding (32-dim) is required" }, { status: 400 });
    }
    const results = await findSimilar(body.embedding, body.excludeId ?? null, Math.min(12, body.limit ?? 6));
    return Response.json({
      total: results.length,
      data: results.map((r) => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        bpm: r.bpm,
        mood: r.mood,
        score: Number(r.score.toFixed(4)),
      })),
    });
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
}
