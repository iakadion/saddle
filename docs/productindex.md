# saddle product surfaces

Saddle is the contract layer for a family of caller-owned surfaces. The library does not ship a desktop toolkit, mobile runtime, n8n server, browser account, or hosted control plane. It describes the boundaries, validates declarations, orchestrates injected handlers, and preserves structured failure information.

## surface map

| Surface | Current contract | Caller-owned concern |
| --- | --- | --- |
| library | root ESM entry and stable factories | application lifecycle and deployment |
| desktop | `desktopmanifest` and `desktopadapter` | windowing, filesystem policy, signing and native packaging |
| mobile | `mobilemanifest` and `mobileadapter` | screen lifecycle, secure storage, permissions and app-store packaging |
| n8n | `n8nnode`, `n8nmatch` and `n8nexecute` | node registration, credential UI, workflow persistence and execution host |
| operations | `operationsmetrics`, `retentionpolicy`, `backupplan` and `threatmodel` | telemetry exporter, backup store, retention worker and incident response |
| cross runtime | `runtimecontract`, `memorystorage` and root ESM import | runtime-specific APIs and package loader behavior |
| browser worker | `workerbridge` and root-safe contracts | worker lifecycle, message transport and extension permissions |
| browser | browser agent and snapshot contracts | browser vendor adapter, profile and session ownership |
| extension | Manifest V3 reference files, serializable protocol and `permissionpolicy` | browser permission grant, signing and store submission |
| web control | API, service, `controlsurface` and `controlservice` contracts | operator UI, authentication, database and hosting |

## operating boundary

The engine never invents a host, port, credential, account, app identifier, browser profile, or cloud provider. A surface adapter should expose only the operations that its host can execute. Unsupported operations return a structured capability result, while handler failures preserve a stable code and message for operator logs.

The cross-runtime boundary keeps the root entry free of filesystem, Node HTTP and other Node-only imports. Those adapters remain explicit imports so callers can select them in Node without making browser worker, Deno or Bun consumers pay for unavailable APIs.

## block 10 scope

The first Block 10 slice establishes the desktop and mobile adapter boundaries, expands the n8n node declaration to the workflow trigger vocabulary already used by the engine, adds product documentation, exposes an auditable operator control contract for jobs, sessions, storage, runners, permissions, logs and artifacts, and defines bounded operations policies for metrics, retention, backup, restore and threat ownership. The concrete UI, authentication, telemetry export, persistence and incident response remain caller-owned.
