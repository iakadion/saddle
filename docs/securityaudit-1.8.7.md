# Security and web audit for 1.8.7

This audit records the baseline collected before remediation. The repository owner can cross-check the live GitHub view at [Saddle Security](https://github.com/wenathlan/saddle/security) and the [Dependabot alerts API](https://docs.github.com/en/rest/dependabot/alerts).

## Baseline

GitHub reported **42 open Dependabot alerts**: 2 critical, 14 high, 23 medium and 3 low. Five alerts were associated with the root `package-lock.json`; the remaining alerts were associated with the tracked `scrape/package-lock.json`. The largest groups were `undici`, `hono`, `vite`, `shell-quote`, `brace-expansion`, `postcss`, `ip-address` and `sharp` in the nested scrape manifest.

The local root `npm audit` reported 4 vulnerabilities in the current root installation: 2 moderate, 1 high and 1 critical. The root audit is a separate view from GitHub's repository-wide alert count and does not include the stale nested scrape dependency graph unless that directory is audited independently.

Code scanning returned no analysis found, and secret scanning returned that the feature is disabled. These are coverage gaps, not evidence that the repository has no code or secret findings. The remediation therefore includes enabling or documenting the appropriate GitHub security controls without fabricating a clean result.

## Web inventory

The requested directory `web/public/manos` does not exist. The actual platform directory is `web/public/__manus__`, containing `debug-collector.js`; it is a small runtime support directory rather than a product asset directory. The public visual assets are tracked under `web/public/assets/` as four WebP files.

The first path audit found root-absolute application entry and route paths, while the asset files themselves are in the correct public directory. The Pages site is served below `/saddle/`, so every asset and internal route must be resolved through the Vite base path rather than assuming `/`.

## Remediation policy

The 1.8.7 work will prioritize Node.js built-ins for new logic, update direct and transitive dependencies through the root lockfile, isolate or remove the obsolete nested scrape dependency graph when it is not part of the published engine, preserve the small `__manus__` support directory unless its script is proven unnecessary, and make web assets base-aware. A final audit will distinguish resolved advisories from external or unfixable advisories rather than hiding them.
