# Saddle 1.8.14 release notes

Saddle 1.8.14 carries the active code and release-facing manifests forward from 1.8.13. The 1.8.13 release notes remain the canonical record for the previous artifact set. The comparative 1.8.21 research remains planning material and is not presented as a separate shipped version.

## Changes

| Area | Change |
|---|---|
| Version identity | Aligned npm, lockfile, Maven, NuGet, RubyGems, browser extension, Tauri, Capacitor, iOS and crawler metadata to `1.8.14`. The iOS marketing version is `1.8.14` with build `1008014`. |
| Container | Added a build-stage TypeScript engine compilation, runtime-only `dist` copy, `org.opencontainers.image.version` label and post-push pull/label/CLI smoke validation. |
| Registry order | Documented GHCR as the first package surface, followed by GitHub Packages npm, public npmjs, Maven, NuGet and RubyGems. |
| Release automation | Kept the shared release-tag resolver as the only version source; workflows reject tag/package mismatches and do not contain per-release manual versions. |
| Architecture | Kept the root-first layout, no project-owned `src` directory, transport-neutral exports and caller-owned infrastructure. |

## Artifact contract

The active workflows derive names from the `v1.8.14` release tag. The expected artifact family is listed below; attached-asset counts and registry conclusions must be updated only after the release workflows finish.

| Surface | Expected artifact family |
|---|---|
| Linux desktop | `saddle.browser.1.8.14.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop | `saddle.browser.1.8.14.<architecture>.exe`, `.msi` |
| macOS desktop | `saddle.browser.1.8.14.<architecture>.dmg`, `.app.zip` |
| Android | `saddle.apk.1.8.14.apk`, `saddle.aab.1.8.14.aab` |
| iOS | `saddle.ipa.1.8.14.ipa`, `saddle.app.1.8.14.app.zip` |
| Container | `saddle.container.1.8.14.tar.gz` |
| Browser extension | `saddle.extension.1.8.14.zip` |

Signing remains explicit. `unsigned`, `ci-test-key`, `caller-owned`, `notarized` and a provider-reported status are distinct states. These notes do not claim SignPath approval or production signing.

## Registry publication

The six registry workflows derive the version from the same `v1.8.14` release tag through `.github/actions/releaseversion`. GHCR is listed first in the package order and must build, scan, push, pull and smoke-test the published image before the job is successful. The remaining workflows publish GitHub Packages npm, public npmjs, Maven, NuGet GitHub Packages and RubyGems from the same validated version. Public `nuget.org` is not targeted by the current repository workflow.

| Registry | Workflow | Version | Expected result |
|---|---|---:|---|
| GHCR | `publishghcr.yml` | `1.8.14` | build, scan, push, pull and smoke test |
| GitHub Packages npm | `publishgithubnpm.yml` | `1.8.14` | tag-derived package |
| Public npmjs | `publishnpmjs.yml` | `1.8.14` | tag-derived package |
| Maven GitHub Packages | `publishmaven.yml` | `1.8.14` | tag-derived package |
| NuGet GitHub Packages | `publishnuget.yml` | `1.8.14` | tag-derived package |
| RubyGems GitHub Packages | `publishrubygems.yml` | `1.8.14` | tag-derived package |

## Verification policy

Local gates must pass before the tag is created. The release notes must be amended with effective asset names and workflow conclusions only after remote verification. Production signing remains pending until caller-owned certificates and provider configuration are supplied.

## References

[1]: https://github.com/wenathlan/saddle "Saddle source repository"
[2]: https://github.com/wenathlan/saddle/releases "Saddle release archive"
[3]: https://github.com/wenathlan/saddle/blob/main/docs/releasenotes-1.8.13.md "Saddle 1.8.13 release notes"
