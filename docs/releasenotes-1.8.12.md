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

The release workflows derive the version from the release tag and use these lowercase dotted names. This table is the contract expected from CI; it does not claim that an asset exists until the corresponding workflow attaches it.

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

## Compatibility and upgrade notes

The public package remains `@wenathlan/saddle`. The release does not downgrade the package to `1.8.3`; the active version is `1.8.12`. Version `1.8.21` is reserved for the next objective-driven research and implementation cycle. SignPath Foundation approval and production code-signing credentials remain caller-owned and are not implied by this release note.

## Verification

The prepared state passed 107 active tests, 69 legacy tests, engine build and syntax checks, formatting checks, web TypeScript and Pages build checks, npm pack dry-run, npm audit, flat-native validation and diff hygiene. Final artifact sizes and live download URLs must be filled from the actual GitHub Actions release run rather than estimated in advance.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
[3]: https://github.com/wenathlan/saddle/blob/main/LICENSE "Saddle GPL-3.0-only license"
