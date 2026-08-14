# Saddle 1.8.13

Saddle 1.8.13 carries the active code and release-facing manifests forward from 1.8.12. The previous [1.8.12 release notes](releasenotes-1.8.12.md) remain the canonical record for the licensing and artifact baseline. The comparative 1.8.21 research is planning material and is not presented as a shipped feature.

## Changes

| Area | Change |
|---|---|
| Persistent queue | Added caller-owned leases, visibility timeout, deterministic clock injection, renewals, attempt accounting and idempotency-key deduplication. Existing crash recovery and retry behavior remain compatible. |
| Version identity | Aligned npm, lockfile, Maven, NuGet, RubyGems, browser extension, Tauri, iOS, crawler and Capacitor metadata to `1.8.13`. The iOS marketing version is `1.8.13` with build `1008013`. |
| Structured extraction | Added a schema-neutral result with field-level source URL, selector, extraction timestamp, bounded UTF-8 payload and caller-injected parser support. |
| Browser context | Added allowlisted snapshot projection with stable snapshot and element references, deterministic UTF-8 byte budgets and truncation metadata. |
| Workflow lifecycle | Extended resumable runs with explicit cancellation reasons and caller-owned, idempotent compensation callbacks. Compensation failures are surfaced as `COMPENSATION_FAILED`. |
| Artifact retention | Added deterministic keep/prune decisions by maximum age, count or bytes. Manifest generation records policy and decisions and never deletes caller files. |
| Documentation | Added the 1.8.13 release notes and retained the 1.8.12 artifact and signing policy documents. |
| Architecture | Kept the root-first layout, no project-owned `src` directory, transport-neutral exports and caller-owned infrastructure. |

## Artifact contract

The active workflows derive names from the release tag. The `v1.8.13` release was published and contains the generated assets listed below; iOS remains unavailable because Apple signing and provisioning were not configured.

| Surface | Expected artifact family |
|---|---|
| Linux desktop | `saddle.browser.1.8.13.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop | `saddle.browser.1.8.13.<architecture>.exe`, `.msi` |
| macOS desktop | `saddle.browser.1.8.13.<architecture>.dmg`, `.app.zip` |
| Android | `saddle.apk.1.8.13.apk`, `saddle.aab.1.8.13.aab` |
| iOS | `saddle.ipa.1.8.13.ipa`, `saddle.app.1.8.13.app.zip` |
| Container | `saddle.container.1.8.13.tar.gz` |
| Browser extension | `saddle.extension.1.8.13.zip` |

Signing remains explicit. `unsigned`, `ci-test-key`, `caller-owned`, `notarized` and a provider-reported status are distinct states. This release note does not claim SignPath approval or production signing.

## Verified attached assets

The release contains **38 attached assets**. Desktop binaries are unsigned, Android APK/AAB files use the explicitly labeled `ci-test-key`, and the container is marked `caller-owned`.

| Surface | Attached assets | Signing |
|---|---|---|
| Linux desktop | `saddle.browser.1.8.13.x64.deb`, `saddle.browser.1.8.13.x64.rpm`, `saddle.browser.1.8.13.x64.appimage`, `saddle.browser.1.8.13.arm64.deb`, `saddle.browser.1.8.13.arm64.rpm`, `saddle.browser.1.8.13.arm64.appimage` | `unsigned` |
| Windows desktop | `saddle.browser.1.8.13.x86.exe`, `saddle.browser.1.8.13.x86.msi`, `saddle.browser.1.8.13.x64.exe`, `saddle.browser.1.8.13.x64.msi`, `saddle.browser.1.8.13.arm64.exe`, `saddle.browser.1.8.13.arm64.msi` | `unsigned` |
| macOS desktop | `saddle.browser.1.8.13.x64.dmg`, `saddle.browser.1.8.13.x64.app.zip`, `saddle.browser.1.8.13.arm64.dmg`, `saddle.browser.1.8.13.arm64.app.zip` | `unsigned` |
| Android | `saddle.apk.1.8.13.apk`, `saddle.aab.1.8.13.aab` | `ci-test-key` |
| Container | `saddle.container.1.8.13.tar.gz` | `caller-owned` |
| Browser extension | `saddle.extension.1.8.13.zip` | `unsigned` |
| Manifests | `manifest.android.1.8.13.json`, `manifest.container.1.8.13.json`, `manifest.desktop.linux.arm64.1.8.13.json`, `manifest.desktop.linux.x64.1.8.13.json`, `manifest.desktop.macos.arm64.1.8.13.json`, `manifest.desktop.macos.x64.1.8.13.json`, `manifest.desktop.windows.arm64.1.8.13.json`, `manifest.desktop.windows.x64.1.8.13.json`, `manifest.desktop.windows.x86.1.8.13.json` | metadata |
| Checksums | `sha256.android.1.8.13`, `sha256.container.1.8.13`, `sha256.desktop.linux.arm64.1.8.13`, `sha256.desktop.linux.x64.1.8.13`, `sha256.desktop.macos.arm64.1.8.13`, `sha256.desktop.macos.x64.1.8.13`, `sha256.desktop.windows.arm64.1.8.13`, `sha256.desktop.windows.x64.1.8.13`, `sha256.desktop.windows.x86.1.8.13` | integrity metadata |

## Registry publication

The six registry workflows derive the version from the same `v1.8.13` release tag through `.github/actions/releaseversion`. The release-event jobs completed successfully for GitHub Packages npm, public npmjs, Maven and RubyGems. GHCR completed successfully after the corrected Buildx and image-hardening rerun. NuGet was rerun manually from `main` and completed successfully with `Saddle.1.8.13.nupkg`; the package is published to GitHub Packages NuGet under the `wenathlan` owner. Public `nuget.org` was not targeted by the repository workflow and is not claimed here.

| Registry | Workflow | Verified version | Result |
|---|---|---:|---|
| GHCR | `publishghcr.yml` | `1.8.13` | success after corrected rerun |
| GitHub Packages npm | `publishgithubnpm.yml` | `1.8.13` | success |
| Public npmjs | `publishnpmjs.yml` | `1.8.13` | success |
| Maven GitHub Packages | `publishmaven.yml` | `1.8.13` | success |
| NuGet GitHub Packages | `publishnuget.yml` | `1.8.13` | success after explicit rerun |
| RubyGems GitHub Packages | `publishrubygems.yml` | `1.8.13` | success |

## Verification

The queue, structured extraction, browser context, workflow compensation and retention features passed the active engine and release test suites. The release validation workflow passed, and the live release contains the 38 assets listed above. The original release-event security, GHCR and mobile failures were superseded by successful corrected reruns; production signing remains pending.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
[3]: https://github.com/wenathlan/saddle/blob/main/docs/releasenotes-1.8.12.md "Saddle 1.8.12 release notes"
