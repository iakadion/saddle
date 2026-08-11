/**
 * captcha contracts separate detection and evidence from any solver provider.
 */
export const captchatypes = Object.freeze(["hcaptcha", "turnstile", "recaptcha", "unknown"]);

export function captchacontract(options = {}) {
  const detect = options.detect ?? (() => ({ kind: "unknown", detected: false }));
  const solve = options.solve;
  return {
    async detect(context) { const result = await detect(context); return { kind: captchatypes.includes(result.kind) ? result.kind : "unknown", detected: Boolean(result.detected), sitekey: result.sitekey, evidenceurl: result.evidenceurl }; },
    async request(context) { return { status: "reviewrequired", kind: context.kind ?? "unknown", message: "captcha requires explicit human or external solver review", context }; },
    async solve(context) { if (typeof solve !== "function") return { status: "unavailable", reason: "no external solver configured" }; const result = await solve(context); return { status: result?.passed ? "passed" : "failed", passed: Boolean(result?.passed), solver: result?.solver ?? "external", token: result?.token, evidenceurl: result?.evidenceurl }; },
    assert(result) { if (!result?.passed) throw new Error("captcha assertion failed"); return result; }
  };
}
