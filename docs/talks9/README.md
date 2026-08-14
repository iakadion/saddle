<p align="center">
  <img src="docs/assets/saddlemark.svg" alt="Saddle" width="720" />
</p>

<p align="center">
  <strong>Storage-backed jobs, scraping contracts and portable runners for Node.js.</strong><br />
  <a href="https://github.com/iakadion/saddle/actions/workflows/ci.yml"><img src="https://github.com/iakadion/saddle/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/iakadion/saddle/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-d35d3d" alt="Release 1.0.0" /></a>
  <a href="https://github.com/iakadion/saddle/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-202a2f" alt="GPL 3.0 license" /></a>
</p>

Saddle is a **JavaScript ESM engine** for jobs that move data between storage, a working set, an injected runner and durable artifacts. It includes focused contracts for scraping, crawling, browser agents, queues, persistence, MCP transport, webhooks and package delivery without taking ownership of the caller's credentials or infrastructure.

> **Core idea:** storage is the durable side of the working set; the runner is replaceable; the artifact is the boundary.

<p align="center">
  <img src="docs/assets/architecture.svg" alt="Saddle runtime architecture: storage, bridge, runner and artifact" width="100%" />
</p>

## Start here

Saddle requires **Node.js 22 or newer**.

```bash
npm install @wenathlan/saddle
```

The public API uses injected transports. A caller can use the built-in `fetch`, a custom fetcher, a browser adapter, a storage backend or a runner without changing the core contracts.

```js
import { scrapeurl, formatforagent } from "@wenathlan/saddle";

const result = await scrapeurl("https://example.com", {
  format: "markdown"
});

const context = formatforagent(result, {
  maxchunksize: 2000,
  keypoints: 4
});

console.log(context.summary);
console.log(context.chunks);
```

For a deterministic example with no network access:

```bash
node examples/publicapi.js
```

## What is included

| Area | Contract | Result |
| --- | --- | --- |
| Jobs | `engine`, `scheduler`, `inprocess` | `prepare → process → sync → cleanup` |
| Storage | local, chunked, S3-compatible, GitHub Contents, file hosting | durable objects and chunks |
| Working set | memory bridge, modes, objects, transforms | storage-to-compute and compute-to-storage |
| Scraping | robots, cache, extraction, schema, scraper | text, metadata, links and structured output |
| Crawl | normalization, BFS crawler, persistent frontier | bounded domain-aware crawling |
| Browser | fingerprint, session, replay and injected agent | browser actions without a vendor lock-in |
| Operations | queues, idempotency, saga, retry, circuit breaker | controlled execution and recovery |
| Protocols | JSON, NDJSON, SSE, blocks and MCP | transport-neutral messages |
| Delivery | manifests, workflow registry, binary/container plans | package and runner surfaces |

## Public API

The root export is intentionally broad. Subpath exports are available for consumers that want a smaller dependency surface.

| Export | Purpose |
| --- | --- |
| `saddleurl` | choose the fetch or injected browser path |
| `scrapeurl` | fetch one URL and extract content |
| `scrapehtml` | extract content from HTML without network access |
| `extractcontent` | expose structured extraction directly |
| `serializeresult` | serialize as JSON, text, Markdown, XML or Redis payload |
| `formatforagent` | produce summary, key points, chunks, links and token count |
| `batchscrape` | process bounded URL groups with progress callbacks |
| `crawlurl` | run the crawl contract through the public surface |
| `browseragent` | adapt navigation, click, type, screenshot, DOM and scroll |
| `mcpserver` / `mcptransport` | expose optional MCP tools over JSONL or HTTP |
| `nodeserver` | expose a Web Request/Response handler through Node HTTP |

The complete API is documented in [`docs/libraryapi.md`](docs/libraryapi.md).

## The execution model

Saddle coordinates contracts instead of hiding providers behind a mandatory platform. A typical job looks like this:

```js
import {
  engine,
  eventbus,
  inprocess,
  localmemory,
  localstorage,
  scheduler
} from "@wenathlan/saddle";

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

console.log(result.artifact);
```

The caller still chooses how to provide `fetcher`, browser transport, persistence, proxy pool, captcha solver, webhook secret and remote credentials. Saddle does not embed secrets, fixed hosts or a mandatory cloud vendor.

## CLI

The package includes the `saddle` executable.

```bash
saddle help
saddle modes
saddle runexample
saddle mcp
```

The CLI keeps local execution explicit. Remote execution belongs to the configured forge, storage and workflow adapters.

## Security boundaries

Saddle follows a caller-owned infrastructure model.

| Boundary | Policy |
| --- | --- |
| Credentials | injected at runtime; never committed |
| Network | `http` and `https` URLs are validated; private targets are blocked by the API/MCP security layer |
| Crawling | robots rules and crawl delay are explicit inputs to the crawl contract |
| Storage | adapters are replaceable; the core does not assume one object store |
| Runtime | Node HTTP is isolated in `server/node.js`; core contracts stay transport-oriented |
| Failure | retry policy, circuit breaker, idempotency and saga compensation remain configurable |

The engine is an orchestration layer, not a promise that every website, browser or external service can be automated. Operators remain responsible for authorization, terms of service and data handling.

## Package surfaces

The release is distributed through the following GitHub Packages registries.

| Registry | Published artifact | Workflow |
| --- | --- | --- |
| GitHub npm | `@iakadion/saddle@1.0.0` | [`publishgithubnpm.yml`](.github/workflows/publishgithubnpm.yml) |
| GHCR | `ghcr.io/iakadion/saddle:latest` | [`publishghcr.yml`](.github/workflows/publishghcr.yml) |
| Maven | `io.devthink:saddle:1.0.0` | [`publishmaven.yml`](.github/workflows/publishmaven.yml) |
| NuGet | `Saddle 1.0.0` | [`publishnuget.yml`](.github/workflows/publishnuget.yml) |
| RubyGems | `saddle 1.0.0` | [`publishrubygems.yml`](.github/workflows/publishrubygems.yml) |

The canonical JavaScript package name remains `@wenathlan/saddle` for the public npmjs workflow. GitHub Packages uses `@iakadion/saddle` because the GitHub Actions token is authorized for the repository owner namespace.

## Development

```bash
npm ci
npm test
npm run check
npm run formatcheck
npm run pack:check
```

The test suite is deterministic and does not require network access or real credentials. `npm run pack:check` runs syntax checks, the JSDoc format audit, all tests and an npm pack dry-run.

## Repository map

```text
core/          errors, events and identifiers
domain/        jobs, artifacts, sessions and providers
memory/        working-set bridge, modes, objects and transforms
storage/       local, chunked, remote and file-hosting adapters
scrape/        robots, cache, extraction, schema and scraper
crawl/         URL normalization, crawler and persistent frontier
queue/         queue, idempotency, saga and recovery
browser/       fingerprint, session and agent contracts
mcp/           optional server and JSONL/HTTP transport
protocol/      JSON, NDJSON, SSE and block serializers
workflow/      manifests, templates and registry
tests/         deterministic engine coverage
docs/          architecture, API, release and registry notes
```

The project deliberately uses a **root-based JavaScript ESM layout**. There is no `src/` directory and no TypeScript build requirement.

## Current scope

Version 1.0 establishes the engine contracts and a tested package surface. Browser implementations, provider credentials, persistent databases and production deployment remain caller-selected adapters. The next improvements should extend those contracts without coupling the core to one forge, registry, browser or storage vendor.

## License

Saddle is distributed under the [GNU General Public License v3.0](LICENSE).
