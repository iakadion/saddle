# Saddle 1.8.5

Saddle 1.8.5 extends the published 1.8.4 engine without rewriting its immutable tag. The package metadata now declares Node.js `>=26.7.0`, npm `>=10.9.2`, the reproducible package manager `npm@12.0.2`, `main`/`module`/`browser` entry hints and `sideEffects: false` for bundlers.

The release adds `playwright` as an optional peer at `^1.62.1` and exposes `@wenathlan/saddle/browser-playwright`. The adapter dynamically loads the caller-installed provider and reports `OPTIONAL_DEPENDENCY_MISSING` when Playwright is not installed. No browser binary, credential, host or runtime dependency is forced into the transport-neutral root.

The package remains root-based JavaScript ESM. `trustedDependencies` and patch metadata were intentionally not added: the package has no install-time dependency requiring trust escalation and no active package patch to describe. The pnpm documentation also states that pnpm 11 no longer reads settings from the `pnpm` field in `package.json`, so no stale `pnpm.patchedDependencies` field was introduced.
