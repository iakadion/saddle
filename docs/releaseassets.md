# Release assets

The Node-only release adapter creates deterministic metadata for caller-selected artifacts. It writes `SHA256SUMS`, `sbom.cdx.json` in CycloneDX 1.5 shape and `provenance.intoto.jsonl` in an in-toto statement shape. The adapter never publishes, authenticates or selects a registry.

```bash
npm run release:assets -- \
  --version 1.8.5 \
  --output build/release \
  --artifact build/saddle.tgz \
  --build-type caller-build \
  --builder caller-ci
```

The artifact paths are supplied by the caller and are sorted before the checksum and provenance files are written. Package dependencies are read from the root lockfile to build a compact component list. The output can be attached to a release or checked by a registry-specific workflow without adding credentials to the library.

The package also exports the adapter as `@wenathlan/saddle/release-assets`. It is intentionally Node-only because release metadata reads files and uses the Node crypto implementation; the transport-neutral root remains free of Node imports.
