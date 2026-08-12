# ecosystem implementation plan

Saddle is treated as the contract layer for a larger ecosystem. The implementation is progressive: each block adds a cohesive capability, tests it without real credentials, updates the public documentation and records the release impact before the next block begins.

## north star

The library remains usable as a root-based JavaScript ESM package in library, CLI, binary, browser, extension, desktop, mobile, container and runner contexts. A caller can choose storage, browser, provider, runner, database, proxy, bot and credential adapters without changing the core contracts.

The engine owns **contracts, validation, orchestration, recovery and auditability**. The caller owns **accounts, credentials, remote infrastructure, browser profiles, service terms and deployment choices**.

## non-negotiable invariants

| Invariant | Rule |
| --- | --- |
| Runtime | JavaScript ESM, root-based, no `src/`, lowercase filenames and English JSDoc |
| Infrastructure | no hardcoded host, port, credential, cloud account or vendor-specific function |
| Library | works without an extension, browser, remote runner, external memory or database |
| Security | validate URLs, isolate browser contexts, minimize permissions, verify webhooks and audit actions |
| Recovery | jobs, commands, artifacts and sync operations are idempotent, retryable or explicitly terminal |
| Evidence | a feature is complete only with an executable contract, deterministic tests and documentation |
| Distribution | package contents, license, provenance, checksums and registry namespace are verified before release |

## block order

| Block | Scope | Current state | Exit evidence |
| --- | --- | --- | --- |
| 1 | audit and governance | active | gap matrix, sources, claims reconciled |
| 2 | browser agent foundation | complete | snapshots, refs, stale errors, tabs, frames, action results and context-aware replay provenance tests |
| 3 | extension runtime | first slice complete | MV3 unpacked surface, protocol, worker, content bridge and tests |
| 4 | working set and storage | complete | range chunks, content dedupe, tiered cache, conflict sync and memory capabilities |
| 5 | runners and execution | complete | provider health, triggers, cancellation, heartbeat and resumable runs |
| 6 | scraping and context | complete | semantic extraction, crawl budgets, RAG lineage and low-cardinality metrics |
| 7 | API, MCP and security | complete | request identity, optional auth, secure headers, browser MCP tools and redirect/DNS checks |
| 8 | bots and integrations | complete | app lifecycle, command scopes, idempotency, delivery retries and dead letters |
| 9 | packaging and distribution | extension zip and registry slice verified for 1.8.1 | desktop, mobile, n8n and binary artifacts remain caller-owned |
| 10 | product surfaces and operations | first slice complete | desktop, mobile, n8n and operator control contracts; observability, retention and threat model remain |
| 11 | cross-runtime compatibility | transport-neutral graph audit complete | Node, Bun and Deno root probe, browser worker bridge, extension permission/build checks and package graph audit |
| 12 | release gates | active | deterministic checks, docs, clean diffs and claim/code parity |

## execution method

Each block follows the same loop:

1. Compare the requested behavior with primary repositories or platform documentation.
2. Record the gap and the intended boundary in `docs/gapmatrix.md`.
3. Define the smallest transport-neutral contract.
4. Implement grouped logic in the domain folder without adding a vendor dependency unless required.
5. Add deterministic tests with fake transports and no real credentials.
6. Update API docs, README claims, changelog and `todo.md`.
7. Run format, syntax, tests, package and security checks.
8. Commit and push the block before starting the next one.

## current implementation

Version 1.8.1 contains the first bot and integration lifecycle slice after browser, storage, runners, scraping and API hardening, the public npm identity migration, the minimal extension permission policy and the deterministic extension zip workflow. Registry publication evidence for 1.8.1 covers GitHub npm, GHCR, Maven, NuGet, RubyGems and an accepted public npmjs publish; immediate npmjs index propagation remains a follow-up check. The first product surface slice adds desktop, mobile, n8n, operator control, operational policy and framework-neutral HTTP contracts. The first cross-runtime slice validates the root on Node, Bun and Deno, while extension-context and browser bundler checks remain.

## evidence sources

The current plan is grounded in the repository's [`comparativeaudit.md`](comparativeaudit.md), [`gapmatrix.md`](gapmatrix.md), the supplied conclusions documents, and primary platform or project sources listed there. External claims remain evidence-backed notes; they do not become product promises until the corresponding block has executable tests.
