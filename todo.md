# Saddle engine — checklist de implementação

## Auditoria e contratos

- [x] Auditar a base atual do repositório e confirmar branch, remotes e arquivos existentes.
- [x] Separar o escopo da biblioteca do escopo da interface visual.
- [x] Definir o runtime mínimo suportado e a política de compatibilidade.
- [x] Transformar a tese `storage == compute` em interfaces executáveis e testáveis.

## Núcleo da biblioteca

- [x] Criar o modelo de job, sessão, artefato, provider, storage backend e working set.
- [x] Implementar o event log versionado e a validação do Session JSON.
- [x] Implementar o scheduler que seleciona o primeiro runner disponível.
- [x] Implementar o bridge de storage com um adaptador local seguro e extensível.
- [x] Implementar o executor de jobs com ciclo `prepare → process → sync → cleanup`.

## Superfícies e entrega

- [x] Criar a API pública da biblioteca e a CLI inicial.
- [x] Adicionar testes unitários e testes de integração sem credenciais reais.
- [x] Adicionar package metadata, build, exports e exemplo executável.
- [x] Adicionar workflows GitHub Actions sem executar ações destrutivas.
- [x] Validar tudo localmente e revisar o diff antes do push.
- [x] Publicar a primeira implementação no repositório GitHub selecionado após confirmação final do diff.

## Migração de arquitetura

- [x] Remover o layout `src` e mover a lógica para módulos root based.
- [x] Migrar o engine de TypeScript para JavaScript ESM.
- [x] Renomear arquivos internos para lowercase sem underscore ou hyphen.
- [x] Substituir classes e identificadores públicos por nomes lowercase compatíveis com a skill.
- [x] Remover endereços e portas hardcoded do runtime e tornar opções parametrizáveis.
- [x] Manter o pacote `@wenathlan/saddle` como superfície de distribuição sem travar os adaptadores.

## Expansão do engine

- [x] Implementar os modos library, cli, binary, browser, headless e computer como superfícies independentes.
- [x] Adicionar memória interna, externa, física, vetorizada e de biblioteca como estratégias selecionáveis.
- [x] Adicionar adapters para GitHub, storage S3 compatible e dispatch de workflow sem credenciais no código.
- [x] Implementar API de sessão, replay abstrato e persistência JSONL.
- [x] Adicionar contrato de socket para realtime sem depender de uma plataforma única.
- [x] Manter alternativas de deploy abertas sem Netlify Functions ou Vercel Functions.

## Próxima frente do engine

- [x] Criar contratos de persistência para jobs sessions artifacts chunks e providers.
- [x] Adicionar schema operacional compatível com Prisma Drizzle e MySQL2 sem impor um driver.
- [x] Implementar queue de jobs idempotência retry e saga de compensação.
- [x] Adicionar workflow dispatch parametrizado e registro de run.
- [x] Adicionar browser session replay abstrato sem acoplar o core a um browser.
- [x] Adicionar scraping seguro com robots cache extraction e content types.
- [x] Criar packager para binary container e manifest de distribuição.
- [x] Adicionar adapters multiforge para GitLab Forgejo Gitea Codeberg e Hugging Face.
- [x] Criar contrato de browser e replay de eventos sem acoplar a um navegador.
- [x] Implementar parser de robots e respeito ao crawl delay.
- [x] Implementar cache com ttl e stale while revalidate.
- [x] Implementar extraction estruturada de metadata links e texto.
- [x] Criar manifest de distribuição para library cli binary e container.
- [x] Gerar plano de container sem fixar host ou port.
- [x] Criar adapter genérico de forge e wrappers GitLab Forgejo Gitea Codeberg e Hugging Face.

## Próxima camada operacional

- [x] Criar bot unificado com start stop command webhook schedule e status.
- [x] Criar parser de comandos e registro de adapters de plataforma.
- [x] Criar serializadores JSON NDJSON e SSE sem servidor obrigatório.
- [x] Criar streaming de blocos com backpressure configurável.
- [x] Adicionar adapter SQL neutro para Drizzle Prisma e MySQL2.
- [x] Adicionar workflows multiforge e manifests de execução.

## Roadmap P0 e P1

- [x] Criar memory engine com `memoryobject`, `computeresult`, targets e `safeload`.
- [x] Implementar transformações storage to compute e compute to storage.
- [x] Adicionar API universal de scrape, crawl, batch e health com SSE.
- [x] Adicionar rate limiting global, por usuário e por domínio.
- [x] Implementar crawling BFS com normalização de URL, sitemap e limite de domínio.
- [x] Adicionar queue persistente para crawl e fallback em memória.
- [x] Implementar `save` e `load` de sessões e extraction por schema.
- [x] Adicionar servidor MCP opcional com ferramentas scrape, crawl, batch, extract e serialize.
- [x] Criar Dockerfile seguro e docker compose parametrizado.
- [x] Adicionar runtime universal sem exigir fs, process ou Buffer no núcleo.

