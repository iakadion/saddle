# Saddle

Binary computing agent, agent browser, computer-use, scraper and packager.

> **Storage turned into memory.** Saddle runs on other people's computers (GitHub Actions, Forgejo, Gitea, GitLab, Codeberg, free Docker containers) and turns unlimited third-party storage buckets into virtual RAM/GPU/CPU. **Nothing runs on the operator's local machine.** Ships as a library, CLI, binary, n8n node, CRX extension, Android/iOS and Tauri desktop app. Package `@devthink/saddle` — published to npm, GitHub Packages, Maven, NuGet, RubyGems and GitHub Containers (auto-mirrored to jsDelivr). It is simultaneously **sandbox + virtual machine + webhook server + workflow orchestrator (n8n-style) + packager + deployment system + integration platform** — sometimes each *is* the other three; the virtual VMs expose vCPU/VRAM/vGPU/virtual processing to the user, 100% on the internet, 100% virtual.

This document is the single source of truth, arranged as a progressive arc: **Foundation (1–6)**, **Engine (7–17)**, **Productization (18–31)**. Nothing here is attributed to external tooling; it is the project's own architecture.

## Foundation

### 1. What Saddle Is

A **virtual machine you publish as a package**. Core thesis: **storage bytes and compute-memory bytes are the same bytes** — the only difference is a *usage flag* (process vs keep). A Node.js framework runs on other people's runners, loading storage buckets as virtual RAM/GPU via a storage→RAM bridge. The operator only owns: accounts, the published repo/package, and the automation breadboard.

- **Agent Browser** — Brave capture, movement replay, session recording, binary computing.
- **Computational Memory** — repos / Hugging Face / Kaggle / S3 → virtual RAM/GPU; published as a package.
- **Captcha Bypass** — hCaptcha, Cloudflare Turnstile, reCAPTCHA (VLM ONNX + token APIs).
- **Multi-Platform Bot** — GitHub, GitLab, Forgejo, Gitea, Discord, Telegram, Reddit, HF via a unified adapter.
- **Compute Backends** — GitHub (4 vCPU / 16 GB, unlimited OSS minutes), Forgejo/Gitea self-hosted (unlimited), GitLab Free (400–800 min/mo, 10 GB), Codeberg + Woodpecker (750 MB FLOSS), HF Spaces (16 GB RAM, suspends after 48 h idle — keep-alive cron), HF ZeroGPU (~96 GB VRAM, a few min/day free), Kaggle (30 h/wk GPU T4/P100), ModelScope (2,000 calls/day + 2 notebook-VM accounts that run the engine directly on their compute), Oracle Cloud Always Free (2 OCPU / 12 GB ARM), free Docker containers. Provider chain: **oracle-cloud → github-actions → huggingface → gitlab-ci → kaggle** — the first free runner wins (`github-actions {cpu:4, ramGb:16, maxDuration:6h}`). GitHub Actions runners are owned by Microsoft — the *whole* chain runs on third-party hosts.
- **Storage Backends (virtual memory)** — HF (500 GB/file), Kaggle (200 GB/dataset), Terabox (1 TB, ×3 = 3 TB), R2, Telegram (2 GB/file Bot API), Discord (∞ via 8 MB chunks) — aggregated via rclone (70+ backends) into effectively unlimited disk that behaves as RAM/GPU.
- **Package Surfaces** — n8n node, CRX extension, Android/iOS (native or Ionic/Capacitor), Tauri desktop + Electron/Unity converts.

**Agent Browser (capture & replay):** the same engine records and replays human movement deterministically. Virtual mouse = CDP `Input.dispatchMouseEvent` + SVG cursor sprite with trail and click ripple; trajectory follows a Bézier curve with realistic speed phases (0–5% ramp 0.3×→2.5×; 5–75% cruise 2.3–2.5× with sinusoidal jitter; 75–100% ease-out 2.5×→0.3×; sub-pixel final drift σ 0.3–1.5 px), duration from Fitts's law `0.05 + 0.07·log2(1 + d/20)` s, ~15% overshoot on long moves. Typing = lognormal inter-key delay (μ=4.17, σ=0.3 → ~65 ms) with bigram speedup and ~2% typos; scroll = wheel with accel/decel + settle delay. Stealth patches `navigator.webdriver`→`undefined`, plugins/WebGL/canvas/audio, per-session coherent fingerprints.

**Session JSON (`docs/logs/<session>.json`)** — one reproducible artifact per session:

```json
{ "version": 1, "session": { "id": "sess_...", "agentName": "UKA-capture", "browser": "brave",
  "originUrl": "https://accounts.hcaptcha.com/demo", "seed": "session-42", "personality": "careful",
  "viewport": "1280x800", "startedAt": "…", "finishedAt": "…", "status": "passed" },
  "events": [ { "t": 12.4, "type": "move", "x": 312, "y": 480, "tx": 320, "ty": 500 },
              { "t": 220.1, "type": "click", "x": 320, "y": 500, "button": "left", "target": "#checkbox" },
              { "t": 540.0, "type": "scroll", "dx": 0, "dy": -120, "angle": 0 } ],
  "captcha": { "kind": "hcaptcha", "sitekey": "a9b5fb07-…", "passed": true, "solver": "vlm",
    "evidenceUrl": "https://res.cloudinary.com/uka/sess_…/hcaptcha.png" },
  "metrics": { "eventCount": 1284, "durationMs": 201000, "avgMouseSpeed": 2.3, "clickCount": 7 } }
```

Event types: `move | click | drag | scroll | key`; `drag` is typed `(t, x0, y0, x1, y1)`, `key` `(t, key="Enter", target)`, click carries `button:"left"|"right"`; coordinates in CSS px, `t` in ms relative; long move runs may be compacted; every log is reproducible from `seed` + `events`. `viewport` is an object `{width, height}`; ids look like `sess_01J9XEXAMPLE0001`. `replay.js` re-dispatches events in Brave at configurable speed; `d3` plots the mouse trail; evidence (screenshot/token/video via `ffmpeg-static`) goes to Cloudinary. Baselines: hybrid DOM+vision wins — OpenAI CUA 87% complex-JS (58% WebArena), Google Mariner 83.5% WebVoyager (84% ScreenSpot), browser-use 89.1%, OSWorld human 72.4% vs SOTA ~12–20%; WebArena top systems ~71%, production range 50–60%; Microsoft UFO² = Windows UI Automation + OmniParser (vision).

**Build gates:** planning + research complete; platform implementation begins only on explicit user go-ahead.

### 2. Core Principle: Storage == Compute

One rule underlies everything: **RAM and disk are the same construct** — `inode + dentry + file_operations` in VFS. Storage and RAM differ only by *backing*; a static repo file is `/usr /bin /lib`, a static site is the BIOS, a workflow trigger is the bootloader.

| Aspect | Storage | Compute memory | Same? |
|--------|---------|----------------|-------|
| Bytes | yes | yes | ✅ |
| Abstraction | VFS inode | VFS inode | ✅ |
| Difference | usage flag = keep | usage flag = process | only flag |

**Hard physical limit:** storage ≠ VRAM. VRAM is soldered (≈900 GB/s bus); remote storage has ~50–300 ms latency. Bucket-as-VRAM is impossible; bucket-as-VHD via FUSE is valid.

### 3. Repo-as-CPU & Repo OS

A git repo + CI runner is a **serverless function / virtual processor**.

| Piece | Role in the "computer" |
|-------|------------------------|
| Repo | Disk (persistent state in `docs/results/`) |
| CI | CPU (`workflow_dispatch` = function call) |
| Pages | Bus + CDN (static JSON as shared memory) |
| Static site | BIOS (~50 KB, triggers and polls) |
| `repository_dispatch` | IPC between repositories |
| `workflow_dispatch` | cross-repo API call — returns `run_id` since Feb 2026 |
| `workflow_call` / `workflow_run` | reusable / intra-repo chaining |

**VFS theory — "everything is a file":** process, memory, device and socket are all `inode + dentry + file_operations`. Docker OverlayFS (`lowerdir` read-only → `upperdir` writable → `merged`) and K8s `emptyDir`/tmpfs turn static filesystem into a running system. A VM is a static `qcow2`/`vmdk` + an emulator.

- **Magic bytes are the true type** (extension is UX): ELF `7F 45 4C 46`, PE `4D 5A`+`50 45 00 00`, PNG `89 50 4E 47 0D 0A 1A 0A`, ZIP `50 4B 03 04`. The loader **reads magic bytes → picks parser → maps to RAM → executes**; "10 GB RAM and 600 GB storage" are the same gigabytes, with 1-bit/4-bit quantization as the fallback to squeeze models into that budget.
- **VM-as-file:** v86 boots Linux from a static ISO on Pages (`seabios.bin` + cdrom `linux.iso`); WebContainers run Node-in-WASM with a SharedArrayBuffer FS (needs COOP/COEP — `coi-serviceworker` shim + `.nojekyll`).
- **RAM-ified git:** `git clone --separate-git-dir=/dev/shm/repo.git` + `mount -o bind /dev/shm/repo /mnt/repo` runs a working copy fully in RAM; browsers only ever read a **256-byte preview** via `File API slice` (never the full binary). OverlayFS `copy_up` copies a whole file lower→upper on first write.
- Each static file is a handler: `api/queue.json` as message queue, `dumps/incoming/` as binary inbox.

**Storage → RAM (inside a runner):**

```bash
fallocate -l 16G /mnt/swapfile && mkswap /mnt/swapfile && swapon /mnt/swapfile  # disk → RAM
mount -t tmpfs -o size=8G tmpfs /mnt/ramdisk                                    # RAM → fast disk
modprobe zram && echo 8G > /sys/block/zram0/disksize && mkswap /dev/zram0 && swapon /dev/zram0  # 2–3× compression
```

Heavy work runs in `/mnt/ramdisk`; results commit to `docs/results/` and are served via Pages/CDN. The client only does `File` API slice + base64 + `fetch`.

**mmap — one buffer, two roles:** `mmap(MAP_SHARED)` maps a storage file directly into the process address space — the *same* bytes are simultaneously storage and RAM; `mmap.sync()` flushes RAM→storage; file grows via `ftruncate`. Libraries: `@riaskov/mmap-io`, `@cloudpss/mmap` (`/dev/shm`), memfs/unionfs, `@platformatic/vfs` (SQLite-backed VFS), paged-buffer (64 KB pages, ~50 pages ≈ 3 MB resident).

