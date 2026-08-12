/**
 * compatibility contracts describe core capabilities without importing a runtime-specific adapter.
 */

import { runtimefeatures, runtimename } from "./detect.js";

export const corecapabilities = Object.freeze(["esm", "fetch", "streams", "textencoding", "webcrypto"]);

/** Reports the runtime capabilities expected by the transport-neutral root entry. */
export function runtimecontract(scope = globalThis) { const features = runtimefeatures(scope); return { runtime: runtimename(scope), core: true, capabilities: { esm: true, fetch: features.fetch, streams: features.streams, textencoding: typeof scope.TextEncoder === "function" && typeof scope.TextDecoder === "function", webcrypto: Boolean(scope.crypto?.subtle) }, nodeonly: { filesystem: features.filesystem, server: Boolean(scope.process?.versions?.node) } }; }

/** Returns a structured unsupported-mode error for a missing runtime capability. */
export function unsupportedruntime(feature, contract = runtimecontract()) { const error = new Error(`runtime capability is unavailable: ${feature}`); error.code = "UNSUPPORTED_RUNTIME"; error.feature = String(feature); error.runtime = contract.runtime; return error; }
