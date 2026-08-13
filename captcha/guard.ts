/**
 * captcha guard blocks silent automation and records a review event for audit.
 */
export function captchaguard(options = {}) {
  const events = [];
  return {
    async check(context) { const result = await options.contract.detect(context); if (!result.detected) return { allowed: true, result }; const event = { type: "captcha.detected", at: Date.now(), kind: result.kind, sitekey: result.sitekey }; events.push(event); return { allowed: false, result, event, action: "reviewrequired" }; },
    events() { return events.map((event) => ({ ...event })); }
  };
}
