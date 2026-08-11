/**
 * memory persistence is the local baseline for tests and offline operation.
 */
import { persistenceadapter } from "./adapter.js";

export function memorypersistence() {
  const jobs = new Map();
  const events = new Map();
  const sessions = new Map();
  const artifacts = new Map();
  const chunks = new Map();
  return persistenceadapter({
    async savejob(job) { jobs.set(job.id, structuredClone(job)); return jobs.get(job.id); },
    async getjob(id) { return jobs.get(id) ? structuredClone(jobs.get(id)) : null; },
    async updatejob(id, patch) { const current = jobs.get(id); if (!current) return null; const next = { ...current, ...patch, updatedat: Date.now() }; jobs.set(id, next); return structuredClone(next); },
    async listjobs(filter = {}) { return [...jobs.values()].filter((job) => Object.entries(filter).every(([key, value]) => job[key] === value)).map((job) => structuredClone(job)); },
    async saveevent(event) { const list = events.get(event.jobid) ?? []; list.push(structuredClone(event)); events.set(event.jobid, list); return event; },
    async listevents(jobid) { return (events.get(jobid) ?? []).map((event) => structuredClone(event)); },
    async savesession(session) { sessions.set(session.id, structuredClone(session)); return structuredClone(session); },
    async readsession(id) { return sessions.get(id) ? structuredClone(sessions.get(id)) : null; },
    async saveartifact(artifact) { artifacts.set(artifact.key, structuredClone(artifact)); return structuredClone(artifact); },
    async getartifact(key) { return artifacts.get(key) ? structuredClone(artifacts.get(key)) : null; },
    async savechunk(chunk) { chunks.set(chunk.id, structuredClone(chunk)); return structuredClone(chunk); },
    async getchunks(artifactkey) { return [...chunks.values()].filter((chunk) => chunk.artifactkey === artifactkey).sort((left, right) => left.index - right.index).map((chunk) => structuredClone(chunk)); }
  });
}
