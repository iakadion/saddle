# Saddle 1.8.16

Saddle 1.8.16 adds a pure, policy-evaluable release-evidence layer above existing checksum verification. The library normalizes caller-supplied evidence, evaluates it through explicit policy, and creates a serializable release-readiness receipt. It remains descriptive: it does not fetch artifacts, scan files, query CVE feeds, sign content, create tags, invoke CI, publish packages, or contact a registry.

## Changes

| Area | Change |
|---|---|
| Evidence | Added `releaseevidence` with explicit `notProvided`, `declared`, `parsed`, `checked`, `verified`, `rejected`, and `unknown` states. |
| Policy | Added `evaluateevidence` with caller-selected evidence kinds, allowed states, expected producer/workflow values, ordered reasons, and `accepted`, `rejected`, or `insufficient` outcomes. |
| Readiness | Added `releasereadiness`, which binds source tag, observed manifest versions, gates, artifact-plan digest, targets, signing state, and an evidence evaluation without executing a release. |
| Verification bridge | Added `evidencefromverification`, which converts only an already-valid local `verifyassets` checksum result to `checked` evidence and retains signing state as metadata. |
| API | Added the root export and `@wenathlan/saddle/release-evidence` subpath, documented in the public library API. |
| Validation | The candidate passed 136 active tests, 69 legacy tests, engine build, web checks/build, format validation, package dry-run, high-severity audit, flat native validation, and whitespace validation. |

## Artifact contract

The release workflows derived artifact names and package versions from `v1.8.16`. The matrix below matches the attached release assets after the platform workflows completed; signing status remains explicit rather than inferred from a filename.

| Group | Expected attached assets |
|---|---|
| Linux desktop | `saddle.browser.1.8.16.x64.appimage`, `saddle.browser.1.8.16.x64.deb`, `saddle.browser.1.8.16.x64.rpm`, `saddle.browser.1.8.16.arm64.appimage`, `saddle.browser.1.8.16.arm64.deb`, `saddle.browser.1.8.16.arm64.rpm` |
| Windows desktop | `saddle.browser.1.8.16.x86.exe`, `saddle.browser.1.8.16.x86.msi`, `saddle.browser.1.8.16.x64.exe`, `saddle.browser.1.8.16.x64.msi`, `saddle.browser.1.8.16.arm64.exe`, `saddle.browser.1.8.16.arm64.msi` |
| macOS desktop | `saddle.browser.1.8.16.x64.dmg`, `saddle.browser.1.8.16.x64.app.zip`, `saddle.browser.1.8.16.arm64.dmg`, `saddle.browser.1.8.16.arm64.app.zip` |
| Android | `saddle.apk.1.8.16.apk`, `saddle.aab.1.8.16.aab` |
| Container | `saddle.container.1.8.16.tar.gz` |
| Browser extension | `saddle.extension.1.8.16.zip` |
| Manifests | `manifest.android.1.8.16.json`, `manifest.container.1.8.16.json`, `manifest.desktop.linux.arm64.1.8.16.json`, `manifest.desktop.linux.x64.1.8.16.json`, `manifest.desktop.macos.arm64.1.8.16.json`, `manifest.desktop.macos.x64.1.8.16.json`, `manifest.desktop.windows.arm64.1.8.16.json`, `manifest.desktop.windows.x64.1.8.16.json`, `manifest.desktop.windows.x86.1.8.16.json` |
| Checksums | `sha256.android.1.8.16`, `sha256.container.1.8.16`, `sha256.desktop.linux.arm64.1.8.16`, `sha256.desktop.linux.x64.1.8.16`, `sha256.desktop.macos.arm64.1.8.16`, `sha256.desktop.macos.x64.1.8.16`, `sha256.desktop.windows.arm64.1.8.16`, `sha256.desktop.windows.x64.1.8.16`, `sha256.desktop.windows.x86.1.8.16` |

The release contains **38 attached assets**: 20 primary artifacts, nine manifests, and nine checksum files. iOS artifacts are absent because Apple signing, provisioning, and export credentials remain caller-owned and no IPA or app archive was built.

## Publication and verification policy

The six registry workflows publish from the same validated release tag, in container-first order: GHCR, GitHub Packages npm, public npmjs, Maven, NuGet GitHub Packages, and RubyGems. The GHCR workflow must build, scan, push, pull, inspect its OCI version label, and complete a smoke check. The release does not claim SignPath approval, Authenticode trust, Apple notarization, production Android signing, SBOM validation, vulnerability status, or registry availability unless the completed workflow output independently supports that claim.

## Verified publication results

The release validation, security, container artifact, desktop artifact, target-plan, and extension workflows completed successfully. The six tag-driven registry workflows also completed successfully: GHCR, GitHub Packages npm, public npmjs, Maven, NuGet GitHub Packages, and RubyGems. The release-event Android job correctly stopped when production Android signing secrets were unavailable. Manual run `31839378707` then produced and attached the APK and AAB through the explicitly allowed `ci-test-key` path; it is not presented as a production Android signing result.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
