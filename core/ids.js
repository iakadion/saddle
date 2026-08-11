/**
 * injectable time and id factories make every engine path reproducible.
 */
export function systemclock() {
  return { now: () => Date.now() };
}

export function idfactory(randomuuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  return {
    next(prefix) {
      const suffix = randomuuid?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      return `${prefix}${suffix}`;
    }
  };
}
