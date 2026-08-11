# saddle roadmap p2 p3

## implemented surfaces

The P2 and P3 cut adds the safe extension points described by the README without forcing browser, captcha, proxy, AI, webhook, or packaging vendors into the core.

| area | module | behavior |
|---|---|---|
| browser | `browser/fingerprint.js` | coherent session profile with stable operating system, browser, locale, timezone, touch, and pixel ratio |
| browser | `browser/session.js` | binds one profile and one proxy reference to recorded events |
| proxy | `proxy/pool.js` | least used selection, failure threshold, graveyard, and timed revive |
| captcha | `captcha/contract.js` | detection, explicit review, optional external solver, and assertion |
| evidence | `captcha/evidence.js` | hash and metadata manifest without persisting raw secrets by default |
| ai | `ai/tokens.js` | configurable token estimates and context budgets |
| ai | `ai/chunk.js` | heading aware Markdown chunks with overlap and token counts |
| ai | `ai/rag.js` | content hash deduplication and vector record metadata |
| ai | `ai/llmstxt.js` | compact `llms.txt` and full content variants with absolute HTTPS links |
| webhooks | `webhook/receiver.js` | HMAC verification, delivery idempotency, and event handler boundary |
| packaging | `surfaces/manifest.js` | browser, extension, desktop, mobile, n8n, cli, binary, and library manifests |

## security boundary

The browser layer does not patch `navigator`, TLS, HTTP/2, canvas, audio, or WebGL. It only models a coherent profile and session binding. The captcha layer does not bypass challenges automatically. It stops for review or calls an explicitly injected external solver and records only an auditable result reference.

Proxy selection is health based. Repeated failures move an entry to a graveyard state and a timer can revive it later. A session keeps a single proxy reference instead of rotating blindly during an active identity.

## extensibility

AI code uses plain text and array contracts. A tokenizer, embedding provider, vector database, browser runtime, captcha solver, proxy agent, or webhook transport can be attached through a factory without changing public engine contracts.

## validation

The repository keeps the root based JavaScript layout, no `src` directory, lowercase modules, no credentials, and no hardcoded local host or port. The current suite validates the new contracts together with the engine foundation and prior P0/P1 layers.
