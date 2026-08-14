# Saddle 1.8.15

Saddle 1.8.15 adds transport-neutral contracts for verified storage, bounded working sets, isolated transformations, provider selection and immutable delivery. The shared core remains declarative: it does not create runners, start containers, register service workers, mutate DNS, transfer artifacts or execute binaries without a caller-owned adapter.

## Changes

| Area | Change |
|---|---|
| Storage | Added verified pool reads, primary/mirror/fan-out writes, quorum evidence, operation budgets, range reads, repair plans and verified-source restore plans. |
| Memory | Added bounded working-set admission, capability-gated bridge plans, materialization transitions and declarative cleanup plans. |
| Transformations | Added magic-byte classification, bounded WASM plans, isolated adapters, archive inspection limits and cache eligibility controls. |
| Providers | Added capability-based selection, caller preferences, dry-run rendering, integrity-bound handoff and cancellation plans with unknown remote state preserved. |
| Delivery | Added immutable chunk manifests, verification without evaluation, PWA/CDN capability reports, Mini App validation requirements and DNS/application bridge descriptors. |
| Validation | Active tests increased to 132 while the 69 legacy tests remain green; package, flat native, web and audit gates passed. |

## Artifact contract

The release workflows derive artifact names and package versions from `v1.8.15`. The following artifact families are expected from the release pipelines; signing remains explicit and is never inferred from a filename.

| Surface | Artifact family |
|---|---|
| Linux desktop | `saddle.browser.1.8.15.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop | `saddle.browser.1.8.15.<architecture>.exe`, `.msi` |
| macOS desktop | `saddle.browser.1.8.15.<architecture>.dmg`, `.app.zip` |
| Android | `saddle.apk.1.8.15.apk`, `saddle.aab.1.8.15.aab` |
| iOS | `saddle.ipa.1.8.15.ipa`, `saddle.app.1.8.15.app.zip` |
| Container | `saddle.container.1.8.15.tar.gz` |
| Browser extension | `saddle.extension.1.8.15.zip` |

## Publication and verification policy

The six registry workflows publish from the same validated release tag, in container-first order: GHCR, GitHub Packages npm, public npmjs, Maven, NuGet GitHub Packages and RubyGems. GHCR must build, scan, push, pull, inspect its OCI version label and complete a smoke check. Production signing remains caller-owned; the release does not claim SignPath approval, Apple notarization or a production Android signing key unless a workflow reports those states.

## Verified publication results

The v1.8.15 release has **38 attached assets** after the desktop rerun completed. GHCR, GitHub Packages npm, npmjs, Maven, NuGet and RubyGems completed successfully from the release event. The initial release-event Android job correctly failed because no production signing secrets were present; manual run `31835215420` completed with the explicitly labeled `ci-test-key` fallback. The desktop rerun completed after a transient macOS asset-attachment failure, without changing the tag or claiming notarization.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
