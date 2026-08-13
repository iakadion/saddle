<p align="center">
  <img src="docs/assets/saddlemark.svg" alt="Saddle" width="720" />
</p>

<p align="center">
  <strong>Storage-backed jobs, scraping contracts and portable runners for Node.js.</strong><br/>
  <strong>Binary computing engine, agent browser, scraper and packager.</strong><br/>
  <a href="https://github.com/wenathlan/saddle/actions/workflows/ci.yml"><img src="https://github.com/wenathlan/saddle/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/wenathlan/saddle/releases/tag/v1.8.7"><img src="https://img.shields.io/badge/release-v1.8.7-d35d3d" alt="Release 1.8.7" /></a>
  <a href="https://github.com/wenathlan/saddle/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-202a2f" alt="GPL 3.0 license" /></a>
</p>

> **Core idea:** storage is the durable side of the working set; the runner is replaceable; the artifact is the boundary. **Storage == Compute** means that the same bytes can be retained or processed according to an explicit usage flag.

Saddle is a **JavaScript ESM engine** for jobs that move data between storage, a bounded working set, a caller-injected runner and durable artifacts. It is also a virtual machine published as a package: the caller can run it on GitHub Actions, Forgejo, Gitea, GitLab, Codeberg, Docker or another third-party compute surface. The engine does not require the operator's local machine, does not embed credentials and does not choose a mandatory cloud provider.

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
node examples/publicapi.js
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

The root entry point is transport-neutral. Node filesystem, HTTP server, persistent sessions and Playwright are explicit subpaths or optional adapters. The library accepts caller-provided fetchers, browser transports, storage adapters, persistence, proxy pools, captcha evidence handlers, webhook secrets and remote credentials.

### Productization: one engine, many shells

The same contracts can be surfaced as an npm library, CLI, binary, Manifest V3 browser extension, webhook server, MCP transport, workflow action, container image, Maven package, NuGet package or RubyGem. These surfaces are adapters around the engine; they are not separate sources of truth.

## Public API

| Export | Purpose |
| --- | --- |
| `saddleurl` | choose a fetch or caller-injected browser path |
| `scrapeurl` | fetch one URL and extract bounded content |
| `scrapehtml` | extract from HTML without network access |
| `extractcontent` | structured extraction |
| `serializeresult` | serialize JSON, Markdown or XML results |
| `formatforagent` | summary, chunks and token count |
| `batchscrape` | bounded URL groups |
| `crawlurl` | crawl contract with domain and budget controls |
| `browseragent` | caller-owned navigation, click, type and screenshot actions |
| `mcpserver` / `mcptransport` | MCP tools over JSONL or HTTP |
| `nodeserver` | Web Request/Response handler |
| `engine` / `scheduler` | job lifecycle and runner dispatch |
| `release-assets` | SHA256SUMS, SBOM and provenance metadata for caller-selected artifacts |

The complete export map is documented in [`docs/libraryapi.md`](docs/libraryapi.md). The product index is in [`docs/productindex.md`](docs/productindex.md), and runnable examples are in [`docs/usage.md`](docs/usage.md).

## Browser extension

The extension is a pure JavaScript Manifest V3 reference surface in [`extension/`](extension/). It contains a popup, service worker, isolated content bridge, read-only page-world `pagefacts` boundary, snapshot diffs and persisted window/tab/frame context for explicit resume.

```bash
# load the unpacked extension from chrome://extensions
ls extension/manifest.json extension/worker.js extension/content.js extension/popup.html

# build an isolated artifact using the version supplied by the caller or release tag
npm run extension:build -- --output build/extension
```

The base permission set is `activeTab`, `scripting` and `storage`. It does not request broad host permissions, cookies, `webRequest`, debugger access or arbitrary page code execution. Optional host escalation remains caller-owned. Releases attach `saddle-extension-<version>.zip`; cross-browser profiles remain adapter work.

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

