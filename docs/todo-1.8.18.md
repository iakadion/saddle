# Saddle 1.8.18 — isolated execution and binary-processing plan

> This plan contains **920 individual actions**. It uses 92 unchecked work packages, each with ten ordered actions: **inspect, extract, classify, design, implement, test, boundary-test, review, document, and record**. The ten actions apply to the exact subject named by each work package; a package may be marked complete only after all ten actions have evidence.

## Completion guardrails

| Rule | Requirement |
| --- | --- |
| Truthfulness | A contract may describe, plan, validate, or invoke isolation. It must not claim to provide a VPS, micro-VM, browser isolation, persistent database, GPU, signing, or a remote service unless the caller supplies and verifies the corresponding adapter. |
| Isolation | Untrusted bytes are never executed by the transport-neutral root. Execution requires a caller-owned isolated-runner adapter and an explicit policy. |
| Storage | Remote storage is durable state, not literal RAM or VRAM. Materialization remains bounded, measurable, and caller-owned. |
| Effects | Network, browser, container, filesystem, database, credentials, dispatch, retention, and deletion remain explicit privileged effects. |
| Compatibility | New contracts are additive, TypeScript-first, dependency-free, serializable, root-first, and use deterministic tests. |
| Publishing | Release work begins only after all gates pass and every version-bearing manifest agrees on `1.8.18`. |

## 1. Scope source audit — actions 001–100

- [ ] **001–010.** Read README source lines 001–200; extract architecture, mode, and naming requirements.
- [ ] **011–020.** Read README source lines 201–400; extract execution, binary, and isolation requirements.
- [ ] **021–030.** Read README source lines 401–600; extract storage, memory, and provider assertions.
- [ ] **031–040.** Read README source lines 601–800; extract runner, workflow, and deployment assertions.
- [ ] **041–050.** Read README source lines 801–1000; extract agent, browser, scrape, and bot assertions.
- [ ] **051–060.** Read README source lines 1001–1200; extract protocol, database, and API assertions.
- [ ] **061–070.** Read README source lines 1201–1400; extract package, native, and extension assertions.
- [ ] **071–080.** Read README source lines 1401–1600; extract web, playground, and UI assertions.
- [ ] **081–090.** Read README source lines 1601–1848; extract release, quality, and governance assertions.
- [ ] **091–100.** Compare the extracted source claims with current 1.8.17 code, tests, manifests, and shipped artifacts.

## 2. Feasibility, terminology, and capability evidence — actions 101–200

- [ ] **101–110.** Classify every source claim as shipped, adapter-ready, research-only, deferred, infeasible, or policy-rejected.
- [ ] **111–120.** Define precise vocabulary for process plan, isolated execution, sandbox adapter, container adapter, micro-VM adapter, and remote runner.
- [ ] **121–130.** Define precise vocabulary for durable storage, working set, cache, mmap, tmpfs, memory pressure, and materialization.
- [ ] **131–140.** Define precise vocabulary for binary inspection, binary transform, binary execution, binary artifact, and binary provenance.
- [ ] **141–150.** Define precise vocabulary for browser transport, browser session, browser isolation, browser action, and browser evidence.
- [ ] **151–160.** Define precise vocabulary for edge processing, third-party runner, provider chain, job lease, and artifact boundary.
- [ ] **161–170.** Define a claim-evidence schema that distinguishes declared capability from verified capability and observed result.
- [ ] **171–180.** Define a capability receipt schema for platform, architecture, isolation mechanism, limits, and adapter identity.
- [ ] **181–190.** Define a policy vocabulary for allowed, denied, approval-required, unknown, expired, and unsupported execution requests.
- [ ] **191–200.** Document the non-goals: no false VPS, no hidden credentials, no arbitrary code execution in the root, and no quota evasion.

## 3. Execution-policy contracts — actions 201–300

- [ ] **201–210.** Design the serializable execution-request contract with input reference, target, policy, and artifact destination.
- [ ] **211–220.** Design the serializable execution-policy contract with network, filesystem, process, time, memory, and output limits.
- [ ] **221–230.** Design the serializable execution-plan contract that separates planning from privileged execution.
- [ ] **231–240.** Design the serializable execution-receipt contract for adapter identity, limits, timings, exit classification, and artifacts.
- [ ] **241–250.** Design the serializable execution-evidence contract for hashes, logs, retention intent, and verification state.
- [ ] **251–260.** Design the isolated-runner adapter interface without importing Docker, Firecracker, Playwright, or provider SDKs in the root.
- [ ] **261–270.** Design the cancellation and unknown-remote-state contract with no false rollback claims.
- [ ] **271–280.** Design the admission-control contract for queue budget, concurrency budget, working-set budget, and execution quota.
- [ ] **281–290.** Design the explicit approval token and consent correlation contract for privileged execution requests.
- [ ] **291–300.** Design deterministic fixture shapes for accepted, denied, expired, unsupported, cancelled, and unknown execution states.

