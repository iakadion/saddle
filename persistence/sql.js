/**
 * sql persistence keeps query execution injected for mysql2 drizzle or another sql client.
 */
import { persistenceadapter } from "./adapter.js";

export function sqlpersistence(options = {}) {
  if (typeof options.query !== "function") throw new TypeError("sql persistence requires query");
  const table = options.table ?? { jobs: "jobs", events: "events", sessions: "sessions", artifacts: "artifacts", chunks: "chunks" };
  async function one(statement, values = []) { const result = await options.query(statement, values); return result?.rows?.[0] ?? result?.[0]?.[0] ?? result?.[0] ?? null; }
  async function many(statement, values = []) { const result = await options.query(statement, values); return result?.rows ?? result?.[0] ?? result ?? []; }
  return persistenceadapter({
    async savejob(job) { await options.query(`insert into ${table.jobs} (id,name,status,priority,input,outputkey,createdat,updatedat) values (?,?,?,?,?,?,?,?)`, [job.id, job.name, job.status, job.priority, JSON.stringify(job.input ?? null), job.outputkey ?? null, job.createdat, job.updatedat ?? job.createdat]); return job; },
    async getjob(id) { const row = await one(`select * from ${table.jobs} where id = ?`, [id]); return row ? normalizejob(row) : null; },
    async updatejob(id, patch) { const current = await this.getjob(id); if (!current) return null; const next = { ...current, ...patch, updatedat: Date.now() }; await options.query(`update ${table.jobs} set status = ?, priority = ?, input = ?, outputkey = ?, updatedat = ? where id = ?`, [next.status, next.priority, JSON.stringify(next.input ?? null), next.outputkey ?? null, next.updatedat, id]); return next; },
    async listjobs(filter = {}) { const rows = await many(`select * from ${table.jobs} order by createdat desc`, []); return rows.map(normalizejob).filter((job) => Object.entries(filter).every(([key, value]) => job[key] === value)); },
    async saveevent(event) { await options.query(`insert into ${table.events} (id,jobid,type,at,data) values (?,?,?,?,?)`, [event.id, event.jobid, event.type, event.at, JSON.stringify(event.data ?? {})]); return event; },
    async listevents(jobid) { return (await many(`select * from ${table.events} where jobid = ? order by at asc`, [jobid])).map((row) => ({ ...row, data: parsejson(row.data) })); },
    async savesession(session) { await options.query(`insert into ${table.sessions} (id,version,agentname,originurl,seed,status,startedat,finishedat,events) values (?,?,?,?,?,?,?,?,?)`, [session.id, session.version, session.agentname, session.originurl, session.seed, session.status, session.startedat, session.finishedat ?? null, JSON.stringify(session.events ?? [])]); return session; },
    async readsession(id) { const row = await one(`select * from ${table.sessions} where id = ?`, [id]); return row ? { ...row, events: parsejson(row.events) } : null; },
    async saveartifact(artifact) { await options.query(`insert into ${table.artifacts} (key,sizebytes,sha256,contenttype,createdat,metadata) values (?,?,?,?,?,?)`, [artifact.key, artifact.sizebytes, artifact.sha256, artifact.contenttype, artifact.createdat, JSON.stringify(artifact.metadata ?? {})]); return artifact; },
    async getartifact(key) { const row = await one(`select * from ${table.artifacts} where key = ?`, [key]); return row ? { ...row, metadata: parsejson(row.metadata) } : null; },
    async savechunk(chunk) { await options.query(`insert into ${table.chunks} (id,artifactkey,chunkindex,byteoffset,sizebytes,sha256,storagekey) values (?,?,?,?,?,?,?)`, [chunk.id, chunk.artifactkey, chunk.index, chunk.offset, chunk.sizebytes, chunk.sha256, chunk.storagekey]); return chunk; },
    async getchunks(artifactkey) { return (await many(`select * from ${table.chunks} where artifactkey = ? order by chunkindex asc`, [artifactkey])).map((row) => ({ ...row, index: row.index ?? row.chunkindex, offset: row.offset ?? row.byteoffset })); }
  });
}

export function mysql2persistence(pool, options = {}) { if (typeof pool?.execute !== "function") throw new TypeError("mysql2 pool requires execute"); return sqlpersistence({ ...options, query: async (statement, values) => pool.execute(statement, values) }); }

function normalizejob(row) { return { ...row, input: parsejson(row.input) }; }
function parsejson(value) { if (value == null || typeof value === "object") return value; try { return JSON.parse(value); } catch { return value; } }
