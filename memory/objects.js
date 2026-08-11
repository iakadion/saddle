/**
 * memory objects and compute results are serializable contracts between storage and runtime.
 */
export function memoryobject(options = {}) {
  const buffer = tobytes(options.buffer ?? options.data ?? new Uint8Array(0));
  return { id: options.id ?? `memory${Date.now().toString(36)}`, buffer, size: buffer.byteLength, type: options.type ?? "application/octet-stream", createdat: options.createdat ?? Date.now(), metadata: { ...(options.metadata ?? {}) } };
}

export function computeresult(options = {}) {
  return { id: options.id ?? `result${Date.now().toString(36)}`, payload: options.payload, mimetype: options.mimetype, metadata: { ...(options.metadata ?? {}) }, processingtimems: options.processingtimems ?? 0, memoryusedbytes: options.memoryusedbytes ?? 0 };
}

export function tobytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === "string") return new TextEncoder().encode(value);
  return new TextEncoder().encode(JSON.stringify(value));
}
