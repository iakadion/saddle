/**
 * migration plans stay neutral so Prisma, Drizzle, MySQL2, Turso, and another SQL driver can map them.
 */
export const migrationlist = Object.freeze([
  { version: 1, name: "baseoperational", tables: ["jobs", "events", "sessions", "artifacts", "chunks"] },
  { version: 2, name: "persistentqueue", tables: ["queueitems"] },
  { version: 3, name: "webhookdeliveries", tables: ["webhookdeliveries"] }
]);

/** Returns pending migration statements for a dialect. */
export function migrationplan(options = {}) { const current = options.current ?? 0; const dialect = options.dialect ?? "mysql"; return migrationlist.filter((migration) => migration.version > current).map((migration) => ({ ...migration, statements: migration.version === 2 ? [`create table if not exists queueitems (id text primary key, status text not null, attempts integer not null, payload json not null, result json, error json, createdat bigint not null, updatedat bigint not null)`] : migration.version === 3 ? [`create table if not exists webhookdeliveries (id text primary key, event text not null, receivedat bigint not null, processedat bigint, payload json not null)`] : [], dialect })); }

/** Returns the latest schema version. */
export function latestmigration() { return migrationlist.at(-1).version; }
