# Saddle 1.7.0

Saddle 1.7.0 extends the engine from browser and storage primitives into a complete integration boundary for agent systems.

## Highlights

- Adds app installation, suspension, revocation and scope authorization through `appregistry`.
- Adds caller-defined bot command policies through `commandguard`.
- Makes bot command results idempotent when a caller supplies an idempotency key.
- Adds webhook delivery attempts, retryable errors and dead-letter records through `deliveryqueue`.
- Keeps credentials, OAuth tokens, provider clients and infrastructure ownership outside the library core.
- Preserves the root-based JavaScript ESM architecture and vendor-neutral adapter boundaries.

## Included since 1.0.0

The 1.7.0 release includes browser snapshots and stale-reference checks, tab/frame context, action results and recording, content-addressed storage, range reads, tiered cache, manifest synchronization, runner health, heartbeat, triggers, resumable execution, semantic extraction, crawl budgets, retrieval provenance, low-cardinality metrics, API envelopes, caller-owned authorization, SSRF redirect/DNS checks, optional browser MCP tools, app lifecycle and delivery recovery.

## Validation

The release was prepared with the deterministic Node test runner, format checks, package dry-run, public export checks and `git diff --check`. The release candidate contains 76 passing tests and produces `devthink-saddle-1.7.0.tgz` without publishing credentials in source files.

## Registry targets

The release workflows target GitHub Packages npm, npmjs through OIDC Trusted Publishing, GHCR, Maven, NuGet and RubyGems. Each package is verified from its workflow result before being reported as published. npmjs publication remains conditional on the one-time Trusted Publisher configuration for `@devthink/saddle`.
