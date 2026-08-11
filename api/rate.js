/**
 * token bucket rate limiting supports global user and domain keys.
 */
export function ratebucket(options = {}) {
  const capacity = options.capacity ?? 10;
  const refill = options.refill ?? capacity;
  const interval = options.interval ?? 60000;
  const buckets = new Map();
  function consume(key, cost = 1) {
    const now = Date.now();
    const previous = buckets.get(key) ?? { tokens: capacity, at: now };
    const tokens = Math.min(capacity, previous.tokens + ((now - previous.at) / interval) * refill);
    if (tokens < cost) return { allowed: false, retryafter: Math.ceil(((cost - tokens) / refill) * interval) };
    buckets.set(key, { tokens: tokens - cost, at: now });
    return { allowed: true, retryafter: 0 };
  }
  return { consume, clear() { buckets.clear(); } };
}

export function ratelimiter(options = {}) {
  const global = ratebucket(options.global ?? { capacity: 1000, refill: 1000 });
  const user = ratebucket(options.user ?? { capacity: 100, refill: 100 });
  const domain = ratebucket(options.domain ?? { capacity: 10, refill: 10 });
  return {
    check(input = {}) {
      const checks = [[global, "global"], [user, `user:${input.user ?? "anonymous"}`], [domain, `domain:${input.domain ?? "unknown"}`]];
      for (const [bucket, key] of checks) { const result = bucket.consume(key); if (!result.allowed) return { allowed: false, retryafter: result.retryafter, scope: key }; }
      return { allowed: true, retryafter: 0 };
    }
  };
}
