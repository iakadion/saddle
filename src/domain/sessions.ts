// Domain model: session logs are versioned, append-only and validated before replay.
import { ValidationError } from "../core/errors.js";
export type SessionEventType = "move" | "click" | "drag" | "scroll" | "key";
export type SessionEvent = { t: number; type: SessionEventType; x?: number; y?: number; tx?: number; ty?: number; dx?: number; dy?: number; key?: string; target?: string; button?: "left" | "right" };
export type SessionRecord = { version: 1; id: string; agentName: string; originUrl: string; seed: string; status: "created" | "recording" | "closed"; startedAt: number; finishedAt?: number; events: SessionEvent[] };
const eventTypes = new Set<SessionEventType>(["move", "click", "drag", "scroll", "key"]);
export function validateSessionRecord(value: unknown): SessionRecord {
  if (!value || typeof value !== "object") throw new ValidationError("Session must be an object");
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || typeof record.id !== "string" || typeof record.agentName !== "string" || typeof record.originUrl !== "string" || typeof record.seed !== "string") throw new ValidationError("Session header is invalid");
  if (!Array.isArray(record.events)) throw new ValidationError("Session events must be an array");
  const events = record.events.map((event, index) => validateSessionEvent(event, index));
  const status = record.status;
  if (status !== "created" && status !== "recording" && status !== "closed") throw new ValidationError("Session status is invalid");
  if (typeof record.startedAt !== "number" || record.startedAt < 0) throw new ValidationError("Session startedAt is invalid");
  return { version: 1, id: record.id, agentName: record.agentName, originUrl: record.originUrl, seed: record.seed, status, startedAt: record.startedAt, finishedAt: typeof record.finishedAt === "number" ? record.finishedAt : undefined, events };
}
function validateSessionEvent(value: unknown, index: number): SessionEvent {
  if (!value || typeof value !== "object") throw new ValidationError(`Session event ${index} is invalid`);
  const event = value as Record<string, unknown>;
  if (typeof event.t !== "number" || event.t < 0 || typeof event.type !== "string" || !eventTypes.has(event.type as SessionEventType)) throw new ValidationError(`Session event ${index} has an invalid time or type`);
  const result: SessionEvent = { t: event.t, type: event.type as SessionEventType };
  for (const field of ["x", "y", "tx", "ty", "dx", "dy"] as const) {
    const candidate = event[field];
    if (candidate !== undefined) { if (typeof candidate !== "number") throw new ValidationError(`Session event ${index}.${field} is invalid`); result[field] = candidate; }
  }
  if (event.key !== undefined && typeof event.key !== "string") throw new ValidationError(`Session event ${index}.key is invalid`);
  if (event.target !== undefined && typeof event.target !== "string") throw new ValidationError(`Session event ${index}.target is invalid`);
  if (event.button !== undefined && event.button !== "left" && event.button !== "right") throw new ValidationError(`Session event ${index}.button is invalid`);
  if (typeof event.key === "string") result.key = event.key;
  if (typeof event.target === "string") result.target = event.target;
  if (event.button === "left" || event.button === "right") result.button = event.button;
  return result;
}
