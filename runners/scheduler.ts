/**
 * scheduling uses stable priority order and selects the first available runner.
 */
import { runnerunavailable } from "../core/errors.js";

export function scheduler(providers) {
  if (!Array.isArray(providers) || providers.length === 0) throw new TypeError("scheduler requires providers");
  const ordered = [...providers].sort((left, right) => left.descriptor().priority - right.descriptor().priority);
  return {
    async select(job) {
      for (const provider of ordered) if (provider.descriptor().status === "available" && await provider.canrun(job)) return provider;
      throw runnerunavailable(job.id);
    },
    list() { return [...ordered]; }
  };
}