## 4. Binary inspection and transformation contracts — actions 301–400

- [ ] **301–310.** Define a binary-source contract for inline bytes, durable artifact references, and caller-owned streams.
- [ ] **311–320.** Define bounded binary metadata inspection based on magic bytes, size, digest, and declared media type.
- [ ] **321–330.** Define binary classification results for archive, executable, document, image, model, unknown, and malformed input.
- [ ] **331–340.** Define the binary-transform plan contract with deterministic input, options, cache identity, and output expectations.
- [ ] **341–350.** Define the transform adapter interface for caller-owned WASM, native, container, or remote execution paths.
- [ ] **351–360.** Define archive-inspection contracts that list entries and limits without extracting untrusted content.
- [ ] **361–370.** Define archive-extraction plans that require a caller-owned extraction adapter and explicit path controls.
- [ ] **371–380.** Define binary-output verification for digest, byte count, media type, expected structure, and provenance.
- [ ] **381–390.** Define binary-processing failure taxonomy for malformed, oversized, unsupported, denied, timeout, and verification failure.
- [ ] **391–400.** Define deterministic binary fixtures and fuzz boundaries without storing unsafe executable payloads in the repository.

## 5. Working-set, storage, and materialization contracts — actions 401–500

- [ ] **401–410.** Define working-set admission estimates for byte size, range support, locality, and required transforms.
- [ ] **411–420.** Define bounded range materialization plans for local, remote, chunked, and content-addressed storage adapters.
- [ ] **421–430.** Define cache identity, cache freshness, cache evidence, and caller-owned eviction plans.
- [ ] **431–440.** Define temporary materialization lifecycle states from planned through verified cleanup intent.
- [ ] **441–450.** Define storage capability receipts for range reads, writes, integrity checks, regions, and retention constraints.
- [ ] **451–460.** Define integrity verification for chunks, manifests, content addresses, and reconstructed binary artifacts.
- [ ] **461–470.** Define storage-pool policy for primary, mirror, fan-out, quorum, repair planning, and no-background-retry limits.
- [ ] **471–480.** Define memory-pressure decisions that remain declarative and never claim local or remote RAM ownership.
- [ ] **481–490.** Define storage-to-execution handoff records with bytes, hash, policy identity, and recipient adapter identity.
- [ ] **491–500.** Define deterministic tests for working-set budgets, range support, corrupt members, and cleanup-plan generation.

## 6. Runner, provider-chain, and remote-isolation adapters — actions 501–600

- [ ] **501–510.** Define runner capability declarations for process, container, micro-VM, browser, network, and hardware attributes.
- [ ] **511–520.** Define runner eligibility evaluation with explicit requirements and no provider-specific implicit fallback.
- [ ] **521–530.** Define deterministic provider-chain selection from declared capabilities, policy, preference, and evidence.
- [ ] **531–540.** Define runner dispatch plans that remain effect-free until a caller-provided adapter executes them.
- [ ] **541–550.** Define GitHub Actions runner adapter requirements without treating an ephemeral workflow as a permanent VPS.
- [ ] **551–560.** Define Forgejo, Gitea, GitLab, Codeberg, and Woodpecker adapter requirements without embedding tokens or endpoints.
- [ ] **561–570.** Define container-runner adapter requirements for image identity, read-only input, bounded mounts, resource limits, and receipt evidence.
- [ ] **571–580.** Define micro-VM adapter requirements for kernel/image provenance, CPU/memory limits, network policy, and lifecycle receipt.
- [ ] **581–590.** Define remote cancellation, observation, and handoff semantics when provider state is delayed, unknown, or unavailable.
- [ ] **591–600.** Define deterministic fake-runner tests proving planning, policy denial, adapter selection, and receipt validation without remote execution.

## 7. Agent browser, scrape, and MCP capability contracts — actions 601–700

- [ ] **601–610.** Define browser-session capability receipts for transport, isolation claim, headless state, and permitted actions.
- [ ] **611–620.** Define browser-action request and evidence contracts for navigation, click, type, capture, and download planning.
- [ ] **621–630.** Define browser isolation requirements that require a caller-owned transport and cannot be inferred from a UI label.
- [ ] **631–640.** Define snapshot, frame, tab, and context-budget handoffs between browser adapters and agent logic.
- [ ] **641–650.** Define scrape-request consent, robots, freshness, cache, provenance, and bounded-output policy contracts.
- [ ] **651–660.** Define crawler frontier, domain budget, retry, queue, and cancellation contracts with explicit persistence ownership.
- [ ] **661–670.** Define proxy and captcha boundaries as caller-owned evidence or adapters, never bundled bypass behavior.
- [ ] **671–680.** Define MCP tool declarations for execution planning, binary inspection, capability evaluation, and artifact evidence.
- [ ] **681–690.** Define SaddleBot task boundaries for explicit operator commands, message provenance, and no autonomous credential handling.
- [ ] **691–700.** Define deterministic tests for browser evidence, scraper freshness, crawl budgets, MCP serialization, and bot policy rejection.

