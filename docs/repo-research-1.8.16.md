# Saddle 1.8.16 comparative repository research

This document records public-source evidence for the 1.8.16 feature-selection process. It is an evidence log rather than an adoption list: Saddle does not copy source code, inherit third-party credentials, reproduce anti-bot behavior, or adopt a pattern without independent compatibility and security review.

## Sampling contract

The selected sample targets 130 public repositories across browser agents, extensions, scraping, workflows, storage, isolation, packaging, CI, application bridges, and protocol tooling. A candidate is only complete when its canonical repository, license, current evidence, relevant implementation area, compatibility boundary, and disposition are recorded. Popularity is not treated as correctness.

## Browser agent and computer-use evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `browser-use/browser-use` | [repository][1] | The MIT project exposes agent/browser separation, custom tools and an extensive test directory, but its hosted browser guidance includes stealth, proxy rotation and CAPTCHA handling. | Its extensible tool boundary supports Saddle's injected-adapter model. | Consider only declarative session/tool boundaries; reject stealth and CAPTCHA-bypass patterns. |
| `vercel-labs/agent-browser` | [repository][2] | The Apache-2.0 CLI uses accessibility snapshots with stable refs, requires a fresh snapshot after overlay interference, and documents tab/session handles. | Corroborates Saddle's snapshot-reference freshness, obstruction reporting and tab identity contracts. | Compare its explicit stale-reference and stable-handle semantics; do not embed a browser daemon. |
| `firecrawl/web-agent` | [repository][3] | The MIT project layers templates, an agent core, structured output, streaming and independently scoped subagents. | Its explicit separation of orchestrator, skills and output is relevant to provider-neutral workflow contracts. | Consider provenance-bearing structured-output and bounded subagent contracts only. |
| `browseros-ai/BrowserOS` | [repository][4] | The AGPL-3.0 project describes a local browser/agent split, session replay and MCP-facing components. | It demonstrates that replay and session observability can be product surfaces, but has a substantially different browser-fork architecture and license. | Record as architectural counterexample; do not adopt Chromium-fork, login-import or AGPL-derived code. |

## Initial cross-source observations

The first four repositories reinforce existing Saddle contracts rather than expose a safe missing primitive: fresh accessibility references, explicit session identity, structured output boundaries, replay metadata and caller-visible control planes. No candidate justifies weakening the current caller-owned authentication, browser ownership, or remote-action confirmation boundaries.

## Scraping, crawling, and extraction evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `unclecode/crawl4AI` | [repository][5] | The Apache-2.0 project documents crash recovery, state callbacks, bounded deep-crawl examples and a security-hardened Docker server, but also exposes stealth and fingerprint features. | Its explicit recovery state and capacity-aware dispatcher are relevant to persisted crawl contracts. | Consider resumable frontier checkpoints and caller-defined backpressure; reject stealth/fingerprint patterns. |
| `scrapy/scrapy` | [repository][6] | The BSD-3-Clause framework has long-lived typed test surfaces, security policy and a documented structured extraction focus. | It is evidence for keeping scrape parsing, lifecycle and test contracts independently replaceable. | Use as mature corroboration only; no Python runtime or framework adoption is implied. |
| `apify/crawlee` | [repository][7] | The Apache-2.0 TypeScript library combines HTTP/browser modes, persistent request queues, pluggable storage and configurable routing/retries, while also advertising browser-like headers and TLS fingerprints. | Its queue and storage separation corroborates Saddle's provider-neutral frontier and adapter boundaries. | Consider explicit queue/storage capability reports; reject anti-detection, header imitation and fingerprint behavior. |
| `firecrawl/firecrawl` | [repository][8] | The AGPL-3.0 project exposes explicit scrape, crawl, map and batch surfaces and states that end users must respect site policies; its documentation also describes hosted proxies and interactions. | It corroborates distinct lifecycle contracts for single scrape, map and batch crawl operations. | Record endpoint separation and robot-policy posture; do not adopt AGPL code, credential-dependent hosting, or anti-blocking infrastructure. |

## Scraping disposition

The sources support a narrow next comparison question: whether Saddle should add an explicit persisted crawl-checkpoint receipt with caller-owned resume evidence. Existing Saddle range, storage, queue and provenance contracts already cover much of the adjacent surface. No implementation is selected until at least one additional independent source or an applicable standard corroborates the public contract.

## Workflow, queue, and orchestration evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `temporalio/temporal` | [repository][9] | The MIT project distinguishes durable workflow execution from worker implementation and documents retry-oriented resilience. | It corroborates the existing Saddle separation between serializable run state and caller-owned execution adapters. | Consider event-history compatibility only; do not introduce a Temporal server dependency. |
| `platformatic/job-queue` | [repository][10] | The Apache-2.0 TypeScript queue documents explicit storage backends, visibility timeout, cancellation results, graceful stop, stalled-job recovery and leader election. | It independently corroborates Saddle's lease, idempotency, visibility and cancellation contracts. | Compare terminal-state receipts and explicit cancellation outcomes; reject autonomous reapers or background loops in the library core. |
| `rails/solid_queue` | [repository][11] | The MIT backend differentiates workers, dispatchers, schedulers and supervision while treating queue claims and concurrency as infrastructure concerns. | It reinforces the principle that scheduling and worker lifecycle should be external adapters, not silently started by a library. | Consider capability reporting for worker lifecycle; do not adopt database-specific SQL semantics. |
| `danielgerlag/workflow-core` | [repository][12] | The MIT workflow library documents pluggable persistence, long-running state, events and compensating saga steps. | It corroborates Saddle's caller-owned compensation and persistence boundaries. | Compare compensation receipt modeling only; avoid importing an external workflow DSL. |

