<p align="center">
  <img src="docs/assets/saddlemark.svg" alt="Saddle" width="720" />
</p>

<p align="center">
  <strong>Storage-backed jobs, scraping contracts and portable runners for Node.js.</strong><br/>
  <strong>Binary computing engine, agent browser, scraper and packager.</strong><br/>
  <a href="https://github.com/wenathlan/saddle/actions/workflows/ci.yml"><img src="https://github.com/wenathlan/saddle/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/wenathlan/saddle/releases/tag/v1.8.13"><img src="https://img.shields.io/badge/release-v1.8.13-d35d3d" alt="Release 1.8.13" /></a>
  <a href="https://github.com/wenathlan/saddle/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0--only-202a2f" alt="GPL 3.0 only license" /></a>
</p>

> **Core idea:** storage is the durable side of the working set; the runner is replaceable; the artifact is the boundary. **Storage == Compute** means that the same bytes can be retained or processed according to an explicit usage flag.

Saddle is a **TypeScript-first ESM engine** compiled to JavaScript, declarations and source maps for jobs that move data between storage, a bounded working set, a caller-injected runner and durable artifacts. It is also a virtual machine published as a package: the caller can run it on GitHub Actions, Forgejo, Gitea, GitLab, Codeberg, Docker or another third-party compute surface. The engine does not require the operator's local machine, does not embed credentials and does not choose a mandatory cloud provider.

The canonical JavaScript package is `@wenathlan/saddle`. GitHub Packages npm, Maven and GHCR use the `wenathlan` owner namespace; NuGet and RubyGems retain their ecosystem package names. Older `@devthink`, `@iakadion` and `io.devthink` references in archived documents are historical records, not current package identities.

## Start here

Saddle requires **Node.js 26.7.0 or newer**.

```bash
npm install @wenathlan/saddle
```

```js
import { scrapeurl, formatforagent } from "@wenathlan/saddle";

const result = await scrapeurl("https://example.com", { format: "markdown" });
const context = formatforagent(result, { maxchunksize: 2000, keypoints: 4 });

console.log(context.summary);
```

The deterministic examples and tests do not require network access or real credentials:

```bash
node --import tsx examples/publicapi.ts
npm test
```

## Progressive architecture

The project documentation follows a progressive arc. The foundation describes the storage and runner model; the engine describes the contracts that make the model executable; productization describes the package, extension, workflow and web surfaces.

### Foundation: storage, runners and working sets

Saddle treats a repository, bucket or object store as durable state and a third-party runner as a replaceable processor. GitHub Actions is one adapter, not the core. Forgejo, Gitea, GitLab, Codeberg, Docker and caller-owned runners can implement the same runner contracts.

The physical limit remains explicit: remote storage is not VRAM. A storage-to-RAM bridge can stage a bounded working set through a local filesystem, tmpfs, mmap, cache or caller-owned storage adapter, but it cannot remove network latency or create the bandwidth of a GPU bus. The engine exposes that distinction instead of hiding it behind marketing language.

The execution model is:

```text
repository or bucket -> runner working set -> process -> durable artifact
        persistent state       virtual processor       published boundary
```

The repository may act as a disk, a CI workflow may act as a function call, Pages may act as a static bus and a release artifact may act as the durable boundary. `workflow_dispatch`, `repository_dispatch` and HTTP adapters remain caller-configured interfaces.

### Runtime modes and physical boundaries

The historical design treats the repository and its runner as a **virtual processor**, not as a claim that remote storage is physical VRAM. The storage-to-compute bridge stages a bounded working set through memory, filesystem, tmpfs, mmap or a caller-owned adapter; network latency, bandwidth and provider quotas remain real limits. The same library contracts are available with or without their paired surface, so a caller can use fetch or browser, visible or headless, internal or external storage, physical or vectorized memory, and library or binary packaging without being locked to one mode.

| Mode | Boundary | Typical use |
| --- | --- | --- |
| Fetch | no browser | Static HTML, APIs and deterministic extraction. |
| Browser | caller-owned transport | Interactive pages, snapshots, tabs and actions. |
| Auto | adaptive selection | Fetch first, then browser when the caller permits it. |
| Headless | no visible UI | CI runners, servers and scheduled jobs. |
| CLI or binary | packaged entry point | Operator tools or third-party compute jobs. |
| Computer | storage-to-compute bridge | Bounded binary and memory processing. |

The engine keeps these boundaries explicit. It does not silently install a browser, mount a bucket as VRAM, create a database, choose a proxy, or transfer credentials to a provider.

