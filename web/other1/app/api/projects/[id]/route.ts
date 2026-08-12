import { deleteProject, findSimilar, getProject } from "@/lib/studio-repo";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number.parseInt(id, 10);
  if (Number.isNaN(num)) return Response.json({ error: "invalid id" }, { status: 400 });
  const project = await getProject(num);
  if (!project) return Response.json({ error: "not found" }, { status: 404 });
  const similar = Array.isArray(project.embedding) && project.embedding.length === 32 ? await findSimilar(project.embedding, project.id, 5) : [];
  return Response.json({ data: project, similar: similar.map((s) => ({ id: s.id, name: s.name, kind: s.kind, score: Number(s.score.toFixed(4)) })) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number.parseInt(id, 10);
  if (Number.isNaN(num)) return Response.json({ error: "invalid id" }, { status: 400 });
  await deleteProject(num);
  return Response.json({ ok: true });
}
