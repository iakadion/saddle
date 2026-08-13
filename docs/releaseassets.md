# Release assets

The Node-only release adapter creates deterministic metadata for caller-selected artifacts. For version `1.8.12`, it writes dotted surface-specific names such as `sha256.desktop.1.8.12`, `manifest.desktop.1.8.12.json`, `sbom.desktop.1.8.12.cdx.json` and `provenance.desktop.1.8.12.intoto.jsonl`. The adapter rejects underscore-based public names and Rust build-helper executables. It never publishes, authenticates or selects a registry.

```bash
npm run release:assets -- \
  --version 1.8.12 \
  --surface desktop \
  --output build/release \
  --artifact build/saddle.tgz \
  --build-type caller-build \
  --builder caller-ci
```

The artifact paths are supplied by the caller and are sorted before the checksum, manifest, SBOM and provenance files are written. Package dependencies are read from the root lockfile to build a compact component list. The output can be attached to a release or checked by a registry-specific workflow without adding credentials to the library.

The package also exports the adapter as `@wenathlan/saddle/release-assets`. It is intentionally Node-only because release metadata reads files and uses the Node crypto implementation; the transport-neutral root remains free of Node imports.

## Release matrix

The `releaseartifactmatrix(version, options)` contract in `packager/manifest.ts` describes the supported desktop, Android, iOS, container and browser-extension outputs in one deterministic structure. Each entry includes platform, architecture, dotted artifact names, checksum name, manifest name and the actual signing label supplied by the caller. It is descriptive only: it does not invoke a vendor toolchain, select a registry or imply that a platform trusts an unsigned artifact.
