# Saddle 1.8.13

Saddle 1.8.13 carries the active code and release-facing manifests forward from 1.8.12. The previous [1.8.12 release notes](releasenotes-1.8.12.md) remain the canonical record for the licensing and artifact baseline. The comparative 1.8.21 research is planning material and is not presented as a shipped feature.

## Changes

| Area | Change |
|---|---|
| Persistent queue | Added caller-owned leases, visibility timeout, deterministic clock injection, renewals, attempt accounting and idempotency-key deduplication. Existing crash recovery and retry behavior remain compatible. |
| Version identity | Aligned npm, lockfile, Maven, NuGet, RubyGems, browser extension, Tauri, iOS, crawler and Capacitor metadata to `1.8.13`. The iOS marketing version is `1.8.13` with build `1008013`. |
| Documentation | Added the 1.8.13 release notes and retained the 1.8.12 artifact and signing policy documents. |
| Architecture | Kept the root-first layout, no project-owned `src` directory, transport-neutral exports and caller-owned infrastructure. |

## Artifact contract

The active workflows derive names from the release tag. The following names are expected for a 1.8.13 run; actual URLs, checksums and sizes must come from the completed CI run.

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

## Verification

The queue feature passed the active test suite and engine check. The complete release gate must be rerun after the version bump before a tag or release is created. The 1.8.21 research set is independent of this release and remains untagged.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
[3]: https://github.com/wenathlan/saddle/blob/main/docs/releasenotes-1.8.12.md "Saddle 1.8.12 release notes"
