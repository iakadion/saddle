# Reorganization 1.8.8

## Purpose

Version 1.8.8 applies the architecture skill's grouping rule to active JavaScript contracts. The objective is not to erase historical features or flatten unrelated domains. The objective is to give each correlated responsibility one canonical owner, reduce redundant folder boundaries, and preserve public names and deterministic behavior.

## Audit result

The active package contains a JavaScript runtime and a legacy TypeScript scrape tree. The TypeScript tree is not imported by the active root entry or package export map. It remains in place because it documents a broader historical surface and contains features that would require a separate compatibility decision before conversion to the current JavaScript library boundary.

| Context | Previous ownership | Version 1.8.8 owner | Decision |
| --- | --- | --- | --- |
| Crawl acquisition | `crawl/normalize.js`, `crawl/frontier.js`, `crawl/crawler.js`, `crawl/persistent.js` | `scrape/crawl.js` | Consolidated. URL normalization, traversal, frontier budgets and durable crawl state share one context and preserve all public function names. |
| Retry protection | `retry/policy.js`, `retry/circuit.js` | `runtime/retry.js` | Consolidated. Both modules protect caller-owned runners, storage and network handlers from transient failure storms. |
| Scrape error classification | `errors/taxonomy.js` | `core/errors.js` | Consolidated. Generic engine errors and scrape recovery metadata share one stable error boundary. |
| Page cache | `scrape/cache.js` | `scrape/cache.js` | Kept separate. It caches single-page scrape results and robots policy. |
| Storage cache | `storage/cache.js` | `storage/cache.js` | Kept separate. It manages hot and cold byte-backed tiers, encoding, eviction and revalidation. |
| Job persistence | `queue/persistent.js` | `queue/persistent.js` | Kept separate. It persists generic job lifecycle records rather than crawl URLs. |
| Browser sessions | `browser/session.js`, `domain/sessions.js`, `sessions/*` | existing owners | Kept separate. These contracts represent browser identity, domain validation and file or replay persistence. |

## Compatibility rule

The root export barrel continues to expose `normalizeurl`, `sameorigin`, `crawlfrontier`, `persistentqueue`, `crawl`, `retrypolicy`, `circuitbreaker`, `webscrapeerror` and `classifyerror`. Internal imports, tests and package payload declarations now point to the canonical owners. No public export was renamed for the regrouping.

## Verification rule

The reorganization is accepted only when syntax checks, deterministic tests, format checks, package dry-run, dependency audit, web typecheck and Pages build pass. A deleted file is considered redundant only after its imports, tests, package payload and documented public names have been checked.

## Deferred historical surface

The legacy TypeScript modules under `scrape/` remain a separate historical surface. They include richer browser, renderer, cache, middleware, server, session, pool, sitemap and format contracts. They are not silently merged into the active JavaScript modules because doing so would either discard features or introduce an undeclared TypeScript and external dependency build into the published core.
