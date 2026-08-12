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
| 2 | browser agent foundation | complete | snapshots, refs, stale errors, tabs, frames, action results and replay provenance tests |
| 3 | extension runtime | first slice complete | MV3 unpacked surface, protocol, worker, content bridge and tests |
| 4 | working set and storage | complete | range chunks, content dedupe, tiered cache, conflict sync and memory capabilities |
| 5 | runners and execution | complete | provider health, triggers, cancellation, heartbeat and resumable runs |
| 6 | scraping and context | partial | semantic extraction, crawl budgets, RAG lineage and token policies |
| 7 | API, MCP and security | partial | versioned routes, browser MCP tools and expanded SSRF coverage |
| 8 | bots and integrations | partial | app lifecycle, permissions, delivery adapters and conformance tests |
| 9 | packaging and distribution | partial | reproducible extension, desktop, mobile, n8n and binary artifacts |
| 10 | product surfaces and operations | planned | controls, observability, retention, threat model and release process |
| 11 | cross-runtime compatibility | planned | Node, worker, Deno, Bun and extension capability checks |
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

Version 1.4 contains the first runners foundation slice after browser and storage work. It adds provider health reports, cooperative heartbeat signals, forge-neutral workflow triggers, legal run transitions and resumable remote execution through injected adapters. The next implementation block is scraping and context because runner outcomes now have stable trigger and recovery boundaries.

## evidence sources

The current plan is grounded in the repository's [`comparativeaudit.md`](comparativeaudit.md), [`gapmatrix.md`](gapmatrix.md), the supplied conclusions documents, and primary platform or project sources listed there. External claims remain evidence-backed notes; they do not become product promises until the corresponding block has executable tests.
