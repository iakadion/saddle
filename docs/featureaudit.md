# saddle feature audit

This audit compares the current repository with the project README and the additional conclusions file. The repository is a library engine. It does not claim that a contract stub is the same as a production integration.

## foundation and engine

| feature | status | evidence or gap |
|---|---|---|
| root based JavaScript library | complete | no `src`; ESM package; grouped domains; lowercase paths |
| memory bridge | complete | load, persist, release, safe load, targets, transforms |
| memory modes | complete | internal, external, physical, vectorized, library contracts |
| job engine | complete | prepare, process, sync, cleanup, runner selection, events |
| chunked artifacts | complete | local and chunked adapters; checksums; manifest contracts |
| sessions | partial | JSONL save, load, validation, replay; no real browser capture runtime |
| crawler | partial | bounded BFS, same domain, robots, normalization, cache; no sitemap or adaptive renderer |
| universal API | partial | web request handler and public library helpers; no production task service with durable polling API |
| MCP | partial | optional tools contract; no external MCP SDK or packaged remote server mode |
| queue | partial | in memory and file persistence; no SQLite queue with crash recovery semantics |
| errors and retry | complete | taxonomy, recovery hints, retry policy, circuit breaker |

## browser, captcha, and proxy

| feature | status | decision |
|---|---|---|
| browser agent | partial | injected adapter only; Playwright, Brave, CDP, screenshots, and real input are not bundled |
| session fingerprint | partial | coherent profile and proxy binding exist; no TLS or HTTP2 patch layer |
| stealth patches | deferred | browser and network evasion is not silently embedded in a general library |
| proxy pool | complete | least used selection, health failures, graveyard, revive |
| captcha detection | complete | explicit contract, review pause, solver injection, evidence hash |
| captcha bypass | not implemented by design | no automatic challenge bypass or token abuse is shipped |

## storage, database, and compute

| feature | status | gap |
|---|---|---|
| GitHub Contents | partial | adapter is injectable; no live GitHub App authentication or release asset flow |
| S3 compatible and WebDAV | partial | generic file hosting adapter exists; no provider specific signing or multipart upload |
| GitLab, Forgejo, Gitea, HF, Kaggle, ModelScope, Terabox, Telegram, Discord | partial | some forge workflow templates exist; provider storage and bot adapters are not complete |
| Prisma, Drizzle, MySQL2 | partial | neutral contracts and query adapters exist; no deployed schema, migrations, or database runtime |
| file as compute | partial | manifests and local working sets exist; no durable chunk table, job table, or real rebuild worker |
| runner farm | partial | workflow manifests exist; no live first free runner dispatcher across accounts |
| Docker and compose | partial | safe templates exist; no built and published image or runtime acceptance test |

## productization

| feature | status | gap |
|---|---|---|
| npm package metadata | partial | package is publishable but still version `0.2.0` |
| GitHub release | missing | no release workflow, tag, changelog, or release assets for `1.0.0` |
| npm publishing | missing | no publish workflow; `NPM_TOKEN` must be configured as a GitHub secret |
| GitHub Packages and GHCR | missing | no package or image publishing jobs |
| Maven, NuGet, RubyGems, PyPI | missing | no language specific wrappers or trusted publishing jobs |
| jsDelivr, UNPKG, esm.sh | partial | URLs are documented; no release verification or SRI manifest |
| browser extension | partial | MV3 source, minimal permissions, isolated page boundary, snapshot diffs and unpacked zip build exist; CRX signing and cross-browser profiles remain caller-owned |
| mobile and desktop apps | partial | target manifests only; no Tauri, Capacitor, Android, or iOS project |
| site and per site database | missing | no `web` application, Hono server, Drizzle schema, Prisma schema, or site deployment adapter |
| multi platform app identity | partial | generic bot and forge contracts; no OAuth or GitHub App installation flow |

## safety and release decision

The next production priority is not to add more vendor claims. It is to close the publish path: version metadata, changelog, release workflow, npm provenance, package smoke test, and a provider neutral durable job schema. Browser stealth, captcha bypass, account farming, and storage abuse are not release blockers because they are not safe defaults for this library.

The exposed npm token is treated as compromised. It must be revoked before any publication. A new token must be stored as the GitHub repository secret `NPM_TOKEN` or replaced by npm trusted publishing through GitHub Actions OIDC. No token belongs in source, commit history, command output, or chat.
