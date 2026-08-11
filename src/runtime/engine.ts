// Runtime engine: orchestrates job, working set, runner execution, checksum and commit.
import { asSaddleError } from "../core/errors.js";
import { InMemoryEventSink, type EventSink } from "../core/events.js";
import type { Clock, IdFactory } from "../core/ids.js";
import { DefaultIdFactory, SystemClock } from "../core/ids.js";
import { createJob, type Job, type JobOutput, type JobResult, type JobSpec } from "../domain/jobs.js";
import type { RunnerExecutionContext } from "../domain/providers.js";
import type { MemoryBridge } from "../memory/bridge.js";
import type { RunnerScheduler } from "../runners/scheduler.js";
import type { StorageAdapter } from "../storage/adapter.js";
export type SaddleEngineOptions = { storage: StorageAdapter; memory: MemoryBridge; scheduler: RunnerScheduler; events?: EventSink; ids?: IdFactory; clock?: Clock };
export class SaddleEngine {
  private readonly storage: StorageAdapter; private readonly memory: MemoryBridge; private readonly scheduler: RunnerScheduler; private readonly events: EventSink; private readonly ids: IdFactory; private readonly clock: Clock;
  constructor(options: SaddleEngineOptions) { this.storage = options.storage; this.memory = options.memory; this.scheduler = options.scheduler; this.events = options.events ?? new InMemoryEventSink(); this.ids = options.ids ?? new DefaultIdFactory(); this.clock = options.clock ?? new SystemClock(); }
  async run<TInput, TOutput extends JobOutput>(spec: JobSpec<TInput>, handler: (context: RunnerExecutionContext<TInput>) => Promise<TOutput> | TOutput): Promise<JobResult<TOutput>> {
    const job = createJob(spec, this.ids, this.clock); await this.emit(job, "job.queued", { name: job.name }); const controller = new AbortController(); let workingSet; let provider;
    try {
      job.status = "preparing"; await this.emit(job, "job.preparing", { status: job.status }); provider = await this.scheduler.select(job); await this.emit(job, "runner.selected", { runnerId: provider.descriptor().id }); workingSet = await this.memory.prepare(job); job.status = "running"; await this.emit(job, "job.running", { status: job.status, location: workingSet.location });
      const context: RunnerExecutionContext<TInput> = { job, workingSet, signal: controller.signal }; const output = await provider.execute(context, handler); const encoded = encodeOutput(output); job.status = "syncing"; await this.emit(job, "job.syncing", { status: job.status, bytes: encoded.bytes.byteLength }); const sync = await this.memory.sync(workingSet, encoded.bytes);
      const artifact = await this.storage.put({ key: spec.outputKey ?? `results/${job.id}${encoded.extension}`, data: encoded.bytes, contentType: encoded.contentType, metadata: { jobId: job.id, runnerId: provider.descriptor().id } }); await this.emit(job, "storage.committed", { key: artifact.key, sha256: artifact.sha256 }); job.status = "completed"; await this.emit(job, "job.completed", { status: job.status, artifactKey: artifact.key }); return { job, output, runnerId: provider.descriptor().id, artifact, sync };
    } catch (error) { job.status = "failed"; const failure = asSaddleError(error, job.id); await this.emit(job, "job.failed", { code: failure.code, retryable: failure.retryable, message: failure.message }); throw failure; } finally { if (workingSet) await this.memory.cleanup(workingSet); }
  }
  private async emit(job: Job, type: Parameters<EventSink["emit"]>[0]["type"], data: Record<string, unknown>): Promise<void> { await this.events.emit({ id: this.ids.next("evt"), type, jobId: job.id, at: this.clock.now(), data }); }
}
function encodeOutput(output: unknown): { bytes: Uint8Array; contentType: string; extension: string } { if (output instanceof Uint8Array) return { bytes: output, contentType: "application/octet-stream", extension: ".bin" }; if (typeof output === "string") return { bytes: new TextEncoder().encode(output), contentType: "text/plain; charset=utf-8", extension: ".txt" }; return { bytes: new TextEncoder().encode(JSON.stringify(output)), contentType: "application/json", extension: ".json" }; }