## Workflow disposition

The initial workflow sample reinforces existing 1.8.15 behavior rather than selecting a new feature. The strongest candidate for later evidence is a **terminal-state receipt** that records whether a cancellation, compensation, or cleanup is confirmed, requested, unavailable, or remains externally unknown. It must remain serializable and must not start timers, reapers, workers, or external dispatch loops.

## Storage, virtual filesystem, and cache evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `seaweedfs/seaweedfs` | [repository][13] | The Apache-2.0 storage system distinguishes volumes, metadata, replication levels, range/ETag support and configured hot/warm tiers. | It corroborates that tiers describe storage location and latency, not virtual RAM or compute. | Consider a declarative replica locality/cost evidence field; do not implement a storage server. |
| `Barre/ZeroFS` | [repository][14] | The AGPL project combines S3-backed VFS, explicit memory/disk caches, conditional writes, epoch fencing and deterministic fault simulation. | Its refusal to degrade unsafe writes corroborates Saddle's explicit capability rejection model. | Consider conditional-write evidence and cache-tier provenance only; reject kernel, mount, daemon and AGPL-derived implementation. |
| `veged/omniFUSE` | [repository][15] | The MIT virtual filesystem declares backend-specific concurrency semantics, refuses unsafe providers without conditional writes and keeps host credentials outside an agent sandbox. | It validates caller-owned credentials and provider capability checks. | Consider conflict/outcome receipts for adapters; do not mount paths or synchronize in the shared library. |
| `dennwc/cas` | [repository][16] | The Apache-2.0 CAS emphasizes immutable hashes, large archives, remote indexing and pipeline caches. | It corroborates Saddle's hash-addressed transform and artifact cache keys. | Consider explicit cache lineage metadata; do not introduce a second CAS implementation. |

## Storage disposition

The evidence favors a small, additive **provider mutation precondition receipt**: a caller can obtain a deterministic record that a requested write, restore or repair requires conditional-write support, expected digest evidence and declared size limits. It must neither mount a filesystem nor perform storage I/O. A second independent source has corroborated the conditional-write boundary, but implementation remains deferred until the research sample is broadened and the public naming is reviewed.

## Sandbox, WASM, container, and binary isolation evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `ciresnave/wasm-sandbox` | [repository][17] | The MIT project models runtime, capability and resource-limit layers, including memory, CPU, filesystem and network boundaries. | It corroborates Saddle's planned WASM budget and injected-isolation-adapter contracts. | Consider a normalized capability/limit receipt; do not create a default executor or compile untrusted input. |
| `aayushadhikari7/aegis` | [repository][18] | The dual MIT/Apache project uses zero permissions by default, explicit filesystem/clock/logging grants, fuel, memory, timeout and module validation. | It independently corroborates deny-by-default capabilities and pre-execution validation. | Consider explicit requested-versus-granted capability comparison; keep actual execution caller-owned. |
| `anthropic-experimental/sandbox-runtime` | [repository][19] | The Apache-2.0 preview documents allow-only network egress, allow-only writes, platform-specific OS sandboxes and violation attribution. | It supports preserving denial reasons and per-invocation provenance in a future adapter contract. | Consider adapter result provenance only; do not ship OS sandbox commands, proxy setup or mutable host configuration. |
| `opensandbox-group/OpenSandbox` | [repository][20] | The Apache-2.0 platform separates lifecycle APIs, command/file operations, egress policy, credential vault and container/microVM runtimes. | It corroborates a separation between core planning and an external sandbox service. | Consider generic capability-report fields; reject platform lifecycle management and secret injection from Saddle core. |

## Isolation disposition

Multiple independent sources support a potential **isolation capability receipt** that compares a requested operation against caller-reported resource, filesystem and network permissions. The receipt must declare `eligible`, `denied`, or `adapter-required`; it must not spawn a process, create a container, configure a proxy, or authorize network access. Implementation remains pending broader sampling and a review of existing `binary/transform.ts` exports.

## Release engineering, provenance, and SBOM evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `slsa-framework/slsa-github-generator` | [repository][21] | The Apache-2.0 generator documents provenance boundaries and explicitly directs new users to GitHub artifact attestations because the project is no longer actively maintained. | It confirms that a verifier and an attestation generator are distinct concerns. | Prefer native GitHub attestation verification where available; do not add the unmaintained generator. |
| `sigstore/cosign` | [repository][22] | The Apache-2.0 project verifies signatures against expected identity and issuer and emphasizes signing OCI subjects by digest, not mutable tags. | It corroborates Saddle's immutable-digest verification and claim-check ordering. | Consider a portable expected-identity verification input; never claim signed status without verified evidence. |
| `anchore/syft` | [repository][23] | The Apache-2.0 SBOM tool covers filesystems, archives and container images with SPDX/CycloneDX outputs and signed attestations. | It demonstrates format breadth that should remain a release-tool responsibility, not engine runtime behavior. | Consider a release receipt that references an externally generated SBOM digest; do not embed a scanner. |
| `aquasecurity/trivy` | [repository][24] | The Apache-2.0 scanner distinguishes scan targets from scanners and covers vulnerabilities, secrets, SBOM and misconfiguration. | It corroborates Saddle's separation between advisory findings and blocking release policy. | Retain external security gates; avoid making library consumers depend on a scanner runtime. |

## Release disposition

