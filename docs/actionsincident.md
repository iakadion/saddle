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

After selecting **GitHub Actions** in the repository settings, the Pages API reported `has_pages: true`, `build_type: workflow`, source `main` and the public URL `https://wenathlan.github.io/saddle/`. The next run must still validate the corrected build/deploy job and its project base path.

The repository metadata audit found `main` as the default branch, one open Dependabot pull request (`#4`, branch `dependabot/npm_and_yarn/npm_and_yarn-2772e86c4e`) and the public repository description still set to the placeholder `saddle`. The branch is not a second production branch; it is an automated dependency-update head branch and should be closed only after its obsolete `/web/package.json` target is replaced by the root npm configuration.

The repository homepage displays an `Edit` control beside the public identity, while the current viewport does not expose a separate About form. The description update remains pending until that control is opened and saved.
