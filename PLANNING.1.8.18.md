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

## 1.8.18 scope classification

The submitted architecture reference was reviewed in full as an evidence source. Its goals divide into three categories. The first category can be implemented in the package now: serializable execution plans, denied-by-default policy evaluation, bounded binary inspection and transformation planning, runner capability selection, materialization receipts, browser and scrape evidence, and a static playground that visualizes those contracts. The second category needs an application backend selected and operated by the caller: Drizzle-backed persistence, queue resumption, webhook handling, account identity, workspace data, audit retention, and service-side job dispatch. The third category needs dedicated execution infrastructure: a remote interactive browser, a hardened OCI container runtime, or a KVM-capable micro-VM host.

| Requested outcome | 1.8.18 package treatment | Operational requirement |
| --- | --- | --- |
| Binary processor | Inspect, classify, plan, verify, and hand off binary work through additive contracts. | Execution requires an explicit caller-owned adapter. |
| Edge or third-party compute | Select a compatible runner and create a dispatch plan plus receipt schema. | A configured forge, container platform, or remote executor. |
| Sandbox or micro-VM | Model policy, requirements, approval, lifecycle, and evidence. | An OCI runtime, gVisor or KVM/Firecracker-capable host supplied by the operator. |
| Remote agent browser | Model session, action, evidence, and isolation capability. | A deployed remote-browser service, such as a caller-operated Neko instance, with networking and authentication. |
| Drizzle database | Define a persistence adapter boundary and schema projection. | A backend application, configured database, migrations, and server-side secrets. |
| Playground in `web/` | Build a static, local-fixture interface for plans, policies, binary metadata, receipts, and integration requirements. | No backend is needed for the initial demonstrator. |

## Selected implementation increment

The first implementable block is **isolated execution planning and binary-processing evidence**. It extends existing binary, runner, memory, runtime, persistence, browser, and release modules without duplicating them. The new root-first isolation surface will remain dependency-free and effect-free. It will expose serializable request, policy, plan, requirement, capability, receipt, evidence, approval, and adapter types; deterministic evaluators; and a caller-owned adapter interface. An execution request will be denied by default when its policy, capability receipt, approval, or adapter declaration is absent or incompatible.

The initial website work will be a **truthful static playground** under `web/`. It will create and inspect plans with safe fixtures, show the difference between an execution plan and execution, inspect bounded binary metadata, render runner eligibility and policy denial explanations, and state the backend prerequisites for Drizzle, remote browser, OCI, gVisor, and Firecracker integrations. It will not accept arbitrary binary execution, connect to Docker, create databases, relay browser input, store secrets, call a provider, or represent a static site as a VPS.

## Isolation research basis

Neko is a self-hosted remote browser or desktop running in containers and accessed through WebRTC; it requires an operator-managed image, credentials, network exposure, and potentially TURN infrastructure. gVisor supplies an OCI runtime for sandboxed containers but is not a conventional virtual machine and has compatibility and performance boundaries. Firecracker is a KVM micro-VM runtime that requires a compatible Linux host, KVM access, a kernel, a root filesystem, and production jailer configuration. These systems are therefore external adapter targets rather than dependencies of the Saddle root library.[1] [2] [3]

## Architecture decision required before remote operation

The static playground and core contracts can be implemented immediately. Remote execution needs the operator to select one of two subsequent tracks: a managed application backend with database-backed plans and receipts, or a dedicated execution host for container or micro-VM isolation. The former supports persistent application data and user-visible status; the latter is required for Docker, gVisor, Firecracker, or an interactive Neko browser. Neither track is selected implicitly by adding a package dependency.

## Unified web and internal API decision

The earlier Site A through Site E concept is now one `web/` surface. It will not be recreated as multiple deployments. Its internal API is a set of typed, serializable request and response boundaries, not a set of fake remote URLs:

| Internal boundary | Responsibility in the unified site | Default implementation |
| --- | --- | --- |
| Gateway API | Accepts a typed request and assigns a deterministic request identifier. | Pure in-process function; no HTTP request. |
| Planning API | Produces a binary-processing, runner, working-set, browser, or persistence plan. | Existing library contracts and pure wrappers. |
| Policy API | Decides whether a requested effect is permissible. | Denied unless an explicit approval, capability, and adapter declaration all match. |
| Materialization API | Describes storage and memory requirements plus a cleanup plan. | Plan and receipt only; no filesystem, RAM bridge, or database mutation. |
| Execution API | Renders a handoff that a caller-owned adapter may execute. | Structured `execution-disabled` result; no binary, process, WASM, container, browser, worker, or remote call. |
| Persistence API | Projects a serializable record or schema request. | Ephemeral fixture state for the playground; no disk, database, provider, or account. |
| Evidence API | Returns a receipt that distinguishes requested, planned, denied, delegated, and completed states. | Deterministic receipt generated from the request and policy. |

The static web application can use these API shapes directly in the browser, but it cannot host an HTTP API, database, remote process, or micro-VM. If a backend is introduced later, it will implement the same envelopes behind server routes without changing their caller-facing semantics.

## Non-negotiable resource model

No executable system can process data without using the resources of some host. In-memory storage uses the RAM of the process host; a browser UI uses a small amount of the visitor's browser resources; a database uses storage or memory of its host; and a remote browser, container, WebAssembly runtime, or micro-VM consumes the resources of its operator host. The 1.8.18 product default therefore means **no intentional compute job, file read, binary load, local bridge, network call, database operation, provider usage, free-tier usage, paid service, browser launch, or remote dispatch**.

The unified playground will use only tiny built-in fixtures and deterministic pure functions. It will not offer file upload, arbitrary code input, compilation, binary execution, WASM instantiation, `node:vm`, worker creation, persistent storage, fetch, WebSocket, iframe, provider token, or machine control. Any later operational mode must require a caller-supplied adapter, a capability declaration, an effect budget, and a matching approval record. Its receipt must name the execution owner and must never call a logical working set, memory adapter, SQLite `:memory:` database, PouchDB memory adapter, or JavaScript object graph a VPS or a micro-VM.

## 1.8.18 deliverable sequence

1. Add root-first execution-policy and internal-API contract modules that compose the existing binary transformation, runner-chain, working-set and release-evidence vocabulary.
2. Add deterministic tests for disabled, denied, planned, delegated, receipt, budget, approval and adapter mismatch cases.
3. Add the unified playground route to `web/`, using safe fixtures and internal API projections to show the lifecycle without executing it.
4. Add documentation that explains the difference between logical sandbox planning, in-process storage, OCI sandboxing, remote-browser streaming and KVM micro-VMs.
5. Run all release gates, then only bump and tag 1.8.18 when the selected contract and playground are complete.

## References

[1]: https://neko.m1k1o.net/docs/v2 "Neko documentation"
[2]: https://gvisor.dev/docs/ "gVisor documentation"
[3]: https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md "Firecracker getting started guide"
