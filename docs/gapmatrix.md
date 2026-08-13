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
| Root library | Implemented ESM entry point with broad exports and an extension subpath | Browser-specific packaging and cross-browser profiles remain adapter-owned | P2 | Keep serializable extension contracts separate from browser binaries |
| Browser agent | Implemented injected action adapter for navigate, click, type, screenshot, DOM, title, scroll and command batches | Vendor-neutral action results and bounded action batches are public; optional Playwright provider is isolated behind `browser-playwright` | P1 | Keep the adapter boundary; browser binaries and credentials remain caller-owned |
| Browser snapshots | Implemented public contract | Snapshot ids, bounded elements, stable refs, stale checks and diffs are covered by deterministic tests | P0 | Reuse the contract from MCP and extension transport |
| Session replay | Implemented | Replay restores caller-owned window, tab and frame context before actions; context identifiers are validated and counted | P1 | Keep browser selection and restoration in injected adapters |
| Extension runtime | Manifest V3 manifest, service worker, content bridge, popup, snapshot diffs, context metadata and deterministic build artifact are implemented | Cross-browser manifests remain unbundled | P2 | Keep a pure JavaScript MV3 reference surface with minimal permissions |
| Extension messaging | Versioned envelope, correlation id, timeout, sender metadata and error response contract are implemented | Long-lived ports remain caller-owned | P1 | Keep transport-neutral messages and explicit runtime adapters |
| Service worker resilience | Implemented contract slice | Pending command envelopes, attempt metadata and snapshot summaries persist through injected storage; resume remains explicit and user-owned | P0 | Rehydrate metadata on startup and never replay a command without an explicit caller action |
| Permissions | Contract slice | `permissionpolicy` keeps the base permissions minimal and optional escalation caller-owned | P0 | Start with `storage` and no broad host permissions; make host access caller-configured |
| Content isolation | Implemented read-only page-to-extension boundary | The page world cannot invoke extension commands; richer page facts remain bounded | P1 | Keep `pagebridge.js` read-only, token-correlated and caller-controlled |
| Task agent | Partial | Jobs, workflows and bot commands exist, but no browser task planner or tool registry | P1 | Reuse workflow, trigger and bot contracts; add browser task commands only after snapshots |
| MCP | Implemented scrape, crawl, batch, extract and serialize tools with JSON-RPC handling | No browser snapshot or browser action MCP tools | P1 | Add browser tools as an optional adapter over the same snapshot/action contracts |
| API security | Implemented URL protocol and private hostname/IP checks | Request envelopes, optional authorization, security headers, redirect bounds and injected DNS resolution checks are now available | P0 | Keep credentials caller-owned and reject private or rebinding targets before transport |
| Apps and bots | Implemented platform adapter, commands, bot and webhook signature contracts | App install/suspend/revoke, command scope checks, idempotency and delivery retry/dead-letter records are now available | P1 | Keep platform tokens and OAuth lifecycle caller-owned |
| Storage | Implemented local, chunked, S3-compatible, GitHub Contents and file hosting adapters | Range reads, content dedupe, tiered cache, capabilities and conflict-aware sync were missing | P1 | Use the new neutral storage helpers and keep extension storage injected |
| Queue | Implemented in-memory, persistent and extension-resumable command contracts | Browser host still owns long-lived queue workers and cancellation policy | P1 | Keep command records serializable and resume explicit through the extension adapter |
| Remote execution | Implemented provider, scheduler, health, triggers, heartbeat and resumable run contracts | No permissioned extension-to-runner bridge or forge-specific status adapters for every provider | P1 | Require explicit caller-provided endpoint and auth; no default remote host |
| Scraping | Implemented robots, cache, HTML extraction, schema extraction, scraper and content normalization | Rich document parsers and binary format adapters remain caller-owned | P1 | Keep extraction safe and bounded; add adapters for richer document types |
| Crawl | Implemented normalized BFS and persistent frontier | Priority and per-domain budget frontier now exist; sitemap refresh remains absent | P1 | Keep frontier state serializable and caller-persistable |
| RAG context | Implemented chunk hashes and vector record metadata | Retrieval provenance and merge records now exist; embeddings and indexes remain injected | P1 | Preserve source, document, chunk and score lineage |
| Observability | Contract slice | Low-cardinality counters and durations are bound to the standard operational metric vocabulary; export and tracing remain caller-owned | P1 | Keep metrics vendor-neutral and bounded |
| Operations policy | Contract slice | Retention, backup/restore capability and threat ownership are declarative and caller-owned | P1 | Add workers, persistence and incident response only in host surfaces |
| Web control surface | Contract slice | `controlservice` maps Web Request and Response traffic to the auditable control contract; framework, auth verifier and persistence remain injected | P1 | Keep the HTTP boundary transport-neutral |
| Auth profiles | Session file and replay contracts exist | No extension profile or consent model | P1 | Defer cookie/profile export; support explicit user-owned session references only |
| CAPTCHA | Contract, guard and evidence exist | No automatic solver integration | deferred | Keep external/manual solver boundary; do not promise bypass in the extension |
| Stealth | Fingerprint contract exists | No automatic stealth patching | deferred | Keep opt-in fingerprint metadata; no hidden anti-detection behavior |
| Packaging | npm, GHCR, Maven, NuGet, RubyGems, extension zip, deterministic SHA256SUMS, CycloneDX SBOM and in-toto-shaped provenance assets are implemented | Desktop, mobile, n8n and binary release artifacts remain caller-owned | P1 | Keep non-JavaScript artifacts in explicit adapters and release jobs |
| Mobile and desktop apps | Contract slice | Desktop/mobile manifests and caller-owned adapter contracts exist; no native project is bundled | P1 | Keep native projects caller-owned and add runtime conformance tests incrementally |
| n8n surface | Contract slice | Node metadata, trigger matching and declared action execution exist; no n8n host package is bundled | P1 | Keep node registration and credentials caller-owned |
| Cross-browser | Target profile declares browser and extension | Firefox, Edge or Safari manifests remain unbundled; transport-neutral export graph is statically audited for Node-only imports | P2 | Keep WebExtension-compatible contracts and add browser adapters incrementally |
| Storage equals compute | Memory bridge and engine implement storage-to-working-set-to-artifact; sync and capability negotiation now exist | Remote storage is not physical VRAM and has latency | deferred | Document as a working-set model, never as literal remote VRAM |
| Site/database deployment | Persistence schemas and adapters exist | No hosted site or database is part of the package | deferred | Keep deploy targets caller-owned and outside the library core |

