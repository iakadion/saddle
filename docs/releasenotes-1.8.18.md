# Saddle 1.8.18

Saddle 1.8.18 adds a data-only isolation planning surface and a single-site playground. It does not turn the package into a VPS, a micro-VM, a database host, a remote browser, or an executor. A binary, browser, container, provider, storage, database, network, or host operation remains unavailable until an operator supplies a compatible adapter, an explicit policy and a matching approval. The initial web projection uses a fixed safe fixture and produces only plans, denials or caller-owned handoffs.

## Changes

| Area | Change |
| --- | --- |
| Isolation contracts | Adds `executionrequest`, `executiondecision` and `executionhandoff` to normalize intent, make the default denial explicit and render an adapter handoff without invoking it. |
| Internal API | Adds `internalenvelope` and `internalapi` for typed gateway, planning, policy, materialization, execution, persistence and evidence projections. |
| Package surface | Adds `@wenathlan/saddle/isolation` as a narrow browser-safe subpath instead of requiring the complete root export graph. |
| Default posture | Rejects effects without matching effect policy, target policy, approval, adapter capability and named adapter owner. The decision contains no effect invocation. |
| Playground | Adds the unified `/playground` route under `web/`, showing a fixed descriptor, six internal boundaries and the difference between denial and a still-non-executing handoff. |
| Versioning | Aligns active package, registry, native, extension, crawler, Capacitor and iOS metadata to `1.8.18`, with iOS build number `1008018`. |

## Operational boundary

An in-memory object, an in-memory database or a JavaScript data structure runs on the resources of its process host. It is not a VPS or a micro-VM. A remote browser, OCI sandbox, WebAssembly runtime and KVM micro-VM likewise require a real operator host and resource budget. The library does not select, pay for, create or use any such infrastructure. The new contracts make those future integration points explicit without activating them.

## Expected artifact matrix

The tag-driven release workflow derives names from `v1.8.18`. If the platform workflows complete, the candidate matrix contains the following 38 release assets. This is an expected matrix, not a claim that assets, registry entries, signatures, scans or platform execution have already been independently verified.

| Class | Expected assets |
| --- | --- |
| Primary artifacts | `saddle.aab.1.8.18.aab`, `saddle.apk.1.8.18.apk`, `saddle.browser.1.8.18.arm64.app.zip`, `saddle.browser.1.8.18.arm64.appimage`, `saddle.browser.1.8.18.arm64.deb`, `saddle.browser.1.8.18.arm64.dmg`, `saddle.browser.1.8.18.arm64.exe`, `saddle.browser.1.8.18.arm64.msi`, `saddle.browser.1.8.18.arm64.rpm`, `saddle.browser.1.8.18.x64.app.zip`, `saddle.browser.1.8.18.x64.appimage`, `saddle.browser.1.8.18.x64.deb`, `saddle.browser.1.8.18.x64.dmg`, `saddle.browser.1.8.18.x64.exe`, `saddle.browser.1.8.18.x64.msi`, `saddle.browser.1.8.18.x64.rpm`, `saddle.browser.1.8.18.x86.exe`, `saddle.browser.1.8.18.x86.msi`, `saddle.container.1.8.18.tar.gz`, `saddle.extension.1.8.18.zip` |
| Manifests | `manifest.android.1.8.18.json`, `manifest.container.1.8.18.json`, `manifest.desktop.linux.arm64.1.8.18.json`, `manifest.desktop.linux.x64.1.8.18.json`, `manifest.desktop.macos.arm64.1.8.18.json`, `manifest.desktop.macos.x64.1.8.18.json`, `manifest.desktop.windows.arm64.1.8.18.json`, `manifest.desktop.windows.x64.1.8.18.json`, `manifest.desktop.windows.x86.1.8.18.json` |
| Checksums | `sha256.android.1.8.18`, `sha256.container.1.8.18`, `sha256.desktop.linux.arm64.1.8.18`, `sha256.desktop.linux.x64.1.8.18`, `sha256.desktop.macos.arm64.1.8.18`, `sha256.desktop.macos.x64.1.8.18`, `sha256.desktop.windows.arm64.1.8.18`, `sha256.desktop.windows.x64.1.8.18`, `sha256.desktop.windows.x86.1.8.18` |

## Verification boundary

The deterministic engine suite has passed 139 active tests for this candidate. The web TypeScript check and static build have passed, and the `/playground` route was manually verified in its denial and handoff-projection states. Registry availability, image manifest inspection, scan results, signing status, SBOM validation, Android signing, iOS artifacts and attached release assets must be recorded only after their relevant workflow outputs independently complete.
