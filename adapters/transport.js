/**
 * transport centralizes timeout retry and jitter without choosing a host or vendor.
 */
export function transport(options = {}) {
  const fetcher = options.fetcher ?? fetch;
  const attempts = options.attempts ?? 3;
  const timeout = options.timeout ?? 30000;
  const retrycodes = new Set(options.retrycodes ?? [408, 409, 429, 500, 502, 503, 504]);
  async function request(url, init = {}) {
    let last;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetcher(url, { ...init, signal: init.signal ?? controller.signal });
        if (response.ok || !retrycodes.has(response.status) || attempt === attempts - 1) return response;
        last = new Error(`request failed with ${response.status}`);
      } catch (error) {
        last = error;
        if (attempt === attempts - 1) throw error;
      } finally { clearTimeout(timer); }
      await delay(backoff(options, attempt));
    }
    throw last ?? new Error("request failed");
  }
  return { request };
}

function backoff(options, attempt) { const base = options.backoff ?? 250; const jitter = options.jitter ?? 0; return base * 2 ** attempt + Math.floor(Math.random() * jitter); }
function delay(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
