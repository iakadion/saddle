# package metadata audit for 1.8.5

The attached package manifest was used as a format reference, not as a dependency source. Its large application-oriented dependency graph, TypeScript build paths, workspace references and unrelated command names do not match the Saddle root-based JavaScript ESM library. Copying those entries would increase install cost, introduce unverified runtime coupling and weaken the transport-neutral package boundary.

| Field | Decision | Reason |
| --- | --- | --- |
| `engines` | `node >=26.7.0`, `npm >=10.9.2` | matches the release toolchain and prevents silently testing on the older Node 22 floor |
| `packageManager` | `npm@12.0.2` | records the current npm major used for the package contract without changing the existing release scripts |
| `main`, `module`, `browser` | `./index.js` | gives older bundlers and browser-aware tooling a stable hint while `exports` remains authoritative |
| `sideEffects` | `false` | the exported library modules are contract factories; CLI-only execution is guarded by direct-entry checks |
| `peerDependencies.playwright` | `^1.62.1`, optional | the new explicit `browser-playwright` adapter dynamically loads a caller-installed provider |
| `optionalDependencies` | not added | no optional package is required by a current implementation; an empty field would add no behavior |
| `trustedDependencies` | not added | no install-time package script requires trust escalation; this is not an npm core field |
| patch metadata | not added | no active dependency patch exists; pnpm 11 no longer reads settings from the `pnpm` field in `package.json` |

The root entry remains free of Node-only imports and external runtime imports. The Playwright provider is only reachable through the explicit `./browser-playwright` subpath and is absent from the root transport-neutral graph. Consumers that do not need a browser provider do not need to install Playwright.

## References

1. [npm package.json documentation](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
2. [pnpm package.json documentation](https://pnpm.io/package_json)
3. [Node.js package entry points and exports](https://nodejs.org/api/packages.html)
4. [Playwright npm package](https://www.npmjs.com/package/playwright)
