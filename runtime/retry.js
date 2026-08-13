/**
 * retry context groups transient retry policy and circuit protection for runners,
 * storage adapters and network-facing surfaces.
 */

/** Creates bounded exponential retry behavior for retryable failures. */
export function retrypolicy(options = {}) {
  const maxattempts = options.maxattempts ?? 3;
  const base = options.base ?? 1000;
  const factor = options.factor ?? 2;
  const cap = options.cap ?? 30000;
  return { async run(handler) { let last; for (let attempt = 1; attempt <= maxattempts; attempt += 1) { try { return await handler(attempt); } catch (error) { last = error; if (error?.retryable !== true || attempt === maxattempts) throw error; const wait = Math.min(cap, base * factor ** (attempt - 1)) + Math.floor(Math.random() * (options.jitter ?? 0)); options.onretry?.({ attempt, wait, error }); await delay(wait); } } throw last; } };
}

/** Creates a circuit breaker that opens after repeated handler failures. */
export function circuitbreaker(options = {}) {
  const threshold = options.failurethreshold ?? 5;
  const resettimeout = options.resettimeout ?? 60000;
  let failures = 0;
  let openedat = 0;
  let state = "closed";
  async function execute(handler) { if (state === "open") { if (Date.now() - openedat < resettimeout) throw new Error("circuit breaker is open"); state = "halfopen"; } try { const result = await handler(); failures = 0; state = "closed"; return result; } catch (error) { failures += 1; if (failures >= threshold) { state = "open"; openedat = Date.now(); } throw error; } }
  return { execute, status() { return { state, failures, openedat }; }, reset() { failures = 0; openedat = 0; state = "closed"; } };
}

/** Waits between retry attempts without introducing an external timer dependency. */
function delay(milliseconds) { return milliseconds ? new Promise((resolve) => setTimeout(resolve, milliseconds)) : Promise.resolve(); }
