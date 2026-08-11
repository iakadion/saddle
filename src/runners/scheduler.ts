// Scheduler: stable priority order plus first available provider, with no hidden round-robin.
import { RunnerUnavailableError } from "../core/errors.js";
import type { Job } from "../domain/jobs.js";
import type { RunnerProvider } from "../domain/providers.js";
export class RunnerScheduler {
  private readonly providers: readonly RunnerProvider[];
  constructor(providers: readonly RunnerProvider[]) { if (providers.length === 0) throw new Error("RunnerScheduler requires at least one provider"); this.providers = [...providers].sort((left, right) => left.descriptor().priority - right.descriptor().priority); }
  async select<TInput>(job: Job<TInput>): Promise<RunnerProvider> { for (const provider of this.providers) { if (provider.descriptor().status !== "available") continue; if (await provider.canRun(job)) return provider; } throw new RunnerUnavailableError(job.id); }
  list(): readonly RunnerProvider[] { return this.providers; }
}