**Persistent liquid sandbox (`storage.bin`):** CI downloads the previous `storage.bin` artifact → mmaps it → CDN packages (`https://esm.sh/…`) fetched and written into the buffer → container runs (8 GB RAM + 8 GB storage) → `bridge.sync()` flushes RAM→storage → artifact re-uploaded (7-day retention) → next session resumes exactly where it left off.

### 4. Multiforge & Distributed Compute

Mirroring the engine across forges multiplies free quota.

| Forge | Minutes | Storage | Role |
|-------|---------|---------|------|
| GitHub Public | unlimited (OSS), 6 h/job, 20 concurrent jobs | 500 MB artifacts, 10 GB cache, 1 GB Pages | primary |
| Forgejo self-hosted | unlimited (your HW) | unlimited | mirror |
| Gitea self-hosted | unlimited | unlimited | mirror |
| Codeberg + Woodpecker | unlimited FLOSS | 750 MB soft | OSS backup |
| GitLab Free | 400 min/mo | 10 GB/project | Pages fallback |
| HF Buckets | — | 500 GB/file, 100 GB private | AI storage |
| Kaggle | — | 200 GB/dataset (10 = 2 TB) | datasets |

**Farm:** `n` worker repos × 500 MB = distributed storage (`100 opencode-worker-N` repos × 500 MB = **50 GB**); a controller (`scripts/farm.py`) dispatches `workflow_dispatch` (`{job_id, filename, action: run}`, and `binary_url` in the V3 draft) and breaks at the **first free runner (`204 Accepted`)** — not blind round-robin. Parallel repo-related push ≈ 4× compute. Real workflow file set: GitHub `.github/workflows/{process-binary,opencode-runner,dump-processor,pages,cleanup,thirdparty-only}.yml`; Forgejo `.forgejo/workflows/{forgejo-heavy,thirdparty-only}.yml`; Gitea `.gitea/workflows/saddle.yml`; Codeberg `.woodpecker/deploy.yml`; GitLab root `.gitlab-ci.yml` (hard-coded `heavy_processor` + `pages` jobs). `opencode-runner.yml` listens on `repository_dispatch` type `opencode-run` + `workflow_dispatch` (inputs `session_id`, `prompt`, model default `opencode/gpt-5`) → installs opencode via `curl -fsSL https://opencode.ai/install | bash` → `opencode run --format json` → `.opencode/results/{session_id}.json`. `cleanup.yml` (cron `0 0 * * 0`) deletes artifacts older than 7 d via `actions/github-script@v7` (`listArtifactsForRepo` + `deleteArtifact`). `thirdparty-only.yml` forces `ubuntu-latest` public, never self-hosted. Multi-forge paths: GitHub `.github/workflows/`, Forgejo/Gitea `.forgejo/`/`.gitea/workflows/`, Codeberg `.woodpecker/`, GitLab `.gitlab-ci.yml` (`saas-linux-small-amd64` default tag, `medium` when RAM>8 GB). Forgejo Actions ≈95% GitHub-Actions compatible (Gitea ≈90%, both self-hostable ≥512 MB).

**Runner facts:** GitHub `ubuntu-latest` 4 vCPU/16 GB/14 GB SSD, public = unlimited minutes, max 6 h/job, 20 concurrent, artifacts ≤500 MB cleaned after 7 days (cleanup.yml), 2026 small runner = 1 vCPU/5 GB/15 min; Codeberg labels `codeberg-small` 2 CPU/4 GB/5 min (−medium 4/8/10 min); GitLab size classes small 2vCPU/8GB → 2xlarge 32/128 GB. Codeberg: 750 MB git + 1.5 GB LFS/packages; GitLab Pages 100 MB limit (separate Registry); GitLab cache 5 GB/14 d, artifacts unlimited/30 d default; GitHub LFS free 1 GB storage + 1 GB bandwidth/mo; GitHub cache 10 GB retained 7–90 d.

**Env vars:** `SBOT_TOKEN`, `SBOT_PLATFORM`, `SBOT_MEMORY_BUCKET`, `SBOT_WEBHOOK_SECRET`, `SBOT_CDN_URL`, `SBOT_SCDN_*`, `VERCEL_REGION`, `SBOT_MEMORY_ENGINE` (ram/storage/bucket), `HF_TOKEN`, `KAGGLE_USERNAME/KEY`, 3 × Terabox remotes, plus `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `INIT_SECRET`, `SELF_URL`, `GITHUB_TOKEN`, `GITLAB_TOKEN`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENCODE_SERVER_PASSWORD`; secret-size limit 48 KB → base64 via `AnimMouse/setup-rclone`. Gitea runner: `GITEA_INSTANCE_URL` + `GITEA_RUNNER_REGISTRATION_TOKEN` with `gitea/act_runner:latest`.

### 5. Storage Backends & Sync

| Backend | Limit / pattern | CLI |
|---------|-----------------|-----|
| rclone | 70+ backends (S3, R2, WebDAV…); install `curl https://rclone.org/install.sh \| sudo bash`; `rclone copy … --progress --transfers 8` | `rclone copy/sync`, `rclone serve http` (local CDN, `--addr :8080`) |
| S3 / R2 | object store, key `s3://bucket/uuid`; R2 free 10 GB + 10 M ops, 5 GB file | `rclone` |
| Hugging Face | free unlimited best-effort; 10 TB public + 1 TB private PRO **$9/mo**; 500 GB/file via Xet | `HfApi.upload_folder`; browser-raw `https://huggingface.co/datasets/{id}/resolve/main/<file>` (dataset viewer = better for binaries) |
| Kaggle | **private total 200 GB, public unlimited**; 50 top-level files; egress free via CDN; metadata `dataset-metadata.json` (title/id/licenses:[mit]/resources) | `kaggle datasets create -p … --dir-mode tar`, `kaggle datasets version -p … -m "<msg>"` |
| Terabox | 1 TB/account, 4 GB/file free (20 GB premium, **300 files/transfer**); multi-cloud sync `rclone sync terabox1:… huggingface:/kaggle:` | `split -b 200M` named `.bin.js` packaging |
| npm | 250 MB tarball/version (`npm pack --dry-run` preview); jsDelivr/UNPKG/esm.sh unlimited CDN; chunks renamed `.bin.js` **to escape the npm binary-content scan** | `npm publish --access public` |
| Cloudinary | heavy media (video/screenshots/large JSON; mp4/webm replays, before/after challenge shots, click masks); DB stores only `url` + `cloudinaryId` | `cloudinary.uploader.upload` `{resource_type:"auto", folder:"uka/<folder>"}` |
| Telegram / Discord | Telegram 2 GB/file Bot API (4 GB premium) via telethon/pyrogram (TeleSync, teledrive); Discord ∞ via 8 MB chunks (25 MB base / 500 MB Nitro), discord-fs FTP-over-Discord | chunker + mesh |

**Free pool (no own machine):** GitHub 500 MB + HF ~10 TB + Kaggle 20 TB + Terabox 3 TB + npm ~unlimited + Turso 9 GB ≈ **>33 TB**. SQL sharding: `shards=[drizzle(URL_1),drizzle(URL_2)]; getShard(k)=shards[Bun.hash(k)%n]` (40 shards × 3 GB = 120 GB, or **400 shards = 1.2 TB** via HTTPS-only, no git push). Multi-cloud sync: Terabox → HF → Kaggle. **rclone hidden-RAM risk:** mounting large trees can grow driver RAM from ~1.8 GB to >7 GB (OOM) — prefer `--vfs-cache-mode full` + `--memory` limits.

**npm chunk-as-package CDN farm:** `split -b 200M binary.wasm chunk-` → rename to `chunk-NNN.bin.js` → `npm publish @seuuser/assets-001…` → `https://cdn.jsdelivr.net/npm/@seuuser/assets-001@1.0.0/dist/chunk-NNN.bin.js` → fetch, rebuild in tmpfs, execute. 1 GB = 4 packages; 10 packages = 2.5 GB on a global CDN.

**10 CDNs with free egress:** jsDelivr (NPM+GitHub, 50 MB GH / 100 MB npm, unlimited bw, purge API `https://purge.jsdelivr.net/gh/user/repo@tag/file` — "the free S3") · UNPKG (npm, ~100 MB, unlisted-package use for private config/JSON) · esm.sh (NPM+JSR+GitHub, TSX→JS on edge, `?bundle&min&target`, **no hard file-size limit**) · cdnjs (curated, 50 MB/file) · Statically (GH+GL+BB, image CDN `?w=` `?f=webp`) · GCore (1 TB/mo free) · Cloudflare R2 (10 GB free, 10 M ops, free egress) · Backblaze B2 (10 GB, 1 GB/day) · Supabase Storage (1 GB) · HF Hub CDN (free unlimited egress). Skypack is deprecated — use esm.sh; `esm.unpkg.com` adds ESM+bundling to UNPKG.

### 6. Memory Engine

The bridge that loads storage objects into compute memory (RAM/GPU), transforms, processes and persists results back.

| Method | Behavior |
|--------|----------|
| `load(key)` | iterates backends, returns first hit as compute buffer; throws on error |
| `persist(key, data)` | writes to **all** configured backends |
| `release(key)` | deletes from in-memory `Map` |
| `safeLoad(key)` | wrapped `load` → `{ success, data?, error? }` |

Object shapes: `MemoryObject{id, buffer, size, type, createdAt, metadata}`; `ComputeResult{id, payload, mimeType?, metadata?, processingTimeMs, memoryUsedBytes}`. Backend targets are declared per type: `RepoStorageTarget{platform,owner,repo,branch,path,token}`, `HFStorageTarget{space,revision}`, `KaggleStorageTarget{dataset,ssl_verification}`, `ModelScopeStorageTarget{namespace,repo}`, `FileHostingStorageTarget{host,path,method: upload|s3compatible|webdav}`; factory throws on unknown type. Error contract: `MemoryEngine.load failed for key "{key}": {error}`; `transformToStorage` defaults MIME to `application/octet-stream`. Use-case URIs: `repo://my-repo/large-file.bin`, `repo://models/my-model/weights.bin`, `repo://saddle/sessions/session-001.json`.

