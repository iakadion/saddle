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
