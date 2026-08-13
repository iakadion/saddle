/**
 * api contracts keep request identity and success envelopes stable across HTTP and MCP adapters.
 */

export const apiversion = 1;

/** Extracts a caller supplied request id or creates a local id without exposing secrets. */
export function requestcontext(request, options = {}) {
  const requestid = request?.headers?.get?.("x-request-id") ?? options.requestid ?? `request${Date.now().toString(36)}`;
  return { version: apiversion, requestid: String(requestid), method: request?.method ?? options.method, path: options.path };
}

/** Creates a versioned success envelope for APIs that opt into envelopes. */
export function successpayload(data, context = {}) { return { version: apiversion, requestid: String(context.requestid ?? `request${Date.now().toString(36)}`), data }; }

/** Creates a versioned error payload with a stable retry hint. */
export function errorpayload(code, message, context = {}) { return { version: apiversion, requestid: String(context.requestid ?? `request${Date.now().toString(36)}`), error: { code: String(code), message: String(message), retryafter: Number(context.retryafter ?? 0) } }; }
