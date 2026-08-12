# saddle public library api

The public API is designed around injected transports. Consumers can use the same contracts in Node, Bun, Deno, a browser worker, a desktop wrapper, or a server adapter without importing a vendor client into the core.

| export | purpose |
|---|---|
| `saddleurl` | choose fetch or an injected browser agent |
| `scrapeurl` | fetch a URL and return extracted content |
| `detectcontenttype` / `normalizeresult` / `normalizeresponse` | classify and bound JSON, XML, Markdown, text, HTML and binary response content |
| `scrapehtml` | extract content from an HTML string |
| `extractcontent` | expose structured extraction directly |
| `serializeresult` | serialize as JSON, Markdown, text, XML, or Redis payload |
| `formatforagent` | produce summary, key points, chunks, links, and token count |
| `batchscrape` | run bounded parallel scrape jobs with progress callbacks |
| `crawlurl` | run the same crawl contract through the public surface |
| `browseragent` | adapt navigate, click, type, screenshot, DOM, scroll, and commands |
| `pagesnapshot` / `snapshotref` | create bounded page state and stable element references |
| `assertfreshsnapshot` / `snapshotdiff` | reject stale actions and compare page state |
| `browsercontext` | track tabs, frames and active browser context without a vendor client |
| `actionbatch` / `actionresult` | execute bounded adapter actions with structured outcomes |
| `actionrecorder` | record snapshot boundaries and action provenance for replay |
| `contentstorage` | deduplicate immutable bytes behind logical references |
| `tieredcache` | serve bounded hot values with persistent cold storage and stale revalidation |
| `syncobject` / `syncbackends` | compare manifests and copy or resolve updates across adapters |
| `memoryengine.sync` / `memoryengine.capabilities` | synchronize working set objects and inspect backend capabilities |
| `runnerhealth` / `runnerhealthall` | report provider readiness, capacity and failures |
| `heartbeat` | emit cooperative liveness signals for long-running work |
| `workflowtriggers` / `triggermatch` | normalize and match manual, event, schedule and retry starts |
| `resumablerun` / `transitionrun` | recover remote run state through legal transitions |
| `extractsemantic` | expose bounded headings, landmarks, controls and links |
| `crawlfrontier` | prioritize URLs and enforce page and domain budgets |
| `provenance` / `mergeprovenance` | link context chunks to source and retrieval evidence |
| `metricstore` | collect bounded counters and duration summaries |
| `authorize` | verify caller credentials through an injected verifier |
| `requestcontext` / `successpayload` / `errorpayload` | create versioned API identity and response contracts |
| `assertresolvedpublicurl` / `assertredirectchain` | validate resolved destinations and bounded redirects |
| `browsertools` | expose injected snapshot and action methods as optional MCP tools |
| `appregistry` | track app installation, scopes and revocation state |
| `commandguard` | enforce caller-defined bot command scopes |
| `deliveryqueue` | retry webhook deliveries and retain dead letters |
| `nodeserver` | expose a Web Request/Response handler through Node HTTP |

```js
import { scrapeurl, formatforagent } from "@wenathlan/saddle";

const result = await scrapeurl("https://example.com", {
  format: "markdown",
  fetcher: globalThis.fetch
});

console.log(formatforagent(result));
```

The `fetcher`, browser adapter, persistence adapter, proxy pool, captcha solver, webhook handler, and vector store remain caller-owned. This is intentional: the engine coordinates contracts but does not claim ownership of credentials, sessions, remote infrastructure, or external service terms.

## package surfaces

The package exposes explicit subpaths for `./browser`, `./bot`, `./captcha`, `./memory-engine`, and `./deploy`. Desktop, mobile, and n8n contracts are exported from the root entry; the root entry remains the complete JavaScript API for consumers that prefer one import.

Version 1.1 adds `./extension`, which exposes browser-neutral message, snapshot and service-worker routing contracts. The concrete Manifest V3 files live in `extension/`; they are not imported by the core at runtime and do not require Chrome when the library is used as a Node package. The browser surface also exposes snapshots, tab/frame context, action results, bounded action batches and recording through `./browser`.

The current main branch adds `desktopmanifest`, `mobilemanifest`, `desktopadapter`, `mobileadapter`, `n8nnode`, `n8nmatch`, `n8nexecute`, `controlsurface`, `controlservice`, and `workerbridge`. These factories describe surface boundaries and invoke caller-owned handlers; they do not install a native toolkit, start an n8n server, create a dashboard, or store credentials. They will be included in the next versioned release after the compatibility gates are complete.

The root entry is cross-runtime safe for the tested core contract. Filesystem, Node HTTP, persistent queue, file sessions, local memory and captcha evidence adapters remain available through explicit Node-only files or subpaths. `runtimecontract` reports the capabilities of the current global scope, while `memorystorage` provides a process-local backend for browser workers, Deno, Bun and deterministic tests.
