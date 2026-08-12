# saddle product surfaces

Saddle is the contract layer for a family of caller-owned surfaces. The library does not ship a desktop toolkit, mobile runtime, n8n server, browser account, or hosted control plane. It describes the boundaries, validates declarations, orchestrates injected handlers, and preserves structured failure information.

## surface map

| Surface | Current contract | Caller-owned concern |
| --- | --- | --- |
| library | root ESM entry and stable factories | application lifecycle and deployment |
| desktop | `desktopmanifest` and `desktopadapter` | windowing, filesystem policy, signing and native packaging |
| mobile | `mobilemanifest` and `mobileadapter` | screen lifecycle, secure storage, permissions and app-store packaging |
| n8n | `n8nnode`, `n8nmatch` and `n8nexecute` | node registration, credential UI, workflow persistence and execution host |
| browser | browser agent and snapshot contracts | browser vendor adapter, profile and session ownership |
| extension | Manifest V3 reference files and serializable protocol | browser permission grant, signing and store submission |
| web control | API and service contracts | operator UI, authentication, database and hosting |

## operating boundary

The engine never invents a host, port, credential, account, app identifier, browser profile, or cloud provider. A surface adapter should expose only the operations that its host can execute. Unsupported operations return a structured capability result, while handler failures preserve a stable code and message for operator logs.

## block 10 scope

The first Block 10 slice establishes the desktop and mobile adapter boundaries, expands the n8n node declaration to the workflow trigger vocabulary already used by the engine, and adds product documentation. Operator controls for jobs, sessions, storage, runners, permissions, logs and artifacts remain a subsequent slice around these same contracts.