## 8. Persistence, database, protocol, and observability contracts — actions 701–800

- [ ] **701–710.** Define persistence interfaces for execution plans, receipts, evidence, artifacts, approvals, and resumable tasks.
- [ ] **711–720.** Evaluate Drizzle ORM only as an optional caller-owned persistence adapter, not as a root dependency or required database.
- [ ] **721–730.** Define relational schema projections for jobs, artifacts, leases, receipts, evidence, approvals, and retention decisions.
- [ ] **731–740.** Define migration ownership, database credentials, tenancy, and backup policy as application-layer responsibilities.
- [ ] **741–750.** Define JSON, NDJSON, SSE, block, and MCP representations for execution states and binary-processing progress.
- [ ] **751–760.** Define event correlation identifiers across job, runner, artifact, approval, browser, and delivery boundaries.
- [ ] **761–770.** Define redaction controls for logs, metadata, URLs, headers, secrets, and binary-derived strings.
- [ ] **771–780.** Define health, heartbeat, queue depth, working-set pressure, and adapter freshness observations without false availability claims.
- [ ] **781–790.** Define audit trail integrity for plan-to-receipt transitions, evidence references, and operator-visible denial reasons.
- [ ] **791–800.** Define deterministic persistence-adapter tests using in-memory fakes and no mandatory database server.

## 9. Unified `web/` playground — actions 801–900

- [ ] **801–810.** Audit the existing root-first `web/` site, routes, assets, build script, and deployment-neutral base-path behavior.
- [ ] **811–820.** Define the playground information architecture for capability planning, binary inspection, execution policy, receipt viewing, and integration guidance.
- [ ] **821–830.** Define a browser-only demonstration model that uses local fixtures and does not execute uploaded or remote binaries.
- [ ] **831–840.** Define a playground execution-plan form with explicit policy fields, bounded input options, and denial explanations.
- [ ] **841–850.** Define a playground binary-inspection form limited to metadata and caller-selected safe sample fixtures.
- [ ] **851–860.** Define a playground storage-to-working-set visualization that explains stages and limits without claiming RAM conversion.
- [ ] **861–870.** Define a playground runner-selection view that compares declared capabilities and leaves dispatch disabled without an adapter.
- [ ] **871–880.** Define a playground browser and scrape view that displays evidence boundaries, consent needs, and caller-owned transport requirements.
- [ ] **881–890.** Define a playground integration view for library import, adapters, database option, container option, and hosted-operation prerequisites.
- [ ] **891–900.** Define responsive, accessible, deterministic UI tests and static build verification for every new playground state.

## 10. Security, quality, packaging, and 1.8.18 release — actions 901–920

- [ ] **901–910.** Perform the 1.8.18 threat-model review for untrusted bytes, remote dispatch, archive handling, secrets, browser actions, SSRF, and provider boundaries.
- [ ] **911–920.** Run final source, test, package, native, documentation, version, artifact, release-note, and registry-readiness gates before creating any 1.8.18 tag.

## 11. Unified internal API architecture — actions 921–970

- [x] **921–930.** Define internal API boundaries for gateway, planner, materializer, executor, persistence, and receipt projection within the single `web/` surface.
- [x] **931–940.** Define a hard default policy that rejects user-hardware access, local execution, remote dispatch, paid providers, and free-tier providers until the caller explicitly supplies an adapter and approval.
- [x] **941–950.** Define in-memory demonstration adapters for the six internal API boundaries that are deterministic, do not call the network, and do not execute supplied bytes.
- [x] **951–960.** Define browser-facing internal API request and response envelopes for plan creation, policy evaluation, binary metadata inspection, and receipt projection.
- [x] **961–970.** Define test cases proving that a missing adapter, unapproved provider, remote URL, local hardware target, or binary execution request yields a structured denial without side effects.

## 12. Final version alignment and commit — actions 971–980

- [x] **971–980.** Align active npm, lockfile, Maven, NuGet, RubyGems, extension, desktop, Capacitor, crawler and iOS metadata to `1.8.18`; create the candidate release note, run the release gates, inspect the npm package, configure `iakadion` authorship, commit, and push the verified source revision.

## 13. Post-push CI correction — actions 981–990

- [x] **981–990.** Inspect the failed CodeQL Rust and Pages workflow runs; identify the exact failing steps; correct only the responsible workflow or build configuration; rerun local equivalents; commit and push the correction; verify the new runs; then retry the public GitHub release.

## Evidence ledger

Every completed ten-action work package must link its evidence to the final release record: source revision or research URL, design note, code path, deterministic test name, boundary test, documentation update, validation command, result, reviewer state, and disposition. The 970 actions deliberately start with factual classification; implementation may proceed only for capabilities that are both technically feasible and expressible without false infrastructure claims.
