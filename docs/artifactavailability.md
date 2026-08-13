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
