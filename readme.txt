                    SADDLE - README
                       Version 1.0, August 2026

 Copyright (C) August 2026 devthink, nathlan, iakadion, nathu filho, allan neris, andraneris
 Everyone is permitted to view this document, but changing it
 is not allowed. This document is part of Project saddle.

                            Preamble

  Project saddle unifies both README sources.

  Saddle is a JavaScript ESM engine for jobs that move data between storage,
  a working set, an injected runner and durable artifacts. It includes
  contracts for scraping, crawling, browser agents, queues, persistence,
  MCP transport, webhooks and package delivery.

  Core thesis: storage bytes and compute-memory bytes are the same bytes.
  A Node.js framework runs on other people's runners, loading storage
  buckets as virtual RAM/GPU via storage->RAM bridge.

  This README is the single source of truth combining Foundation, Engine,
  and Productization sections from both original READMEs.

                       TERMS AND CONDITIONS

  0. Overview.

  See full readme.md for complete documentation, API, execution model,
  CLI, security boundaries, package surfaces, development, and repository
  map.

  1. What is Included.

  Jobs, Storage, Working set, Scraping, Crawl, Browser, Operations,
  Protocols, Delivery, Agent Browser, Compute Backends, Storage Backends.

  2. License.

  Proprietary - View Only. See license.txt.

                     END OF TERMS AND CONDITIONS


# Saddle

<p align="center">
  <img src="docs/assets/saddlemark.svg" alt="Saddle" width="720" />
</p>

<p align="center">
  <strong>Storage-backed jobs, scraping contracts and portable runners for Node.js.</strong><br/>
  <strong>Binary computing agent, agent browser, computer-use, scraper and packager.</strong><br/>
  <a href="https://github.com/iakadion/saddle/actions/workflows/ci.yml"><img src="https://github.com/iakadion/saddle/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/iakadion/saddle/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-d35d3d" alt="Release 1.0.0" /></a>
  <a href="https://github.com/iakadion/saddle/blob/main/license.md"><img src="https://img.shields.io/badge/license-Proprietary--View--Only-202a2f" alt="Proprietary View Only" /></a>
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
| Storage | local, chunked, S3-compatible, GitHub Contents, file hosting | durable objects and chunks |
| Working set | memory bridge, modes, objects, transforms | storage-to-compute and compute-to-storage |
| Scraping | robots, cache, extraction, schema, scraper | text, metadata, links and structured output |
| Crawl | normalization, BFS crawler, persistent frontier | bounded domain-aware crawling |
| Browser | fingerprint, session, replay and injected agent | browser actions without vendor lock-in |
| Operations | queues, idempotency, saga, retry, circuit breaker | controlled execution and recovery |
| Protocols | JSON, NDJSON, SSE, blocks and MCP | transport-neutral messages |
| Delivery | manifests, workflow registry, binary/container plans | package and runner surfaces |
| Agent Browser | capture & replay, stealth, fingerprint | Brave capture, movement replay, session recording |
| Compute Backends | github-actions, huggingface, gitlab-ci, kaggle, oracle-cloud | free runners chain |
| Storage Backends | HF, Kaggle, Terabox, R2, Telegram, Discord via rclone | unlimited disk as RAM |

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

## CLI

```bash
saddle help
saddle modes
saddle runexample
saddle mcp
saddle capture --url <url>
saddle bot --platform github --token $SBOT_TOKEN
saddle memory --load repo://owner/repo/path/file.json
saddle deploy --target netlify
```

## Security boundaries

| Boundary | Policy |
| --- | --- 