FILE: 31.auditoria.dados.md
- 7 model token prices hardcoded in tokens.ts (gpt-4o, gpt-4o-mini, gpt-4-turbo, claude-3-5-sonnet, claude-3-haiku, gemini-1.5-pro, gemini-1.5-flash) — all outdated 2024 pricing, not documented
- User-Agent hardcoded as single static string in browser.ts line 13
- Host hardcoded as '0.0.0.0' in server.ts line 132
- 3 hardcoded paths (pythonPath, windowSize, doomFramesDir in renderer.ts)
- Version hardcoded in 4 files (cli.ts 2.0.0, server.ts 2.0.0, web/index.html v2.0.0, package.json 2.0.0)
- 1 dependabot.yml placeholder (ecosystem vazio)
- 30+ config values hardcoded (timeout, scroll delay, max scrolls, retries, retry delay, cache TTL, viewport, locale, max tokens, chunk size, model, max size, default TTL, max failures, revive after, rate limit interval, max concurrent, pool size, batch concurrency, chunking max tokens, overlap, serialize key pattern, llms.txt max pages, robots UA, cache TTL)
- '--disable-web-security' hardcoded in browser.ts launch args
- CORS '*' in dev-server.ts
- Error handling: no try-catch around storage ops, no contextual error logging
- No mention of the audit finding that the tool is "desainado" without hardcoded values
- No default server host configured (127.0.0.1)
- No configuration for proxy, rate-limiter, pool, batch, chunking, serialize, llms-txt, robos, robots, cache, agent, types, session, chunking, retry

FILE: 32.bots.automacao.computacional.md
- 11 bots listed with star counts and free/open status (FreeClaw, become-ceo, Agentic-AI, Agent-2-Beta, Custom-MCP-Calculator, gaia-agent, Improved-Browser-Agent, AI-Agent-Pipeline, AI-Agent-Optimization, ai-devops-automation, AI-devops-agents)
- Installation commands for each bot (npx, curl, git clone, pip install -r requirements.txt)
- Bot-specific details: FreeClaw Telegram AI agent, become-ceo Discord AI team, Agent-2-Beta self-hosted browser AI agent, Custom-MCP-Calculator MCP server, gaia-agent GAIA benchmark accuracy, Improved-Browser-Agent browser automation + math, AI-Agent-Pipeline token optimization, AI-Agent-Optimization production pipeline, ai-devops-automation FastAPI microservice, AI-devops-agents CI/CD deployment pipelines
- No mention in README that these bots exist or how they relate to the saddle project's bot framework

FILE: 33.bots.codigo.revisao.md
- 11 review bots with star counts (robin, AICodeBot, AI-Code-Reviewer, codeflow-ai-reviewer, repo-guard, acrobot, multi-provider-code-review, li-agent, AI-Code-Review-Bot, semantic-code-review-bot)
- Installation commands for each (npx robin-review, curl install.sh, etc.)
- GitHub Actions workflow YAML files for each bot (robin.yml, li-agent.yml, acrobot.yml, multi-review.yml)
- secrets needed: LLM_API_KEY, LLM_BASE_URL, LLM_MODEL for robin
- Auth tokens and model-specific configs for each bot
- No mention in README of specific code review bots or how they relate to the saddle project

FILE: 34.bots.seguranca.cicd.md
- 11 security/CI/CD bots (AutoAR, ai-pr-guardian-demo, ai-code-sentinel, CyberGuard AI, Auto-PR-bot-v2.0, ci-helper-bot, CICD-Pipeline-failure-bot, code-quality-action, release-please, auto-merge-bot, AutoTriage, pr-triage-bot, Maintainer-Bot)
- AutoAR (238 stars) detailed: ASM, Discord bot, bug bounty automation
- ai-pr-guardian-demo: 0 stars, GitHub Actions, security violations scanning
- ai-code-sentinel: 0 stars, AST analysis + security scanning
- CyberGuard AI: 2 stars, Telegram security bot
- GitHub Copilot: 170k+ stars, AI pair programmer, code completion, chat, function generation
- GitHub Advanced Security: CodeQL + Secret scanning + dependency review
- Dependabot: dependency automation + security scanning
- Release Drafter: auto drafts releases based on commits/PRs
- Full YAML config files for each bot (security.yml, codeql.yml, pr-guardian.yml, cic-failure.yml, auto-triage.yml, etc.)
- No mention in README of these security bots or how the saddle project handles security scanning