The sample supports a future **release verification receipt** that binds a release tag, artifact digest, optional SBOM digest, expected workflow identity and evidence status. It must preserve the difference among absent, generated, downloaded and independently verified evidence. It cannot manufacture an attestation, signature or certificate, and no release-engineering implementation is selected until the workflow and registry sample is complete.

## Extension, PWA, and Mini App evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `nanobrowser/nanobrowser` | [repository][25] | The Apache-2.0 extension runs in the user browser and emphasizes user-supplied LLM keys, local credential retention, settings and side-panel workflows. | It corroborates Saddle's extension-as-adapter surface and caller-owned credentials. | Consider a declarative extension capability report only; reject key storage, browser control or autonomous multi-agent execution in core. |
| `GoogleChrome/chrome-extensions-samples` | [repository][26] | Official Apache-2.0 samples separate individual extension APIs and functional examples, including manifest-version migration materials. | It reinforces explicit manifest/permission documentation and adapter-specific tests. | Use as a compatibility reference; do not add permissions without an extension-specific implementation and user-facing rationale. |
| `GoogleChrome/workbox` | [repository][27] | The MIT PWA toolkit handles caching strategies, service-worker lifecycle and offline behavior. | It corroborates treating PWA as a delivery adapter, not an engine runtime service. | Retain the 1.8.15 declarative PWA plan; no service-worker registration or cache mutation from the library. |
| `Telegram-Mini-Apps/tma.js` | [repository][28] | The MIT TypeScript monorepo separates platform packages and documents client/backend development boundaries. | It corroborates keeping Mini App validation and platform SDK work outside a generic engine. | Consider a validated surface requirement descriptor only; do not embed Telegram SDK, secrets or platform validation. |

## Surface disposition

The evidence reinforces 1.8.15's declarative PWA, extension, DNS and Mini App requirements. No additional core implementation is selected: any future work must be an opt-in adapter package with a platform-specific permission review, a deterministic capability report and no implicit registration, credential flow or remote mutation.

## MCP, RAG, and tool-protocol evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `modelcontextprotocol/typescript-sdk` | [repository][29] | The official SDK separates client, server, transport and thin runtime-specific middleware and accepts portable schema implementations. | It corroborates Saddle's explicit protocol contracts and adapter-first transport design. | Consider an optional schema-compatible descriptor only; do not add an MCP server, client, OAuth flow or HTTP listener to the core. |
| `modelcontextprotocol/servers` | [repository][30] | Reference servers are explicitly educational rather than production-ready and distinguish filesystem, fetch, memory and tool examples. | It reinforces treating example integrations as non-authoritative and requiring threat-model review. | Use as an interoperability reference; do not embed reference-server behavior. |
| `infiniflow/ragflow` | [repository][31] | The Apache-2.0 system emphasizes source-aware chunking, grounded citations, heterogeneous ingestion and heavy deployment dependencies. | It corroborates Saddle's provenance-bearing structured extraction and bounded context budget. | Consider explicit source/citation receipt fields only; avoid RAG runtime, embeddings, model execution and persistent service dependencies. |
| `mondaycom/agent-tool-protocol` | [repository][32] | The MIT protocol describes provenance policies, approval pause/resume, schema discovery and isolated execution with resource limits. | It corroborates preserving tool-origin and approval state across serializable workflow records. | Consider provenance/approval receipt semantics; reject generated-code execution, dynamic API loading and secret-bearing OAuth integrations in core. |

## Protocol disposition

The sample corroborates one candidate for later implementation: an **origin-bearing tool result envelope** that separates user, caller, adapter and remote-source claims without trusting a model-generated label. It must be schema-validatable, serializable and side-effect free. Implementation remains deferred until at least two additional protocol or security sources are reviewed and existing `protocol/` exports are mapped.

## CI, runner, and forge evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `actions/runner` | [repository][33] | The MIT runner is the execution application for a GitHub Actions job in hosted or self-hosted environments, with OS-specific release distributions. | It corroborates treating a runner as execution infrastructure rather than a library-owned capability. | Keep runner discovery and dispatch as adapter data; do not control runner lifecycle from Saddle. |
| `cisco-open/forge` | [repository][34] | The Apache-2.0 platform separates tenant labels, runner images, isolation lanes, placement, credentials and lifecycle cleanup under an operator-owned control plane. | It corroborates stable, declarative runner capability reports and caller/provider ownership boundaries. | Consider label/capability evidence only; reject AWS, Kubernetes, tenant management and IaC dependencies. |
| `forgejo/forgejo` | [repository][35] | The canonical repository was selected as a forge candidate, but primary page extraction returned no readable content in this run. | It remains in the candidate universe but has no accepted finding yet. | Defer until canonical documentation or repository metadata can be captured. |
| `forgejo/runner` | [repository][36] | The runner repository was selected for workflow compatibility analysis, but primary page extraction returned no readable content in this run. | It remains a pending candidate rather than evidence. | Defer; do not infer semantics from third-party summaries. |

## CI disposition

The completed sources reinforce the existing 1.8.15 chain capability model. A future **runner attestation input** may bind a caller-reported runner label set, operating system, architecture, ephemeral status and policy identifiers to a dispatch plan. It must not imply that the runner is owned, reachable, authenticated, isolated or safe without adapter-provided evidence.

