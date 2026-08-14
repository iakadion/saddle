# Saddle 1.8.9 artifact availability

Saddle 1.8.9 is a TypeScript-first engine release with native packaging generated from the shared Tauri 2 desktop boundary. The workflows derive the release version from the release tag and attach only the files produced by the corresponding runner. Tauri documents `android build` and `ios build` as separate platform commands, while the desktop `build` command generates platform installers from the resolved frontend distribution [1].

## Verified release assets

The following artifacts are attached to the [v1.8.9 GitHub release][3]. The desktop assets are unsigned build artifacts; code signing, notarization and store submission remain caller-owned. The Android files are debug-signed test artifacts and are not production store releases.

| Surface           | Generated asset                                                                                                                   | Release status | Distribution note                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| Windows           | [Saddle Browser 1.8.9 setup EXE](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser_1.8.9_x64-setup.exe) | Generated      | Unsigned installer; caller-owned signing and update policy.                           |
| Windows           | [Saddle Browser 1.8.9 MSI](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser_1.8.9_x64_en-US.msi)       | Generated      | Unsigned installer; caller-owned signing and enterprise deployment.                   |
| Linux             | [Debian package](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser_1.8.9_amd64.deb)                     | Generated      | Unsigned package; Snap and Flatpak are not part of this release.                      |
| Linux             | [RPM package](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser-1.8.9-1.x86_64.rpm)                     | Generated      | Unsigned package; repository publication remains caller-owned.                        |
| Linux             | [AppImage](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser_1.8.9_amd64.AppImage)                      | Generated      | Portable unsigned image.                                                              |
| macOS             | [DMG](https://github.com/wenathlan/saddle/releases/download/v1.8.9/Saddle.Browser_1.8.9_aarch64.dmg)                              | Generated      | Unsigned and not notarized; PKG is deferred.                                          |
| Android           | [Debug APK](https://github.com/wenathlan/saddle/releases/download/v1.8.9/app-universal-debug.apk)                                 | Generated      | Debug key for test installation; production signing is caller-owned.                  |
| Android           | [Debug AAB](https://github.com/wenathlan/saddle/releases/download/v1.8.9/app-universal-debug.aab)                                 | Generated      | Debug key for test packaging; production signing is caller-owned.                     |
| Container         | [Saddle container tarball](https://github.com/wenathlan/saddle/releases/download/v1.8.9/saddle-container-1.8.9.tar.gz)            | Generated      | OCI image exported as a tarball; deployment runtime and registry remain caller-owned. |
| Browser extension | [Saddle extension ZIP](https://github.com/wenathlan/saddle/releases/download/v1.8.9/saddle-extension-1.8.9.zip)                   | Generated      | Deterministic extension package.                                                      |

The platform manifests and checksums are also attached. They are named `artifact-manifest-linux.json`, `artifact-manifest-windows.json`, `artifact-manifest-macos.json`, `artifact-manifest-android.json`, `container-artifact-manifest.json`, `SHA256SUMS-linux`, `SHA256SUMS-windows`, `SHA256SUMS-macos`, `SHA256SUMS-android` and `SHA256SUMS-container`.

## Unavailable or caller-owned targets

The iOS workflow exists but is gated by `SADDLE_IOS_ENABLED` or an explicit manual dispatch input. No IPA is claimed for v1.8.9 because the release was not run with Apple Developer certificates, provisioning profiles and export credentials. The same ownership rule applies to PKG, MSIX, Snap, Flatpak, production Android signing, Windows signing, macOS signing and notarization. The package targets for npm, GitHub Packages, GHCR, Maven, NuGet and RubyGems remain separate registry workflows and are not duplicated as release binaries.

Tauri configuration is resolved from `tauri.conf.json` and can be extended with platform-specific configuration files, which keeps the core application boundary reusable without embedding signing material or infrastructure endpoints [2].

## References

[1]: https://v2.tauri.app/reference/cli/ "Tauri Command Line Interface"
[2]: https://v2.tauri.app/develop/configuration-files/ "Tauri Configuration Files"
[3]: https://github.com/wenathlan/saddle/releases/tag/v1.8.9 "Saddle v1.8.9 GitHub Release"

## 1.8.10 conversion contract

Version 1.8.10 keeps the Tauri desktop browser and adds explicit Capacitor Android and iOS conversion targets. The shared source is the TypeScript library plus the compiled `web/dist/public` output; the native folders do not fork engine logic. The Android release build enables R8 and resource shrinking, and the workflow creates an ephemeral CI test key when caller production signing secrets are absent.

The 1.8.10 workflow names the public outputs `saddle.browser.1.8.10.<format>`, `saddle.apk.1.8.10.apk`, `saddle.aab.1.8.10.aab`, `saddle.ipa.1.8.10.ipa`, `saddle.container.1.8.10.tar.gz` and `saddle.extension.1.8.10.zip`. Surface manifests and checksums use the corresponding `manifest.<surface>.1.8.10.json` and `sha256.<surface>.1.8.10` forms. The release is not considered complete until the live GitHub asset list matches these generated names.

## Verified 1.8.10 primary assets

The v1.8.10 release contains the following primary assets. Sizes are bytes and exclude the separate manifest and checksum files.

| Surface         | Asset                                                                                                       |       Size |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ---------: |
| Desktop browser | [AppImage](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.appimage)    | 79,870,456 |
| Desktop browser | [Debian](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.deb)           |  5,294,388 |
| Desktop browser | [RPM](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.rpm)              |  5,297,815 |
| Desktop browser | [Windows EXE](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.exe)      |  4,341,818 |
| Desktop browser | [Windows MSI](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.msi)      |  5,246,976 |
| Desktop browser | [macOS DMG](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.browser.1.8.10.dmg)        |  5,222,365 |
| Android         | [APK](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.apk.1.8.10.apk)                  |  3,498,594 |
| Android         | [AAB](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.aab.1.8.10.aab)                  |  3,893,352 |
| Container       | [OCI tarball](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.container.1.8.10.tar.gz) | 81,718,314 |
| Extension       | [ZIP](https://github.com/wenathlan/saddle/releases/download/v1.8.10/saddle.extension.1.8.10.zip)            |     10,759 |

## 1.8.11 flat source contract

Version 1.8.11 keeps the Tauri browser build flat at `desktop/`, with `Cargo.toml`, `tauri.conf.json`, `build.rs`, `lib.rs` and `main.rs` directly in that surface root. The frontend remains the generated `web/dist/public` output and `dist/` is not committed.

The Android project maps Saddle-owned `AndroidManifest.xml`, `main/`, `res/`, `test/` and `androidtest/` directly from the `android/` root through Gradle `sourceSets`. Capacitor staging under `android/app`, `android/assets` and plugin internals is generated during synchronization, removed or ignored before build, and is not project-owned source. The iOS surface keeps its generated Xcode and Swift Package internals because Capacitor owns those paths; Saddle-owned configuration remains at the `ios/` root and no project-owned `ios/src` directory is added.

The v1.8.11 workflows derive the version from the release tag, run flat-surface validation, reject helper binaries and attach only outputs matching the dotted lowercase contract. The live release asset list below was verified against the published GitHub release.

## Verified 1.8.11 primary assets

Sizes are bytes and exclude the separate manifest and checksum files.

| Surface         | Asset                                                                                                       |       Size |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ---------: |
| Desktop browser | [AppImage](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.appimage)    | 79,870,456 |
| Desktop browser | [Debian](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.deb)           |  5,294,158 |
| Desktop browser | [RPM](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.rpm)              |  5,297,619 |
| Desktop browser | [Windows EXE](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.exe)      |  4,343,237 |
| Desktop browser | [Windows MSI](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.msi)      |  5,246,976 |
| Desktop browser | [macOS DMG](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.browser.1.8.11.dmg)        |  5,216,935 |
| Android         | [APK](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.apk.1.8.11.apk)                  |  3,498,594 |
| Android         | [AAB](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.aab.1.8.11.aab)                  |  3,893,324 |
| Container       | [OCI tarball](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.container.1.8.11.tar.gz) | 81,722,975 |
| Extension       | [ZIP](https://github.com/wenathlan/saddle/releases/download/v1.8.11/saddle.extension.1.8.11.zip)            |     10,760 |

The release also contains `manifest.*.1.8.11.json` and `sha256.*.1.8.11` files for Android, container, and each desktop runner. No IPA was attached because caller-owned Apple signing and provisioning were not enabled for this release.

## 1.8.12 release matrix

Version 1.8.12 was published with the expanded matrix below. The release workflows derived the version from the `v1.8.12` tag and attached the generated checksum and manifest files beside each available surface artifact. The release contains 38 assets; iOS was not attached because caller-owned Apple signing and provisioning were not configured.

| Surface | Architectures | Artifact naming contract |
| --- | --- | --- |
| Linux desktop browser | x64, arm64 | `saddle.browser.1.8.12.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop browser | x86, x64, arm64 | `saddle.browser.1.8.12.<architecture>.exe`, `.msi` |
| macOS desktop browser | x64, arm64 | `saddle.browser.1.8.12.<architecture>.dmg`, `.app.zip` |
| Android | caller-configured signing | `saddle.apk.1.8.12.apk`, `saddle.aab.1.8.12.aab` |
| iOS | caller-configured signing and provisioning | `saddle.ipa.1.8.12.ipa`, `saddle.app.1.8.12.app.zip` |
| Container | OCI | `saddle.container.1.8.12.tar.gz` |
| Browser extension | Manifest V3 | `saddle.extension.1.8.12.zip` |

Each surface also emits `sha256.*.1.8.12`, `manifest.*.1.8.12.json` and, where enabled by the release path, SBOM and provenance metadata. The Android manifest records `ci-test-key`, desktop manifests record `unsigned` and the container manifest records `caller-owned`. No state implies production trust.

## 1.8.13 release matrix

Version 1.8.13 keeps the release-tag-derived matrix and adds deterministic retention metadata to generated artifact manifests. The implementation records retention policy and keep/prune decisions but never removes caller-owned files. The release contains 38 assets; iOS was not attached because caller-owned Apple signing and provisioning were not configured.

| Surface | Architectures | Artifact naming contract |
| --- | --- | --- |
| Linux desktop browser | x64, arm64 | `saddle.browser.1.8.13.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop browser | x86, x64, arm64 | `saddle.browser.1.8.13.<architecture>.exe`, `.msi` |
| macOS desktop browser | x64, arm64 | `saddle.browser.1.8.13.<architecture>.dmg`, `.app.zip` |
| Android | caller-configured signing | `saddle.apk.1.8.13.apk`, `saddle.aab.1.8.13.aab` |
| iOS | caller-configured signing and provisioning | `saddle.ipa.1.8.13.ipa`, `saddle.app.1.8.13.app.zip` |
| Container | OCI | `saddle.container.1.8.13.tar.gz` |
| Browser extension | Manifest V3 | `saddle.extension.1.8.13.zip` |

Each surface also emits `sha256.*.1.8.13`, `manifest.*.1.8.13.json` and, where enabled by the release path, SBOM and provenance metadata. The Android manifest records `ci-test-key`, desktop manifests record `unsigned` and the container manifest records `caller-owned`. The manifest may additionally carry `retention`, `retentionplan` and `retentionevaluatedat`; these fields are advisory execution decisions and do not imply deletion or publication.

## 1.8.14 release matrix

Version 1.8.14 keeps the release-tag-derived matrix and adds post-push container pull and smoke validation. The implementation records retention policy and keep/prune decisions but never removes caller-owned files. The release contains 38 verified assets; iOS remains unavailable until caller-owned Apple signing and provisioning are configured.

| Surface | Architectures | Artifact naming contract |
| --- | --- | --- |
| Linux desktop browser | x64, arm64 | `saddle.browser.1.8.14.<architecture>.deb`, `.rpm`, `.appimage` |
| Windows desktop browser | x86, x64, arm64 | `saddle.browser.1.8.14.<architecture>.exe`, `.msi` |
| macOS desktop browser | x64, arm64 | `saddle.browser.1.8.14.<architecture>.dmg`, `.app.zip` |
| Android | caller-configured signing | `saddle.apk.1.8.14.apk`, `saddle.aab.1.8.14.aab` |
| iOS | caller-configured signing and provisioning | `saddle.ipa.1.8.14.ipa`, `saddle.app.1.8.14.app.zip` |
| Container | OCI | `saddle.container.1.8.14.tar.gz` |
| Browser extension | Manifest V3 | `saddle.extension.1.8.14.zip` |

Each surface also emits `sha256.*.1.8.14`, `manifest.*.1.8.14.json` and, where enabled by the release path, SBOM and provenance metadata. The Android manifest records `ci-test-key`, desktop manifests record `unsigned` and the container manifest records `caller-owned`. The container image additionally records `org.opencontainers.image.version=1.8.14`; the post-push workflow pulls that exact version and runs the CLI help smoke test.

The verified 1.8.14 release contains six Linux assets, six Windows assets, four macOS assets, two Android assets, one container archive, one browser extension, nine manifests and nine checksum files. The release-event mobile job did not bypass missing production credentials; the successful manual rerun used the explicit `ci-test-key` path.

## 1.8.15 verified release matrix

The published [v1.8.15 release](https://github.com/wenathlan/saddle/releases/tag/v1.8.15) contains 38 attached assets: six Linux desktop artifacts, six Windows desktop artifacts, four macOS desktop artifacts, two Android artifacts, one container archive, one browser extension, nine manifests, and nine checksum files. The primary artifacts use the dotted lowercase names `saddle.browser.1.8.15.<architecture>.<format>`, `saddle.apk.1.8.15.apk`, `saddle.aab.1.8.15.aab`, `saddle.container.1.8.15.tar.gz`, and `saddle.extension.1.8.15.zip`.

The available metadata files are `manifest.android.1.8.15.json`, `manifest.container.1.8.15.json`, the seven desktop `manifest.*.1.8.15.json` files, and the matching nine `sha256.*.1.8.15` files. The release record identifies Android as `ci-test-key`, desktop surfaces as `unsigned`, and the container as `caller-owned`; those declared states do not imply production signing, notarization, or registry trust.

## 1.8.16 verified release matrix

The published [v1.8.16 release](https://github.com/wenathlan/saddle/releases/tag/v1.8.16) contains 38 attached assets: six Linux desktop artifacts, six Windows desktop artifacts, four macOS desktop artifacts, two Android artifacts, one container archive, one browser extension, nine manifests, and nine checksum files. The asset names match the matrix in [releasenotes-1.8.16.md](releasenotes-1.8.16.md).

The release-event Android workflow stopped because production signing secrets were not configured. The separately successful manual Android run `31839378707` used the workflow's explicit `ci-test-key` option and attached the APK, AAB, checksum, and manifest. No iOS artifact is claimed because Apple signing, provisioning, and export credentials were not configured. Desktop artifacts remain `unsigned`, the container manifest remains `caller-owned`, and no result is represented as production signing, notarization, registry trust, SBOM validation, or vulnerability status without its own evidence.

The release-evidence API can normalize and evaluate results supplied by completed verification adapters, but it cannot generate artifacts, change their signing state, publish them, or validate their registry availability.

## 1.8.17 container platform candidate

The 1.8.17 candidate keeps the established release asset contract while expanding the GHCR image index to `linux/amd64`, `linux/arm64`, and `linux/ppc64le`. The workflow must inspect the pushed index before this document treats those platform variants as available. The attached `saddle.container.1.8.17.tar.gz` remains one archive artifact and is not evidence of a Windows container variant.

`windows/amd64`, `linux/arm/v7`, and `linux/386` are not claimed by this candidate. A Windows image requires its own versioned Windows base, Dockerfile, runner, and compatibility validation; the existing Debian Linux Dockerfile cannot produce it by adding a platform string. `unknown` descriptors are not runnable targets. The platform decision and evidence limits are detailed in [containerplatforms-1.8.17.md](containerplatforms-1.8.17.md).

## 1.8.17 verified container publication

The published [v1.8.17 release](https://github.com/wenathlan/saddle/releases/tag/v1.8.17) contains 38 attached assets, including `saddle.container.1.8.17.tar.gz`, `manifest.container.1.8.17.json`, and `sha256.container.1.8.17`. GHCR workflow run `31847952976` completed successfully after QEMU-enabled Buildx published and inspected the Linux OCI index. Its post-push assertion accepted exactly `linux/amd64`, `linux/arm64`, and `linux/ppc64le`; the amd64 variant was pulled, its OCI version label was compared with `1.8.17`, and `saddle help` completed.

The release container manifest identifies `ghcr.io/wenathlan/saddle:1.8.17` and preserves `caller-owned` as its signing state. The Android manifest records `ci-test-key`. Those explicit metadata states do not imply production signing, Windows container availability, notarization, vulnerability status, or any independent trust property.