Transforms: `transformToCompute` (~2× overhead) and `transformToStorage`. Backends (factory): `github`, `gitlab`, `forgejo`, `gitea`, `huggingface`, `kaggle`, `modelscope`, `filehosting` (s3compatible / webdav). Repository is primary; HF/Kaggle/ModelScope/terabox(s) secondary.

**Memory capacity model (8 GB box):**

| Layer | Size |
|-------|------|
| kernel/OS | ~500 MB |
| Docker runtime | ~200 MB |
| WASM runtime | ~100 MB |
| Firecracker overlay | ~50 MB |
| app | ~2 GB |
| sandboxes | ~4 GB |
| cache | ~1.15 GB |

**Memory tiers (by preference):** ram (~100 ns) · zram (~500 ns) · tmpfs (~1 µs) · mmap (~5 µs) · sqlite (~10 µs) · r2 (~50 µs), auto-scaled by size (<64 MB → memfs; <1 GB → mmap; larger → SQLite/R2).

**Tuning:** `sysctl vm.swappiness=180 vm.page-cluster=0` → zram 3:1 (8 → 24 GB effective); tmpfs sizes must be explicit (default ½ RAM); `--tmpfs /tmp:size=2G` as RAM-storage in containers; `/dev/shm` is already tmpfs in runners.

---

## Engine

### 7. Memory Modes & Tiers

| Tier | Type | Source | Capacity |
|------|------|--------|----------|
| L1 | RAM | System | Limited, ephemeral |
| L2 | VRAM | GPU | Limited, compute-bound |
| L3 | Storage RAM | Repositories | Practically unlimited |
| L4 | External buckets | HF / Kaggle / Terabox / R2 | Unlimited |

Memory forms (annotated): internal — always supported, the baseline · external — repos, HF, Kaggle, S3, R2, Terabox · physical — runner RAM via swap/tmpfs/zram · vectorized — embeddings, supports **averaging / ensemble across shards** · library — shared via npm/Maven/NuGet/RubyGems/GHCR.

Every operational mode works **without and with** its pair — the engine is never locked to one form: computer · library · application · browser · desktop · mobile · extension · cli · binary · headless · physical file · vector file · internal/external file · internal/external dependency. Same for memory: internal, external, physical, vectorized, library — all work with or without.

### 8. Database & SQL

Drizzle ORM + `mysql2` (Turso/libSQL and Prisma/Neon as alternates). DB is **created at deploy**, never local sqlite — though `drizzle-kit generate`/`migrate` run in the build script (`"build": "drizzle-kit push && next build"`) for edge-safe migration. Columns: `BIGINT` (pointer, >2 GB), `INT` (chunk_index), `TEXT` (`s3://bucket/uuid`), `JSON` manifest, `BYTEA`/`LONGBLOB` (1 MB chunk). **Guardrail:** never put TB in one row — always chunk; base64 in DB is an anti-pattern (+33%). Postgres limits: `varlena` TOAST 1 GB, table 32 TB, `pg_largeobject` 4 TB/OID; MySQL `LONGBLOB` = 4 GB, row < 65 KB.

```sql
CREATE TABLE files (id BIGSERIAL PRIMARY KEY, size_bytes BIGINT, storage_key TEXT, hash TEXT, metadata JSONB);
CREATE TABLE file_chunks (file_id BIGINT REFERENCES files(id), chunk_index INT, data BYTEA, PRIMARY KEY(file_id, chunk_index)) PARTITION BY HASH(file_id);
```

**Operational tables (drizzle/mysql-core):** `sessions` (id text PK, agent_name, browser default `"brave"`, origin_url, status default `"running"`, seed, timestamps; idx on status) · `events` (session_id FK cascade, t float, type, x/y float, data text; idx on session_id) · `captcha_results` (session_id FK cascade, kind, sitekey, token, passed bool, solver, evidence_url) · `assets` (session_id FK cascade, kind, cloudinary_id, url, bytes). Prisma mirrors the same four models with cascade `onDelete`.

**V6 Prisma models (file-as-compute):** `Site` (id, domain unique, plan default hobby, storagePointer BigInt) → `File` (name, mime, size BigInt, sizeInt UI cache, chunkCount, sha256, metadata Json `{originalRepos[1..10], cdnUrls[]}`) → `FileChunk` (index 0..599, byteOffset BigInt = index × 1,048,576, size 1_048_576, data Bytes optional + `dataBase64 Text` fallback for D1/Turso, repoId 1..10, repoUrl raw.githubusercontent, cdnUrl cdn.jsdelivr.net, nextChunkId linked-list, checksum; `@@unique([fileId,index])`) → `ComputeJob` (type REBUILD|EXEC|TRANSPILE, status queued/running/done, priority, ramdiskPath `/mnt/ramdisk/job…/rebuilt.bin`, resultJson `{stdout,timeMs,ramUsed}`, resultUrl).

**SQL frameworks (chunk-as-blob per provider):** Prisma (`bytes`→bytea/longblob) · Drizzle (`customType` bytea, light, type-safe) · TypeORM (`bytea`/`longblob`) · Sequelize (`BLOB('long')`) · Knex (`binary('data')`) · better-sqlite3 (sync) · mysql2 (LONGBLOB) · pg (bytea + large objects) · MikroORM (+DataLoader) · TypeDORM (DynamoDB-style). Prisma `driverAdapters` preview + `previewFeatures` for Postgres.

**Free third-party SQL tiers:** Turso (9 GB / 500 DBs / **500 M rows read**; CLI `turso db create <name> --group default` + `turso db shell … "CREATE TABLE dumps (id TEXT, data BLOB)"`), Neon (0.5 GB → **1 project / 100 h compute**, scale-to-zero, billed only on use), Supabase (500 MB DB + 1 GB storage + 2 GB bandwidth), PlanetScale, Cloudflare D1, Deta, Fly.io SQLite. Paired with `mysql2`, `better-sqlite3`, `@libsql/client` (local file + `syncUrl: libsql://`), `pglite` for in-memory PostgreSQL, and **`node:sqlite` `DatabaseSync`** (Node 22+, `PRAGMA journal_mode=WAL / synchronous=NORMAL / cache_size=10000 / temp_store=MEMORY`) as a zero-dependency RAM/storage bridge. Drizzle generated columns (`VIRTUAL vs STORED`) support in-memory computed fields.

### 9. File-as-Compute

Published site + Prisma schema stores everything as tables. `Site` (JSON data) → `File` (storage pointer, `BIGINT` size) → `FileChunk` (1 MB/row) → `ComputeJob` (queued/running/done; `runner: github|forgejo|codeberg`).

**Flow:** browser drags a 600 MB `binary.wasm` → sliced into 600 × 1 MB chunks across 10 worker repos (60 chunks/worker) → `ComputeJob` queued (`runner: github|forgejo|codeberg|gitlab|huggingface`) → worker `SELECT`s chunks, rebuilds in tmpfs 8 GB, runs via WASI/Node → result back to the FileChunk table or an R2/CDN `storageKey` (jsDelivr) → browser polls `GET /api/jobs/:id`.

**Pointers (TB scale):** `BigInt` id = 9×10¹⁸ files; `BigInt` size >2 GB; `BYTEA` ≤10 MB inline (else chunked); `storageKey` = `s3://bucket/uuid`. `nextChunkId` linked list keeps order; `repoId` 1..10 distributes under provider caps.

### 10. Content Types & API Communication

The API accepts **any content type** — nothing is locked to one format. Sites, protocols and techniques talk to each other over HTTPS the way an LLM API does: **request in → response streamed → done**. Every exchange is a request/response pair that can arrive as JSON, an event stream, a stream of blocks/numbers/payloads, or raw bytes.

| Media type | Role | Where |
|-----------|------|-------|
| `application/json` | primary requests/responses, dispatches, webhooks, job payloads | `POST /v1/scrape`, `workflow_dispatch`, `site`↔`site` |
| `text/event-stream` (SSE) | progress streaming, LLM-style responses | `/v1/event`, `/session/message`, TUI, frontend |
| `application/x-ndjson` (JSONL) | append-only event log, traces, sessions | `~/.local/share/opencode`, `docs/logs/*.jsonl`, audit |
| `application/ld+json` (JSON-LD) | structured data embedded in HTML | extraction, Schema.org |
| `multipart/form-data` | file & evidence upload | HF Spaces, asset evidence |
| `application/octet-stream` | binary chunks (1 MB); base64 0x8000 during upload | FileChunk, SCDN, binary run |
| `application/javascript` | ESM modules served from CDN | zero-install execution |
| `image/png` / `video/mp4` / `markdown` | evidence, replays, serialized output | Cloudinary, serialization |

**Request → stream → response (LLM-style):**
```
client ──POST /v1/scrape──► API ──(validate, open stream)──► worker
      ◄────────── 200 text/event-stream ──────────
event: message  data: {"block":1,"kind":"status","value":"running"}
event: message  data: {"block":2,"kind":"content","value":"..."}
event: done     data: {"job":"sess_123","status":"completed","resultUrl":"https://cdn..."}
```
- Each **block** carries a payload (string | number | JSON | Buffer); every event may be a number, a byte-chunk, or a JSON object.
- Retries are at-least-once, idempotent via `request_id`.
- Streams: SSE `text/event-stream` (30 s keepalive, reconnect — `proxy_buffering off` required) · WebSocket (30 s heartbeat, `socket.io` in `web/server.js`) · NDJSON lines.

**Reference protocol (server, port 4096):** `GET /doc` (OpenAPI 3.1) · `GET /global/health` → `{healthy}` · `GET /global/event` (SSE `ReadableStream`, `Cache-Control: no-cache`) · `POST /session/create` → then `session.prompt` SSE · `/tui/*` (`append-prompt`, `submit-prompt`, `execute-command`, `show-toast`). Sessions are append-only JSONL under `~/.local/share/opencode`; CLI flags `--format json`, `--variant high|xhigh|max`. Auth `Basic opencode:<password>`; SSE needs `proxy_buffering off` (Nginx `X-Accel-Buffering: no`), Cloudflare free idle ~100 s → keep-alive 30 s, browsers cap ~6 SSE connections per origin.

