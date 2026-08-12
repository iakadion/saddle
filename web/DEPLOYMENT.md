# Saddle Pages deployment

The site is a static React/Vite application. The normal development build also bundles the placeholder server entrypoint, but Pages deployments use `pnpm run build:pages` so only `dist/public` is published.

## GitHub Pages

The GitHub workflow uses Node.js 26.7.0, runs the typecheck, builds with `VITE_BASE_PATH=/saddle-pages/`, uploads `dist/public` with `actions/upload-pages-artifact@v4` and deploys it with `actions/deploy-pages@v4`. The repository must be public or the account plan must support Pages, and the repository Pages setting must use GitHub Actions as its source.

## GitLab Pages

The GitLab pipeline builds with the `node:26.7.0` image, copies the output into `public/` and marks the job with `pages: true`. GitLab Pages then serves the generated `public` artifact. The project owner controls the namespace and Pages visibility.

## Forgejo and Codeberg Pages

The generic Forgejo workflow builds and uploads an artifact using fully qualified actions from `data.forgejo.org`. The Codeberg-specific workflow additionally calls `https://codeberg.org/git-pages/action@v2` with the injected `forge.token`. It is intended for a repository hosted on Codeberg and publishes `https://${forge.repository_owner}.codeberg.page/saddle-pages/`.

## Gitea

The Gitea workflow uses the mostly GitHub-compatible Actions runner to build and upload `dist/public`. Gitea does not provide a universal Pages endpoint in the workflow contract, so serving the artifact requires a Pages service or object-storage target selected by the instance owner.

## Woodpecker

The Woodpecker workflow builds the same output in a `node:26.7.0` container. Woodpecker keeps the workspace available to later steps, but artifact storage or a Pages upload plugin is instance-specific. No endpoint or deployment secret is hardcoded.
