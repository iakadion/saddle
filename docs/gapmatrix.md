# feature gap matrix

This matrix turns the supplied README and conclusions into implementation decisions. It does not treat a marketing claim as an implemented feature. A row is marked **implemented** only when the repository contains an executable contract and a deterministic test or a verified workflow.

## priority rules

| Priority | Meaning |
| --- | --- |
| P0 | blocks a usable extension or makes a public contract misleading |
| P1 | required for a credible browser agent or ecosystem integration |
| P2 | valuable capability that can remain an adapter or later surface |
| deferred | intentionally not promised by the current core |

## matrix

| Area | Current state | Gap | Priority | Decision |
| --- | --- | --- | --- | --- |
| Root library | Implemented ESM entry point with broad exports | No extension subpath or extension files are shipped | P0 | Add a small `extension/` package surface and export only serializable contracts |
| Browser agent | Implemented injected action adapter for navigate, click, type, screenshot, DOM, title, scroll and command batches | No browser implementation is owned by the core | P1 | Keep the adapter boundary; add extension transport, not a vendor browser dependency |
| Browser snapshots | Not implemented as a public contract | No accessibility tree, stable element refs, snapshot ids or stale ref errors | P0 | Add snapshot and action result contracts usable by MCP and extension transport |
| Session replay | Partial | Replay exists, but recording, tab ownership, frame identity and snapshot invalidation are absent | P1 | Add event recorder and session state contracts after the first extension bridge |
| Extension runtime | Surface is only declared in `surfaces/manifest.js` and `surfaces/targets.js` | No Manifest V3 manifest, service worker, content bridge, popup or build artifact | P0 | Implement a pure JavaScript MV3 reference surface with minimal permissions |
| Extension messaging | Not implemented | No versioned envelope, correlation id, timeout, sender metadata or error response contract | P0 | Add transport-neutral message contracts and Chrome runtime adapter |
| Service worker resilience | Not implemented | No rehydration or durable state strategy for worker termination | P0 | Persist pending command metadata and session summaries through injected storage |
| Permissions | Not implemented | No permission policy or optional escalation path | P0 | Start with `storage` and no broad host permissions; make host access caller-configured |
| Content isolation | Not implemented | No isolated-world DOM bridge or page-to-extension boundary | P0 | Add a narrow content script that reports page facts through the message contract |
| Task agent | Partial | Jobs, workflows and bot commands exist, but no browser task planner or tool registry | P1 | Reuse workflow and bot contracts; add browser task commands only after snapshots |
| MCP | Implemented scrape, crawl, batch, extract and serialize tools with JSON-RPC handling | No browser snapshot or browser action MCP tools | P1 | Add browser tools as an optional adapter over the same snapshot/action contracts |
| Storage | Implemented local, chunked, S3-compatible, GitHub Contents and file hosting adapters | Extension storage is not mapped to the storage contract | P1 | Add an injected extension storage adapter; do not make Chrome storage mandatory in the core |
| Queue | Implemented in-memory and persistent queue contracts | No worker-aware resume protocol for extension commands | P1 | Add resumable command records and idempotency keys to extension transport |
| Remote execution | Implemented provider, scheduler and workflow dispatch contracts | No permissioned extension-to-runner bridge | P1 | Require explicit caller-provided endpoint and auth; no default remote host |
| Auth profiles | Session file and replay contracts exist | No extension profile or consent model | P1 | Defer cookie/profile export; support explicit user-owned session references only |
| CAPTCHA | Contract, guard and evidence exist | No automatic solver integration | deferred | Keep external/manual solver boundary; do not promise bypass in the extension |
| Stealth | Fingerprint contract exists | No automatic stealth patching | deferred | Keep opt-in fingerprint metadata; no hidden anti-detection behavior |
| Packaging | npm, GHCR, Maven, NuGet and RubyGems workflows are live | No extension zip build or release artifact | P1 | Add a deterministic zip/check workflow after the reference surface is tested |
| Cross-browser | Target profile declares browser and extension | No Firefox, Edge or Safari manifests/build validation | P2 | Keep WebExtension-compatible contracts and add adapters incrementally |
| Storage equals compute | Memory bridge and engine implement storage-to-working-set-to-artifact | Remote storage is not physical VRAM and has latency | deferred | Document as a working-set model, never as literal remote VRAM |
| Site/database deployment | Persistence schemas and adapters exist | No hosted site or database is part of the package | deferred | Keep deploy targets caller-owned and outside the library core |

## first implementation slice

The first code slice targets the P0 rows only. It will contain:

1. A versioned serializable message envelope with request correlation and error responses.
2. A snapshot contract with stable references and stale snapshot detection.
3. A Chrome MV3 service worker that rehydrates state and routes messages.
4. A narrow content script that reports document metadata and visible text through the bridge.
5. An extension manifest with `storage` only and no broad host permission by default.
6. Deterministic tests for envelopes, snapshot validity and worker routing without Chrome credentials or network access.

The extension remains an adapter. The root library continues to work without a browser, without an extension and without external memory.

## implementation status

Version 1.1 implements the first slice in `extension/`: `protocol.js` provides versioned serializable messages and snapshot identity; `serviceworker.js` provides browser independent routing; `worker.js` binds that router to Manifest V3 APIs; `content.js` runs the isolated page bridge; and `popup.html` with `popup.js` provides user initiated snapshot and read actions. The package exports `@devthink/saddle/extension`, while the root library remains usable without Chrome.

The slice is intentionally not a full autonomous browser agent. Snapshot diffing, tab and frame identity, resumable command records, optional host escalation, browser action results and multi-browser packaging remain P1 or P2 work.

## references

1. [Chrome message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
2. [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
3. [Chrome permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
4. [Chrome service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
5. [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
6. [Vercel agent-browser](https://github.com/vercel-labs/agent-browser)
7. [Browser Use](https://github.com/browser-use/browser-use)
8. [WXT](https://wxt.dev/)