## Packaging and cross-platform distribution evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `goreleaser/goreleaser` | [repository][37] | The MIT release-engineering tool targets multiple language ecosystems and delegates complexity to local or CI release configuration. | It corroborates keeping distribution policy in versioned release configuration and workflows. | Use as a release-automation comparison only; do not add GoReleaser as a dependency. |
| `jreleaser/jreleaser` | [repository][38] | The Apache-2.0 tool supports Java and non-Java projects with publication to multiple package managers. | It corroborates a manifest-driven, multi-registry release matrix. | Keep Saddle's existing per-registry workflows; do not replace established package pipelines with a new orchestrator. |
| `tauri-apps/tauri` | [repository][39] | The dual-licensed framework maps a web frontend to platform-native bundle formats and treats its Rust host as the application boundary. | It reinforces the existing desktop packaging separation and artifact naming matrix. | Retain current desktop workflow and flat project layout; no new desktop framework work is selected. |
| `ionic-team/capacitor` | [repository][40] | The MIT framework distinguishes cross-platform web/native APIs and treats native projects as source artifacts. | It corroborates the existing Capacitor-based Android/iOS surfaces and explicit native plugin boundary. | Retain current mobile model; do not embed native APIs in the engine. |

## Packaging disposition

The sources validate the current Saddle approach rather than reveal a safe missing engine primitive: manifests and release notes must describe targets, artifacts and verification evidence; platform toolchains must build and sign outside the shared library. No 1.8.16 implementation is selected from this category.

## Additional forge and runner evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `woodpecker-ci/woodpecker` | [repository][41] | The Apache-2.0 CI engine separates server, agent, pipeline and plugin surfaces and is used by a public forge. | It corroborates that CI controller, executor and plugin lifecycle belong outside a portable library contract. | Consider provider/plugin capability vocabulary only; do not embed a CI engine. |
| `actions/actions-runner-controller` | [repository][42] | The Apache-2.0 Kubernetes controller orchestrates and scales self-hosted runner scale sets, including ephemeral container-backed runners. | It reinforces that runner scaling and lifecycle are deployment/operator responsibilities. | Consider ephemeral-runner evidence in adapter reports; do not introduce Kubernetes control-plane dependencies. |
| Forgejo Actions administrator guide | [documentation][43] | Forgejo explicitly states that it relies on separately installed/configured runners; logs and artifacts are server-retained while cache stays on the runner. | It corroborates separating provider-owned retention and cache location in artifact reports. | Consider retention/capability facts from an adapter; do not assume workflow compatibility or provision runners. |
| Forgejo Actions reference | [documentation][44] | Forgejo documents partial GitHub Actions compatibility and warns that `pull_request_target` with untrusted code can expose tokens and cache contents. | It corroborates requiring explicit trust and credential boundaries for any multi-forge workflow adapter. | Add this as a negative test criterion for future workflow-rendering work; no execution integration is selected. |

## Additional CI disposition

The independent sources strengthen a future adapter-level **runner provenance receipt**: it may report provider, workflow dialect, labels, runner scope, cache locality, artifact retention and an explicit trust boundary. It must not claim GitHub/Forgejo compatibility without a provider test, and it must reject a request that combines elevated credentials with untrusted checkout unless the caller records an explicit policy override.

## Additional storage and VFS evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `rclone/rclone` | [repository][45] | The MIT sync tool covers many remotes and virtual backends such as union, chunking, hashing, compression and encryption while maintaining explicit copy/sync/check operations. | It corroborates provider-neutral capability reports, integrity-aware plans and explicit operations. | Consider provider-feature normalization; do not embed credentials, mounts or sync execution. |
| `juicedata/juicefs` | [repository][46] | The Apache-2.0 filesystem combines object data storage and separately managed metadata, supports chunks and mounts, and requires a client plus metadata/object infrastructure. | It demonstrates why filesystem semantics require privileged infrastructure beyond an engine contract. | Keep working-set and mount intent declarative; reject POSIX mount, metadata-engine and FUSE implementation in core. |
| `ipfs/kubo` | [repository][47] | The dual-licensed node uses CIDs, verifiable transfer and optional gateway/FUSE/daemon surfaces. | It corroborates content-addressable integrity and the cost of service, peer and mount responsibilities. | Consider content-addressed receipt fields; do not add a peer node, HTTP gateway or mount. |
| `minio/minio` | [repository][48] | The AGPL-3.0 object store is source-only and explicitly warns that deployment, credentials and container operations remain operator responsibilities. | It corroborates provider responsibility boundaries and license-aware dependency rejection. | Use S3 capability concepts only; do not add MinIO code, runtime or AGPL dependency. |

## Additional storage disposition

The sources reinforce a possible 1.8.16 **provider feature matrix** that captures `rangeRead`, `conditionalWrite`, `multipart`, `integrityClaim`, `objectImmutability`, `retention`, `mountRequired`, and `credentialOwner` as adapter-reported facts. The core must reject impossible plans before I/O and must never translate remote storage into a claim of RAM, VRAM, local POSIX semantics, unbounded throughput or persistent compute.