## Roadmap P2 e P3

- [x] Criar perfil de fingerprint coerente por sessão sem patch stealth automático.
- [x] Implementar pool de proxy com health score, rotate e revive.
- [x] Adicionar contrato de captcha solver manual ou externo com evidências.
- [x] Implementar token estimate, chunk markdown e RAG manifest.
- [x] Gerar llms.txt e llms-full.txt a partir de páginas estruturadas.
- [x] Adicionar webhooks HMAC e eventos de job.
- [x] Criar manifests para browser extension, desktop, mobile e n8n.

## Public library layer

- [x] Criar `saddleurl` e `scrapeurl` com formatos configuráveis.
- [x] Adicionar `extractcontent`, `serializeresult`, `formatforagent`, batch e crawl helpers.
- [x] Criar Browser Agent abstrato com navigate click type screenshot text html scroll e execute commands.
- [x] Adicionar taxonomia de erros HTTP e recovery policy.
- [x] Implementar retry policy e circuit breaker configuráveis.
- [x] Criar servidor Node parametrizado com host e port recebidos por configuração.
- [x] Adicionar adapters de storage remoto para GitHub Contents e file hosting.
- [x] Atualizar documentação, exports, exemplo público e superfície deploy.

## Format and mode consolidation

- [x] Audit all public modules for English JSDoc section comments.
- [x] Add a mode matrix for library application browser cli binary and memory.
- [x] Add binary build contracts and explicit mode resolution.
- [x] Add computer desktop mobile extension and internet surface manifests.
- [x] Review package exports docs examples and embedded error handlers.

## Release audit

- [x] Compare every README foundation engine and productization item with the current code.
- [x] Compare the conclusions file with the current storage, site, database, forge, and runner model.
- [x] Mark missing features as implemented, partial, deferred, or unsafe by design.
- [x] Complete durable database schema and migration contracts.
- [x] Add persistent queue recovery and MCP transport with SSRF guard.
- [x] Complete production release workflow and changelog.
- [x] Add npm provenance through npm Trusted Publishing without a long-lived token.
- [x] Add live release workflow metadata for GitHub Packages and the public registries.

## Registry workflows

- [x] Document GitHub Packages versus public npmjs publication.
- [x] Add GitHub Packages npm workflow using `GITHUB_TOKEN` and `packages: write`.
- [x] Add public npmjs workflow using npm Trusted Publishing and `id-token: write`.
- [x] Add GHCR container workflow using `GITHUB_TOKEN` and `packages: write`.
- [x] Add Maven GitHub Packages workflow and minimal pom/settings metadata.
- [x] Add NuGet GitHub Packages workflow and minimal project metadata.
- [x] Add RubyGems GitHub Packages workflow and minimal gem metadata.
- [x] Validate workflows locally without publishing or exposing credentials.
- [x] Implement the highest priority missing library features.
- [x] Prepare package version 1.0 metadata and release notes.
- [x] Add safe GitHub release validation and npmjs publish workflow using OIDC Trusted Publishing.
- [x] Create the v1.0 tag only after the final checks pass.
- [x] Inspect failed or missing release workflow runs and package listings.
- [x] Publish the authorized GitHub Packages npm artifact after correcting the namespace blocker.
- [x] Verify package version and visibility through the GitHub package page.
- [x] Publish GHCR Maven NuGet and RubyGems artifacts after their independent metadata checks.
- [x] Commit and push publication verification metadata.

## Comparative audit and extension surface

- [x] Compare browser-agent, scraper, automation, MCP, storage and workflow libraries using primary repository or documentation sources.
- [x] Compare browser extension architectures and record permission, content-script, service-worker and messaging gaps.
- [x] Reconcile the three supplied README or conclusions documents with the current root-based engine.
- [x] Create a prioritized feature gap matrix with evidence and implementation status.
- [x] Create the `extension/` surface with manifest, service worker, content bridge, popup or control surface and shared protocol contracts.
- [x] Add deterministic extension tests without browser credentials or network access.
- [x] Integrate extension exports and documentation without coupling the core to Chrome or another vendor.

## Master ecosystem plan

### Release 1.7.0 execution

