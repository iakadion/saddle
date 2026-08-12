import { NextRequest } from "next/server";
import { TimelineSchema } from "@/lib/audio/schema";
import { timelineToProject, embedProject } from "@/lib/audio/embedding";
import { createProject, findSimilar, saveSegments, trainOnProject } from "@/lib/studio-repo";

export const dynamic = "force-dynamic";

/**
 * Ingests a dissected-audio timeline (already validated client-side), persists
 * the import + its per-second frames, converts it into a playable ProjectDoc
 * ("template da IA"), trains the local model on it, and returns the closest
 * stored projects by embedding cosine similarity.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string; timeline?: unknown };
    if (!body.name || !body.timeline) {
      return Response.json({ error: "name and timeline are required" }, { status: 400 });
    }
    const parsed = TimelineSchema.safeParse(body.timeline);
    if (!parsed.success) {
      return Response.json({ error: "timeline failed schema validation", issues: parsed.error.issues.slice(0, 5) }, { status: 422 });
    }
    const timeline = parsed.data;

    const imported = await createProject({
      name: body.name,
      kind: "import",
      prompt: "audio importado",
      doc: timeline as unknown as Record<string, unknown>,
      embedding: timeline.embedding,
    });

    await saveSegments(imported?.id ?? -1, timeline.frames);

    // convert to playable template + train the model on it
    let template: unknown = null;
    let templateId: number | null = null;
    try {
      const frames = timeline.frames.map((f) => ({
        s: f.s,
        rms: f.rms,
        pitch: f.events.find((e) => e.kind === "note")?.hz ?? null,
        bassHit: f.events.some((e) => e.kind === "transient" && e.note === "kick"),
        snareHit: f.events.some((e) => e.kind === "transient" && e.note === "hit" && e.velocity > 0.5),
        hatHit: f.events.some((e) => e.kind === "transient" && e.note === "hat"),
      }));
      const t = timelineToProject(frames, timeline.bpm, timeline.embedding.slice(0, 12));
      const doc = { ...t, embedding: embedProject(t as Parameters<typeof embedProject>[0]) };
      const state = await trainOnProject(doc);
      const savedTemplate = await createProject({
        name: `${body.name} — template IA`,
        kind: "variation",
        prompt: `template extraído de ${body.name}`,
        doc: doc as unknown as Record<string, unknown>,
        embedding: doc.embedding,
        parentId: imported?.id ?? null,
      });
      template = savedTemplate;
      templateId = savedTemplate?.id ?? null;
      void state;
    } catch {
      // training is best-effort
    }

    const similar = await findSimilar(timeline.embedding, imported?.id ?? null, 5);

    return Response.json(
      {
        data: imported,
        template,
        templateId,
        seconds: timeline.seconds,
        frames: timeline.frames.length,
        events: timeline.frames.reduce((a, f) => a + f.events.length, 0),
        embeddingPreview: timeline.embedding.slice(0, 8),
        similar: similar.map((s) => ({ id: s.id, name: s.name, kind: s.kind, score: Number(s.score.toFixed(4)) })),
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
}
