// Runner adapter: in-process execution is the deterministic baseline for local tests and examples.
import type { JobHandler, RunnerDescriptor, RunnerExecutionContext, RunnerProvider } from "../domain/providers.js";
import type { Job } from "../domain/jobs.js";
export class InProcessRunnerProvider implements RunnerProvider {
  private readonly runner: RunnerDescriptor;
  private available: boolean;
  constructor(options: Partial<RunnerDescriptor> = {}) { this.runner = { id: options.id ?? "runner-local", name: options.name ?? "Local in-process runner", priority: options.priority ?? 0, status: options.status ?? "available", maxConcurrent: options.maxConcurrent ?? 1, capabilities: options.capabilities ?? ["node", "local"] }; this.available = this.runner.status === "available"; }
  descriptor(): RunnerDescriptor { return { ...this.runner, status: this.available ? "available" : "offline" }; }
  setAvailable(value: boolean): void { this.available = value; }
  async canRun<TInput>(_job: Job<TInput>): Promise<boolean> { return this.available; }
  async execute<TInput, TOutput>(context: RunnerExecutionContext<TInput>, handler: JobHandler<TInput, TOutput>): Promise<TOutput> { return handler(context); }
}
