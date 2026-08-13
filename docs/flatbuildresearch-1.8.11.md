# Flat native build research for Saddle 1.8.11

The 1.8.11 migration follows the repository rule that project-owned code stays at the surface root and that generated `dist/` output is excluded from version control. The migration does not delete toolchain-owned files blindly: it separates Saddle-owned entrypoints from generated platform staging and verifies each build after the path change.

## Tauri desktop

The official Tauri project structure normally places the Rust project under `src-tauri/`, and the configuration file acts as a marker for the CLI to locate the Rust project [1]. Tauri also supports configuration extension through `--config`, but that feature merges configuration and does not itself guarantee a different Rust project directory [2]. The 1.8.11 implementation therefore tests the more direct layout: `desktop/tauri.conf.json`, `desktop/Cargo.toml`, `desktop/build.rs`, `desktop/lib.rs` and `desktop/main.rs`. The workflow invokes the CLI from `desktop/` so the configuration and Cargo manifest share one flat surface root.

The frontend remains outside the native surface at `web/dist/public`. The path is relative to `desktop/tauri.conf.json`, and the generated `dist/` directory stays ignored. Desktop `target/`, icon outputs and bundle staging also remain generated and are never release inputs unless they match the explicit artifact collector patterns.

## Android Capacitor

Android Gradle supports custom source directories through the module-level `sourceSets` block. The official Android guidance allows `java.srcDirs`, `res.srcDirs` and `manifest.srcFile` to point to project-defined paths outside the conventional `src/main` tree [3]. The 1.8.11 layout uses this capability for Saddle-owned files: `android/main/` for the activity host, `android/res/` for resources, `android/AndroidManifest.xml` for the manifest and root-level test directories where practical.

Capacitor 8 still generates its web staging, plugin metadata and Cordova bridge under its conventional Android project paths during `cap sync`. Those generated paths are toolchain-owned, ignored by Git and not treated as Saddle source. A validation step rejects tracked `android/app/src` project files while allowing the transient CI staging created by Capacitor. This keeps the repository flat without breaking the generator contract.

## iOS Capacitor

Capacitor generates an Xcode project, Swift Package Manager bridge and copied web resources. The generated `CapApp-SPM` package explicitly identifies itself as CLI-managed. The 1.8.11 migration therefore keeps the Xcode project and Capacitor-managed package paths as generated platform internals while ensuring Saddle-owned metadata, workflow configuration and documentation live at the `ios/` root. Flattening the internal Xcode group hierarchy would require abandoning the generated Capacitor project and would reduce reproducibility rather than improve it.

## Decision

The flat rule applies strictly to project-owned files. Desktop becomes fully flat at `desktop/`. Android moves the Saddle-owned activity, manifest, resources and tests to root-level paths and maps them through Gradle `sourceSets`; transient Capacitor files remain ignored. iOS keeps generator-owned Xcode internals but exposes a flat root contract and does not add a project-owned `src` directory. All workflows use release-tag version derivation and contain no credentials or fixed infrastructure endpoints.

## References

[1]: https://v2.tauri.app/start/project-structure/ "Tauri project structure"
[2]: https://v2.tauri.app/develop/configuration-files/ "Tauri configuration files"
[3]: https://developer.android.com/build/gradle-tips "Android Gradle tips and source set configuration"
