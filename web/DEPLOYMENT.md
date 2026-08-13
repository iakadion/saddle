# Saddle Pages deployment

The site is a static React/Vite application rooted directly in this directory. The repository root owns the package manifest and deployment workflows; this directory owns `index.html`, `main.tsx`, components, pages, public assets and `dist/`. Pages deployments use the root script `npm run web:build:pages` so only `web/dist/public` is published.

## GitHub Pages

The root GitHub workflow uses Node.js 26.7.0, configures Pages, runs `npm run web:check`, builds with the caller-configured `SADDLE_PAGES_BASE_PATH` variable or the repository base path returned by `configure-pages`, uploads `web/dist/public` with `actions/upload-pages-artifact@v4` and deploys it from a dependent `github-pages` environment with `actions/deploy-pages@v4`. The repository Pages setting must use GitHub Actions as its source. For `wenathlan/saddle`, the public project URL is `https://wenathlan.github.io/saddle/` and the default asset base path is `/saddle/`.

## GitLab Pages

The root GitLab pipeline builds with the `node:26.7.0` image, copies `web/dist/public` into `public/` and marks the job with `pages: true`. GitLab Pages then serves the generated `public` artifact. The project owner controls the namespace and Pages visibility.

## Forgejo and Codeberg Pages

The root Forgejo workflow builds and uploads `web/dist/public` using fully qualified actions from `data.forgejo.org`. The root Codeberg-specific workflow additionally calls `https://codeberg.org/git-pages/action@v2` with the injected `forge.token`. It publishes the repository name under the caller's Codeberg Pages namespace.

## Gitea

The root Gitea workflow uses the mostly GitHub-compatible Actions runner to build and upload `web/dist/public`. Gitea does not provide a universal Pages endpoint in the workflow contract, so serving the artifact requires a Pages service or object-storage target selected by the instance owner.

## Woodpecker

The root Woodpecker workflow builds the same output in a `node:26.7.0` container. Woodpecker keeps the workspace available to later steps, but artifact storage or a Pages upload plugin is instance-specific. No endpoint or deployment secret is hardcoded.
