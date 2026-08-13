# Actions and Pages incident

This note records the GitHub-hosted failures observed while debugging the root web migration on 2026-08-13. The repository is public, the default branch is `main`, and the GitHub API reported `has_pages: false` before Pages configuration.

## observed failures

| Surface | Run | Evidence |
| --- | --- | --- |
| GitHub Pages | [31703685525](https://github.com/wenathlan/saddle/actions/runs/31703685525) | `actions/configure-pages@v5` returned `HttpError: Not Found`; the repository Pages site was not enabled/configured. |
| CI | [31703407943](https://github.com/wenathlan/saddle/actions/runs/31703407943) | The historical workflow invoked `npm run build`, which is not a root package script. |
| Uka tests | [31702858313](https://github.com/wenathlan/saddle/actions/runs/31702858313) | The historical workflow invoked `npm run typecheck`, which is not a root package script. |
| CI | [31702858281](https://github.com/wenathlan/saddle/actions/runs/31702858281) | The historical workflow invoked both `npm run typecheck` and `npm run build`, which are not the engine gates. |
| Dependabot | [31701834922](https://github.com/wenathlan/saddle/actions/runs/31701834922) | Dependabot attempted `/web/package.json`, which was intentionally removed during the root migration. |

## correction contract

The canonical npm manifest and lockfile are at the repository root. Engine workflows must use `npm ci`, `npm run check`, `npm run formatcheck`, `npm test` and `npm run pack:check`. The web Pages workflow must use `npm run web:check`, `npm run web:build:pages` and publish `web/dist/public`. Dependabot must use the `npm` ecosystem at `/`.

The Pages workflow also requires the repository owner to enable GitHub Pages and select **GitHub Actions** as its source. The workflow cannot create the Pages site when the repository API still reports `has_pages: false`; that setting is managed at the repository level, not by the static artifact build.

After selecting **GitHub Actions** in the repository settings, the Pages API reported `has_pages: true`, `build_type: workflow`, source `main` and the public URL `https://wenathlan.github.io/saddle/`. The corrected build/deploy workflow then completed successfully in [run 31705301175](https://github.com/wenathlan/saddle/actions/runs/31705301175), with `configure pages`, `web:check`, build, artifact upload and deploy all green.

The final workflow commits also passed [Saddle engine CI run 31705367442](https://github.com/wenathlan/saddle/actions/runs/31705367442), [Uka-tests run 31705367433](https://github.com/wenathlan/saddle/actions/runs/31705367433) and [cross-runtime compatibility run 31705367432](https://github.com/wenathlan/saddle/actions/runs/31705367432). All three completed with `success` on `main`.

The repository metadata audit found `main` as the default branch and one open Dependabot pull request (`#4`, branch `dependabot/npm_and_yarn/npm_and_yarn-2772e86c4e`). Its only commit (`4cb2a45`) changes the root package lock plus an unrelated nested `scrape/package.json` and `scrape/package-lock.json`; it does not represent a second production branch and is not safe to merge into the root release. The branch should be closed as an obsolete automated update after owner confirmation.

The repository homepage About editor was opened in the authenticated browser and saved with the canonical Saddle description. The repository API should now report that description instead of the placeholder `saddle`.

The six non-main Dependabot tips were preserved as `archive-dependabot-*` tags, their PRs were closed, and their branch refs were removed. The cleanup leaves `main` as the only active branch without deleting the archived commit objects.

The first `v1.8.6` release fan-out passed release validation, GitHub Packages npm, public npmjs, Maven, NuGet, RubyGems and extension packaging. GHCR alone failed because the Docker image ran `npm ci --omit=dev` against the root manifest, whose dev-only Vite peer graph is rejected by npm's strict peer resolver. The corrective Dockerfile now sets `NPM_CONFIG_LEGACY_PEER_DEPS=true` and passes `--legacy-peer-deps`; the GHCR workflow also checks out the release tag for both release and manual dispatch paths.
