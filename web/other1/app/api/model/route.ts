import { NextRequest } from "next/server";
import { getModel, retrainFromAll, trainOnProject } from "@/lib/studio-repo";
import { ProjectDocSchema } from "@/lib/audio/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getModel();
  return Response.json({ data: state });
}

// POST { trainDoc } → incremental training step on a single project document
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { trainDoc?: unknown };
    const parsed = ProjectDocSchema.safeParse(body.trainDoc);
    if (!parsed.success) {
      return Response.json({ error: "trainDoc must be a valid vector-one/project@5.0 document", issues: parsed.error.issues.slice(0, 4) }, { status: 400 });
    }
    const state = await trainOnProject(parsed.data);
    return Response.json({ data: state });
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
}

// PUT → full retrain from every stored project
export async function PUT() {
  const state = await retrainFromAll();
  return Response.json({ data: state });
}