FILE: 35.comparativo.concorrencia.md
- 7 competitors detailed: Crawlee (23.7k stars, Apify), Playwright (90.5k), Puppeteer (94.5k), Cheerio (30.4k), Scrapy (62.1k, Zyte), Firecrawl (130k stars), Browserless (13.3k)
- Feature comparison table: anti-detection (webscrape has no), persistent queue (Crawlee), Docker (all have), MCP server (Playwright, Firecrawl, Browserless), session persistence (Browserless), proxy rotation (Crawlee, Browserless)
- Critical gaps: anti-detection (no stealth), persistent queue (no SQLite/SDC), Docker support (no Dockerfile), MCP server (no integration)
- 7 competitors detailed: Crawlee, Playwright, Puppeteer, Cheerio, Scrapy, Firecrawl, Browserless
- Architecture comparison: Crawlee's Request Queue vs webscrape's in-memory Array
- Playwright integration patterns (raw vs wrapper vs Crawlee)
- Serialization comparison (webscrape 5 formats vs Scrapy feeds vs Firecrawl API)
- Rate limiting comparison (webscrape token bucket vs Crawlee built-in)
- Anti-detection detail: WEbscrape has 4 profiles (Chrome/FF/Safari × Win/Mac), no fingerprint randomization, no TLS fingerprint, no canvas/WebGL spoofing, no navigator property randomization, no captcha solving, no residential proxy
- Crawlee has human-like fingerprints, Browserless has BrowserQL, Firecrawl has residential proxies + stealth
- 100k+ stars for competitors, 300+ releases for Scrapy
- Not in README: specific tool names (Crawlee, Playwright, Puppeteer, Cheerio, Scrapy, Firecrawl, Browserless) beyond the general mention
- Runtime support comparison: Node.js >= 26.2.0, Bun >= 1.4.0, Python, Rust
- 23.7k Crawlee stars, 90.5k Playwright, 94.5k Puppeteer, 30.4k Cheerio, 62.1k Scrapy, 130k Firecrawl, 13.3k Browserless

FILE: 36.computational.memory.md
- 7-tier memory architecture diagram (memory layers)
- Memory engine core code with MemoryEngine class, load/persist/release/safeLoad methods
- Memory Object interface with id, buffer, size, type, createdAt, metadata
- Compute Result interface with id, payload, mimeType, metadata, processingTimeMs, memoryUsedBytes
- 7 loading/persisting backends (github, gitlab, forgejo, gitea, huggingface, kaggle, modelscope, filehosting)
- Performance characteristics: load latency, process throughput, persist latency, memory overhead (~2x), max capacity (unlimited)
- Error handling with try-catch and contextual error logging
- Storage Backend Factory class with switch statement for all 8 backends
- 3 use cases: large file processing, ML model inference, browser session memory
- 100+ lines of actual code in MemoryEngine class
- No mention in README of these specific backends or memory strategies

FILE: 37.deploystrategy.md
- 7 deployment strategies: Netlify, Vercel, GitHub Actions, GitLab CI, Forgejo Actions, Gitea Actions, Docker/VM
- Netlify config: netlify.toml with build, redirects, headers
- Netlify env vars: SBOT_TOKEN, SBOT_PLATFORM, SBOT_MEMORY_BUCKET, SBOT_WEBHOOK_SECRET, SBOT_CDN_URL
- Vercel config: vercel.json with builds, routes
- Vercel env vars: VERCEL_REGION, SBOT_MEMORY_ENGINE
- GitHub Actions workflow: .github/workflows/saddle-robot.yml with triggers, permissions, env, deploy steps, artifact upload
- GitHub App config: permissions (contents, pull-requests, issues, actions, metadata, webhooks)
- GitLab CI: .gitlab-ci.yml with stages, deploy, execute, store jobs, variables
- Forgejo Actions: .forgejo/workflows/saddle.yaml with schedule, push triggers, steps
- Gitea Actions: .gitea/workflows/saddle.yml with schedule, execute steps
- Docker Compose: full config with saddle-robot and saddle-db services
- Dockerfile: multi-stage with chromium, npm ci, COPY, HEALTHCHECK
- HTTPS communication between sites: certificate validation, SSL options
- Decision matrix with 7 strategies and their pros/cons
- No mention of these deployment configs

