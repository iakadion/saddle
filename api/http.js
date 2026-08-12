/**
 * http helpers use the web request response contract and remain framework neutral.
 */
export function jsonresponse(data, options = {}) { return new Response(JSON.stringify(data), { status: options.status ?? 200, headers: { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...(options.headers ?? {}) } }); }

export function errorresponse(code, message, options = {}) { return jsonresponse({ error: { code, message, retryafter: options.retryafter ?? 0, requestid: options.requestid ?? `request${Date.now().toString(36)}` } }, { status: options.status ?? 400, headers: options.headers }); }

export function sseresponse(events) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({ start(controller) { for (const event of events) controller.enqueue(encoder.encode(`event: ${event.event ?? "message"}\ndata: ${JSON.stringify(event.data ?? {})}\n\n`)); controller.close(); } });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-store", connection: "keep-alive", "x-accel-buffering": "no", "x-content-type-options": "nosniff" } });
}
