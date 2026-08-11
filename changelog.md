# changelog

## 1.0.0

The first public release packages the Saddle engine as a root based JavaScript library and CLI.

### foundation

The release includes jobs, events, sessions, artifacts, chunked storage, memory bridges, internal and external memory modes, runner scheduling, local storage, S3 compatible contracts, GitHub Contents contracts, and neutral Prisma, Drizzle, MySQL2 persistence mappings.

### api

The public library exposes scrape, crawl, batch, extract, serialize, agent formatting, Browser Agent delegation, universal HTTP service routes, JSONL, SSE, block streaming, MCP JSONL/HTTP transport, URL safety checks, rate limiting, retries, circuit breaking, and error recovery metadata.

### automation

The release includes bot command contracts, forge workflow manifests, persistent queue recovery, workflow dispatch, webhook HMAC verification, idempotent delivery handling, proxy health rotation, coherent session profiles, explicit captcha review, token budgeting, Markdown chunking, RAG manifests, and `llms.txt` generation.

### distribution

The package exposes subpaths for browser, bot, captcha, modes, memory engine, and deploy planning. It includes binary build plans, target profiles, Docker and compose templates, multiforge templates, release metadata, and an npm provenance workflow.

### safety boundary

Real browser runtimes, provider credentials, captcha bypass, TLS stealth patches, database drivers, vector stores, and remote storage credentials remain caller supplied. The package does not silently bypass challenge systems or embed secrets.