- [x] Confirm the 1.7.0 working tree, workflows, release metadata and package contents.
- [x] Create and push tag `v1.7.0` from the validated commit.
- [x] Create GitHub Release Notes for 1.7.0 without publishing credentials in the repository.
- [x] Verify the npm GitHub Packages, GHCR, Maven, NuGet and RubyGems workflow runs.
- [x] Confirm the published artifact name and version in each registry before reporting success.
- [x] Record the npmjs Trusted Publishing bootstrap blocker without claiming a publish.
- [x] Continue with the surfaces block after the release verification.

The following blocks are the execution order for the complete ecosystem. A block becomes complete only when its contracts, implementation, deterministic tests, documentation and release impact are all checked.

### Block 1 — audit and governance

- [ ] Reconcile the supplied `README.md`, `README(2).md`, and `other.md` with the current code and remove claims that are not executable.
- [ ] Maintain the comparative audit with primary sources for browser agents, scrapers, MCP, storage, workflow and extension projects.
- [ ] Keep `docs/gapmatrix.md` current with implemented, partial, deferred and unsafe-by-design states.
- [ ] Define criteria for public API stability, adapter ownership, credentials, permissions, persistence and recovery.

### Block 2 — browser agent foundation

- [x] Add accessibility or structured page snapshots with snapshot identifiers and stable references.
- [x] Add stale reference, overlay obstruction, navigation and frame errors.
- [x] Add tab, frame, window and browser session identity contracts.
- [x] Add action results for navigation, click, type, fill, key, scroll, upload and screenshot.
- [x] Add deterministic event recording and replay with snapshot boundaries and tab/window/frame context restoration.

### Block 3 — extension runtime

- [x] Add the first Manifest V3 extension surface with popup, content bridge, service worker and protocol.
- [x] Add durable pending commands and rehydration after service worker termination.
- [x] Add a read-only isolated-world to page-world bridge with token correlation, bounded facts and timeout errors.
- [ ] Add optional host permission escalation with explicit user consent.
- [x] Add snapshot diffing, tab/frame metadata and resumable command records.
- [x] Add deterministic extension packaging and unpacked validation.
- [ ] Add Firefox, Edge and WebExtension-compatible adapter profiles.

### Block 4 — working set and storage

- [x] Complete chunk manifests with resume, checksum, range reads and partial sync.
- [x] Add content-addressed storage indexes and deduplication across backends.
- [x] Add cache tiers with ETag, stale-while-revalidate, invalidation and bounded memory.
- [x] Add storage capability negotiation for local, forge, S3-compatible, dataset and extension storage.
- [x] Add conflict detection and merge policy for concurrent artifact writes.

### Block 5 — runners and execution

- [x] Add provider health, capacity, cost, quota and capability reporting.
- [x] Add workflow trigger contracts for manual, webhook, schedule, repository dispatch and retry events.
- [x] Add resumable remote run records with cancellation, timeout and heartbeat semantics.
- [x] Add cron or alarm manifests without binding the core to a single forge or host.
- [x] Add execution sandbox capability reports for Node, browser, container and binary modes.

### Block 6 — scraping and agent context

- [x] Add structured accessibility and semantic extraction alongside HTML extraction.
- [x] Add content-type detection and safe bounded normalization for JSON, XML, Markdown, text, HTML and binary results; richer parsers remain adapters.
- [x] Add crawl frontier priorities, per-domain budgets, sitemap refresh and persistence metrics.
- [x] Add RAG chunk lineage, embeddings adapter contracts and retrieval result provenance.
- [x] Add token accounting and model context policies without hardcoded provider prices.

### Block 7 — API, MCP and security

- [x] Complete HTTP and Web Request/Response server routes for scrape, crawl, batch, jobs, health and artifacts.
- [x] Add versioned API envelopes, request ids, structured error responses and content negotiation.
- [x] Add MCP browser snapshot and browser action tools over JSONL and HTTP transports.
- [x] Expand SSRF defenses to redirects, DNS rebinding, IPv6, metadata endpoints and proxy dispatch.
- [x] Add authentication, authorization, rate limits and audit events as caller-owned adapters.

### Block 8 — bots, apps and integrations

- [x] Complete GitHub, GitLab, Forgejo, Gitea, Codeberg, Hugging Face, Discord, Telegram and generic webhook adapters.
- [x] Add app installation, OAuth, bot token and webhook lifecycle contracts without storing secrets in the library.
- [x] Add command permissions, idempotent command execution and platform-neutral status reporting.
- [x] Add notification and artifact delivery adapters with retry and dead-letter behavior.
- [x] Add integration conformance tests using fake transports only.

### Block 9 — packaging and distribution