## Additional workflow and queue evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `dbos-inc/dbos-transact-ts` | [repository][49] | The MIT durable-workflow SDK uses a Postgres persistence layer for checkpoints, queueing, limits, deduplication, scheduling and workflow management. | It corroborates separating serializable run records and idempotency keys from a provider-specific execution service. | Consider run-state and deduplication receipt fields; reject Postgres runtime, worker loop and autonomous scheduling in core. |
| `vercel/workflow` | [repository][50] | The Apache-2.0 SDK persists progress, retries steps and can suspend workflows, with managed, self-hosted and custom-world deployment options. | It reinforces the distinction between a portable workflow model and an operator-provided durable backend. | Consider an adapter capability declaration for persistence/resume; do not embed a managed backend or retries. |
| `taskforcesh/bullmq` | [repository][51] | The MIT queue exposes priorities, concurrency, pause/resume, rate limits, deduplication and sandboxed workers over external Redis/Postgres-backed services. | It corroborates that queue semantics depend on a specific executor/store and must be claimed by an adapter. | Retain Saddle's lease/idempotency contracts; do not add a queue dependency or worker. |
| `Webslash/duty` | [repository][52] | The unreleased project describes cached activities and resume-after-failure semantics but states it cannot yet be installed. | It is an emergent candidate, not production evidence. | Record as watchlist only; do not derive an implementation from an unreleased API. |

## Additional workflow disposition

The combined sources support a later **durability capability receipt** with declared `checkpointStore`, `leaseAuthority`, `deduplicationScope`, `retryAuthority`, `scheduleAuthority`, `cancellationConfirmation` and `retentionOwner` fields. It must never promise exactly-once external side effects, automatic recovery or background execution without an adapter that has positively provided those capabilities.

## Additional browser automation evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `microsoft/playwright` | [repository][53] | The Apache-2.0 framework offers isolated browser contexts, accessibility-oriented locators, stable references, traces and artifact capture. | It corroborates Saddle's bounded browser snapshot, stable-ref and trace-oriented contracts. | Consider adapter-independent trace/snapshot receipt fields; do not add a browser binary or automation runtime dependency. |
| `puppeteer/puppeteer` | [repository][54] | The Apache-2.0 library controls browsers via DevTools/BiDi and separates browser download from the lighter core library. | It reinforces explicit browser lifecycle and dependency acquisition. | Keep browser launch/configuration in adapters; do not trigger downloads or launch browsers from core. |
| `browser-use/browser-use` | [repository][55] | The MIT agent advertises profile reuse, hosted execution, proxy rotation, stealth and CAPTCHA-related capabilities alongside agent control. | It is useful negative evidence for separating consented browser context from anti-detection functionality. | Retain user-controlled context descriptors; reject stealth, proxy rotation, CAPTCHA circumvention, profile synchronization and credential reuse features. |
| `vercel-labs/agent-browser` | [repository][56] | The Apache-2.0 CLI exposes accessibility snapshots, stable tab/ref handles, tracing, output limits and explicit session commands. | It corroborates explicit handles, fresh snapshots after state changes and structured observability. | Consider an adapter-neutral stale-reference/trace receipt; do not add a CLI daemon, CDP client, cookie import or browser control surface. |

## Additional browser disposition

The evidence supports a future **browser interaction receipt** that records snapshot identity, reference scope, session isolation claim, trace artifact digest and an explicit `userContextProvided` flag. It must expire refs when a snapshot changes, avoid carrying cookie or credential contents, require user confirmation for sensitive browser actions and forbid any stealth, CAPTCHA, fingerprint or anti-bot bypass mode.

## Additional crawling and extraction evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `scrapy/scrapy` | [repository][57] | The BSD-3-Clause framework is a structured-data crawler with extensive documentation and tests. | It corroborates a clear crawler/extractor boundary rather than implicit browser behavior. | Use as an architecture reference only; do not add a Python crawler runtime. |
| `unclecode/crawl4AI` | [repository][58] | The Apache-2.0 crawler documents structured extraction, schema strategies, resume state and secure-by-default Docker changes, but also profiles, proxies, user scripts and stealth mode. | It provides both useful extraction-state patterns and explicit negative patterns for Saddle. | Consider bounded extraction/continuation receipts; reject stealth, proxying, custom page scripts, stored profiles and built-in service deployment. |
| `scrapinghub/frontera` | [repository][59] | The BSD-3-Clause project separates frontier policy from pluggable backend and transport implementations and provides breadth/depth discovery strategies. | It corroborates an explicit frontier plan whose queue and transport remain externally supplied. | Consider immutable frontier decision records; do not implement distributed crawling or message buses. |
| `crawler-commons/crawler-commons` | [repository][60] | The Apache-2.0 components focus on reusable robots and sitemap parsing, including RFC 9309-aligned robots behavior and parser hardening. | It corroborates policy parsing and strict input validation as separate from fetch execution. | Consider a validated robots/sitemap evidence envelope; no Java dependency or fetcher is selected. |

## Additional crawling disposition

The evidence supports a future **crawl policy receipt** containing a normalized origin, robots decision and source, sitemap discovery evidence, request budget, parser limits and explicit `fetchAdapterRequired` status. It must not fetch, crawl, execute scripts, store cookies, bypass access controls or claim a resource was permitted unless the caller provides the source and parser evidence.

## Additional sandbox and isolation evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `bytecodealliance/wasmtime` | [repository][61] | The Apache-2.0 runtime emphasizes WASI host integration, configurable CPU/memory consumption and an independently maintained security process. | It corroborates explicit module format, host capability and resource-budget declarations. | Consider a runtime-neutral WASM capability receipt; do not embed or invoke a runtime. |
| `google/nsjail` | [repository][62] | The Apache-2.0 tool requires Linux namespace, cgroup, rlimit, seccomp, mount and network configuration to isolate processes. | It demonstrates that credible process isolation is host-specific and privileged. | Keep `tmpfs`, mount, resource and network controls as adapter requirements; do not execute nsjail or emit commands from core. |
| `firecracker-microvm/firecracker` | [repository][63] | The Apache-2.0 microVM monitor depends on KVM and a correctly configured Linux host and provides host-controlled vCPU, memory, devices, rates and jailer settings. | It corroborates a detailed external isolation-attestation model. | Consider receipt fields for host-provided isolation; reject microVM control plane, KVM access and privileged setup. |
| `gvisor/gvisor` | [repository][64] | The candidate was selected for userspace-kernel isolation comparison, but primary page extraction did not return usable content in this run. | It remains a pending source rather than implementation evidence. | Defer until a primary source is captured; do not infer gVisor behavior from summaries. |

