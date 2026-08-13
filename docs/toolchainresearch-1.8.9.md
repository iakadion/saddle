# Toolchain research 1.8.9

## Date

The migration baseline is **2026-08-13**.

## Verified sources

| Area | Verified finding | Source |
| --- | --- | --- |
| TypeScript | The official TypeScript download page states that TypeScript 7.0 is currently available and recommends a project-local npm installation for reproducible lockfiles. | [TypeScript download](https://www.typescriptlang.org/download/) |
| TypeScript release | The official TypeScript team blog announces TypeScript 7.0 as the current native compiler release. | [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| Node.js | Node.js 26.7.0 is the current release in the v26 line as of 2026-08-05. | [Node.js 26.7.0](https://nodejs.org/en/blog/release/v26.7.0) |
| Node.js support | The official release table identifies v26 as Current and v24 as LTS; production targets should remain caller-selectable between supported Current and LTS runtimes. | [Node.js releases](https://nodejs.org/en/about/previous-releases) |

## Migration decision

The root project will use a project-local TypeScript compiler pinned in `package.json` and `package-lock.json`. The engine target remains Node.js `>=26.7.0`, while target manifests may declare a different runtime only when the target adapter and workflow provide an explicit compatibility contract. Generated JavaScript, declaration files, source maps and bundles remain build output and are not committed as source.