- [x] Add extension zip and unpacked validation with a release-tag-derived build; keep desktop, mobile, n8n and binary artifact plans caller-owned.
- [x] Add reproducible SBOM, provenance, checksum and release asset generation.
- [x] Verify all registry workflows for v1.7.0 without exposing credentials.
- [ ] Add install and smoke-test instructions for npm, GitHub Packages, GHCR, Maven, NuGet and RubyGems.
- [ ] Publish only after namespace, visibility, license and artifact contents are confirmed.

### Block 10 — product surfaces and operations

- [x] Add desktop and mobile manifests with caller-owned adapter contracts.
- [x] Extend n8n trigger and action declarations with deterministic execution guards.
- [x] Add a product surface index and usage guide for the new contracts.
- [x] Add an auditable operator control contract for jobs, sessions, storage, runners, permissions, logs and artifacts.
- [x] Add a framework-neutral Web Request and Response control handler with optional caller authorization.
- [x] Add bounded operational metrics for latency, retries, queue depth, runner selection, storage bytes and failures.
- [x] Add retention, backup, restore and threat ownership policy contracts without forcing workers or persistence.
- [x] Add the first caller-owned desktop, mobile, n8n and framework-neutral web control contracts around the same engine contracts.
- [ ] Add operator controls for jobs, sessions, storage, runners, permissions, logs and artifacts.
- [ ] Add observability for latency, retries, queue depth, runner selection, storage bytes and failures.
- [ ] Add migration, backup, restore and data retention policies for persistent adapters.
- [ ] Add threat model, abuse boundaries, terms-of-service guidance and security release process.

### Block 11 — cross-runtime compatibility

- [x] Reexecute cross-runtime validation from the derived release tag without a fixed workflow version.
- [x] Confirm that the npmjs workflow uses the `NPM_TOKEN` secret without exposing its value in logs or files.
- [x] Replace the invalid or unauthorized `NPM_TOKEN` secret with a valid raw token for the intended npm scope.
- [x] Reexecute npmjs publication and confirm `@wenathlan/saddle@1.8.1` is visible in the public registry.
- [x] Confirm the npm token identity can publish `@wenathlan/saddle` without exposing the token.
- [x] Validate root library operation in Node, Bun and Deno through the CI matrix.
- [x] Validate the browser worker root boundary through the injected `workerbridge` contract.
- [ ] Validate extension-context package loading where supported; the permission policy contract is covered separately.
- [x] Add a minimal extension permission policy and optional caller-owned escalation contract.
- [x] Keep Node-only filesystem and HTTP adapters outside the transport-neutral core.
- [x] Add capability detection and graceful unsupported-mode errors.
- [x] Add Node package surface import tests for every declared export target.
- [x] Add a deterministic transport-neutral export graph audit for every browser-safe subpath; full vendor bundler output remains a host concern.

### Block 12 — release gates

- [x] Align package metadata, lockfile, changelog and release notes to `1.8.0`.
- [x] Run all local release gates on the 1.8.0 candidate.
- [x] Create and push tag `v1.8.0` only from the validated commit.
- [x] Create GitHub Release `v1.8.0` with notes derived from the changelog.
- [x] Verify GitHub npm, GHCR, Maven, NuGet and RubyGems workflows for `1.8.0`.
- [x] Confirm npmjs status without claiming publication when the registry returns HTTP 404.
- [x] Audit the latest verified Node, Docker, Java, .NET, Ruby and Bun/Deno action versions before changing CI.
- [x] Update workflow toolchains and Docker base images without hardcoding a package release version.
- [x] Validate that all five registry workflows derive the package version from the release tag.
- [ ] Keep npmjs publication blocked until the owner confirms a valid `NPM_TOKEN`; do not publish during toolchain maintenance.
- [ ] Require deterministic tests, format audit, syntax checks, package dry-run and security scan for every block.
- [ ] Require documentation and changelog updates for every public contract.
- [ ] Require a clean working tree and reviewed diff before each push.
- [ ] Create a versioned release only after all claims in the README match code or are explicitly marked planned or deferred.
- [ ] Audit `.github` for duplicated release logic and unify only the shared version, checkout and validation path.
- [x] Centralize package installation, deterministic gates and tarball validation in `.github/actions/validatepackage`.
- [ ] Continue the next library feature block with tests, documentation and release-aware metadata.
- [x] Migrate all canonical package identity references from `@devthink/saddle` to `@wenathlan/saddle`.
- [x] Create a follow-up release after the package identity migration; do not reuse the existing v1.8.0 tag.
- [x] Align package metadata and release notes to follow-up version `1.8.1`.
- [x] Create tag `v1.8.1` only after the scoped npm identity migration passes all gates.

