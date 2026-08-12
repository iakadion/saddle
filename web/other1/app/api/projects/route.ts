import { NextRequest } from "next/server";
import { createProject, listProjects } from "@/lib/studio-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await listProjects();
  return Response.json({ total: data.length, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      kind?: string;
      prompt?: string;
      doc?: unknown;
      embedding?: number[];
      parentId?: number | null;
    };
    if (!body.name || !body.doc || !Array.isArray(body.embedding)) {
      return Response.json({ error: "name, doc and embedding (32-dim) are required" }, { status: 400 });
    }
    if (body.embedding.length !== 32) {
      return Response.json({ error: "embedding must have 32 dimensions" }, { status: 400 });
    }
    const created = await createProject({
      name: body.name,
      kind: body.kind ?? "generated",
      prompt: body.prompt ?? "",
      doc: body.doc,
      embedding: body.embedding,
      parentId: body.parentId ?? null,
    });
    return Response.json({ data: created }, { status: 201 });
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }
}