FILE: 38.flow.md
- High-level pipeline: scrapeUrl() → AgentBrowser → navigate → scroll/extract → serializeResult() → formatForAgent()
- URL scraping path: scrapeUrl(url) → AgentBrowser.launch → navigate → scroll → html → extractContent → ScrapeResult
- HTML scraping path: scrapeHtml(html) → extractContent → ScrapeResult
- Browser reuse path: scrapeWithBrowser(browser, url) → navigate → html → extractContent → ScrapeResult
- Data flow: Cheerio.parse(html) → Title, Author, Text, Links, Images, Tables, Metadata
- Serialization flow: resolveFormat → resolveExtension → markdown (Turndown) / json (stringify) / xml (xml2js) / redis (JSON.SET) / text (strip tags + join)
- Agent output flow: formatForAgent() → summary + key points + URLs + chunks + tokenCount
- 3 execution paths in detail
- No mention in README of these specific pipeline flows

FILE: 39.multi.platform.bot.md
- 5 platform adapters: GitHub (GitHub App + OAuth), GitLab (personal access token), Forgejo (GitHub-compatible), Gitea (GitHub-compatible), Discord (bot token + HTTPS)
- GitHub adapter: type, authenticate, listRepos, getRepo, createIssue, createPR, addComment, createWebhook, executeWorkflow, uploadReleaseAsset
- GitLab adapter: type, authenticate, listProjects, getProject, createIssue, createMergeRequest, addComment, createWebhook, triggerPipeline, uploadFile
- Forgejo adapter: extends GitHubAdapter, customBaseUrl
- Gitea adapter: extends GitHubAdapter, customBaseUrl
- Discord adapter: type, authenticate, sendMessage, createWebhook, executeWebhook, addReaction, createThread
- Unified Bot Interface: start, stop, executeCommand, handleWebhook, scheduleTask, getStatus
- Bot Config: platforms, memoryEngine, deploy, logging
- Bot Commands: capture, scrape, review, deploy, memory, status, test, release, webhook, schedule, npm publish, artifact
- Webhook JSON configs for GitHub and GitLab
- Deployment per platform: GitHub (Actions + NPM), GitLab (CI + Docker), Forgejo (Actions + Docker), Gitea (Actions + Docker), Discord (token + HTTPS)
- SafeAdapter class for error handling
- No mention in README of multi-platform adapter specifics

FILE: 40.npm.publish.md
- Full package.json with exports, scripts, repository, keywords, author, license
- NPM publishing steps: build, test, lint, typecheck, prepublishOnly, login, publish
- Pre-publish checklist
- As library (npm install) and CLI (npm install -g, saddle --command)
- Binary entry point: saddle.js
- Scoped package structure: @devthinking/saddle/
- Versioning strategy: semver (patch/minor/major)
- 10-step pre-publish checklist
- No mention of these npm details

FILE: 41.o.que.falta.md
- 30+ specific gaps prioritized P0-P3
- Anti-detection: no stealth plugin (playwright-extra-plugin-stealth already in optionalDependencies but not used), no fingerprint randomization, no TLS fingerprint rotation, no canvas/WebGL spoofing, no navigator property randomization, no captcha solving, no residential proxy
- Persistent queue: Set<string> in-memory + Array, no SQLite/Redis, no crash recovery
- Docker: no Dockerfile, no docker-compose.yml, no Container deployment
- MCP server: no integration
- Session persistence: in-memory only
- Zod schema extraction: no validation of schema
- PDF generation: no implementation
- Configurable token prices: hardcoded 2024 values
- Webhook support: no notification system
- Video extraction: no support
- Mobile emulation: no implementation (but Playwright supports it)
- Tracing/debug: no implementation
- Adaptive rendering cache: no caching
- Week-by-week roadmap (1 week, 2-3 weeks, 3-4 weeks)

