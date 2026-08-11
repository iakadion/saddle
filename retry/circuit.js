/**
 * circuit breaker protects providers from repeated failure storms.
 */
export function circuitbreaker(options = {}) {
  const threshold = options.failurethreshold ?? 5;
  const resettimeout = options.resettimeout ?? 60000;
  let failures = 0;
  let openedat = 0;
  let state = "closed";
  async function execute(handler) {
    if (state === "open") { if (Date.now() - openedat < resettimeout) throw new Error("circuit breaker is open"); state = "halfopen"; }
    try { const result = await handler(); failures = 0; state = "closed"; return result; } catch (error) { failures += 1; if (failures >= threshold) { state = "open"; openedat = Date.now(); } throw error; }
  }
  return { execute, status() { return { state, failures, openedat }; }, reset() { failures = 0; openedat = 0; state = "closed"; } };
}
