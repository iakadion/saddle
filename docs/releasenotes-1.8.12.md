# Saddle 1.8.12

Saddle 1.8.12 consolidates the root-first native surfaces, the GPL-3.0-only project policy, release provenance and the cross-platform artifact contract. The package manifest and active native manifests remain at `1.8.12`. The uploaded scope README is not an execution script and was not rewritten.

## Highlights

| Area | Change |
|---|---|
| Licensing | Canonical GPL-3.0-only license, aligned package metadata and consolidated root legal documents. |
| Release verification | Independent checksum, manifest and explicit signing-state verification. |
| Storage | Paginated S3-compatible listing with prefix, continuation token, XML entity decoding and caller-owned limits. |
| Scraping | Bounded recursive sitemap traversal with deduplication, cycle protection and injected fetcher. |
| Browser | Bounded action recorder with immutable manifests, JSON export and explicit clearing. |
| Workflows | Strict typed inputs, defaults, choices and deterministic trigger identities. |
| Modes | Cross-runtime capability report with caller-owned host, port, credentials and provider boundaries. |
| Security | Existing CodeQL, OSV, npm audit, cargo audit, Trivy, SBOM and provenance gates remain active. |

## Artifact matrix

The release workflows derive the version from the release tag and use these lowercase dotted names. The `v1.8.12` release was published and contains the generated assets listed below; iOS remains unavailable because Apple signing and provisioning were not configured.

| Surface | Architectures or mode | Expected artifact |
|---|---|---|
| Linux desktop browser | x64, arm64 | `saddle.browser.1.8.12.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop browser | x86, x64, arm64 | `saddle.browser.1.8.12.<architecture>.exe`, `.msi` |
| macOS desktop browser | x64, arm64 | `saddle.browser.1.8.12.<architecture>.dmg`, `.app.zip` |
| Android | caller-configured signing | `saddle.apk.1.8.12.apk`, `saddle.aab.1.8.12.aab` |
| iOS | caller-configured signing and provisioning | `saddle.ipa.1.8.12.ipa`, `saddle.app.1.8.12.app.zip` |
| Container | OCI | `saddle.container.1.8.12.tar.gz` |
| Browser extension | Manifest V3 | `saddle.extension.1.8.12.zip` |

Each generated surface must carry its checksum and manifest companion. Where enabled, CI also emits SBOM and provenance metadata. The signing state must be one of `unsigned`, `ci-test-key`, `caller-owned`, `notarized` or the exact provider status produced by CI. No unsigned artifact is described as trusted or production-signed.

## Verified attached assets

The release contains **38 attached assets**. Desktop binaries are unsigned, Android APK/AAB files use the explicitly labeled `ci-test-key`, and the container is marked `caller-owned`.

| Surface | Attached assets | Signing |
|---|---|---|
| Linux desktop | `saddle.browser.1.8.12.x64.deb`, `saddle.browser.1.8.12.x64.rpm`, `saddle.browser.1.8.12.x64.appimage`, `saddle.browser.1.8.12.arm64.deb`, `saddle.browser.1.8.12.arm64.rpm`, `saddle.browser.1.8.12.arm64.appimage` | `unsigned` |
| Windows desktop | `saddle.browser.1.8.12.x86.exe`, `saddle.browser.1.8.12.x86.msi`, `saddle.browser.1.8.12.x64.exe`, `saddle.browser.1.8.12.x64.msi`, `saddle.browser.1.8.12.arm64.exe`, `saddle.browser.1.8.12.arm64.msi` | `unsigned` |
| macOS desktop | `saddle.browser.1.8.12.x64.dmg`, `saddle.browser.1.8.12.x64.app.zip`, `saddle.browser.1.8.12.arm64.dmg`, `saddle.browser.1.8.12.arm64.app.zip` | `unsigned` |
| Android | `saddle.apk.1.8.12.apk`, `saddle.aab.1.8.12.aab` | `ci-test-key` |
| Container | `saddle.container.1.8.12.tar.gz` | `caller-owned` |
| Browser extension | `saddle.extension.1.8.12.zip` | `unsigned` |
| Manifests | `manifest.android.1.8.12.json`, `manifest.container.1.8.12.json`, `manifest.desktop.linux.arm64.1.8.12.json`, `manifest.desktop.linux.x64.1.8.12.json`, `manifest.desktop.macos.arm64.1.8.12.json`, `manifest.desktop.macos.x64.1.8.12.json`, `manifest.desktop.windows.arm64.1.8.12.json`, `manifest.desktop.windows.x64.1.8.12.json`, `manifest.desktop.windows.x86.1.8.12.json` | metadata |
| Checksums | `sha256.android.1.8.12`, `sha256.container.1.8.12`, `sha256.desktop.linux.arm64.1.8.12`, `sha256.desktop.linux.x64.1.8.12`, `sha256.desktop.macos.arm64.1.8.12`, `sha256.desktop.macos.x64.1.8.12`, `sha256.desktop.windows.arm64.1.8.12`, `sha256.desktop.windows.x64.1.8.12`, `sha256.desktop.windows.x86.1.8.12` | integrity metadata |

## Compatibility and upgrade notes

The public package remains `@wenathlan/saddle`. The release does not downgrade the package to `1.8.3`; the active version is `1.8.12`. Version `1.8.21` is reserved for the next objective-driven research and implementation cycle. SignPath Foundation approval and production code-signing credentials remain caller-owned and are not implied by this release note.

## Verification

The release validation workflow passed, and the live release contains the 38 assets listed above. The original release-event security and mobile jobs were superseded by successful, explicitly labeled manual reruns; no production signing claim is made.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
[3]: https://github.com/wenathlan/saddle/blob/main/LICENSE "Saddle GPL-3.0-only license"