### Engine: contracts instead of vendor lock-in

| Area | Contracts shipped | Result |
| --- | --- | --- |
| Jobs | `engine`, `scheduler`, `inprocess` | `prepare -> process -> sync -> cleanup` |
| Storage | local, chunked, content-addressed, S3-compatible, GitHub Contents and file-hosting adapters | durable objects, ranges, dedupe and sync |
| Working set | memory bridge, modes, objects and transforms | storage-to-compute and compute-to-storage flows |
| Scraping | robots, cache, extraction, semantic facts, schema and normalization | bounded text, metadata, links, controls and structured output |
| Crawl | normalization, priority frontier, BFS crawler and persistent frontier contracts | domain-aware bounded crawling |
| Browser | snapshots, tabs, frames, actions, fingerprint, session and replay contracts | caller-owned browser automation without a mandatory provider |
| Operations | queues, idempotency, saga, retry, circuit breaker, health and heartbeat | controlled execution and recovery |
| Protocols | JSON, NDJSON, SSE, blocks, API envelopes and MCP | transport-neutral messages |
| Delivery | manifests, workflow registry, extension packaging and release assets | repeatable package and runner surfaces |
| Integrations | GitHub, GitLab, Forgejo, app lifecycle, command scopes and delivery adapters | caller-owned provider connectivity |

The protocol layer accepts JSON request/response envelopes, NDJSON append-only events, SSE progress streams, structured text and raw binary chunks. Retryable operations use bounded backoff, idempotency keys and caller-owned persistence; multi-step operations expose saga compensation instead of assuming that a partial remote action can be rolled back automatically.

| Reliability concern | Contract | Default boundary |
| --- | --- | --- |
| Retry | transient HTTP and network failures only | bounded attempts with caller-selected delay |
| Idempotency | request or delivery identity | at-least-once dispatch without duplicate effects |
| Circuit breaker | `closed -> open -> half-open` | caller-owned recovery threshold and timeout |
| Concurrency | queue, frontier or pool budget | explicit limits instead of unbounded fan-out |
| Compensation | workflow or saga callback | caller-owned cleanup after cancellation |

The root entry point is transport-neutral. Node filesystem, HTTP server, persistent sessions and Playwright are explicit subpaths or optional adapters. The library accepts caller-provided fetchers, browser transports, storage adapters, persistence, proxy pools, captcha evidence handlers, webhook secrets and remote credentials.

### Productization: one engine, many shells

The same contracts can be surfaced as an npm library, application archive, computer runtime, desktop installer, Android APK/AAB, iOS IPA, CLI, binary, browser package, Manifest V3 extension, web/PWA artifact, LibreOffice OXT, VSIX, webhook server, MCP transport, workflow action, container image, Maven package, NuGet package or RubyGem. These surfaces are declarative target plans and caller-owned adapters around the engine; they are not separate sources of truth.

### Agent context and structured output

The extraction path is **structured-first**: metadata and schema facts are selected before free-form text, then serialized to bounded Markdown, JSON or XML. Heading-aware chunks preserve source URL, content hash, heading path and token estimates for downstream retrieval. `generateLlmsTxt` and `generateLlmsFullTxt` expose concise agent indexes with absolute links, while `estimateTokens`, `fitsInContext` and the browser context budget prevent a caller from silently exceeding its chosen model or transport limit. No model provider is mandatory; parsing and context policies remain injectable.

### Third-party compute identity

Saddle can be connected to GitHub, GitLab, Forgejo, Gitea, Codeberg, Docker or another caller-owned runner. The operator owns the application identity, repository permissions, webhook secret and provider token; Saddle supplies transport-neutral contracts and never assumes that a hosted service account, database or runner exists. This is the operational meaning of the original multi-forge design: the runner is replaceable and the artifact is the durable boundary.

## Public API

| Export | Purpose |
| --- | --- |
| `saddleurl` | choose a fetch or caller-injected browser path |
| `scrapeurl` | fetch one URL and extract bounded content |
| `scrapehtml` | extract from HTML without network access |
| `extractcontent` | structured extraction |
| `serializeresult` | serialize JSON, Markdown or XML results |
| `formatforagent` | summary, chunks and token count |
| `chunkMarkdown` / `formatChunksForRAG` | heading-aware bounded chunks for downstream context |
| `generateLlmsTxt` / `generateLlmsFullTxt` | agent-readable documentation indexes |
| `estimateTokens` / `fitsInContext` | model-neutral context and cost estimates |
| `withRetry` | bounded retry and abort handling |
| `createServer` | caller-owned HTTP surface |
| `batchscrape` | bounded URL groups |
| `crawlurl` | crawl contract with domain and budget controls |
| `browseragent` | caller-owned navigation, click, type and screenshot actions |
| `mcpserver` / `mcptransport` | MCP tools over JSONL or HTTP |
| `nodeserver` | Web Request/Response handler |
| `engine` / `scheduler` | job lifecycle and runner dispatch |
| `release-assets` | SHA256SUMS, SBOM and provenance metadata for caller-selected artifacts |