FILE: 42.pesquisa.concorrencia.md
- 7 comprehensive competitor analyses: Crawlee, Playwright, Puppeteer, Cheerio, Scrapy, Firecrawl, Browserless
- Each with: website, GitHub stars, license, language, npm dependents
- Detailed architecture for each competitor
- Key features: Crawlee (persistent queue, auto-scaling), Playwright (cross-browser, auto-wait), Puppeteer (CDP, WebDriver BiDi), Cheerio (1.8m dependents), Scrapy (middleware pipeline, Scrapyd), Firecrawl (AI agent endpoint, OCR), Browserless (Docker-first, 90-day sessions)
- Feature comparison table with 10 metrics, webscrape wins AI/LLM, token estimation, chunking, llms.txt, cross-runtime
- Architecture insights: Crawlee's separation of concerns, Scrapy's middleware pipeline, Firecrawl's API-first, Browserless's Docker-first
- 10 critical gaps in webscrape with specific implementation recommendations
- GitHub stars: Crawlee 23.7k, Playwright 90.5k, Puppeteer 94.5k, Cheerio 30.4k, Scrapy 62.1k, Firecrawl 130k, Browserless 13.3k
- 6 releases for Crawlee, 300+ for Scrapy, 134 for Crawlee, Firecrawl ~50 releases, Browserless 655 releases

FILE: 43.plan.universal.architecture.md
- 29 modes across all environments (browser, no browser, Node.js, no Node.js, web, no web, server, no server, script, no script, desktop, no desktop, with IA, without IA, with memory, without memory, with desktop, without desktop, etc.)
- Full directory structure (25 modules, 29 files)
- Strategy cascade architecture with 3 levels
- 15 new modules with specific interfaces and code examples
- Errors hierarchy with 7 error types
- Events system with 10 events using emittery
- Memory engine with 4 submodules (fetch, browser, scrape, extract)
- 15 production dependencies (zod, p-retry, p-limit, p-queue, etc.)
- 12 packages to remove (inquirer, ink, chalk, etc.)
- 7 optional packages to add (playwright, playwright-extra, puppeteer-extra-plugin-stealth)
- Build configs: tsconfig.json, vite.config.ts, package.json
- 9 execution phases with subagent parallelism
- 29 module names and their descriptions
- No mention in README of the universal architecture plan

FILE: 44.reference.md
- Reference index for all saddle robot docs
- 18 historical research docs (RESEARCH-01 through RESEARCH-15)
- 3 decision transcripts (docs/talks)
- 1 JSON movement log file (docs/logs)
- 6 project sections: Planning Documents, Historical Research, Decision Transcripts, Logs
- Architecture Rules (no src/, no deep nesting, lowercase, JSDoc, 20 related logics per file)
- Key concepts: Computational Memory, Multi-Platform Bot, Deploy Strategies, SCDN Integration, NPM Publishing
- License: MIT
- No mention of these specific docs

FILE: 45.robotarchitecture.md
- Agent Browser Engine: 3 types (virtual mouse, click coordinates, scroll events, keyboard input, screenshot capture, session recording)
- Captcha bypass: 3 types (hCaptcha, Cloudflare Turnstile, reCAPTCHA), success rates
- Multi-Platform Bot Engine: 5 platforms with adapter interface
- Computational Memory System: 4 memory layers, storage-to-compute transformation
- Memory Engine API with 4 methods (loadFromStorage, process, persist, release)
- Architecture Diagram showing all components
- 6 deploy strategies: HTTPS between sites, GitHub/GitLab/Forge pipelines, Docker/VM
- NPM Package Publishing: structure, as library vs binary, SCDN integration
- Research Status: 6 components (agent browser, captcha bypass, sandbox/VM, memory engine, multi-platform bot, deploy strategies, SCDN integration)
- Decision Log, License: MIT
- No mention of these specific architecture details