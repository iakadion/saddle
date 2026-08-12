# Saddle

<p align="center">
  <img src="docs/assets/saddlemark.svg" alt="Saddle" width="720" />
</p>

<p align="center">
  <strong>Storage-backed jobs, scraping contracts and portable runners for Node.js.</strong><br/>
  <strong>Binary computing agent, agent browser, computer-use, scraper and packager.</strong><br/>
  <a href="https://github.com/iakadion/saddle/actions/workflows/ci.yml"><img src="https://github.com/iakadion/saddle/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/iakadion/saddle/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-d35d3d" alt="Release 1.0.0" /></a>
  <a href="https://github.com/iakadion/saddle/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-202a2f" alt="GPL 3.0 license" /></a>
</p>

> **Core idea:** storage is the durable side of the working set; the runner is replaceable; the artifact is the boundary. **Storage == Compute** — RAM and disk are the same construct, differing only by usage flag.

Saddle is a **JavaScript ESM engine** for jobs that move data between storage, a working set, an injected runner and durable artifacts. It is also a **virtual machine you publish as a package** that runs on other people's computers (GitHub Actions, Forgejo, Gitea, GitLab, Codeberg, free Docker containers) and turns unlimited third-party storage buckets into virtual RAM/GPU/CPU. Nothing runs on the operator's local machine.

Ships as a library, CLI, binary, n8n node, CRX extension, Android/iOS and Tauri desktop app. Package `@devthink/saddle` — published to npm, GitHub Packages, Maven, NuGet, RubyGems and GHCR (auto-mirrored to jsDelivr).

## Start here

Saddle requires **Node.js 22 or newer**.

```bash
npm install @devthink/saddle
```

```js
import { scrapeurl, formatforagent } from "@devthink/saddle";

const result = await scrapeurl("https://example.com", { format: "markdown" });
const context = formatforagent(result, { maxchunksize: 2000, keypoints: 4 });

console.log(context.summary);
```

Deterministic example with no network:

```bash
node examples/publicapi.js
```

## What is included

| Area | Contract | Result |
| --- | --- | --- |
| Jobs | `engine`, `scheduler`, `inprocess` | `prepare → process → sync → cleanup` |
| Storage | local, chunked, content-addressed, S3-compatible, GitHub Contents, file hosting | durable objects, ranges, dedupe and sync |
| Working set | memory bridge, modes, objects, transforms | storage-to-compute and compute-to-storage |
| Scraping | robots, cache, extraction, semantic facts, schema, scraper | text, metadata, links, controls and structured output |
| Crawl | normalization, priority frontier, BFS crawler, per-domain budgets and persistent frontier | bounded domain-aware crawling |
| Browser | snapshots, tabs, frames, actions, fingerprint, session, replay and injected agent | browser actions without vendor lock-in |
| Operations | queues, idempotency, saga, retry, circuit breaker, health and heartbeat | controlled execution and recovery |
| Protocols | JSON, NDJSON, SSE, blocks, API envelopes and MCP | transport-neutral messages |
| Delivery | manifests, workflow registry, binary/container plans | package and runner surfaces |
| Integrations | GitHub, GitLab, Forgejo, app lifecycle, command scopes and delivery adapters | caller-owned provider connectivity |
| Agent Browser | capture & replay, stealth, fingerprint | Brave capture, movement replay, session recording |
| Compute Backends | github-actions, huggingface, gitlab-ci, kaggle, oracle-cloud | free runners chain |
| Storage Backends | HF, Kaggle, Terabox, R2, Telegram, Discord via rclone | unlimited disk as RAM |
| Extension | Manifest V3 bridge, snapshot protocol, popup and service worker | user initiated browser control |

## Public API

| Export | Purpose |
| --- | --- |
| `saddleurl` | choose fetch or injected browser path |
| `scrapeurl` | fetch one URL and extract |
| `scrapehtml` | extract from HTML without network |
| `extractcontent` | structured extraction |
| `serializeresult` | serialize as JSON, Markdown, XML |
| `formatforagent` | summary, chunks, token count |
| `batchscrape` | bounded URL groups |
| `crawlurl` | crawl contract |
| `browseragent` | navigation, click, type, screenshot |
| `mcpserver` / `mcptransport` | MCP tools over JSONL/HTTP |
| `nodeserver` | Web Request/Response handler |

