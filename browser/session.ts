/**
 * browser sessions bind one fingerprint to one proxy and one event recorder.
 */
import { fingerprintfor, fingerprintvalidate } from "./fingerprint.js";

export function browsersession(options = {}) {
  const id = options.id ?? `browsersession${Date.now().toString(36)}`;
  const fingerprint = options.fingerprint ?? fingerprintfor(id, options);
  if (!fingerprintvalidate(fingerprint)) throw new TypeError("browser fingerprint is incoherent");
  const events = [];
  return {
    id,
    fingerprint,
    proxy: options.proxy,
    record(event) { if (!event || !Number.isFinite(event.t) || event.t < 0 || typeof event.type !== "string") throw new TypeError("browser event is invalid"); events.push({ ...event }); return event; },
    events() { return events.map((event) => ({ ...event })); },
    manifest() { return { id, fingerprint: { ...fingerprint }, proxy: options.proxy?.id ?? options.proxy, eventcount: events.length }; }
  };
}