**Interop across sites and protocols:** `web` ↔ runner ↔ worker ↔ vault (Netlify/Vercel/HF) cross every hop with the **same JSON payload**. Protocols: HTTP (REST, webhooks) ↔ HTTPS (dispatches) ↔ git (3-step write: `blob → tree → commit`) ↔ WS/SSE (realtime) ↔ WebDAV/S3 (storage) ↔ CDN (esm.sh/jsDelivr). The same content-type contract passes through capture → serialize → compute → store → serve.

### 11. Request Strategies & Resilience

| Method | Use in Saddle | When |
|--------|---------------|------|
| `GET` | fetch/crawl, `/health` | read pages |
| `POST` | `/v1/scrape`, `/v1/batch`, login, webhooks, dispatches | create / send data |
| `PUT` | upload/replace (SCDN) | full replace |
| `PATCH` | update job/session fields | partial modify |
| `DELETE` | revoke session, delete CDN asset | remove |
| `HEAD` | existence / `Content-Length` before download | probe |
| `OPTIONS` | CORS preflight | cross-origin check |
| `CONNECT` | HTTPS proxy tunnel | proxy |
| `PROPFIND`/`MKCOL`/`COPY`/`MOVE`/`LOCK` | WebDAV | remote storage |
| `SUBSCRIBE`/`NOTIFY` | pub/sub | progress streaming (pre-WS/SSE) |
| `TRACE` / `PRI` | diagnostics / HTTP/2 stream priority | debug, QoS |

**fetch:** universal `fetch` across Node/Bun/Deno/Workers/browser — no local cross-protocol shim. Timeout via `AbortController`.

**Retry & backoff** (transient only: `429 500 502 503 504 408 409`, plus Cloudflare `520–530`): exponential + jitter (with `linear`/`constant` variants), honor `Retry-After > X-Retry-After > X-Rate-Limit-Reset` (+10% margin); never retry `400 401 403 404 410 422 451` — stop/fix. Network codes that force a retry: `ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`, `ENOTFOUND`. Combine with circuit breaker `CLOSED → OPEN → HALF_OPEN` (`failureThreshold: 5`, `resetTimeout: 60000`) and **Saga** compensations for multi-step ops. Hooks lifecycle (ky/ofetch): `beforeRequest` / `afterResponse` / `beforeRetry` / `beforeError` (`retry:3 retryDelay:1000 backoff:2^n·1000`).

**Webhook idempotency (at-least-once):** key = `X-GitHub-Delivery` / `eventId` stored before processing; duplicates dropped. Validate signatures with HMAC before trust; inspect `X-RateLimit-Limit/Remaining` and batch calls.

**Git writes = 3 atomic steps** via REST: push `blobs` → reference in `trees` → point `commits` to the tree. OCI registries (GitHub/GitLab Packages) double as **universal content-addressed storage** (`oras push`; Chainloop proofs).

### 12. Anti-Detection & Stealth

| Category | Signal | Risk |
|----------|--------|------|
| Browser | `navigator.webdriver`, Canvas/WebGL/Audio, `languages`, `hardwareConcurrency` | High |
| Browser (extended) | `window.chrome`, `navigator.connection`, `navigator.credentials`, WebGPU (2024+) | High |
| Network | TLS JA3/JA4, HTTP/2, IP reputation | High |
| Hardware | `deviceMemory`, `maxTouchPoints` | Med |

**Fingerprint coherence:** 1 stable fingerprint per session, rotate only between sessions; OS↔UA↔engine mapping (Windows↔`Win32`↔Edge/Chrome, macOS↔`MacIntel`↔Safari, mobile↔touch, locale↔`Accept-Language`, timezone↔locale). **JA4** (FoxIO 2024, SHA-256, `t{TLSVer}{SNI}{CipherCount}{ExtCount}_{HashCiphers}_{HashExtensions}_{SigAlgs}_{ALPN}`, e.g. `t13d1516h2_8daaf6152771_e5627efa2ab5_c5e56a2154c7_0`) preferred over **JA3** (Salesforce 2017, MD5 of ClientHello, spoofable). HTTP/2 fingerprint = SETTINGS + WINDOW_UPDATE + PRIORITY frames (Chrome 125: `0|1|0|0|0|0|1|0|0|0|0`, WINDOW_UPDATE 15663105; Firefox 125 SETTINGS `0|0|0|0|0|1|0|0|0|0|0`, WINDOW_UPDATE 12517377). `patchright` (modified Chromium, TLS/HTTP2/CDP) >> JS-only stealth. Per-target breakdown (pass/fail): userAgent ✓ all; webdriver ✓ stealth/patchright/cloak; plugins ✓; WebGL ✓ patchright/cloak; TLS ✓ only patchright; HTTP2 ⚠ patchright/Cloak; CDP ⚠ patchright; `window.chrome` ⚠ patchright/Cloak.

**Stack:** `patchright` (recommended) + `crawlee` (`useFingerprints`, `SessionPool` maxSize 100 / usage 50 / age 3600, `fingerprintOptions` browsers chrome≥120/firefox≥120/safari≥17, devices desktop/mobile, locales en-US/en-GB/pt-BR/es-ES, screen 1366–1920) + residential proxies. 2026 benchmark (block 0–30, lower better): CloakBrowser 26/2 · patchright 24/4 · puppeteer-extra-stealth 18/10 · vanilla Playwright 26/2. Realistic distribution: Chrome 65% / Safari 18% / Firefox 12% / Edge 5%; OS Windows 55% / macOS 25% / Linux 15% / Mobile 5%; resolutions 1920×1080 31% (30%), 1366×768 20%, plus 1536×864 15% / 1440×900 10%. Versions: patchright 1.x, playwright 1.45+, puppeteer 22.x+ / extra 3.3.x / stealth 2.11.x, crawlee 3.x, tls-fingerprint 1.x. **`rebrowser-playwright` is unmaintained since 2024** — use patchright. CloakBrowser (~13.5k★, 2026): `createProfile({os, browser, screen, proxy})`, integrates Puppeteer/Playwright.

### 13. Proxy

| Protocol | Security | Note |
|----------|----------|------|
| HTTP / HTTPS | Low / Med | fast, DNS at client |
| SOCKS4 / 4a | Low | no auth / DNS at proxy |
| SOCKS5 / 5h | Med | auth; `socks5h` resolves DNS at proxy (no leak) — preferred |

Tiers: residential (low block, ~$15/1000) > **mobile 4G/5G** (social) > datacenter (high block, ~$0.50). **Rotation:** intelligent per-session/domain, least-used, tiered — never blind `proxies[i % n]`. **1 fingerprint = 1 proxy = 1 session.** Pool health: active (`httpbin.org/ip`), passive (error score; `failureThreshold: 3`, `recoveryTime: 300000`), graveyard+revive (maxFailures 3, revive timer 300000). Packages: `crawlee`, `proxy-rotator-js` 1.3.2 (round-robin/random/least-used, healthCheck), `rezo` 1.x (2026, active health 30s/5s on `httpbin.org/ip`), `https-proxy-agent` 7.x / `socks-proxy-agent` 8.x (fetch dispatcher, Node 18+), **`proxy-chain` 2.4.0** (`ProxyChain.createServer` local chain), **`socks` 2.8.9** (`SocksClient.createConnection`).

### 14. Captcha

| Priority | Layer | Coverage |
|----------|-------|----------|
| P1 | Stealth (fingerprint + TLS) | avoids the trace |
| P2 | Human behavior (Bézier mouse, lognormal typing) | passes checkbox/score |
| P3 | Solver (VLM / token API) | ~1–5% of sessions |

**Solvers:** `hcaptcha-challenger` (LLM + ONNX: ResNet `image_label_binary`, YOLOv8 `area_select` point/bbox, Spatial Chain-of-Thought `drag_drop`, ViT zero-shot `multiple_choice`; pipeline `install() → AgentT.from_page() → handle_checkbox() → execute()`; deps playwright/httpx/opencv-python/pillow/loguru/pydantic-settings), NopeCHA/auto-captcha (hCaptcha ✅, reCAPTCHA v2/v3 ✅, Turnstile slow), ClickSolver / 2Captcha / CapSolver (30+ types: reCAPTCHA v2/v3/Enterprise, Turnstile, hCaptcha, FunCaptcha/Arkose, GeeTest, DataDome, Amazon WAF, Akamai, Imperva, Friendly, MTCaptcha, KeyCaptcha, Tencent, Yandex, ALTCHA, **Lemin, Cutcaptcha, Prosopo**). Turnstile resolves in ~5 s via ClickSolver (free) with paid fallback. Pipeline: `launchBrave()` → `navigate` → `detectCaptcha` → `solve(page)` → `record` → `assert`. Test fixtures: local (`tests/examples/hcaptchatest.html`) + `accounts.hcaptcha.com/demo`, `challenges.cloudflare.com/turnstile`, `google.com/recaptcha/api2/demo`; evidence (token, screenshot, trace.json, mp4 via `ffmpeg-static`) to `tests/output/`. Success: detects type; solves hCaptcha checkbox via VLM; passes Turnstile ≥1 of 3 (sticky proxy); reproducible JSON (seed).

**Sandbox:** HF Spaces default 16 GB RAM; Vercel Sandbox (Firecracker microVM — per-session/agent isolated, runtimes `node26/24/22` + `python3.13` (default node24), user `vercel-sandbox` + sudo, working dir `/vercel/sandbox`, boots in ms, supports Docker **and FUSE** inside the microVM, domain-allowlist network policy updateable at runtime, **one Linux user per agent** with groups to share; secrets brokered — injected into outbound requests, never visible inside the VM); gVisor (syscall-level). Reference AI-stack: Next.js + AI SDK + Claude Sonnet 4.5 (env `ANTHROPIC_API_KEY`, `SANDBOX_SNAPSHOT_ID`, `VERCEL_OIDC_TOKEN`/`VERCEL_TOKEN`), snapshot stack Xvnc + openbox + noVNC/websockify + Chrome + tools `computer`/`bash`. MicroVM catalog beyond Firecracker/gVisor/Kata: kern (rootless, ~1.5 MB bin, ~1.9 ms cold) · exec-sandbox (QEMU, L1 ~100 ms / L2 ~400 ms, 192 MB) · mitos (Firecracker+K8s, ~27 ms) · rust-nano-vm (<1 MiB) · CubeSandbox (Rust+KVM, <60 ms boot, E2B-compatible) · Edge.js (whole Node app in WASI, ~40 ms boot). **Atlas Browser:** real multi-mode browser layer (computer / browser / cli / binary / headless) with layered stealth + its own backend DB (Drizzle+mysql2+Prisma+Cloudinary), 30 modes — differentiator vs `vercel-labs/agent-browser`, `browser-use`, `clark-browser`.