### Release 1.8.2 — canonical wenathlan publication

- [x] Confirm repository administration and package publication authority for `wenathlan` while retaining `iakadion` repository administration.
- [x] Audit every active manifest, workflow, documentation example and release asset for the canonical `@wenathlan/saddle` identity.
- [x] Bump package metadata, lockfile, Maven, NuGet, RubyGems, changelog and release notes to `1.8.2`.
- [x] Update GitHub Packages npm publication to derive the transferred `@wenathlan` namespace; preserve registry-specific GHCR, Maven, NuGet and RubyGems naming rules.
- [x] Run all deterministic gates and inspect the final diff before creating `v1.8.2`.
- [x] Create and push tag `v1.8.2`, publish the GitHub release and trigger all six publication workflows.
- [x] Verify public npm and the extension zip asset independently; record successful authenticated workflow evidence and protected-access limits for GitHub Package registries.

### Release 1.8.4 — platform pipelines and pages

- [x] Audit every Node.js 22 reference across source, Docker, GitHub Actions, GitLab, Forgejo, Gitea, Codeberg and Woodpecker configurations.
- [x] Replace all active Node.js 22 references with Node.js 26.7.0 and add deterministic version checks.
- [x] Add the Saddle Pages GitHub Pages build and deployment workflow without committing generated site output.
- [x] Add equivalent caller-configured workflows for GitLab, Forgejo, Gitea, Codeberg and Woodpecker.
- [x] Document required repository variables, tokens and deployment limitations for each external forge.
- [x] Verify the owner and package coordinate before deleting the legacy Maven package `io.devthink:saddle`.
- [x] Bump JavaScript, Maven, NuGet, RubyGems, Docker and release metadata to `1.8.4`.
- [x] Run all library and website gates, commit the migration, create `v1.8.4` and verify the resulting library pipelines.

### Package metadata and next engine block

- [x] Compare the attached package manifest with the current `package.json` without copying unrelated scripts or claims.
- [x] Add only the optional Playwright peer because the new explicit adapter and test use it; do not add unused runtime dependencies.
- [x] Add compatible `engines`, `packageManager` and optional `peerDependencies`; do not add empty `optionalDependencies`, unsupported `trustedDependencies` or unused patch metadata.
- [x] Preserve the root-based JavaScript ESM boundary and keep Node-only adapters in explicit subpaths.
- [x] Update package documentation and changelog for any new public metadata or dependency contract.
- [x] Run install, syntax, format, deterministic tests, package dry-run and security review before the next release.
- [x] Decide that the resulting changes belong in `1.8.5`; keep the immutable `1.8.4` tag unchanged.
- [ ] Continue the next engine block only after the package manifest changes are committed and the working tree is clean.

### Web duplicate cleanup

- [x] Inventory `/web` files and group duplicate suffix variants by canonical basename.
- [x] Compare duplicate contents and merge unique sections into the canonical file for each authorized group.
- [x] Delete 310 duplicate suffix files outside the ignored directories and keep canonical paths without numeric suffixes.
- [x] Remove the explicitly authorized `web/other1` and `web/other2` directories after the migration audit.
- [x] Run web typecheck, static Pages build, touched-file format check, engine gates and diff review.
- [x] Publish the deduplicated web tree in commit `d4b6ec5`.

### Web root architecture migration

- [x] Inventory `web/client`, nested workflow folders and all path-sensitive imports before moving files.
- [x] Move the client contents to the web root without creating a second source tree or duplicate canonical files.
- [x] Consolidate web workflows into the root workflow locations defined by the architecture and remove nested copies.
- [x] Remove `web/other1` and `web/other2` after checking that no active build or deploy path references them.
- [x] Reconcile Vite, TypeScript, Pages, GitLab, Forgejo, Gitea, Codeberg and Woodpecker paths after the move.
- [x] Merge web development dependencies and package configuration into the repository root; remove the nested package and lockfile.
- [x] Run web typecheck, static build, dependency synchronization and deploy configuration checks.
- [x] Commit and push the root migration after reviewing the complete diff and resolving workflow-scope permissions.

### Pages incident and release 1.8.6

- [x] Inspect the latest GitHub Actions runs, logs and annotations for Pages, release validation and Dependabot.
- [x] Reconcile `main` with any Dependabot branch or pull request without deleting an active branch blindly.
- [x] Verify the GitHub Pages source, artifact path, base path, environment and repository visibility settings.
- [x] Fix the Pages workflow and validate a deployable artifact from the root-based web project.
- [x] Set the repository project name and description to the Saddle canonical identity after browser confirmation.
- [x] Bump all package and release manifests to `1.8.6` without hardcoding workflow versions.
- [x] Run engine, web, packaging and release gates for `1.8.6`.
- [x] Create and push the `v1.8.6` tag and release only after the previous checks pass.
- [x] Verify the six registry workflows and Pages execution after the release trigger, including the successful GHCR rerun.

