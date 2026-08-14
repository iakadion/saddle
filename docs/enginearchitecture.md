# saddle engine architecture

## purpose

Saddle is a library first. The engine turns a serializable job into a temporary working set, runs the job through a selected provider, commits the result to a storage adapter, and leaves an event trail for observation.

The engine does not claim that remote storage is physical vram. It models the same bytes under two usage flags: `keep` for persistent state and `process` for a temporary working set. Capacity, latency, durability, and availability remain properties of the selected backend.

## root layout

The project has no `src` folder. The root is the map of the engine.

| folder | responsibility |
|---|---|
| `core` | engine errors, scrape error taxonomy, ids, events, and hashing primitives |
| `domain` | jobs, sessions, artifacts, providers, and runtime records |
| `storage` | storage adapter contract, local backend, and checksums |
| `memory` | working set preparation, sync, and cleanup |
| `runners` | provider factories and deterministic scheduling |
| `runtime` | engine orchestration, capability detection, worker boundary, retry and circuit context |
| `scrape` | single page extraction, response normalization, robots policy and grouped crawl context |
| `cli` | explicit command surface with local error handling |
| `tests` | local deterministic tests without credentials |
| `examples` | small runnable integration examples |

All internal file names are lowercase and contain no underscore or hyphen. Related logic stays grouped and each module remains small enough to reason about in isolation. Version 1.8.9 uses TypeScript source at the root and groups crawl URL normalization, traversal, frontier budgets and persistence in `scrape/crawl.ts`; it does not merge distinct storage cache, job queue or browser session contracts merely because they use similar words.

## public contracts

The public contract uses plain objects and factory functions. The engine never requires a class instance from a vendor adapter.

| contract | responsibility | open choice |
|---|---|---|
| `storageadapter` | put, get, head, delete, and list artifacts | local, s3 compatible, webdav, hf, kaggle, or another backend |
| `storagepool` | read verified replicas, write to an explicit quorum, describe capabilities, and produce a repair plan | caller-authorized adapters with explicit priority and no background replication |
| `localmemory` | prepare, sync, and cleanup a working set | tmpfs, mmap, sqlite, r2, or a remote bridge |
| `workingbudget` / `workingadmission` / `bridgeplan` | plan bounded materialization and host-memory operations | caller-owned host adapter; the transport-neutral core never mounts, swaps, or executes a shell command |
| `scheduler` | select the first available provider by stable priority | github, forgejo, gitea, gitlab, hf, kaggle, or custom |
| `engine` | coordinate the lifecycle and emit events | library, cli, browser, desktop, mobile, or service |
| `validatesession` | accept a versioned session record | browser capture, replay, or external event source |

`storagepool` is an additive storage contract. It selects members in stable caller-configured priority order, accepts only caller-owned adapters, verifies a returned digest when one is supplied by the caller or manifest, and returns per-member evidence. A quorum write reports partial outcomes and fails when the requested threshold is not met. `repairplan` is declarative: it identifies a source and candidate targets but never starts a background repair, probes an account, or mutates an adapter.

`workingadmission` selects serializable candidates against byte and entry budgets without reading data. `bridgeplan` can describe `temporaryfile`, `mmap`, `tmpfs`, `zram`, or `swap` only when a caller declares the capability. A returned `caller-executes` result contains preconditions and cleanup ownership; an unsupported capability is reported without a probe or side effect.

`magicbytes`, `wasmplan`, `transformationkey`, `transformationcache`, and `executeisolated` define a separate binary boundary. The module classifies verified byte prefixes, plans bounded WASM work, invalidates cache reuse when source, compiler, key, or policy differ, and calls an injected isolated adapter only. It never creates a process, a container, a filesystem mount, or a network connection by itself.

## execution lifecycle

```text
jobqueued
  -> jobpreparing
  -> runnerselected
  -> jobrunning
  -> jobsyncing
  -> storagecommitted
  -> jobcompleted
```

Failures emit `jobfailed` with an error code, retryability, and a short message. Cleanup runs in a `finally` path after a working set is created. No provider owns retry policy; retry stays at the scheduler and orchestration boundary.

## operation modes

The same contracts support paired modes. A mode can exist without its pair, and an application can add the pair without changing the engine core.

| family | without | with |
|---|---|---|
| library | import the public factories | embed the engine inside an application |
| cli | use the local command surface | connect a custom dispatch adapter |
| binary | run the node entry point | package through a compiler or container |
| memory | internal working set | external, physical, vectorized, or library memory |
| file | internal artifact | external storage or content delivery |
| browser | headless job definition | capture and replay adapter |
| network | local deterministic job | remote provider and storage adapter |

The first cut implements library, CLI, binary entry point, internal memory, and internal file. The other modes are extension points and declarative target plans, not hardcoded platform promises. Version 1.8.9 preserves this boundary while compiling the active engine to ignored `dist/` output.

## infrastructure rules

The engine uses no Netlify Functions and no Vercel Functions. A deployment can use an open Node server, a container, a worker, a forge workflow, or another host that can run the package.

The core does not hardcode a host or port. A future server adapter must receive both as configuration. A temporary session port must be drawn and locked by the caller before it is passed to the adapter. Credentials are never embedded in code and every external service is replaceable through a contract.

Database work remains an adapter concern. Prisma, Drizzle, MySQL2, and other compatible implementations may persist manifests, sessions, chunks, and jobs. Realtime remains an adapter concern and may use Socket or another open transport.

## security boundary

The core does not execute untrusted network code and does not expose credentials to job handlers. A remote runner adapter must declare its permissions, network policy, and cleanup behavior. Captcha solving, anti detection, and browser control are separate opt in surfaces and are not silently enabled by the engine.

## release rule

Every feature is added as a small root module, tested without credentials, and committed after the package check succeeds. External backends arrive one at a time. The public factory signatures stay stable while adapters evolve.