### 15. Crawling, Cache & Extraction

- **Crawling:** BFS (`enqueueLinks()`) vs DFS (`forefront:true`); `robots.txt` + `Crawl-delay` honored (`robots-parser` 3.0.1 RFC 9309: `isAllowed`/`getCrawlDelay`/`getSitemaps`; Crawlee `RobotsTxtFile.parse` + `parseUrlsFromSitemaps()`; fetched via `got-scraping`); sitemap discovery (`sitemapper` 4.1.6 — streaming, sitemap-index, TTL 15000–60000 ms); URL normalization strips `utm_*`, `fbclid`, `msclkid`, `ref`, `source`, `medium`, plus `gclid, gclsrc, dclid, gbraid, wbraid, fb_action_*, fb_ref, fb_source, mc_cid, mc_eid, twclid, hsa_* (13 HubSpot), campaign, content, term, spm, from, share_id` (`normalize-url` 9.0.0: `sortQueryParams, removeTrailingSlash, stripWWW, stripHash, removeExplicitPort`; alt `ufo`, `url-normalize`); `EnqueueStrategy` (SameHostname/SameDomain/SameOrigin/All) + globs/regex/exclude; `maxCrawlDepth` via `request.userData`; canonical `link[rel=canonical]` precedence + redirect chain 301/302/307/308; persistent frontiers `microfrontier` + `p-queue` (priority 1–10). Domain concurrency 2–3.
- **Cache:** L1 RAM (<1 ms) · L2 disk · HTTP (`ETag`/`If-None-Match`, 304, s-maxage) · CDN. TTL by content: static 24–72 h (24 h / 48 h stale), semi-static 4–24 h (4 h), dynamic 30 min–4 h (30 min), realtime 30 s–5 min, transactional **0** — auto-detect via headers (`no-store`→0, `max-age ≤60` realtime, `≤3600` dynamic, `≤86400` semi-static, else static; json→dynamic, html→semi-static, asset→static). Invalidation: TTL, versioned keys `url#v{n}` (keep 3), pattern/domain/path regex, event-driven tags. Multi-layer: LRU (max 500, TTL 5 min) → cacache/Keyv (promote to L1 on hit); SWR `ttl 300_000, swr 600_000`. Libs: `lru-cache`, `node-cache`, `quick-lru`, `cache-manager` (multi-store L1+L2), `keyv`, `cacache` (content-addressable SHA-512), `flat-cache` — with stale-while-revalidate. Crawlee request dedup persists to disk (SQLite), survives crashes, resumes.
- **Extraction (structured-first):** JSON-LD `@graph` → Microdata (`microdata-minimal`) → OpenGraph/Twitter (`open-graph-scraper` 6.11.0, `ogie`) → RSS/Atom (`feedsmith` 2.x fastest RSS/Atom/JSON-Feed, `rss-parser` 3.13.0 customFields, `rss-finder` 2.1.5 auto-discovery) → Readability (`@mozilla/readability` 0.6.0: `charThreshold 100, keepClasses false, nbTopCandidates 5`; alt `defuddle`) → CSS. Parser by load: Cheerio (~1 MB, no JS) / jsdom (~50 MB, DOM) / node-html-parser (throughput) / parse5 (spec). Entities: `entities` (~235 M dl) / `html-entities` / `he`. HTML malformed: `htmlparser2` (forgiving) / `tag-soup`. HTML→MD perf (166 KB Wikipedia): mdream (Rust) 0.34 ms · mdream (JS) 3.26 ms · node-html-markdown 14.31 ms; (1 MB): turndown ~500 ms · node-html-markdown ~320 ms · `mdream` (Rust) ~15 ms. Conversion: `turndown` + `turndown-plugin-gfm`, `html-to-text` v10 (`wordWrap:80, tables:true`), sanitize server-side (`sanitize-html`) / browser (`DOMPurify`). Table parsing: `cheerio-tableparser`. Content-type heuristics: `__NEXT_DATA__`, `_next/data`, `__NUXT__`, `window.__INITIAL_STATE__`, `data-reactroot`, `ng-app`, `id="app"`+vue, `___gatsby`, `__remixContext`, `astro-island`; API interception via `page.on('response')` (XHR/fetch JSON, lazy-load scroll).

### 16. Modes & Runtime

| Mode | Needs browser | Notes |
|------|--------------|-------|
| Fetch | no | Cheerio; static pages / APIs |
| Browser | yes | Playwright AgentBrowser (chromium/firefox/webkit); SPAs, interactive |
| Auto (default) | auto | tries fetch, detects render (framework heuristics), falls back |
| Headless | no UI | CI/CD, servers |
| CLI / Binary | no runtime dep | standalone tool / compiled binary |
| Computer | — | binary data streams, storage→compute core |

**Robot modes (SaddleBot taxonomy):** Binary-runner bot · Automation/API bot · Scraper bot · Bypass bot (captcha/anti-detect) · Headless agent · Internal page/RedLens bot — each persists its output to repos/buckets/DB and triggers from webhooks/cron/commands. Isolation per robot: `runner: github|forgejo|codeberg|gitlab|huggingface`.

**Operation modes work without AND with their pair** — nothing is gated: computer · library · application · browser · desktop · mobile · extension · cli · binary · headless · physical file · vector file · internal/external file · internal/external dependency · internet/dev-dependencies · visible mode. Same for memory: internal/external/physical/vectorized/library — all work with or without.

### 17. Validation, Concurrency & Universal Runtime

- **Zod v4** (~14× faster, ~26 KB; v3 was 60 KB): `z.strictObject`, `.prefault()`, `z.toJSONSchema()` (→ OpenAPI 3.1 via `zod-openapi.createDocument()`), branded/discriminated unions, `z.interface()`, `z.coerce` for CLI, `.brand<'T'>()`, separation of `z.input`/`z.output`, cross-field refines. Core: `ScrapeOptions` (viewport 320–7680 × 240–4320, `maxRetries` 0–10, timeout 1000–300000 ms, format html|text|json|screenshot, `SafeUrl` http/https), `ScrapedItem`, `ScrapeJob` (UUID), `BatchConfig` (`concurrency` 1–100, `jobs` 1–10_000). Middleware per framework (`zValidator` Hono, `ZodTypeProvider` Fastify).
- **Batch/concurrency:** `p-map` 7.0.4, `p-queue` 9.1.2 (priority, `intervalCap`, per-item `timeout`, `onIdle()`/`pause()`/`resume()`), `p-limit` 7.3.0; `BrowserPool` (`minBrowsers:1`, `maxBrowsers:5`, `maxPagesPerBrowser:10`, `launchTimeout:30000`, `idleTimeout:60000`, `acquire()→release()`); Crawlee `AutoscaledPool` (scale up if CPU<50% & mem<70%, down if >80%/85%; min 1 / max 20, scaleUpInterval 1000, scaleDownInterval 5000); `cockatiel` retry/timeout/circuit-breaker (`byPercentage({threshold:50, duration:30000, halfOpenAfter:10000})`) + bulkhead (`maxPerBulkhead 5, maxTotal 50`) + FallbackChain (primary → cache → archive.org). Adaptive: targetErrorRate 0.1 (reduce ×0.3 / increase ×0.2, window 100, 10 s), latency-target p50/p95/p99 ±30%. Defaults: concurrency **10**, `maxAttempts` **3**, exponential backoff.
- **Universal runtime (WinterTC / ECMA-429):** `fetch`, `Request/Response`, `URL`, `URLPattern`, `Headers`, `crypto`, `ReadableStream`, `WritableStream`, `TransformStream`, `TextEncoder/Decoder`, `structuredClone`, `AbortController`, `WebSocket`, `setTimeout/setInterval`, `queueMicrotask`, `atob/btoa`, `performance.now()`. Avoid `fs/process/Buffer/path/child_process/require/__dirname` in the core (use `import.meta.url`, `node:`-prefixed imports); isolate in `src/adapters/{node,browser,deno,cloudflare}.ts`. Runtime detection order: `globalThis.Deno → globalThis.Bun → process.versions.node → window/document`. Build: `tsdown` (`platform:'neutral', format:['esm']`, `exe:true` SEA, auto-exports) / `tsup` (external `/^node:/`) / `unbuild`; polyfills via `unenv`; validate with `npx publint`, `npx @arethetypeswrong/cli`, `madge --circular`. 2026 "do not polyfill" list: node-fetch, cross-fetch, isomorphic-fetch, undici, buffer, path-browserify, process, stream-browserify. Distribution: `bun build --compile` (8 targets, `--bytecode`, embed `with {type:'file'}`/`sqlite`), Node SEA (`postject`), `@vercel/ncc`, `deno compile`.
- **Error taxonomy (typed hierarchy with HTTP statuses):** `WebScrapeError` base → `ValidationError` 400, `TimeoutError` 504, `BlockedError` 403, `RateLimitError` 429, `ProxyError` 502, `ParseError` 422, `AuthError` 401, `NetworkError` 503; each carries `code/statusCode/isRetryable/details`; plus `RetryRequestError` (rate-limit delay), `SessionError` (rotate proxy/UA), `CriticalError`. Recovery: `WAIT_AND_RETRY`, `ROTATE_PROXY`, `REDUCE_CONCURRENCY`, `REVIEW_ROBOTS_TXT`, `ROTATE_USER_AGENT`, `ADD_HUMAN_DELAY`, `STOP_CRAWLING`. Events via `TypedEmitter` (`emittery` 2.0.0: AbortSignal, async-iteration, `Symbol.dispose`; eventemitter3 2–5× faster; mitt ~200 B): `request:start|retry|error|response`, `cache:hit|miss`, `session:rotate`, `proxy:rotate|error`, `browser:crash`, `crawl:discover|complete`. Error metadata: `severity` low/medium/high/critical + `Error.captureStackTrace` + `cause` chaining.
- **Error codes (tree-shakable const enum):** Network 1xxx (E1001 timeout, E1002 conn-refused, E1003 DNS, E1004 TLS) · HTTP 2xxx (E2001 rate-limited, E2002 403, E2003 404, E2004 500, E2005 503) · Browser 3xxx (launch/crash/timeout/navigation) · Scraping 4xxx (E4001 selector, E4002 parse, E4003 captcha, E4004 bot) · Session 5xxx (expired/blocked/cookies) · Config 6xxx (invalid/missing). `ScraperError` base with `{code, cause?, retryable?, metadata?}`; `extends Error` needs `Object.setPrototypeOf(this, Class.prototype)` for `instanceof`. Default policy: maxRetries 3, base 1000, factor 2, cap 30 s; unknown errors retry once; non-retryable: 404, BOT, CAPTCHA, CONFIG.