Version 1.8.7 also removes the obsolete nested `scrape` package manifests and lockfile that generated a separate stale dependency graph. The dependency-free JavaScript scrape contracts remain in `scrape/`. The root lockfile is regenerated and CI runs `npm audit --audit-level=high` plus dependency review for pull requests. See [`docs/securityaudit-1.8.7.md`](docs/securityaudit-1.8.7.md) for the baseline and remediation record.

## Package surfaces and release automation

Workflows use the release tag and the local `releaseversion` action. They do not contain a manually edited version number. The action fetches the tag, checks out its commit and rejects a release when the tag version does not match the root `package.json`.

| Registry | Artifact | Workflow |
| --- | --- | --- |
| GitHub Packages npm | `@wenathlan/saddle@<version>` | `publishgithubnpm.yml` |
| Public npmjs | `@wenathlan/saddle@<version>` | `publishnpmjs.yml` |
| GHCR | `ghcr.io/wenathlan/saddle:<version>` | `publishghcr.yml` |
| Maven | `io.wenathlan:saddle:<version>` | `publishmaven.yml` |
| NuGet | `Saddle.<version>.nupkg` | `publishnuget.yml` |
| RubyGems | `saddle <version>` | `publishrubygems.yml` |

Release assets are caller-selected and deterministic: `SHA256SUMS`, `sbom.cdx.json` in CycloneDX 1.5 shape and `provenance.intoto.jsonl` in an in-toto statement shape. The adapter does not publish, authenticate or choose a registry. The npm token previously sent in chat is compromised and must never be used; public npmjs publication uses only the owner-managed `NPM_TOKEN` repository secret.

## GitHub Pages web surface

The marketing site lives under [`web/`](web/) with a root-based TypeScript/React layout. It has no `client/` or `src/` subdirectory. Vite normalizes the base path and all visual assets resolve through a shared helper, so the same build works at `/` and `/saddle/`.

```bash
npm run web:check
VITE_BASE_PATH=/saddle npm run web:build:pages
```

Small public configuration and visual assets live under `web/public/`. The development collector is `web/public/debugcollector.js` and uses `/debuglogs`; it is not part of the production build. The obsolete `web/public/__manus__` directory is intentionally absent.

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

The engine test suite is deterministic and does not require real credentials or network access. The release path is: update `package.json` and the manifest files, update `changelog.md`, run all gates, create `v<package-version>`, push the tag and create the GitHub release. Registry workflows then derive the same version from that release tag.

## Repository map

```text
core/          errors, events, identifiers and hashing
domain/        jobs, artifacts, sessions and providers
memory/        working-set bridge, modes, objects and transforms
storage/       local, chunked, remote and file-hosting adapters
scrape/        dependency-free robots, cache, extraction, schema and normalization contracts
crawl/         URL normalization, crawler and persistent frontier
queue/         queue, idempotency, saga and recovery
browser/       fingerprint, session, agent and Playwright adapter contracts
extension/     Manifest V3 reference surface and packager
protocol/      JSON, NDJSON, SSE and block serializers
workflow/      manifests, templates and registry contracts
packager/      package and publication plans
release/       checksums, SBOM and provenance metadata
web/           root-based static marketing site
tests/         deterministic engine and extension coverage
docs/          architecture, API, security, release and registry notes
```

The engine remains pure JavaScript ESM with JSDoc comments in English. The web surface is TypeScript/React, while the published library has no TypeScript build requirement and no hardcoded host, port or credential.

## Historical documentation

Earlier README snapshots remain in `docs/plans/README.md`, `docs/talks9/README.md` and `docs/talks9/README (2).md` as archival evidence. Their useful architecture ideas were consolidated here, while stale `@devthink`, `@iakadion`, `io.devthink`, Node 20/22, `client/src` and speculative provider quotas were not copied into the canonical contract.

## Current scope

Version 1.8.7 extends the 1.8.6 engine with dependency remediation, explicit security gates, base-aware Pages assets, removal of the obsolete public debug directory and consolidated documentation. Browser binaries, provider credentials, n8n host registration, persistent databases, captcha solvers and production deployment remain caller-selected adapters. Future work should extend contracts without coupling the core to one forge, registry, browser or storage vendor.

## License

Saddle is distributed under the [GNU General Public License v3.0](LICENSE).