The complete export map is documented in [`docs/libraryapi.md`](docs/libraryapi.md). The product index is in [`docs/productindex.md`](docs/productindex.md), and runnable examples are in [`docs/usage.md`](docs/usage.md).

## Browser extension

The extension is a TypeScript-first Manifest V3 reference surface in [`extension/`](extension/). Its source is compiled into a stable JavaScript unpacked artifact and contains a popup, service worker, isolated content bridge, read-only page-world `pagefacts` boundary, snapshot diffs and persisted window/tab/frame context for explicit resume.

```bash
# build an isolated JavaScript artifact using the version supplied by the caller or release tag
npm run extension:build -- --output build/extension

# load build/extension from chrome://extensions
ls build/extension/manifest.json build/extension/worker.js build/extension/content.js build/extension/popup.html
```

The base permission set is `activeTab`, `scripting` and `storage`. It does not request broad host permissions, cookies, `webRequest`, debugger access or arbitrary page code execution. Optional host escalation remains caller-owned. Releases attach `saddle.extension.<version>.zip`; cross-browser profiles remain adapter work.

## Security boundaries

| Boundary | Policy |
| --- | --- |
| Credentials | injected by the caller or repository secret; never committed or printed |
| Network | HTTP/HTTPS targets are validated; private-target access remains caller policy |
| Crawling | robots rules, crawl delay, limits and budgets are explicit |
| Storage | adapters are replaceable; the core does not own a provider account |
| Runtime | Node-only filesystem, HTTP, Playwright and release metadata stay outside the transport-neutral root |
| Extension | page-world reads are bounded, token-correlated and read-only |
| Failure | retry, circuit breaker, idempotency and resume are configurable |
| Releases | version comes from the `vX.Y.Z` tag and must match `package.json` |

Version 1.8.13 carries the TypeScript-first source into the current release and keeps public JavaScript package paths stable. It includes release-derived package metadata, queue leases, bounded structured extraction with provenance, browser context budgets, explicit workflow cancellation with caller-owned compensation and deterministic artifact retention decisions. The dynamic debug collector is intentionally an unchecked browser boundary because it monkey-patches browser APIs; the rest of the web surface remains strictly typechecked. See [`docs/reorganization-1.8.9.md`](docs/reorganization-1.8.9.md), [`docs/toolchainresearch-1.8.9.md`](docs/toolchainresearch-1.8.9.md), [`docs/releasenotes-1.8.12.md`](docs/releasenotes-1.8.12.md) and [`docs/releasenotes-1.8.13.md`](docs/releasenotes-1.8.13.md).

## Package surfaces and release automation

Workflows use the release tag and the local `releaseversion` action. They do not contain a manually edited version number. The action fetches the tag, checks out its commit and rejects a release when the tag version does not match the root `package.json`. The `created` release event fans out to the six registry workflows, so NuGet, Maven, RubyGems, GitHub Packages npm, public npmjs and GHCR receive the same validated version from one source of truth.

| Registry | Artifact | Workflow |
| --- | --- | --- |
| GHCR | `ghcr.io/wenathlan/saddle:<version>` | `publishghcr.yml` |
| GitHub Packages npm | `@wenathlan/saddle@<version>` | `publishgithubnpm.yml` |
| Public npmjs | `@wenathlan/saddle@<version>` | `publishnpmjs.yml` |
| Maven | `io.wenathlan:saddle:<version>` | `publishmaven.yml` |
| NuGet | `Saddle.<version>.nupkg` | `publishnuget.yml` |
| RubyGems | `saddle <version>` | `publishrubygems.yml` |

Release assets are caller-selected and deterministic: `SHA256SUMS`, `sbom.cdx.json` in CycloneDX 1.5 shape and `provenance.intoto.jsonl` in an in-toto statement shape. The adapter does not publish, authenticate or choose a registry. The npm token previously sent in chat is compromised and must never be used; public npmjs publication uses only the owner-managed `NPM_TOKEN` repository secret.

## Code signing policy