---

## Productization

18. **Distribution Surfaces** — One package, repackaged per target; nothing runs locally.

| Target | Form |
|--------|------|
| n8n | first-class node / its own (automation engine) |
| Browser | CRX extension for any Chromium/Gecko browser — capture runs in-page; movement capture, session replay and captcha bypass work from the extension UI |
| Mobile | Android / iOS native apps |
| Desktop | Tauri (one codebase, three native builds — Windows/macOS/Linux) |

19. **Third-Party Application & Robot Identity** — registered on each platform as a developer-owned third-party app (user owns client ID/secret), never a hosted service.

| Platform | Registration | Robot identity | Runs on |
|----------|--------------|----------------|---------|
| GitHub | GitHub App / OAuth App (`contents/pull-requests/issues/actions` R-W, metadata R, webhooks manage) | bot via `workflow_dispatch` | Actions / Codespaces |
| GitLab | OAuth App + bot user | project bot via CI | GitLab CI |
| Forgejo | OAuth2 (3rd-party) | bot via Actions | Forgejo Actions |
| Gitea | OAuth2 (3rd-party) | bot via Actions | Gitea Actions |
| Hugging Face | OAuth + Spaces | agent in a Space | HF |
| Bitbucket | OAuth Consumer (3rd-party app) | pipeline bot | Bitbucket Pipelines |
| SourceHut | OAuth Application | build bot | builds.sr.ht |
| Discord / Telegram / Reddit / Slack / Mastodon / Matrix / Bluesky | Bot App / Bot API / 3rd-party app | interactive bot; app-only robot | gateway / webhooks / API |

Where a platform has no formal app portal (Telegram, Matrix), the robot is still a developer-owned credentialed account seeded by the user. Registration notes: Reddit app portal `reddit.com/prefs/apps` (web/installed/script + app-only OAuth); Telegram via BotFather; Mastodon/Matrix/Bluesky = per-instance client apps.

20. **Multi-Platform Bots & Automation** — `SaddleBot` unified: `start()`, `stop()`, `executeCommand(cmd)`, `handleWebhook(event)`, `scheduleTask(task)`, `getStatus()`. Adapters `PlatformAdapter`: `authenticate`, `listRepos`, `createWebhook`, `executeBot` — Forgejo/Gitea reuse the GitHub adapter with a custom `baseUrl`. Commands: `capture`, `scrape`, `review`, `deploy`, `memory`, `test`, `release`, `webhook`, `schedule`, `publish`, `artifact`, `status`, `npm publish` (GitHub-only). Adapter specifics: GitHub `createIssue`, `createPR(repo,title,body,branch)`, `addComment`, `executeWorkflow(repo,workflow)`, `uploadReleaseAsset` (token scopes `repo`+`workflow`+`read:org`); GitLab `listProjects`, `createMergeRequest(sourceBranch,targetBranch)`, `triggerPipeline(projectId,ref,variables)`, `uploadFile` (scope `api`); Discord `sendMessage`, `createWebhook`, `executeWebhook(webhookId,webhookToken)`, `addReaction`, `createThread`; Forgejo paths `write:repository`+`write:issue`+`write:webhook`. Webhook events: GitHub `push, pull_request, issues, issue_comment, release, deployment` with `"secret":"${WEBHOOK_SECRET}"`; GitLab trigger/push/merge_request/issue/tag_push. **Flow:** command on Discord → parse → adapter → run on forge → store in memory → report back.

21. **AI Integration & Models**

- Convert HTML → **Markdown before the LLM** (60–80% token reduction). Token/1 KB: HTML ~300–400, Markdown ~80–120, text ~60–80 (cleaned HTML ~200–250, JSON ~150–200). `estimateTokens ≈ chars/4` (~70% accurate) — model-aware helper `estimateTokens(text, model)` / `fitsInContext(text, ctx, model)` / `tokenCost(text, model, price)` with char/token ratios (gpt-4o 3.5, claude 3.2, gemini 3.5). Tokenizers: `js-tiktoken` (~5 MB, o200k_base), `gpt-tokenizer` (~1 MB), `bpe-lite` (~2 MB, multi-model, Gemini 100% accurate, Claude p50k_base ±10–30%).
- **RAG pipeline:** Fetch → Extract → Markdown → Chunk (400–512 tokens, overlap 10–20%, SHA-256 dedupe, hierarchical `chunk-{i}-{j}` with heading path + parentChunkId; separators `['\n\n','\n','. ','! ','? ',', ',' ']`, ~1.3 words/token; metadata frontmatter `source/title/description/scraped_at/content_hash/language`; API `chunkMarkdown({maxTokens:512, overlapTokens:50, preserveCodeBlocks, includeHeadingPath})`, `splitByHeaders()`, `formatChunksForRAG()`) → Embed → Store (Pinecone `{id,values,metadata}` / Weaviate `{class:'DocumentChunk',id,vector,properties}` / Qdrant `{id,vector,payload}`; metadata `headingPath, contentHash, parentChunkId, sourceUrl, tokenCount, expiresAt, sourceDomain, contentType text|code|table|list, language, embeddingModel, embeddingDimensions`). Chunk id = `sha256(hex).slice(0,8)-{position}` (`documentId = contentHash.slice(0,16)`); near-duplicate threshold 0.95; self-healing selectors (strip class, `[id*=x]`, `[class$="x-*"]`, `:nth-child`, `[aria-label]`) with Cheerio fallback.
- Structured extraction: `response_format: json_object`, `temperature: 0`, confidence = used / total. Embeddings: `POST https://api.openai.com/v1/embeddings` `text-embedding-3-small`; Anthropic count via `POST https://api.anthropic.com/v1/messages` (`anthropic-version: 2023-06-01`, `usage.input_tokens`). External context windows: GPT-4o 128K (sweet 8–32K), Claude 3.5 Sonnet 200K (~180K), Gemini 1.5 Pro 2M (~1.8M), Llama 3.1 405B 128K, Mistral Large 128K.
- **llms.txt:** `# Title`, `> desc`, `## sections` (≤2 levels, desc ≤100 chars, absolute HTTPS URLs) ≤100 atomic links — consumed by AI agents directly; `llms-full.txt` = concatenated content variant; adopters: Vercel, Anthropic, OpenAI, Stripe, Supabase, 840+ sites.
- **Free inference:** `@huggingface/inference` `InferenceClient` (textGeneration, featureExtraction) free for models <10 B params; ModelScope OpenAI-compatible at `https://api-inference.modelscope.cn/v1` (e.g. `Qwen/Qwen3.5-27B`).

| Model (free catalog, 26 available) | Source | Context | Modality |
|-------|--------|---------|----------|
| deepseek-v4-flash-free | Zen | 1,048,576 | text |
| longcat-2.0-free | Zen | 1,048,756 | text |
| nemotron-3-ultra-free | Zen | 1,000,000 | text |
| mimo-v2.5-free | Zen | 1,050,000 | text+audio+image+video |
| tencent/hy3:free | OpenRouter | 262,144 | text |
| stepfun/step-3.7-flash:free | OpenRouter | 262,144 | text+image |
| openai/gpt-oss-20b:free | OpenRouter | 131,072 | text |

Sources: `api.kilo.ai`, `opencode.ai/zen`, `openrouter.ai`. Count with `js-tiktoken` / `gpt-tokenizer`.

22. **Packaging & Publishing** — `@devthink/saddle` as **lib + CLI** (`saddle`); install `npm install @devthink/saddle` (global for CLI). Package layout: `lib/index.js` + `bin/saddle.js` (`node:util parseArgs{command, platform, token, verbose}`, default `help`), exports map subpaths `./browser, ./bot, ./captcha, ./memory-engine, ./deploy` (import/require dual) + `./index.cjs`. Scripts: `"build":"tsc"`, `"test":"vitest run"`, `"lint":"biome check ."`, `"typecheck":"tsc --noEmit"`, `"prepublishOnly":"npm run build && npm test"`, `"prepare":"husky"`. Version: semver `npm version patch|minor|major` + `git push --follow-tags`. Library API: `import { SaddleRobot } from '@devthink/saddle'; await robot.start(); await robot.executeCommand(cmd)`. `npm publish --access public` → auto-mirror jsDelivr/UNPKG/esm.sh.

| Registry | What |
|----------|------|
| Node registry | lib + CLI |
| GitHub | repo + Packages + container image |
| Maven | `.jar` via GitHub Packages |
| NuGet | `.nupkg` via GitHub Packages |
| RubyGems | gem push |
| PyPI | wheel via trusted publishing |
| GHCR | docker push |
| HF / Kaggle | bucket/dataset |

Every package is auto-mirrored to jsDelivr/UNPKG/esm.sh (CDN executable from anywhere). OCI registries (GitHub/GitLab Packages, ACR, Docker Hub) double as **universal content-addressed storage** via `oras push` (Chainloop proofs). Trusted publishing: npm/NuGet via OIDC token exchange; Azure via `@azure/storage-blob` + Entra ID/OIDC federated identity.

23. **Deploy & Secure Execution** — All cross-site comms over HTTPS with cert validation.

