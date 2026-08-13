                         SADDLE - CHANGELOG
                       Version 1.7, August 2026

 Copyright (c) August 2026 devthink, nathlan, akadion, nathu filho, alllan neris, andraneris. All Rights Reserved.
 Project: saddle

  All notable changes to Project saddle are documented in this file.

  ## [Unreleased]

    - Added durable pending extension commands with explicit rehydration and resume
    - Added optional Playwright peer metadata and a Node-only `browser-playwright` adapter
    - Added a read-only page-world bridge with token-correlated `pagefacts` responses and deterministic timeout handling
    - Added extension snapshot diffs plus persisted window, tab and frame context for explicit resume

  ## [1.8.5] - 2026-08-13

    - Added Node.js 26.7.0 and npm 12 package metadata
    - Added an optional Playwright peer and explicit Node-only browser adapter
    - Preserved the transport-neutral root without adding runtime dependencies

  ## [1.8.4] - 2026-08-12

    - Updated all active library and forge pipelines from Node 22 to Node.js 26.7.0
    - Added complete deterministic gates to GitLab, Forgejo, Gitea and Woodpecker validation workflows
    - Documented caller-owned Pages and cross-forge deployment boundaries

  ## [1.8.2] - 2026-08-12

    - Added a minimal Manifest V3 permission policy with caller-owned optional escalation
    - Added a Node-only extension builder that versions the unpacked manifest from release metadata
    - Added a release workflow that packages and attaches `saddle-extension-<version>.zip`
    - Added context-aware replay for caller-owned window, tab and frame restoration
    - Added a transport-neutral export graph audit for browser-like package loading
    - Added bounded content-type detection and normalization for structured and binary scrape results
    - Migrated active repository, Maven and GitHub Packages owner metadata to `wenathlan`
    - Prepared all release workflows to derive owner namespaces from the transferred repository

  ## [1.8.1] - 2026-08-12

    - Changed the canonical public npm package identity to `@wenathlan/saddle`
    - Preserved the v1.8.1 GitHub Packages npm artifact namespace as `@iakadion/saddle` for historical accuracy
    - Added follow-up release metadata after the immutable v1.8.0 package identity
    - Kept package version resolution derived from the release tag

  ## [1.8.0] - 2026-08-12

    - Updated GitHub Actions, Docker bases and CI toolchains to Node.js 26.7.0 and current stable action majors
    - Added a transport-neutral browser worker bridge and package export import tests
    - Added a Node 26.7.0 cross-runtime probe lane for Node, Bun and Deno
    - Kept package publication versions derived from release tags without manual version inputs

  ## [1.7.0] - 2026-08-12

    - Added app installation, suspension, revocation and scope authorization
    - Added command scope guards and idempotent bot command results
    - Added webhook delivery attempts, retryable failures and dead letters
    - Verified GitHub npm, GHCR, Maven, NuGet and RubyGems publication workflows for 1.7.0
    - Documented the public npmjs Trusted Publisher bootstrap requirement

  ## [1.6.0] - 2026-08-12

    - Added request identity, success and error API envelopes
    - Added caller-owned optional authorization verification
    - Added secure response headers and bounded redirect checks
    - Added injected DNS resolution checks for private targets
    - Added optional browser snapshot and action MCP tools

  ## [1.5.0] - 2026-08-12

    - Added semantic page extraction for headings, landmarks, controls and links
    - Added priority crawl frontiers and per-domain page budgets
    - Added retrieval provenance and provenance merging for RAG context
    - Added bounded in-memory counters and duration metrics

  ## [1.4.0] - 2026-08-11

    - Added provider health and capacity reports
    - Added cooperative heartbeat signals for long-running work
    - Added forge-neutral manual, webhook, schedule, retry and heartbeat triggers
    - Added legal remote run transitions with resumable submit, status and cancel operations

  ## [1.3.0] - 2026-08-11

    - Added bounded range reads to chunked storage
    - Added content-addressed immutable object storage and logical references
    - Added tiered hot and cold cache with stale-while-revalidate loading
    - Added manifest comparison, conflict policy and multi-backend sync
    - Added memory engine backend capabilities and sync methods

  ## [1.2.0] - 2026-08-11

    - Added vendor-neutral page snapshots with bounded elements and stable references
    - Added stale snapshot errors and snapshot diffs
    - Added tab, frame and active context registry
    - Added bounded browser action batches and structured outcomes
    - Added snapshot-aware action recording for replay provenance

  ## [1.1.0] - 2026-08-11

    - Added a Manifest V3 browser bridge under `extension/`
    - Added versioned extension messages, page snapshots and stale reference checks
    - Added service worker routing with session state persistence
    - Added a narrow popup for user initiated snapshots and page reads
    - Added deterministic extension tests without browser credentials or network access
    - Added the `@devthink/saddle/extension` package export

  ## [1.0.0] - 2026-08-11

    - Initial release of saddle
    - Initial engine contracts and package release
    - GNU General Public License v3.0

                         END OF CHANGELOG
