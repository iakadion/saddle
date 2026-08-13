/**
 * api authorization delegates token verification to the caller and never stores credentials.
 */

/** Authorizes a request through an injected verifier or returns an anonymous principal. */
export async function authorize(request, options = {}) {
  const token = request?.headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "") ?? request?.headers?.get?.("x-api-key");
  if (typeof options.verify !== "function") return { authenticated: false, subject: "anonymous", tokenpresent: Boolean(token) };
  if (!token) return { authenticated: false, subject: "anonymous", tokenpresent: false };
  const principal = await options.verify(token, request);
  if (!principal) { const error = new Error("request is not authorized"); error.code = "UNAUTHORIZED"; throw error; }
  return { authenticated: true, subject: String(principal.subject ?? principal.id ?? "caller"), claims: { ...(principal.claims ?? {}) } };
}