- **Multiple sites** (Netlify/Vercel); each site opens containers; each container writes back through its **own internal API** (Hono) to its **own DB** (Drizzle/Prisma), then mirrored → repo/Terabox/temp container (backup, no loss). Edge inference runs **not only on the site but via npm, GitHub and Maven packages** — the same bytes run wherever pulled. Free tiers: Vercel ≈1 M invocations/mo; Netlify ≈125 K function calls/mo; Cloudflare Workers 100 K req/day; AWS Lambda ≤15 min timeout (postgres 16 + redis 7 via `docker-compose`, `node:22-alpine` multi-stage + HEALTHCHECK).
- **Deploy-at-boot DB (idempotent):** `GET /api/init` (`runtime="nodejs"`, `dynamic="force-dynamic"`) runs `CREATE TABLE IF NOT EXISTS` (or `drizzle-kit push`) with `middleware.ts`/`instrumentation.ts` (Next ≥14.2) firing it at boot via `fetch(process.env.SELF_URL + "/api/init")` + `x-init-secret`; runtime `nodejs` (edge has no `pg`/`fs`). Build variants: `"build": "prisma generate && prisma migrate deploy && next build"` + `"db:push": "drizzle-kit push"`.
- **Secure ladder (by risk):** V8 Isolates (`@edge-runtime/vm`, `isolated-vm`, <5 ms) → WASM (Rust/Go/C++/Pyodide — PyPI native C/C++ extensions excluded) → MicroVMs (Firecracker/Kata/gVisor, ~300 ms boot) → **`vm2` banned** (deprecated, RCE CVEs). Node is the orchestration "brain"; single-threaded → heavy compute offloaded. Python-in-Node also via bridges: `pythonia`, `pymport`, `node-calls-python`, `nodepyx` (embed CPython). Docker hardening: `--network=none`, `--cap-drop=ALL`, `--security-opt=no-new-privileges`, `--read-only`, `--pids-limit=512`, `--runtime=runsc`.
- **Auth:** GitHub Apps > PATs (granular `read:packages`/`write:packages`); **OIDC Federated Identity** for Azure/Blob; **Trusted Publishing** for npm/NuGet (short-lived tokens; NuGet limits on self-hosted runners). **Skew protection**: `drizzle-kit push` in the build step.
- **Serverless constraints:** Vercel Node max 300 s / Edge 50 ms; Netlify Functions 10 s sync / 15 min async; Edge 1–5 ms cold (Wasm); memory caps are small on edge → heavy work stays in runners, not functions. `child_process` is **blocked on Netlify** — route subprocess workloads to WASM/Pyodide/isolates or a separate executor (`microservice split`: Python as its own function + HTTP call). Netlify limits: 1,024 MB fn memory / 512 MB edge. Vercel runs Node/Python/Go/Ruby; cron triggers are **not real-time** (50–60 min delay) — use `node-cron`/`node-schedule`/Scheduled Functions (Netlify `@hourly`) or Supercronic where timeliness matters. Runtime create-at-deploy: Vercel Blob / Netlify `@netlify/blobs` / `prisma migrate deploy` / `drizzle-kit push`; `vercel env pull && vercel build` / `netlify build --context production` keeps local == prod.
- **Isolation ladder (by risk):** `node:vm` / V8 Isolates (`isolated-vm`, `@edge-runtime/vm`, <5 ms, <5 MB) → Docker containers (full apps) → MicroVMs (Firecracker/Kata/gVisor, ~300 ms boot) → WebAssembly (Pyodide = CPython→WASM, WasmEdge CNCF, Runno, Edge.js ~40 ms, BoxLang). **Pyright is NOT an executor** — it is a static type-checker; Python-in-Node = Pyodide/subprocess/MicroVM. `vm2` **banned** (deprecated, RCE CVEs incl. CVE-2025-68613/CVE-2026-1470).

24. **CDN / SCDN & Zero-Install** — Saddle never runs `npm install`. Every package is pulled by URL at execution time: `esm.sh`, `jsDelivr` (`+esm`), `UNPKG`, `esm.run`, `jspm`, `cdnjs`, npm registry. Serve modules via CDN and import inline with **SRI** (`integrity="sha384-…"`).

```
POST /v1/scrape           GET  /v1/scrape/:taskId
POST /v1/scrape/async     POST /v1/batch
POST /v1/crawl            GET  /v1/crawl/:crawlId
GET  /health              (SSE via text/event-stream, 30 s keepalive)
```

SCDN pipeline: capture → `PUT` upload (Bearer token, `Cache-Control`) → edge cache → workers fetch nearest edge → store URLs in repo. Providers: Cloudflare Workers (300+ cities), Cloudflare R2 (free egress), CloudFront (400+ cities, pay-per-use), Bun CDN, Deno Deploy, Vercel Edge Config, Netlify Edge. Config: endpoint/token/bucketId/region?/ttlSeconds; perf: upload 50–200 ms vs direct 200–2000 ms, download 10–50 ms, cache hit 5–20 ms; safeUpload maxRetries 3, backoff `1000 * attempt` ms; TTL example: session JSON 3600, screenshot PNG 86400.

**Zero-install execution — three production patterns:** ESM `import 'https://esm.sh/<pkg>@<ver>'` in `<script type="module">`; dynamic `import('https://esm.sh/<pkg>')`; `<script type="importmap">`; plus the Node one-liner `node --input-type=module -e "import x from 'https://esm.sh/<pkg>'"`. SRI hashes (`integrity="sha384-…"`) pin supply-chain for every module. `esm.run`, `jspm` (`ga.jspm.io`), `cdnjs`, `esm.unpkg.com` (ESM+bundling) complete the catalog (see §58 CDN list doc). Live pins: `https://esm.sh/@opencode-ai/sdk@1.18.4`, `https://esm.sh/@octokit/rest@20.0.2`, COOP/COEP via `coi-serviceworker@0.1.7` (GitHub Pages cannot send those headers → breaks SharedArrayBuffer). Thin-client protocol: 256-byte hex preview + **SHA-256 in a Web Worker** before upload → streaming `CHUNK=0x8000` base64 via GitHub Contents API (`createOrUpdateFileContents`) with a fine-grained PAT (`Contents:write` + `Actions:write`) kept only in `sessionStorage` → poll `GET /actions/runs?event=workflow_dispatch&per_page=20` every 3 s → artifact unzipped in-browser via `DecompressionStream('gzip')` (browser stays <5 MB RAM). Five browser-embedding strategies: SDK Remote · WebContainers · ServiceWorker+Hono+OPFS mock · WASM Go (`GOOS=js`) · GitHub-as-storage+Actions.

25. **Architecture & Conventions**

```
saddle/
├── docs/            # planning + documentation
│   ├── plans/       # numbered goals (001..0NN, flat; index: 00.index ↔ 46.scdnintegration…)
│   ├── talks/       # decision transcripts
│   └── logs/        # JSON movement logs
├── tests/           # {examples/: fixtures (hcaptchatest.html), output/, scripts/}
├── web/             # production site (Vercel/Netlify open server)
│   ├── index.js     # capture UI / server
│   ├── server.js    # API routes (Hono + SSE, socket.io)
│   ├── db.js        # drizzle + mysql2 + prisma loader
│   ├── storage.js   # cloudinary upload
│   ├── capture.js   # browser movement capture (virtual mouse, arrow)
│   └── *.html       # capture UI + test pages (saddle1–7)
├── saddle-robot/    # engine: browser.js, bot.js, captcha.js, memory-engine.js, deploy.js, adapters/{github,gitlab,forgejo,gitea,discord}.js
├── 3d/              # standalone nodes and CLI
├── bin/             # CLI entry points (bin/saddle.js)
└── (root files)     # library entry, configs
```

**Library modules:** saddleUrl · fetch · browser · extract · serialize · errors · retry · proxy · cache · rate-limiter · crawler · batch · pool · agent · tokens · chunking · llms-txt · server · cli · memory-engine · captcha · bot · deploy · storage · adapters.

**Hard conventions:** no `src/` (root-based; **`crc: clean root code`**; the `web/` folder *is* production) · no Vercel/Netlify **Functions** (open Node server; `prisma`/`drizzle`/`mysql2`/`socket`) · no localhost (host parametrized, **ports randomized then locked**) · lowercase files, no underscore, no hyphenals · English docs, JSDoc · error catcher embedded in every script · ≤20 related logics per file · V8 flat manifest: Numeric file names (Title Case with spaces, no nesting; ~50 flat files of 100 total, e.g. `026 API Init Database Trigger.ts`) — `ls` is the documentation, alphabetical order is the diagram.

26. **API Reference** — server framework: Hono (edge, 14 KB) for Workers · Fastify/Elysia → Bun/Node · Express legacy. Always HTTPS + auth (API key/JWT), per-user rate limit, input validation, **SSRF protection** (block internal networks), CORS, `request_id` audit. Respect `robots.txt`. Streaming: SSE / WebSocket / NDJSON. Benchmarks (req/s): Elysia ~184K (Bun) · Fastify 42–114K · Hono 45–78K · Express 8–21K.

**Public library API:** `saddleUrl(url, {mode, timeout, scroll, format: 'markdown'|'json'|'xml'|'text'|'redis', retries, proxy, cache, extractLinks/Images/Tables, antiDetection, tokenCount})` → `{content, metadata}` · `scrapeUrl/scrapeHtml/scrapeWithBrowser` · `extractContent(html, options?)` · `serializeResult(result, {format})` / `serializeHtml(html)` · `formatForAgent(result, {model, maxChunkSize 4000, includeSummary/KeyPoints/RelevantUrls/Metadata})` → `{summary, keyPoints, relevantUrls, chunks[], tokenCount}` · `batchScrape({urls, concurrency, onProgress})` → `(completed, total)` · `crawl(url, {maxDepth, maxPages, sameDomain})` → `{results, stats}` · `chunkMarkdown(content, {maxTokens})` → `{content, headingPath, tokenCount}` · `createServer({port})`. AgentBrowser methods: `navigate({waitUntil:'networkidle'})`, `click`, `type`, `screenshot({fullPage})`, `html()/text()/title()/evaluate()`, `scrollToBottom({step:500, delay:100})`, `executeCommands([{action:'goto', args:{url}},…])`.

```
POST /v1/scrape           # sync, fields: useBrowser, format, waitFor, timeout, proxy; → timing.duration_ms
POST /v1/scrape/async     # returns task id
GET  /v1/scrape/:taskId   # poll result
POST /v1/batch            # up to 10k jobs, concurrency 10
POST /v1/crawl            # GET /v1/crawl/:crawlId
GET  /health              # SSE, 30s keepalive; Nginx proxy_buffering off
```

