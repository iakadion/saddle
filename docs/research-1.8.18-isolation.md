# 1.8.18 isolation research record

## Purpose

This record classifies operational prerequisites for the execution adapters proposed for Saddle 1.8.18. It is evidence for planning only; it does not add a provider dependency, provision infrastructure, or assert that Saddle already operates any of the listed systems.

## Findings

| Technology | Verified finding | Saddle disposition |
| --- | --- | --- |
| Neko | Neko is a self-hosted remote browser or desktop built around container images and WebRTC. Operation requires image selection, networking, authentication, and usually a TURN or port-routing strategy. Browser persistence and file access require explicit policy or volume configuration. | Treat as a caller-owned remote-browser adapter candidate. The root library can describe requirements and validate a receipt; it cannot claim remote browser isolation without a configured operator deployment. |
| gVisor | gVisor supplies the OCI `runsc` runtime for sandboxed containers. It has its own compatibility and performance boundaries and is not a conventional virtual machine. | Treat as a caller-owned OCI isolation adapter candidate. A plan must declare the image, mount, network, resource and receipt policy before dispatch. |
| Firecracker | Firecracker runs KVM micro-VMs and requires host KVM access, a compatible Linux architecture, kernel image, root filesystem image, and production jailer configuration. | Treat as a caller-owned micro-VM adapter candidate requiring dedicated host infrastructure. It cannot run in the transport-neutral root or be promised by the static website. |

## Planning implication

The feasible 1.8.18 foundation is a serializable, denied-by-default execution plan plus adapter interfaces and capability receipts. The initial `web/` playground can let an operator create and inspect plans, binary metadata and policy outcomes with safe local fixtures. It must not execute uploaded binaries, create sandboxes, attach to Docker, start browser sessions, manage credentials, or expose a network target without a separately configured backend.

## Submitted-material synthesis

The submitted conversation records request that the former multi-site design be consolidated into one `web/` site. The useful architectural intent is a single user-facing surface that has internal API boundaries corresponding to a gateway, a plan coordinator, a working-set/materialization layer, an executor boundary, a persistence boundary, and a receipt/audit projection. That intent is compatible with Saddle's contract model when each boundary is represented by a deterministic in-memory demonstration adapter by default.

The same records contain several claims that must not become product statements. A static site cannot be a server, a VPS, or a micro-VM by itself. An in-memory filesystem, SQLite `:memory:`, PouchDB memory adapter, or JavaScript object graph still consumes the memory and CPU of whichever process hosts it; it provides data isolation or a logical model, not no-hardware computation. An actual remote browser, binary processor, container, gVisor sandbox, or Firecracker micro-VM necessarily runs on some host and consumes its resources. A persistent embedded database necessarily consumes the host's storage. Those capabilities therefore remain disabled unless the caller explicitly provides an adapter and an approval; the default playground will demonstrate planning and denial paths only.

The requested product default is consequently recorded as: no user-machine access, no implicit network call, no provider account, no paid product, no free-tier product, no local disk use, no binary execution, no browser launch, and no remote dispatch. A caller may add a local, remote, storage, database, browser, container, or micro-VM adapter later, but the receipt must identify that it was enabled and what resources it is permitted to use.

## Submitted material provenance

1. User-provided `CONVERSA25.txt`
2. User-provided `CONVERSA26.txt`
3. User-provided `CONVERSA27.txt`
4. User-provided `conversa.txt`
5. User-provided `pasted_content.txt`

## Playground verification

The unified `/playground` route was built and inspected through a temporary preview. The rendered page presents the six internal boundaries, the fixed binary descriptor, a default `EXECUTION_POLICY_DENIED` projection with an empty effects list, and an optional handoff projection that remains explicitly non-executing. The navigation includes the new Playground route and the page copy distinguishes internal typed envelopes from hidden endpoints, second sites, remote machines, or active infrastructure. The responsive layout presents the boundary map as an editorial six-stage band and places the policy-state projection beside its two state controls without visually implying that either button starts an executor. Selecting the optional state changed the projection to `CALLER_ADAPTER_REQUIRED` with `caller-delegates` and an empty effects array; it did not add a real adapter or initiate an operation.

## Sources

1. [Neko documentation](https://neko.m1k1o.net/docs/v2)
2. [Firecracker getting started guide](https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md)
3. [gVisor documentation](https://gvisor.dev/docs/)
