// Domain model: providers declare capacity; scheduling remains the engine's responsibility.
import type { Job } from "./jobs.js";
import type { WorkingSet } from "./runtime.js";
export type RunnerStatus = "available" | "busy" | "offline";
export type RunnerDescriptor = { id: string; name: string; priority: number; status: RunnerStatus; maxConcurrent: number; capabilities: readonly string[] };
export type RunnerExecutionContext<TInput> = { job: Job<TInput>; workingSet: WorkingSet; signal: AbortSignal };
export type JobHandler<TInput, TOutput> = (context: RunnerExecutionContext<TInput>) => Promise<TOutput> | TOutput;
export interface RunnerProvider { descriptor(): RunnerDescriptor; canRun<TInput>(job: Job<TInput>): Promise<boolean>; execute<TInput, TOutput>(context: RunnerExecutionContext<TInput>, handler: JobHandler<TInput, TOutput>): Promise<TOutput>; }