Rate limiting: global 1000/min · per-endpoint `/v1/scrape` 10/min · per-user key · **per-domain token bucket** (rate-limiter module); algorithms Token Bucket / Sliding Window Log / Sliding Window Counter / Fixed Window / Leaky Bucket; engines: `express-rate-limit` 8.5.x, `@fastify/rate-limit`, `hono-rate-limiter` (+`@hono-rate-limiter/redis`, `standardHeaders:'draft-7'`), universal-rate-limit (`draft-7` headers), `bottleneck` 2.19.5 (Redis Cluster, minTime/maxConcurrent), `rate-limiter-flexible` (Memory/Redis, `blockDuration`, `execEvenlyMinDelayMs`), `limiter` (Redis), Upstash REST sliding-window via zset (`zremrangebyscore/zadd/zcard/expire`, env `UPSTASH_REDIS_REST_URL/TOKEN`). Error shape `{error: {code, message, retry_after, request_id}}`. SSE 30 s keepalive (Cloudflare free idle ~100 s), browsers cap ~6 SSE/origin; skip streaming under 50 KB.

27. **Examples / Cases**

1. **Human Operator (voice+vision → EMS):** VLM (Claude API) → egocentric camera + open-ended voice trigger → Flask gateway (`utils/receiver.py`) → Arduino relays → EMS (D2→wrist_left, D4→wrist_right, D3→thumb, D5→index, D6→middle, D7→ring, D8→pinky). MIT Hard Mode 2026 winner (Learn Track, 6–8 Mar 2026, 48 h, 6 students: He, Neall, Danry, Kaijzer, Wu, Lewis). Repo `danielkaijzer/Human-Operator`; lineage: PossessedHand (CHI 2011) → Affordance++ (CHI 2015) → openEMSstim (2016) → DextrEMS (2021) → SplitBody (CHI 2024, +35% multitask) → Generative Muscle Stimulation (CHI 2026 Best Paper) → Hand by Hand/FlightAxis (IJCAI 2025); ~150 HCI publications in the field.
2. **Infinite HD / VRAM (FUSE):** bucket → VHD via FUSE; `hf-mount start bucket <user>/<bucket> /mnt/...` / `huggingface/hf-csi-driver` (K8s CSI) / `nisten/huggingface-filesystem` (stream-sync, no local disk); `rclone mount --vfs-cache-mode full`; `cf-vfs` (R2 + Durable Objects), `tigrisfs` (mount R2 as `/mnt/r2`), `@cyclic.sh/s3fs` (drop-in `fs`); mounts → tmpfs 2 G. Mount S3 as FS in Node (`fuse-native` + `@aws-sdk/client-s3`, Range reads). ORM sharding `Bun.hash(k)%n` (40×3 GB = 120 GB; 400 = 1.2 TB). Free: Terabox 1 TB, R2 10 GB (5 GB file), HF, Telegram (2 GB/4 GB premium), Discord (8 MB chunks/∞). Portable runtime: Node 20 portable + Electron, `pkg` single .exe presented as drive Z:. VRAM→swap is legitimate (nbd-vram), bucket→VRAM is not (256-bit bus, hundreds GB/s, no S3→VRAM protocol; S3-as-swap → BSOD/kernel panic).
3. **Repo as processor + WASM in browser:** `@octokit/rest` + `isomorphic-git` in-memory clone → process → push; `WebAssembly.instantiateStreaming` + `go.run`. Cross-repo trigger `repository_dispatch {event_type:"bridge_event"}`; Site A → dispatch → Action commits `docs/queue.json` → Pages rebuild → Site B GETs it.
4. **Sci-Fi (body↔mind):** output EMS/e-Taste (taste via glucose/citric/NaCl/Mg → Wi-Fi actuator, Ohio State) / OVR ION (9-smell cartridge, Unity API) / GVS (0–2 mA; hand redirection +45–55%) / ThermoReal/Peltier (20°→40°C in 1 s); input OpenBCI/brain2qwerty (v2 MEG→text 61% avg / 78% best word accuracy, ~22,000 sentences / 9 volunteers / 10 h MEG each, repo `facebookresearch/brain2qwerty`, dataset `bcbl190626/SpanishBCBL`, CC BY-NC 4.0) / emg2qwerty (sEMG) / Neural Band (meta, sEMG wristband); Tiny AI: llama.cpp (70B Q4_K_M on CPU), BitNet (1-bit, {-1,0,1} weights; 2B trained on 4T tokens runs 100B-class on CPU 5–7 tok/s, 82% less energy), web-llm (WebGPU, no server), llamafile (Mozilla-Ocho single executable); storage: Project Silica (quartz, 10,000-yr life, CD-size = 4 TB), DNA (`microsoft/TrellisBMA`, 200 MB, 1 EB/mm³ theoretical), 5D memory (360 TB/disc, 13.8 B-yr stability), Cerabyte ceramic (1000+ yr, no power), IPFS/Filecoin.
5. **Minimal recipe:** `[Bucket FUSE] → [unionfs] → [llama.cpp/BitNet]` — each piece independent.

28. **Competition & Differentiators** — 7 competitors (Crawlee, Playwright, Puppeteer, Cheerio, Scrapy, Firecrawl, Browserless). **Saddle leads on all-in-one** toolchain (scrape + crawl + batch + serialize → markdown/llms.txt + server + RAG chunking), cross-runtime Node **and** Bun (Node ≥26.2.0 / Bun ≥1.4.0), token estimation, heading-aware chunking, `llms-txt`, Redis `JSON.SET`, AI SDK with 20+ providers, no cloud dependency. Competitor metrics: Crawlee 23.7k★/134 releases · Playwright 90.5k★/~471k dependents · Puppeteer 94.5k★/~575k · Cheerio 30.4k★/~1.8 M dependents · Scrapy 62.1k★/300+ releases/15+ yrs · Firecrawl 130k★ (highest, AGPL-3.0) · Browserless 13.3k★/655 releases (SSPL-1.0). Notes: Crawlee ships multi-package + `npx crawlee create`; Scrapy ecosystem = scrapyrt (REST) + scrapyd (deployment) + scrapy-playwright; all four (Playwright, Firecrawl, Browserless, Puppeteer) ship MCP servers (`@playwright/mcp`, `firecrawl-mcp`, `chrome-devtools-mcp`). **Gaps (P0→P3, see §29):** anti-detection not integrated, no persistent queue, no Dockerfile yet, no MCP server.

29. **Status, Roadmap & What's Missing**

- **Status:** planning + research complete; implementation gated on user go-ahead. Compute backends next: computational-memory engine, storage backends, VM packaging (GitHub + npm → jsDelivr).
- **P0 (blocks prod):** anti-detection (integrate stealth plugin — `playwright-extra` is already an optional dep, never imported), persistent queue (`SqliteQueue` over `better-sqlite3`, schema `CREATE TABLE requests (url TEXT PRIMARY KEY, depth INT, status TEXT, created_at INT, processed_at INT)`, option `CrawlOptions.persist`, in-memory kept as fallback), Docker (`Dockerfile.saddle` + `docker-compose.yml`) — 1–5 d each.
- **P1:** MCP server (`@modelcontextprotocol/sdk`, tools `scrape/crawl/batch/extract/serialize`, CLI subcommand `mcp`) · session persistence (`CookieJar`/`ScrapingSession` → `save(path)/load(path)`) · schema extraction (`extractWithSchema(url, zodSchema)`, endpoint `/scrape/schema`, file `schema-extract.ts`).
- **P2:** PDF (`page.pdf()`) · token prices configurable (`setModelPrices(prices)`; 2024 hardcoded: gpt-4o 0.0025/0.01, gpt-4o-mini 0.00015/0.0006, gpt-4-turbo 0.01/0.03, claude-3-5-sonnet 0.003/0.015, claude-3-haiku 0.00025/0.00125, gemini-1.5-pro 0.00125/0.005, gemini-1.5-flash 0.000075/0.0003) · webhooks (`webhook?: {url, events[]}`; POST on crawl-started/batch-completed/error) · video extraction (metadata + transcript only, never download).
- **P3:** mobile emulation (`device?: string` → `playwright.devices[device]`) · tracing (`context.tracing.start()/stop()`) · adaptive rendering cache (framework detection + API calls, per-domain).
- **Technical debt:** 30+ hardcoded config defaults (timeout 30000, scroll delay 300, max scrolls 50, viewport 1280×720, retries 3/1000 ms, cache TTL 300000, branch…), 7 hardcoded 2024 model prices (above), hardcoded paths (pythonPath/windowSize/doomFramesDir), static User-Agent, `host: 0.0.0.0` (default to `127.0.0.1`) + `--disable-web-security` (security risk), `CORS '*'` in dev-server, version in 4 files, empty Dependabot config, dead optional deps (`playwright-extra`, `puppeteer-extra-plugin-stealth`), unused stealth flag, ~25 packages to remove (react, sharp, hls.js, ink, blessed, ora, figlet, marked…), no try-catch around storage ops.

**Legal/ToS cliff:** global file cap (<5 GB/repo, GitHub 50 MiB warning / 100 MB CLI, 5 GB/repo cap — "not allowed as pure serverless, but valid for processing the repo's own binaries"; farm sharding with throwaway accounts = ToS violation → legit: Turso or R2 @ $0.015/GB, self-hosted Forgejo + MinIO), HuggingFace for AI only (free storage = public/community repos only; private billed); bucket-as-VRAM impossible (legit infinite-HD stack = FUSE + rclone + R2/Storj/Kaggle/self-hosted Forgejo+MinIO). Keep VRAM models in buckets, run locally quantized — never dump movies in repos.

30. **Scripts & CLI**

``` bash
npm run test        # vitest
npm run lint        # biome check
npm run typecheck   # tsc --noEmit
npm run build       # tsdown / compile
```

``` bash
saddle --help                       # usage
saddle <url> -f json --pretty       # scrape URL, CLI flags -f/--format, --pretty, --mode browser --scroll, --agent --output result.json
saddle capture --url <url>          # Agent Browser capture/replay → docs/logs/<session>.json
saddle bot --platform github --token $SBOT_TOKEN   # run SaddleBot on a forge
saddle memory --load repo://owner/repo/path/file.json  # load storage → RAM buffer
saddle deploy --target netlify      # CLI generates platform artifacts + CI/CD for multi-registry publish
saddle mcp                          # MCP server (SaddleBot tools)
```

31. **License** — MIT