## Additional sandbox disposition

The source set supports a future **isolation attestation input** with `runtimeKind`, `hostAuthority`, `filesystemPolicy`, `networkPolicy`, `cpuBudget`, `memoryBudget`, `processBudget`, `timeoutBudget`, `imageOrModuleDigest` and `evidenceStatus`. A caller-provided attestation can be validated for completeness but cannot establish that a host is isolated, privileged operations are allowed or a workload was executed.

## Additional document ingestion and RAG evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `docling-project/docling` | [repository][65] | The MIT tool provides a unified document representation with format-specific conversion, local execution and optional OCR/model/service integrations. | It corroborates the need to preserve content format, transform identity and output provenance. | Consider document-transform receipt fields only; do not add OCR, model, converter or service dependencies. |
| `Unstructured-IO/unstructured` | [repository][66] | The Apache-2.0 library partitions multiple document types with optional system dependencies, container use and connectors. | It reinforces that parsing capability depends on explicit installed toolchains and source types. | Consider an adapter-reported parser capability matrix; do not run parsers or include optional toolchains in core. |
| `deepset-ai/haystack` | [repository][67] | The Apache-2.0 framework exposes retrieval, routing, memory, generation and tool lifecycle with telemetry and integrations. | It corroborates a bounded, inspectable context pipeline but also demonstrates scope that belongs outside a portable engine. | Consider a context selection/audit receipt; reject models, embeddings, telemetry and agent runtime integrations. |
| `run-llama/llama_index` | [repository][68] | The MIT framework separates core from numerous integrations and documents storage, retrieval and build-asset attestation. | It corroborates split core/adapter architecture and independent asset verification. | Consider source/integration identity fields; do not add vector index, LLM, connector or disk persistence. |

## Additional document disposition

The sources support a potential **context provenance envelope** with `sourceDigest`, `sourceLocator`, `retrievalMethod`, `transformIdentity`, `transformDigest`, `chunkIdentity`, `citationRange`, `contextBudget` and `adapterRequired`. The envelope must distinguish caller claims from independently verified data and must not assert document understanding, citation correctness, embedding quality or durable storage without an external adapter.

## Additional supply-chain and policy evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `in-toto/in-toto` | [repository][69] | The framework models owner-signed layouts, authorized functionaries, signed link metadata, material/product rules and independent verification. | It corroborates binding a release claim to explicit expected inputs, steps and evidence rather than a mutable label. | Consider a lightweight expected-evidence schema; do not add signing, command execution or key management. |
| `ossf/scorecard` | [repository][70] | The Apache-2.0 tool presents structured heuristic checks and explicitly warns that aggregate scores are not definitive and can have false positives/negatives. | It corroborates reporting individual evidence and decisions instead of inventing a single security verdict. | Consider granular policy findings; do not embed a scanner or create a score claim. |
| `DependencyTrack/dependency-track` | [repository][71] | The Apache-2.0 platform consumes SBOMs to analyze component and supply-chain risk and operates as a separate service. | It reinforces SBOM as external evidence with a digest and lifecycle distinct from runtime code. | Consider optional SBOM-reference fields; do not add component analysis, database or service dependencies. |
| `open-policy-agent/opa` | [repository][72] | The Apache-2.0 policy engine separates declarative decision evaluation from enforcement by an integrating service. | It corroborates Saddle's plan/decision versus caller-enforced action boundary. | Consider plain-data decision records; do not embed Rego, a policy server or enforcement runtime. |

## Additional security disposition

The combined evidence supports a future **evidence policy result** with `subjectDigest`, `expectedIdentity`, `expectedWorkflow`, `evidenceKind`, `evidenceStatus`, `policyDecision`, `reasons` and `verificationTime`. It must distinguish `absent`, `declared`, `downloaded`, `checked` and `verified` evidence and cannot label an artifact as signed, secure, compliant or trusted without a verifier result supplied by the caller.

## Additional release-engineering evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `semantic-release/semantic-release` | [repository][73] | The MIT tool makes a release pipeline explicit: verify conditions, identify prior tag, analyze changes, generate notes, prepare, publish and notify. | It corroborates ordered release gates and the distinction between preparation and publication. | Consider a data-only release readiness result; do not install plugins, analyze commits automatically or publish. |
| `googleapis/release-please` | [repository][74] | The Apache-2.0 tool prepares release PRs, updates manifests and changelogs, tags and creates releases, while explicitly not handling package publication. | It corroborates separating release preparation from registry publication. | Retain Saddle's tag-derived workflows; consider a manifest-version consistency receipt only. |
| `changesets/changesets` | [repository][75] | The MIT tool collects contributor-declared changes to manage versions, changelogs and publishing, notably for interdependent packages. | It demonstrates traceable change intent as distinct from generated build output. | Consider a change-impact record; do not adopt a monorepo versioning system. |
| `goreleaser/goreleaser` | [repository][76] | The MIT release tool focuses on multi-platform release engineering and CI-oriented distribution. | It corroborates that packaging matrices belong in release pipelines rather than a shared runtime. | Retain target-plan contracts; do not add an external packaging engine or sign/publish abstraction. |