### Branch and checks consolidation

- [x] Inventory every remote branch, open pull request, tag and unique commit reachable only from a non-main ref.
- [x] Record branch tips before deletion so removing refs cannot remove commits from the object database or release history.
- [x] Close obsolete automated pull requests after confirming their changes are not needed by the root-based package.
- [x] Delete every non-main remote branch only after preserving its tip in the audit record and checking for unmerged work.
- [x] Explain the change from the previous check count to the current check count by comparing workflow definitions and check runs.
- [x] Keep only `main` as an active branch and verify that the latest commit on it has the expected CI, compatibility and Pages checks.

### Security, assets, documentation and release 1.8.7

- [ ] Inventory all GitHub security alerts, Dependabot alerts, dependency paths and workflow security findings without hiding unresolved advisories.
- [ ] Identify vulnerable direct and transitive packages, prefer Node.js built-ins where they replace external dependencies, and update safe dependencies to current compatible versions.
- [ ] Regenerate the root lockfile and verify npm audit, dependency review and package gates with the smallest safe remediation.
- [ ] Review workflow permissions, third-party action pins, secret handling, Docker build inputs and release-version derivation for security regressions.
- [ ] Inventory `web/public/manos`, determine whether its script is required, and remove or relocate it without leaving duplicate public runtime files.
- [ ] Audit every web image, SVG, favicon, font and asset URL under the Pages base path; replace root-absolute paths that break at `/saddle/` with base-aware references.
- [ ] Inspect all current and historical README/Markdown sources through git history, deduplicate claims, remove stale package identities and consolidate the canonical README in English.
- [ ] Update all release manifests and changelog metadata to `1.8.7`; keep workflows deriving the version from the tag and package metadata instead of manual edits.
- [ ] Run engine, web, dependency, security, packaging and release gates for `1.8.7`.
- [ ] Create and publish `v1.8.7` only after all actionable security findings and asset checks are resolved or explicitly documented as unfixable external advisories.

### Reorganization and release 1.8.8

- [x] Inventory every active root module and map imports, exports, tests and package payloads by correlated responsibility.
- [x] Classify overlapping scrape, crawl, cache, normalization, extraction, robots and frontier logic into canonical ownership groups.
- [x] Define the smallest safe target layout without introducing `src`, deep nesting or provider-specific coupling.
- [x] Preserve all current public exports through direct moves or compatibility shims before deleting any duplicate implementation.
- [x] Consolidate equivalent logic inside the owning domain while retaining the richest tested behavior from all historical implementations.
- [x] Update every import, export map, test fixture, documentation path and package `files` entry affected by the regrouping.
- [x] Add or improve English JSDoc section comments, bounded error catchers and deterministic tests for each consolidated context.
- [x] Remove only files proven redundant after import, test, package and historical-feature audits; record deferred legacy surfaces explicitly.
- [x] Run the complete engine, web, format, package, dependency and security gates after the reorganization.
- [x] Update release metadata and create `v1.8.8` only after the final diff, package contents and compatibility surface are verified.

### TypeScript migration and multi target release 1.8.9

#### Group 1: baseline and active engine conversion

- [x] Consult the current date and record the TypeScript, Node.js, build and packaging versions used for the migration.
- [x] Inventory every active JavaScript file from `adapters` through `workflow`, excluding `docs` and `web`, with imports, exports, tests and package ownership.
- [x] Classify the active engine into correlated conversion groups: core, domain, memory, storage, runtime, queue, browser, scrape, API, protocol, workflow and delivery.
- [x] Define one root based TypeScript compiler configuration without creating `src` or committing generated `dist` output.
- [x] Convert the transport neutral public entry and one correlated group at a time while preserving function names and package exports.
- [x] Convert Node only adapters with explicit type boundaries for filesystem, HTTP, process, workers and optional Playwright.
- [x] Convert tests and helper scripts to TypeScript where they belong to the active engine contract, retaining deterministic execution.
- [ ] Add English JSDoc sections, explicit error catchers and strict type checks without introducing unnecessary external runtime dependencies.
- [x] Remove or archive only JavaScript files proven replaced after import graph, package and test verification.
- [x] Keep generated JavaScript, declaration files, maps and bundles outside version control and produce them only in CI or local build output.

