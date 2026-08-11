/**
 * prisma persistence maps model delegates through an explicit model configuration.
 */
import { persistenceadapter } from "./adapter.js";

export function prismapersistence(client, options = {}) {
  const models = { jobs: options.jobs ?? client?.job, events: options.events ?? client?.event, sessions: options.sessions ?? client?.session, artifacts: options.artifacts ?? client?.artifact, chunks: options.chunks ?? client?.chunk };
  for (const [name, model] of Object.entries(models)) if (!model) throw new TypeError(`prisma model is missing: ${name}`);
  return persistenceadapter({
    async savejob(job) { return models.jobs.upsert({ where: { id: job.id }, create: job, update: job }); },
    async getjob(id) { return models.jobs.findUnique({ where: { id } }); },
    async updatejob(id, patch) { return models.jobs.update({ where: { id }, data: { ...patch, updatedat: Date.now() } }); },
    async listjobs(filter = {}) { return models.jobs.findMany({ where: filter, orderBy: { createdat: "desc" } }); },
    async saveevent(event) { return models.events.create({ data: event }); },
    async listevents(jobid) { return models.events.findMany({ where: { jobid }, orderBy: { at: "asc" } }); },
    async savesession(session) { return models.sessions.upsert({ where: { id: session.id }, create: session, update: session }); },
    async readsession(id) { return models.sessions.findUnique({ where: { id } }); },
    async saveartifact(artifact) { return models.artifacts.upsert({ where: { key: artifact.key }, create: artifact, update: artifact }); },
    async getartifact(key) { return models.artifacts.findUnique({ where: { key } }); },
    async savechunk(chunk) { return models.chunks.upsert({ where: { id: chunk.id }, create: chunk, update: chunk }); },
    async getchunks(artifactkey) { return models.chunks.findMany({ where: { artifactkey }, orderBy: { index: "asc" } }); }
  });
}
