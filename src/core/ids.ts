// Engine core: injectable clock and IDs make job/session tests deterministic.
export interface Clock { now(): number; }
export class SystemClock implements Clock { now(): number { return Date.now(); } }
export interface IdFactory { next(prefix: string): string; }
export class DefaultIdFactory implements IdFactory {
  next(prefix: string): string {
    const randomUuid = globalThis.crypto?.randomUUID?.();
    const suffix = randomUuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}_${suffix}`;
  }
}