Saddle is applying to the SignPath Foundation for open-source code signing. Until approval is granted, release notes identify each artifact as `unsigned`, `ci-test-key`, `caller-owned` or `notarized` according to the actual build state; no release claims platform trust that has not been verified.

The requested policy is: **Free code signing provided by SignPath.io, certificate by SignPath Foundation**. Committers and reviewers are maintainers with write access to the public repository. Approvers are repository owners or release approvers recorded in `governance.md`. Every signed release must be built from repository source, pass the security and packaging gates, and receive manual signing approval.

The core program will not transfer information to other networked systems unless specifically requested by the user or the person installing or operating it. Browser sessions, storage adapters, runners and external services remain caller-configured and subject to their own policies. See [`privacy-policy.md`](privacy-policy.md) and [`security.md`](security.md).

## GitHub Pages web surface

The marketing site lives under [`web/`](web/) with a root-based TypeScript/React layout. It has no `client/` or `src/` subdirectory. Vite normalizes the base path and all visual assets resolve through a shared helper, so the same build works at `/` and `/saddle/`.

```bash
npm run web:check
VITE_BASE_PATH=/saddle npm run web:build:pages
```

Small public configuration and visual assets live under `web/public/`. The development collector is TypeScript source at `web/lib/debugcollector.ts`, injected only in development, and uses `/debuglogs`; it is not part of the production build. The obsolete `web/public/__manus__` directory is intentionally absent.

## Development and release gates

```bash
npm ci
npm run check
npm run formatcheck
npm test
npm run pack:check
npm audit --audit-level=high
npm run web:check
VITE_BASE_PATH=/saddle npm run web:build:pages
```

The engine test suite is deterministic and does not require real credentials or network access. The release path is: update `package.json` and the manifest files, update `changelog.md` and release notes, run all gates, create `v<package-version>`, push the tag and create the GitHub release. Registry workflows then derive the same version from that release tag. A package metadata change alone does not publish anything; the release tag is the intentional publication boundary.

## Repository map

```text
core/          engine errors, scrape error taxonomy, events, identifiers and hashing
domain/        jobs, artifacts, sessions and providers
memory/        working-set bridge, modes, objects and transforms
storage/       local, chunked, remote and file-hosting adapters
scrape/        robots, cache, extraction, schema, normalization and grouped crawl contracts
queue/         queue, idempotency, saga and recovery
browser/       fingerprint, session, agent and Playwright adapter contracts
extension/     Manifest V3 reference surface and packager
desktop/       Tauri browser application for Windows, Linux and macOS
android/       Capacitor Android conversion target and optimized Gradle release
ios/           Capacitor iOS conversion target and caller-owned Xcode signing
capacitor.config.ts shared web-to-native configuration for Android and iOS
protocol/      JSON, NDJSON, SSE and block serializers
workflow/      manifests, templates and registry contracts
release/       checksums, SBOM and provenance metadata
runtime/       engine orchestration, capability detection, worker and grouped retry context
packager/      dist, binary, container and multi-target artifact plans
web/           root-based static marketing site with TypeScript React source
tests/         deterministic engine and extension coverage
docs/          architecture, API, security, release and registry notes
```

The engine is TypeScript-first ESM with English JSDoc comments and a generated JavaScript `dist/` publication surface. The web surface is TypeScript/React. Desktop is the browser application and uses Tauri; Android and iOS convert the same web output through Capacitor. No source or generated artifact hardcodes a host, port or credential.

## Historical documentation

Earlier root README snapshots and platform READMEs remain in `docs/plans/README.md`, `docs/talks9/README.md`, `docs/talks9/README (2).md`, `android/README.md`, `browser/README.md`, `desktop/README.md`, `extension/README.md` and `ios/README.md` as archival or surface-specific evidence. Their useful architecture ideas were consolidated here, while stale `@devthink`, `@iakadion`, `io.devthink`, Node 20/22, `client/src`, speculative provider quotas and unimplemented hosted services were not copied into the canonical contract.

## Current scope

Version 1.8.13 extends the TypeScript-first engine with flat project-owned desktop, Android and iOS build surfaces, explicit Capacitor staging boundaries, dotted release asset naming, helper-binary rejection, structured extraction provenance, browser context budgets, resumable workflow compensation and retention metadata. Browser binaries, provider credentials, n8n host registration, persistent databases, captcha solvers and production deployment remain caller-selected adapters. Future work should extend contracts without coupling the core to one forge, registry, browser or storage vendor.

## License

Saddle is distributed under the [GNU General Public License v3.0 only](LICENSE).
