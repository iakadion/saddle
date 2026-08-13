/**
 * runner health checks describe provider capacity without selecting infrastructure.
 */

/** Checks provider readiness and returns a serializable health report. */
export async function runnerhealth(provider, job = {}) {
  if (typeof provider?.descriptor !== "function" || typeof provider?.canrun !== "function") throw new TypeError("runner health requires a provider");
  const descriptor = provider.descriptor();
  try {
    const available = await provider.canrun(job);
    return { id: String(descriptor.id), status: available ? descriptor.status ?? "available" : "busy", healthy: Boolean(available), checkedat: Date.now(), capacity: { maxconcurrent: descriptor.maxconcurrent, capabilities: [...(descriptor.capabilities ?? [])] } };
  } catch (error) {
    return { id: String(descriptor.id), status: "offline", healthy: false, checkedat: Date.now(), capacity: { maxconcurrent: descriptor.maxconcurrent, capabilities: [...(descriptor.capabilities ?? [])] }, error: { code: String(error.code ?? "RUNNER_HEALTH_FAILED"), message: String(error.message ?? error) } };
  }
}

/** Checks a provider list in stable order and summarizes available capacity. */
export async function runnerhealthall(providers = [], job = {}) {
  if (!Array.isArray(providers)) throw new TypeError("runner health providers must be an array");
  const reports = [];
  for (const provider of providers) reports.push(await runnerhealth(provider, job));
  return { checkedat: Date.now(), reports, available: reports.filter((report) => report.healthy).length, total: reports.length };
}
