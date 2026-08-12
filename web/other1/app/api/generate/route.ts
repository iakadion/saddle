import { NextRequest } from "next/server";
import { composeLong, parsePrompt } from "@/lib/audio/generator";
import { getModel } from "@/lib/studio-repo";

export const dynamic = "force-dynamic";

/**
 * Server-side LONG-FORM composition: builds the song section-by-section —
 * each section is a variation of the previous one chained onto the same
 * timeline. `seconds` (30–190) selects the target duration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { prompt?: string; seconds?: number };
    const prompt = (body.prompt ?? "").slice(0, 500);
    if (!prompt.trim()) return Response.json({ error: "prompt is required" }, { status: 400 });
    const seconds = typeof body.seconds === "number" && Number.isFinite(body.seconds) ? body.seconds : 45;
    const model = await getModel();
    const { doc, sections } = composeLong(prompt, model.trainedOn > 0 ? model : null, seconds);
    return Response.json({
      spec: parsePrompt(prompt),
      data: doc,
      notes: doc.notes.length,
      bars: doc.bars,
      sections,
      seconds,
      conditionedOn: model.trainedOn,
    });
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
}