#### Group 2: library, application and binary targets

- [x] Define target manifests for library, package, application, computer, desktop, browser, CLI, binary, internet and headless modes.
- [x] Define Android targets for APK and AAB through a caller owned mobile adapter without hardcoded credentials, hosts or signing keys.
- [x] Define iOS targets for IPA and app packaging through a caller owned mobile adapter without committing provisioning material.
- [x] Define desktop targets for macOS app, DMG and PKG, Windows EXE, MSI and MSIX, and Linux AppImage, DEB, RPM, Snap and Flatpak.
- [x] Define CLI and binary targets for Node, Bun or another caller selected runtime while keeping the library core authoritative.
- [x] Define browser extension targets for CRX, XPI and SAFARIEXTZ with shared browser neutral contracts and minimal permissions.
- [x] Define package targets for npm, GitHub Packages, Maven, NuGet, RubyGems, OCI, MCP, VSIX and other supported artifact surfaces.
- [x] Add reproducible target manifests, version derivation from the release tag, checksums, SBOM and provenance without committing generated artifacts.
- [x] Add caller configured workflows for target builds, with secrets only in repository or forge settings and no platform locked functions.
- [x] Run smoke tests for every target manifest and explicitly mark unavailable local toolchains as caller or CI responsibilities.

#### Group 3: web TypeScript architecture and release

- [x] Audit `web` folder by folder and file by file, preserving the root based layout and excluding generated `web/dist` output from version control.
- [x] Group related web components, routes, hooks, contexts, utilities and styles without creating `src`, `client` or duplicated mode trees.
- [x] Apply the same lowercase naming, English JSDoc, error boundary, design token and accessibility rules to the web surface.
- [x] Preserve base aware assets, responsive layouts, navigation, pages build and public marketing behavior during the regrouping.
- [x] Update TypeScript compiler, Vite, test, format and build configurations for the unified root architecture.
- [x] Run engine, web, package, security, target manifest and artifact exclusion gates after each completed group.
- [x] Update README, architecture notes, changelog and release metadata to `1.8.9` only after all implemented claims match code.
- [x] Create the validated `v1.8.9` tag and publish only the generated artifacts from CI to the six registries and configured target channels.

### Missing native and release artifacts for 1.8.9

#### Group 4: shared desktop browser application

- [x] Research and document the supported desktop shell, browser engine, installer and signing toolchains for Windows, Linux and macOS.
- [x] Create a shared TypeScript desktop browser application boundary that reuses the existing web UI and library contracts without duplicating business logic.
- [ ] Add caller-configured desktop runtime settings for profile, storage, downloads, permissions, proxy and update channels.
- [x] Generate Windows EXE and MSI artifacts from the shared desktop source; retain portable directory and MSIX as deferred targets.
- [x] Generate Linux AppImage, Debian and RPM artifacts from the shared desktop source; retain Snap and Flatpak as deferred targets.
- [x] Generate the macOS DMG artifact from the shared desktop source; retain PKG, signing and notarization as caller-owned targets.
- [x] Add deterministic app metadata, icons, version derivation and checksums without committing generated packages.
- [ ] Add smoke checks that inspect each generated manifest and confirm the desktop artifact points to the compiled web and library entrypoints.
- [x] Attach every successfully generated desktop artifact to the existing GitHub release instead of creating an untracked local package.
- [x] Record unavailable native SDKs, signing certificates or store credentials as explicit workflow inputs rather than claiming an unsigned artifact is store-ready.

#### Group 5: mobile and release asset workflows

- [x] Define Android APK and AAB source boundaries and caller-owned signing configuration that reuse the shared application contracts.
- [x] Define iOS app and IPA source boundaries with caller-owned Xcode, provisioning profile, certificate and notarization inputs.
- [x] Add Android workflow jobs that generate debug artifacts when the Android toolchain is available and publish signed artifacts only when secrets exist.
- [x] Add iOS workflow jobs that run on macOS runners only when the required certificates and provisioning inputs are configured.
- [x] Add release asset naming, checksum, provenance and artifact retention rules for generated APK, AAB, EXE, MSI, DEB, RPM, AppImage, DMG, OXT and container targets; retain IPA, MSIX, Snap, Flatpak, PKG and VSIX as explicit unavailable or caller-owned targets.
- [x] Add a release-assets manifest listing generated, unavailable and caller-required artifacts so release notes never imply that a missing binary exists.
- [x] Run the desktop and mobile workflows from the tag-derived version without hardcoded version numbers or credentials.
- [x] Update release notes, README, target documentation and todo.md only after the generated asset list is verified against the actual GitHub release.

