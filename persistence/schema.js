/**
 * the schema descriptor is neutral so prisma drizzle mysql2 or another driver can map it.
 */
export const schemadefinition = Object.freeze({
  jobs: { id: "text primary key", name: "text", status: "text", priority: "integer", input: "json", outputkey: "text", createdat: "integer", updatedat: "integer" },
  events: { id: "text primary key", jobid: "text", type: "text", at: "integer", data: "json" },
  sessions: { id: "text primary key", version: "integer", agentname: "text", originurl: "text", seed: "text", status: "text", startedat: "integer", finishedat: "integer", events: "json" },
  artifacts: { key: "text primary key", sizebytes: "bigint", sha256: "text", contenttype: "text", createdat: "integer", metadata: "json" },
  chunks: { id: "text primary key", artifactkey: "text", index: "integer", offset: "bigint", sizebytes: "integer", sha256: "text", storagekey: "text" }
});

export function schemasql(options = {}) {
  const dialect = options.dialect ?? "mysql";
  const json = dialect === "postgres" ? "jsonb" : "json";
  const bigint = dialect === "sqlite" ? "integer" : "bigint";
  return [
    `create table if not exists jobs (id text primary key, name text not null, status text not null, priority integer not null, input ${json}, outputkey text, createdat ${bigint} not null, updatedat ${bigint} not null)`,
    `create table if not exists events (id text primary key, jobid text not null, type text not null, at ${bigint} not null, data ${json} not null)`,
    `create table if not exists sessions (id text primary key, version integer not null, agentname text not null, originurl text not null, seed text not null, status text not null, startedat ${bigint} not null, finishedat ${bigint}, events ${json} not null)`,
    `create table if not exists artifacts (key text primary key, sizebytes ${bigint} not null, sha256 text not null, contenttype text not null, createdat ${bigint} not null, metadata ${json} not null)`,
    `create table if not exists chunks (id text primary key, artifactkey text not null, chunkindex integer not null, byteoffset ${bigint} not null, sizebytes integer not null, sha256 text not null, storagekey text not null)`
  ];
}

export function prismaschema() {
  return `model job { id String @id name String status String priority Int input Json? outputkey String? createdat BigInt updatedat BigInt }\nmodel event { id String @id jobid String type String at BigInt data Json }\nmodel session { id String @id version Int agentname String originurl String seed String status String startedat BigInt finishedat BigInt? events Json }\nmodel artifact { key String @id sizebytes BigInt sha256 String contenttype String createdat BigInt metadata Json }\nmodel chunk { id String @id artifactkey String chunkindex Int byteoffset BigInt sizebytes Int sha256 String storagekey String }`;
}
