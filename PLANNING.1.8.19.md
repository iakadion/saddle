# Saddle 1.8.19 planning base

## Product direction

Saddle 1.8.19 prioritizes a **virtual control plane**. The library can represent, validate, compare, deny and hand off requests for virtual storage, binary processing, containers, micro-VMs and browser sessions. It does not silently access a user's device, installed browser, browser profile, local files, local storage, credentials, process table or network configuration.

“Virtual” is an operational property of a caller-owned remote adapter and its host. A browser-only demonstration, an in-memory object or an in-process cache cannot be represented as a virtual machine, remote browser or remote storage service. Every operational effect requires an explicit policy, approval, named adapter and receipt.

## Browser direction

| Surface | 1.8.19 interpretation | Operational boundary |
| --- | --- | --- |
| Saddle Browser | A custom visual shell, session manifest and adapter-selection surface. | It becomes a remote isolated browser only when a caller supplies a verified browser-runtime adapter. |
| Chromium family | Capability adapters for Chromium, Chrome, Edge, Brave, Vivaldi, Opera and compatible distributions. | One selected remote image or executable has one declared engine and distribution; the root does not install or control it. |
| Gecko family | Capability adapters for Firefox, Tor Browser and compatible Gecko distributions. | A Gecko adapter is distinct from a Chromium adapter and must have its own capability receipt. |
| WebKit family | A future capability adapter family, included in planning for broad engine coverage. | No WebKit runtime is claimed or activated by 1.8.19 planning. |
| Remote browser service | An adapter contract compatible with an operator-hosted browser container or remote-display service. | It requires a host, runtime/image, network and authentication policy owned by the operator. |

The product must not claim that a single “master browser” merges the Chromium and Gecko engines. The realistic path is one custom Saddle Browser experience that selects among independently built and independently evidenced engine adapters.

## Virtual execution direction

| Request | Root-library result | Required operational adapter |
| --- | --- | --- |
| Remote artifact transfer | A bounded storage plan, policy decision and handoff reference. | A caller-owned remote storage adapter. |
| Binary processing | An inspection, transform or execution plan with no local effect. | A caller-owned WASM, container, process, micro-VM or remote-runner adapter. |
| Container job | An image, platform, limits and receipt requirement. | An operator-owned OCI runtime and host. |
| Micro-VM job | Kernel/image/limit/network requirements and a lifecycle receipt schema. | An operator-owned micro-VM host with real virtualization support. |
| Browser session | Engine preference, profile policy, network policy and capability request. | An operator-owned remote-browser adapter. |

## Neko-derived architecture evidence

Neko describes itself as a self-hosted virtual browser that runs in Docker and streams a desktop using WebRTC. Its public GitHub workflow builds a base image and separate application images through a matrix of browser and desktop choices, with platform declarations rather than a merged browser engine.[1] Its documentation makes file uploads/downloads and persistent browser profiles explicit policy changes, and its remote transport requires WebRTC networking or a TURN configuration.[2]

Saddle can adopt these **architectural lessons** without copying Neko or assuming its infrastructure exists: use a base runtime plus distinct engine images, record platform/image capability receipts, treat remote display as a transport adapter, keep browser profile persistence opt-in, and separate build workflows from service operation. A Neko-compatible adapter remains a future integration point; it is not an embedded service in the package.

## 1.8.19 first implementation selection

The first implementable block is an additive **remote-browser capability contract** that extends the 1.8.18 denied-by-default isolation API. It must represent engine family, distribution, session policy, display transport, image reference, storage policy, capability receipt and adapter handoff. Deterministic tests will verify selection and denial states without starting a browser, container, micro-VM or network service.

## Artifact recovery boundary

The public `v1.8.18` tag and the packages already released from it remain immutable. Failed desktop and mobile release jobs used the tagged source that predated the web alias correction. Rerunning such a job would repeat the old source failure; a complete corrected desktop/mobile asset matrix therefore requires a later version after the 1.8.19 source is approved. The 1.8.18 package registries, Pages deployment and successful workflow evidence remain separate from missing release attachments.

## References

[1] [Neko repository and GHCR image build workflow](https://github.com/m1k1o/neko)

[2] [Neko documentation: browser images, WebRTC, storage and profile policies](https://neko.m1k1o.net/docs/v2)