## Additional release disposition

The sources support a future **release readiness receipt** with `sourceTag`, `manifestVersions`, `requiredGates`, `artifactPlanDigest`, `publicationTargets`, `credentialOwner`, `signingStatus` and `verificationRequirements`. It must remain descriptive: it cannot create tags, alter version files, trigger CI, publish, sign or assert artifact availability.

## Additional runner and CI evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `actions/runner-images` | [repository][77] | The MIT repository documents runner image labels, exact OS/architecture choices, image lifecycle and deprecation policy. | It corroborates selecting immutable or explicit runner capability facts instead of relying on a `latest` label. | Consider runner-image identity and lifecycle fields in capability reports; do not assume image contents or provision VMs. |
| `forgejo/forgejo` | [repository][78] | The Forgejo candidate was selected to evaluate Actions-compatible workflow hosting, but primary page extraction did not return usable content in this run. | It remains pending evidence. | Do not claim compatibility or derive implementation until a primary source is captured. |
| `woodpecker-ci/woodpecker` | [repository][79] | The Apache-2.0 CI engine separates server, agents, plugins and persistence and is used by Codeberg. | It corroborates an externally operated CI/agent boundary. | Consider an operator/agent capability declaration; do not add a CI database, agent, plugin or execution server. |
| `nektos/act` | [repository][80] | The MIT local runner reads workflow files, resolves dependencies and uses Docker to pull/build images and execute containers. | It demonstrates that local workflow compatibility carries Docker and filesystem side effects. | Retain offline target-plan validation only; do not run workflows, images or Docker from the core. |

## Additional runner disposition

The sources support a future **runner environment receipt** with `forgeKind`, `workflowDialect`, `runnerImage`, `os`, `architecture`, `toolchainEvidence`, `executionBoundary`, `ephemeralClaim`, `networkAuthority` and `credentialOwner`. A receipt may identify declared compatibility, but must not claim an action will run, an image is available or a runner is isolated without operator-provided evidence.

## Additional extension, PWA and Mini App evidence

| Candidate | Primary source | Evidence observed | Relevance to Saddle | Disposition |
|---|---|---|---|---|
| `wxt-dev/wxt` | [repository][81] | The MIT framework supports extension manifest variants, browser targets, TypeScript entrypoints and packaging features. | It corroborates treating extension target and manifest version as explicit build inputs. | Consider extension-target requirement validation; do not add an extension build framework. |
| `PlasmoHQ/plasmo` | [repository][82] | The MIT framework exposes content scripts, background workers, storage, messaging, environment files and remote-code options. | It demonstrates platform powers that must remain outside Saddle's shared core. | Keep capability declarations; reject remote code, storage/messaging runtime, environment handling and automated deployment. |
| `vite-pwa/vite-plugin-pwa` | [repository][83] | The MIT plugin generates service workers, manifest data, offline caching and update behavior. | It corroborates modeling cache strategy and lifecycle as explicit requirements. | Retain declarative PWA planning; never register a service worker or mutate a cache from core. |
| `Telegram-Mini-Apps/tma.js` | [repository][84] | The MIT monorepo provides client/backend packages and documentation for Telegram Mini Apps. | It corroborates keeping platform lifecycle and request validation in platform-specific adapters. | Retain Mini App requirement contract; do not connect to Telegram, validate init data or handle credentials in core. |

## Additional surface disposition

The evidence supports a future **surface capability receipt** with `surfaceKind`, `manifestVersion`, `declaredPermissions`, `backgroundLifecycle`, `cacheStrategy`, `platformValidationRequired`, `credentialOwner` and `deploymentOwner`. It may validate contradictory requirements, but cannot register workers, request browser permissions, contact a Mini App platform or publish an extension.

## References

