# saddle public library api

The public API is designed around injected transports. Consumers can use the same contracts in Node, Bun, Deno, a browser worker, a desktop wrapper, or a server adapter without importing a vendor client into the core.

| export | purpose |
|---|---|
| `saddleurl` | choose fetch or an injected browser agent |
| `scrapeurl` | fetch a URL and return extracted content |
| `scrapehtml` | extract content from an HTML string |
| `extractcontent` | expose structured extraction directly |
| `serializeresult` | serialize as JSON, Markdown, text, XML, or Redis payload |
| `formatforagent` | produce summary, key points, chunks, links, and token count |
| `batchscrape` | run bounded parallel scrape jobs with progress callbacks |
| `crawlurl` | run the same crawl contract through the public surface |
| `browseragent` | adapt navigate, click, type, screenshot, DOM, scroll, and commands |
| `nodeserver` | expose a Web Request/Response handler through Node HTTP |

```js
import { scrapeurl, formatforagent } from "@devthink/saddle";

const result = await scrapeurl("https://example.com", {
  format: "markdown",
  fetcher: globalThis.fetch
});

console.log(formatforagent(result));
```

The `fetcher`, browser adapter, persistence adapter, proxy pool, captcha solver, webhook handler, and vector store remain caller-owned. This is intentional: the engine coordinates contracts but does not claim ownership of credentials, sessions, remote infrastructure, or external service terms.

## package surfaces

The package exposes explicit subpaths for `./browser`, `./bot`, `./captcha`, `./memory-engine`, and `./deploy`. The root entry remains the complete JavaScript API for consumers that prefer one import.

Version 1.1 adds `./extension`, which exposes browser-neutral message, snapshot and service-worker routing contracts. The concrete Manifest V3 files live in `extension/`; they are not imported by the core at runtime and do not require Chrome when the library is used as a Node package.