### Native surface conversion and artifact normalization follow-up

- [x] Research Ionic, Capacitor, Tauri and other TS/TSX-to-mobile conversion paths and document the selected trade-offs.
- [x] Create explicit root-based `android/`, `ios/` and `browser/` surface boundaries without duplicating the library engine or web application logic.
- [x] Define Android TSX design and configuration inputs that consume the shared library contracts before conversion to APK and AAB.
- [x] Define iOS TSX design and configuration inputs that consume the shared library contracts before conversion to app and IPA.
- [x] Define the browser surface as the desktop browser contract and document why the implementation remains under `desktop/` or moves to a canonical browser boundary.
- [x] Add focused Android, iOS, browser and desktop workflows that convert the shared TypeScript and TSX source without hardcoded infrastructure or credentials.
- [x] Measure the Android bundle composition and reduce the APK size through release shrinking, ABI strategy, dependency review and asset optimization without removing required functionality.
- [x] Normalize release artifact names to lowercase Saddle names with dots and release versions, including `saddle.browser.1.8.10`, `saddle.apk.1.8.10.apk`, `saddle.aab.1.8.10.aab`, `saddle.container.1.8.10.tar.gz` and `saddle.extension.1.8.10.zip`.
- [x] Remove all `build_script_build*.exe`, `build-script-build.exe`, stale `saddle_desktop.exe`, duplicate `saddle-desktop.exe` and other non-user-facing build outputs from release assets and workflow collection paths.
- [x] Add release manifest validation that rejects helper binaries, underscore-based public artifact names and unexpected duplicate assets before upload.

### Flat native build migration for 1.8.11

- [x] Audit every `src` directory and source path in `desktop/`, `android/`, `ios/`, `browser/` and root workflows; distinguish required vendor-generated internals from project-owned source.
- [x] Define the flat root mapping for the desktop Tauri build, keeping only generated `dist/` output out of version control and moving project-owned configuration and entrypoints to the `desktop/` root where feasible.
- [x] Define the flat root mapping for the Capacitor Android build, configuring Gradle source sets and project-owned entrypoints without maintaining a project-owned `app/src` source tree.
- [x] Define the flat root mapping for the Capacitor iOS build, documenting which Xcode and Capacitor generated paths remain toolchain-owned and which Saddle files belong at the `ios/` root.
- [x] Update `capacitor.config.ts`, desktop configuration, Gradle/Xcode settings and all native workflows to consume the flat mappings without hardcoded host, port, credentials or release versions.
- [x] Remove or relocate every project-owned `src` path that is not required by the native toolchain and add validation that prevents new forbidden source directories.
- [x] Preserve the TypeScript library-first boundary so native surfaces convert shared web output instead of duplicating engine logic.
- [x] Bump all active manifests and release metadata to 1.8.11 while preserving historical 1.8.10 references.
- [x] Run local checks and native CI builds, verify the release asset names and sizes, publish v1.8.11 and document any toolchain-owned paths that cannot be flattened safely.

### Native identity and security hardening follow-up

- [x] Research OpenCode, ZCode and comparable cross-platform applications for icon, metadata, signing, notarization and release hardening patterns without copying their proprietary assets or code.
- [x] Design and generate a distinctive Saddle icon family for Tauri, Android, iOS, browser extension and web metadata, preserving the flat project-owned layout and excluding generated `src` trees.
- [x] Define caller-owned signing contracts for Windows Authenticode, macOS notarization, Android release signing and Apple provisioning without embedding private keys or pretending unsigned binaries are trusted.
- [x] Expand desktop artifact coverage for x64, ARM64, MSI, EXE, AppImage, DEB, RPM, DMG and `.app` where the runner and signing configuration support it.
- [x] Expand mobile and extension artifact coverage for Android APK/AAB, iOS IPA/app and browser extension packages, documenting unavailable targets instead of claiming nonexistent outputs.
- [x] Investigate `GHSA-wrw7-89jp-8q8g` against the complete dependency graph, lockfiles and transitive Capacitor/Tauri surfaces; upgrade, override or isolate the vulnerable path when a compatible fix exists.
- [x] Add an aggressive security workflow combining dependency review, npm audit, OSV or equivalent advisory ingestion, CodeQL, secret scanning, SBOM generation, artifact scanning and fail-closed severity policy.
- [x] Update all application and package workflows to derive versions from release tags, use repository secrets for signing and registry credentials, upload SARIF or equivalent findings, and keep security evidence with the release.
- [ ] Run the full local and CI security/native gates, document any residual caller-owned signing or unsupported architecture, and prepare the next 1.8.11 release update only after validation.