## first implementation slice

The first code slice targeted the P0 rows only. It now contains:

1. A versioned serializable message envelope with request correlation and error responses.
2. A snapshot contract with stable references and stale snapshot detection.
3. A browser context registry for tabs, frames and active state.
4. Structured action results, failures and bounded action batches.
5. A recorder linking actions to the snapshot used before execution.
6. A Chrome MV3 service worker that rehydrates state and routes messages.
7. A narrow content script that reports document metadata and visible text through the bridge.
8. Deterministic tests for browser contracts without Chrome credentials or network access.
9. A read-only page-world bridge with token-correlated responses and bounded `pagefacts` reads.

The extension remains an adapter. The root library continues to work without a browser, without an extension and without external memory.

## implementation status

Version 1.1 implements the first slice in `extension/`: `protocol.js` provides versioned serializable messages and snapshot identity; `serviceworker.js` provides browser independent routing; `worker.js` binds that router to Manifest V3 APIs; `content.js` runs the isolated page bridge; and `popup.html` with `popup.js` provides user initiated snapshot and read actions. The package exports `@wenathlan/saddle/extension`, while the root library remains usable without Chrome.

The slice is intentionally not a full autonomous browser agent. Snapshot diffing, tab and frame identity, resumable command records, optional host escalation, browser action results and multi-browser packaging remain P1 or P2 work. The page-world bridge is deliberately read-only and cannot evaluate arbitrary page-provided commands.

## references

1. [Chrome message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
2. [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
3. [Chrome permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
4. [Chrome service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
5. [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
6. [Vercel agent-browser](https://github.com/vercel-labs/agent-browser)
7. [Browser Use](https://github.com/browser-use/browser-use)
8. [WXT](https://wxt.dev/)
