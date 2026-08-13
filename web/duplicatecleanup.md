# web duplicate cleanup

This directory was audited on 2026-08-13. The canonical file is the path without a numeric copy suffix. All files whose names ended in `(1)`, `(2)` or `(3)` were removed outside the explicitly ignored `other1` and `other2` directories.

The cleanup removed **310 duplicate-suffix files** and preserved **50 files** under `other1` and `other2` exactly as requested. Exact copies were consolidated by retaining the canonical path. The duplicate groups covered configuration files, client components, hooks, pages, server/shared modules, lockfiles, patches and project metadata.

Two divergent variants received a conservative review. The useful compiler options from `tsconfig (2).json`—`target: ESNext`, `forceConsistentCasingInFileNames` and `resolveJsonModule`—were merged into `tsconfig.json`; conflicting `strict`, `jsx`, `include`, `exclude` and `outDir` values were not copied over the active project configuration. The divergent `vite.config(2).ts` only omitted the active `base` setting, so the canonical `vite.config.ts` was retained. The divergent `package (2).json` described a different `@devthink/uka` application rather than Saddle Pages and was not merged into the canonical Saddle Pages manifest.

The `other1` and `other2` directories remain outside this cleanup scope. Future files should use the canonical path directly and should not be created with numeric copy suffixes.
