/**
 * transforms annotate byte movement without pretending remote storage is physical vram.
 */
import { computeresult, memoryobject, tobytes } from "./objects.js";

export function transformtocompute(value, options = {}) {
  const started = performance.now();
  const object = memoryobject({ ...options, buffer: value?.buffer ?? value });
  return { ...object, processingtimems: performance.now() - started, memoryusedbytes: object.size };
}

export function transformtostorage(value, options = {}) {
  const payload = tobytes(value?.payload ?? value?.buffer ?? value);
  return computeresult({ id: value?.id, payload, mimetype: options.mimetype ?? value?.mimetype ?? "application/octet-stream", metadata: options.metadata ?? value?.metadata, processingtimems: value?.processingtimems, memoryusedbytes: payload.byteLength });
}