Complete API: `docs/libraryapi.md`

## The execution model

Saddle coordinates contracts instead of hiding providers. A repo + CI runner is a virtual processor:

- Repo = Disk (persistent state)
- CI = CPU (workflow_dispatch = function call)
- Pages = Bus + CDN
- Static site = BIOS
- repository_dispatch = IPC

```js
import { engine, eventbus, inprocess, localmemory, localstorage, scheduler } from "@devthink/saddle";
const events = eventbus();
const run = engine({
  storage: localstorage("./.saddle-data"),
  memory: localmemory(),
  scheduler: scheduler([inprocess()]),
  events
});
const result = await run.run(
  { name: "example", input: { value: 42 } },
  ({ job }) => ({ jobid: job.id, ok: true })
);
```

The caller still chooses how to provide `fetcher`, browser transport, persistence, proxy pool, captcha solver, webhook secret and remote credentials. Saddle does not embed secrets, fixed hosts or a mandatory cloud vendor.

## Browser extension

Version 1.1 includes a pure JavaScript Manifest V3 reference surface in [`extension/`](extension/). It is deliberately narrow: the user invokes the action, the popup sends a versioned command, the service worker routes it, and an isolated content bridge returns bounded page metadata, visible text or a user initiated action result.

```bash
# load the unpacked extension from chrome://extensions
ls extension/manifest.json extension/worker.js extension/content.js extension/popup.html
```

The extension requests `activeTab`, `scripting` and `storage`; it does not request broad host permissions, cookies, `webRequest`, debugger access or arbitrary page code execution. Its public contracts are available from `@devthink/saddle/extension`. See [`extension/README.md`](extension/README.md) for the unpacked development flow.

## CLI

```bash
saddle help
saddle modes
saddle runexample
saddle mcp
```

## Security boundaries

| Boundary | Policy |
| --- | --- |
| Credentials | injected at runtime; never committed |
| Network | http/https validated; private targets blocked |
| Crawling | robots rules and crawl delay explicit |
| Storage | adapters replaceable |
| Runtime | Node HTTP isolated |
| Failure | retry, circuit breaker, idempotency configurable |

## Package surfaces

| Registry | Artifact | Workflow |
| --- | --- | --- |
| GitHub npm | `@iakadion/saddle@1.1.0` | publishgithubnpm.yml |
| GHCR | `ghcr.io/iakadion/saddle:latest` | publishghcr.yml |
| Maven | `io.devthink:saddle:1.0.0` | publishmaven.yml |
| NuGet | `Saddle 1.0.0` | publishnuget.yml |
| RubyGems | `saddle 1.0.0` | publishrubygems.yml |
| npmjs | `@devthink/saddle` | canonical |

## Development

```bash
npm ci
npm test
npm run check
npm run formatcheck
npm run pack:check
```

Test suite deterministic, no network or real credentials required.

## Repository map

```
core/          errors, events and identifiers
domain/        jobs, artifacts, sessions and providers
memory/        working-set bridge, modes, objects and transforms
storage/       local, chunked, remote and file-hosting adapters
scrape/        robots, cache, extraction, schema and scraper
crawl/         URL normalization, crawler and persistent frontier
queue/         queue, idempotency, saga and recovery
browser/       fingerprint, session and agent contracts
browser/       snapshots, tabs, frames, actions and recorder contracts
mcp/           optional server and JSONL/HTTP transport
protocol/      JSON, NDJSON, SSE and block serializers
workflow/      manifests, templates and registry
tests/         deterministic engine coverage
docs/          architecture, API, release and registry notes
```

Root-based JavaScript ESM layout, no src/ directory, no TypeScript build required.

## Current scope

Version 1.7 establishes the engine contracts, browser snapshot foundation, storage sync primitives, runner recovery contracts, scraping context provenance, API/MCP security contracts, bot integration lifecycle and the first tested extension bridge. Browser implementations, provider credentials, persistent databases and production deployment remain caller-selected adapters. The next improvements should extend those contracts without coupling the core to one forge, registry, browser or storage vendor.

## License

Saddle is distributed under the [GNU General Public License v3.0](LICENSE).
