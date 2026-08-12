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
- [x] Manter o pacote `@devthink/saddle` como superfície de distribuição sem travar os adaptadores.

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
- [x] Add deterministic event recording and replay with snapshot boundaries.

### Block 3 — extension runtime

- [x] Add the first Manifest V3 extension surface with popup, content bridge, service worker and protocol.
- [ ] Add durable pending commands and rehydration after service worker termination.
- [ ] Add optional host permission escalation with explicit user consent.
- [ ] Add snapshot diffing, tab/frame metadata and resumable command records.
- [ ] Add deterministic extension packaging and unpacked validation.
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
- [ ] Add schema validation, content-type detection and safe normalization for JSON, XML, Markdown and binary results.
- [x] Add crawl frontier priorities, per-domain budgets, sitemap refresh and persistence metrics.
- [x] Add RAG chunk lineage, embeddings adapter contracts and retrieval result provenance.
- [x] Add token accounting and model context policies without hardcoded provider prices.

### Block 7 — API, MCP and security

- [ ] Complete HTTP and Web Request/Response server routes for scrape, crawl, batch, jobs, health and artifacts.
- [ ] Add versioned API envelopes, request ids, structured error responses and content negotiation.
- [ ] Add MCP browser snapshot and browser action tools over JSONL and HTTP transports.
- [ ] Expand SSRF defenses to redirects, DNS rebinding, IPv6, metadata endpoints and proxy dispatch.
- [ ] Add authentication, authorization, rate limits and audit events as caller-owned adapters.

### Block 8 — bots, apps and integrations

- [ ] Complete GitHub, GitLab, Forgejo, Gitea, Codeberg, Hugging Face, Discord, Telegram and generic webhook adapters.
- [ ] Add app installation, OAuth, bot token and webhook lifecycle contracts without storing secrets in the library.
- [ ] Add command permissions, idempotent command execution and platform-neutral status reporting.
- [ ] Add notification and artifact delivery adapters with retry and dead-letter behavior.
- [ ] Add integration conformance tests using fake transports only.

### Block 9 — packaging and distribution

- [ ] Add extension zip, desktop bundle, mobile manifest, n8n package and binary artifact plans with real build checks.
- [ ] Add reproducible SBOM, provenance, checksum and release asset generation.
- [ ] Verify all registry workflows from a new version tag without exposing credentials.
- [ ] Add install and smoke-test instructions for npm, GitHub Packages, GHCR, Maven, NuGet and RubyGems.
- [ ] Publish only after namespace, visibility, license and artifact contents are confirmed.

### Block 10 — product surfaces and operations

- [ ] Add caller-owned desktop, mobile, n8n and web control surfaces around the same contracts.
- [ ] Add operator controls for jobs, sessions, storage, runners, permissions, logs and artifacts.
- [ ] Add observability for latency, retries, queue depth, runner selection, storage bytes and failures.
- [ ] Add migration, backup, restore and data retention policies for persistent adapters.
- [ ] Add threat model, abuse boundaries, terms-of-service guidance and security release process.

### Block 11 — cross-runtime compatibility

- [ ] Validate root library operation in Node, browser worker, Deno, Bun and extension contexts where supported.
- [ ] Keep Node-only filesystem and HTTP adapters outside the transport-neutral core.
- [ ] Add capability detection and graceful unsupported-mode errors.
- [ ] Add import, export, tree-shaking and package surface tests for every declared subpath.

### Block 12 — release gates

- [ ] Require deterministic tests, format audit, syntax checks, package dry-run and security scan for every block.
- [ ] Require documentation and changelog updates for every public contract.
- [ ] Require a clean working tree and reviewed diff before each push.
- [ ] Create a versioned release only after all claims in the README match code or are explicitly marked planned or deferred.
