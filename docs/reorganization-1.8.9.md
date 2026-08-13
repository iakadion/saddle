# Reorganization 1.8.9

## Scope

Version 1.8.9 converts the active engine and its deterministic test surface to a root-based TypeScript source layout. The source tree does not gain `src/`; generated JavaScript, declarations, source maps and target plans are created in ignored `dist/` or `build/` directories by local scripts and release workflows.

## Ownership groups

| Group | Canonical source context | Compatibility rule |
| --- | --- | --- |
| Public engine | `index.ts`, `library`, `domain`, `core`, `runtime` | Root exports keep their public names and emit stable `dist/*.js` paths. |
| Storage and memory | `storage`, `memory`, `persistence` | Physical, vector, remote and in-process adapters remain caller-owned. |
| Acquisition | `scrape`, `browser`, `captcha`, `proxy` | Scrape, crawl, browser and evidence contracts remain separate where their capabilities differ. |
| Operations | `queue`, `dispatch`, `workflow`, `runners`, `observability` | Retry, circuit, scheduling and resume contracts stay grouped by lifecycle responsibility. |
| Delivery | `packager`, `release`, `binary`, `surfaces`, `extension`, `cli` | Delivery modules describe plans or build adapters; they do not own store credentials or signing keys. |
| Web | `web/App.tsx`, `web/components`, `web/pages`, `web/lib`, `web/contexts`, `web/hooks` | The static React surface remains root based and TypeScript. The dynamic debug collector is an explicit `@ts-nocheck` browser instrumentation boundary. |

## Build boundary

The project uses a project-local TypeScript 7 compiler. `npm run build:engine` removes and regenerates `dist/`; package `main`, `module`, `browser`, `types`, `bin` and all declared export targets point at that generated output. The npm package includes `dist`, but the Git repository does not commit generated output.

## Target boundary

Application, computer, desktop, mobile, Android, iOS, browser, extension, web, CLI, binary, LibreOffice, MCP, VSIX and container formats are represented by declarative manifests. The workflow produces plans for each target and uploads them as CI artifacts. Actual Android SDK, Xcode, desktop installer, browser-store, LibreOffice and signing toolchains remain caller-selected adapters because the core cannot safely embed platform credentials or vendor infrastructure.

## Verification

The active Node contract has 98 passing tests. The preserved legacy scrape TypeScript surface has 69 passing Vitest tests. Web `tsc`, Pages build, format checks, package dry-run and high-severity audit remain release gates. A target plan is accepted only when it contains the release version, canonical compiled entry, output path, caller-managed credentials marker and reproducible metadata.