[1]: https://github.com/browser-use/browser-use "browser-use/browser-use"
[2]: https://github.com/vercel-labs/agent-browser "vercel-labs/agent-browser"
[3]: https://github.com/firecrawl/web-agent "firecrawl/web-agent"
[4]: https://github.com/browseros-ai/BrowserOS "browseros-ai/BrowserOS"
[5]: https://github.com/unclecode/crawl4AI "unclecode/crawl4AI"
[6]: https://github.com/scrapy/scrapy "scrapy/scrapy"
[7]: https://github.com/apify/crawlee "apify/crawlee"
[8]: https://github.com/firecrawl/firecrawl "firecrawl/firecrawl"
[9]: https://github.com/temporalio/temporal "temporalio/temporal"
[10]: https://github.com/platformatic/job-queue "platformatic/job-queue"
[11]: https://github.com/rails/solid_queue "rails/solid_queue"
[12]: https://github.com/danielgerlag/workflow-core "danielgerlag/workflow-core"
[13]: https://github.com/seaweedfs/seaweedfs "seaweedfs/seaweedfs"
[14]: https://github.com/Barre/zerofs "Barre/ZeroFS"
[15]: https://github.com/veged/omniFUSE "veged/omniFUSE"
[16]: https://github.com/dennwc/cas "dennwc/cas"
[17]: https://github.com/ciresnave/wasm-sandbox "ciresnave/wasm-sandbox"
[18]: https://github.com/aayushadhikari7/aegis "aayushadhikari7/aegis"
[19]: https://github.com/anthropic-experimental/sandbox-runtime "anthropic-experimental/sandbox-runtime"
[20]: https://github.com/opensandbox-group/OpenSandbox "opensandbox-group/OpenSandbox"
[21]: https://github.com/slsa-framework/slsa-github-generator "slsa-framework/slsa-github-generator"
[22]: https://github.com/sigstore/cosign "sigstore/cosign"
[23]: https://github.com/anchore/syft "anchore/syft"
[24]: https://github.com/aquasecurity/trivy "aquasecurity/trivy"
[25]: https://github.com/nanobrowser/nanobrowser "nanobrowser/nanobrowser"
[26]: https://github.com/GoogleChrome/chrome-extensions-samples "GoogleChrome/chrome-extensions-samples"
[27]: https://github.com/GoogleChrome/workbox "GoogleChrome/workbox"
[28]: https://github.com/Telegram-Mini-Apps/tma.js "Telegram-Mini-Apps/tma.js"
[29]: https://github.com/modelcontextprotocol/typescript-sdk "modelcontextprotocol/typescript-sdk"
[30]: https://github.com/modelcontextprotocol/servers "modelcontextprotocol/servers"
[31]: https://github.com/infiniflow/ragflow "infiniflow/ragflow"
[32]: https://github.com/mondaycom/agent-tool-protocol "mondaycom/agent-tool-protocol"
[33]: https://github.com/actions/runner "actions/runner"
[34]: https://github.com/cisco-open/forge "cisco-open/forge"
[35]: https://github.com/forgejo/forgejo "forgejo/forgejo"
[36]: https://github.com/forgejo/runner "forgejo/runner"
[37]: https://github.com/goreleaser/goreleaser "goreleaser/goreleaser"
[38]: https://github.com/jreleaser/jreleaser "jreleaser/jreleaser"
[39]: https://github.com/tauri-apps/tauri "tauri-apps/tauri"
[40]: https://github.com/ionic-team/capacitor "ionic-team/capacitor"
[41]: https://github.com/woodpecker-ci/woodpecker "woodpecker-ci/woodpecker"
[42]: https://github.com/actions/actions-runner-controller "actions/actions-runner-controller"
[43]: https://forgejo.org/docs/v15.0/admin/actions/ "Forgejo Actions administrator guide"
[44]: https://forgejo.org/docs/v15.0/user/actions/reference/ "Forgejo Actions reference"
[45]: https://github.com/rclone/rclone "rclone/rclone"
[46]: https://github.com/juicedata/juicefs "juicedata/juicefs"
[47]: https://github.com/ipfs/kubo "ipfs/kubo"
[48]: https://github.com/minio/minio "minio/minio"
[49]: https://github.com/dbos-inc/dbos-transact-ts "dbos-inc/dbos-transact-ts"
[50]: https://github.com/vercel/workflow "vercel/workflow"
[51]: https://github.com/taskforcesh/bullmq "taskforcesh/bullmq"
[52]: https://github.com/Webslash/duty "Webslash/duty"
[53]: https://github.com/microsoft/playwright "microsoft/playwright"
[54]: https://github.com/puppeteer/puppeteer "puppeteer/puppeteer"
[55]: https://github.com/browser-use/browser-use "browser-use/browser-use"
[56]: https://github.com/vercel-labs/agent-browser "vercel-labs/agent-browser"
[57]: https://github.com/scrapy/scrapy "scrapy/scrapy"
[58]: https://github.com/unclecode/crawl4AI "unclecode/crawl4AI"
[59]: https://github.com/scrapinghub/frontera "scrapinghub/frontera"
[60]: https://github.com/crawler-commons/crawler-commons "crawler-commons/crawler-commons"
[61]: https://github.com/bytecodealliance/wasmtime "bytecodealliance/wasmtime"
[62]: https://github.com/google/nsjail "google/nsjail"
[63]: https://github.com/firecracker-microvm/firecracker "firecracker-microvm/firecracker"
[64]: https://github.com/gvisor/gvisor "gvisor/gvisor"
[65]: https://github.com/docling-project/docling "docling-project/docling"
[66]: https://github.com/Unstructured-IO/unstructured "Unstructured-IO/unstructured"
[67]: https://github.com/deepset-ai/haystack "deepset-ai/haystack"
[68]: https://github.com/run-llama/llama_index "run-llama/llama_index"
[69]: https://github.com/in-toto/in-toto "in-toto/in-toto"
[70]: https://github.com/ossf/scorecard "ossf/scorecard"
[71]: https://github.com/DependencyTrack/dependency-track "DependencyTrack/dependency-track"
[72]: https://github.com/open-policy-agent/opa "open-policy-agent/opa"
[73]: https://github.com/semantic-release/semantic-release "semantic-release/semantic-release"
[74]: https://github.com/googleapis/release-please "googleapis/release-please"
[75]: https://github.com/changesets/changesets "changesets/changesets"
[76]: https://github.com/goreleaser/goreleaser "goreleaser/goreleaser"
[77]: https://github.com/actions/runner-images "actions/runner-images"
[78]: https://github.com/forgejo/forgejo "forgejo/forgejo"
[79]: https://github.com/woodpecker-ci/woodpecker "woodpecker-ci/woodpecker"
[80]: https://github.com/nektos/act "nektos/act"
[81]: https://github.com/wxt-dev/wxt "wxt-dev/wxt"
[82]: https://github.com/PlasmoHQ/plasmo "PlasmoHQ/plasmo"
[83]: https://github.com/vite-pwa/vite-plugin-pwa "vite-pwa/vite-plugin-pwa"
[84]: https://github.com/Telegram-Mini-Apps/telegram-apps "Telegram-Mini-Apps/tma.js"
