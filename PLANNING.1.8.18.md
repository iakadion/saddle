# Saddle 1.8.18 planning base

## Purpose

This planning base consolidates the durable themes found across the 41 historical root README revisions. It is designed to make implementation gaps visible before the 1.8.18 cycle without replacing the repository README, which remains the preserved scope reference.

## Active release baseline

The active package baseline is **1.8.17**. JavaScript, Maven, NuGet, RubyGems, extension, desktop, iOS, crawler, Capacitor, and container metadata are aligned to that release. Older release values in changelog entries, release evidence, research, and deterministic fixtures retain their original values.

## Consolidated capability map

| Area                                  | Current basis                                                                                                                            | 1.8.18 direction                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Storage and memory                    | Working sets, memory modes, materialization, transforms, cache, sync, and cleanup are explicit.                                          | Select a bounded lifecycle, restoration, budget, or observability receipt.                  |
| Runners and multi-forge execution     | Jobs, triggers, compatibility, worker, delivery, and caller-owned runner adapters are present.                                           | Select a portable runner capability or execution evidence receipt.                          |
| File and artifact processing          | Binary transforms, archive inspection, packagers, checksums, SBOM shapes, and provenance metadata exist.                                 | Select a useful verification or adapter boundary.                                           |
| Modes and protocols                   | Fetch, browser, headless, CLI, binary, computer, extension, desktop, mobile, web, JSON, NDJSON, SSE, blocks, and MCP remain declarative. | Select a compatibility, streaming, or schema boundary.                                      |
| Reliability                           | Retry, abort, queue, idempotency, saga, circuit breaker, health, heartbeat, cancellation, and compensation are modeled.                  | Select a recovery decision that needs portable evidence.                                    |
| Scraping and browser context          | Robots, crawling, cache, extraction, snapshots, sessions, fingerprints, and caller-owned transports exist.                               | Select a consent, freshness, resumability, action, or context-budget receipt.               |
| Proxy, captcha, and stealth proposals | Caller-owned boundaries only; no bypass, provider, or success guarantee exists.                                                          | Add policy or evidence only, never circumvention behavior.                                  |
| Database and SQL proposals            | No database is provisioned or required; persistence remains caller-owned.                                                                | Decide whether an adapter contract is needed or should remain external.                     |
| Distribution and signing              | Six registries, native surfaces, release evidence, checksums, and explicit signing states are modeled.                                   | Select a distribution-verification gap without duplicating product logic or implying trust. |

## Selection rules

Each candidate for 1.8.18 must be additive, TypeScript-first, root-first, dependency-free in the core, serializable, deterministic under tests, and adapter-owned for privileged or remote effects. It must not download assets, access credentials, choose a provider, start infrastructure, claim a security property without evidence, or turn a historical proposal into an unsupported guarantee.

## Reading the historical record

The historical README themes are consolidated above by capability rather than copied as duplicate prose. Historical versions, provider-specific examples, secret names, speculative dependencies, obsolete runtime assumptions, and unimplemented services remain historical evidence. The current README remains the preserved scope reference; this document is the organized implementation base for gap selection.
