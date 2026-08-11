/**
 * retry policy handles transient errors and keeps non retryable failures terminal.
 */
export function retrypolicy(options = {}) {
  const maxattempts = options.maxattempts ?? 3;
  const base = options.base ?? 1000;
  const factor = options.factor ?? 2;
  const cap = options.cap ?? 30000;
  return { async run(handler) { let last; for (let attempt = 1; attempt <= maxattempts; attempt += 1) { try { return await handler(attempt); } catch (error) { last = error; if (error?.retryable !== true || attempt === maxattempts) throw error; const wait = Math.min(cap, base * factor ** (attempt - 1)) + Math.floor(Math.random() * (options.jitter ?? 0)); options.onretry?.({ attempt, wait, error }); await delay(wait); } } throw last; } };
}

function delay(milliseconds) { return milliseconds ? new Promise((resolve) => setTimeout(resolve, milliseconds)) : Promise.resolve(); }
