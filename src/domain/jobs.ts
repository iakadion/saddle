// Domain model: jobs carry serializable intent and receive status transitions from the engine.
import { ValidationError } from "../core/errors.js";
import type { Clock, IdFactory } from "../core/ids.js";
export type JobStatus = "queued" | "preparing" | "running" | "syncing" | "completed" | "failed" | "cancelled";
export type JobSpec<TInput = unknown> = { name: string; input?: TInput; priority?: number; outputKey?: string; metadata?: Record<string, string> };
export type Job<TInput = unknown> = { id: string; name: string; input: TInput | undefined; priority: number; outputKey: string | undefined; metadata: Record<string, string>; status: JobStatus; createdAt: number };
export function createJob<TInput>(spec: JobSpec<TInput>, ids: IdFactory, clock: Clock): Job<TInput> {
  if (!spec.name.trim()) throw new ValidationError("Job name cannot be empty");
  return { id: ids.next("job"), name: spec.name, input: spec.input, priority: spec.priority ?? 0, outputKey: spec.outputKey, metadata: { ...spec.metadata }, status: "queued", createdAt: clock.now() };
}
export type JobOutput = Uint8Array | string | Record<string, unknown> | readonly unknown[];
export type JobResult<TOutput extends JobOutput> = { job: Job; output: TOutput; runnerId: string; artifact: import("./artifacts.js").ArtifactManifest; sync: import("./runtime.js").MemorySyncResult };
