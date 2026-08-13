# Platform pipeline audit

This document records the platform facts used by the 1.8.6 pipeline work and the subsequent web root migration. The workflows remain caller-configured: repository owners provide runner availability, deployment secrets and target repository names.

## repository layout contract

The repository has one package manifest and one npm lockfile at the root. The static application is rooted at `web/` without a nested `client/` or `src/` directory: `web/index.html`, `web/main.tsx`, `web/App.tsx`, `web/components/`, `web/pages/`, `web/public/` and `web/dist/` are the canonical paths. Every Pages pipeline installs from the root with `npm ci`, runs `npm run web:check`, and writes the deployable artifact to `web/dist/public`. No nested web package, pnpm lockfile or platform workflow is retained.

## verified platform facts

| Platform | Verified contract | Source |
| --- | --- | --- |
| GitHub Pages | A custom workflow uses `actions/configure-pages@v5`, derives the project base path from the Pages output or repository name, uploads a static artifact with `actions/upload-pages-artifact@v4`, then deploys from a dependent job with `actions/deploy-pages@v4`. The deployment job needs `pages: write` and `id-token: write`, depends on the build job and uses the `github-pages` environment. The repository source is configured as GitHub Actions and the current site is `https://wenathlan.github.io/saddle/`. | [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) |
| Codeberg Pages | Forgejo Actions can deploy with `https://codeberg.org/git-pages/action@v2`, using `site`, `source` and the injected `${{ forge.token }}`. Publishing the repository subdomain should be restricted to the default branch. Codeberg is migrating its legacy Pages v2 flow; custom domains still have separate constraints. | [Codeberg Pages via Forgejo Actions](https://docs.codeberg.org/codeberg-pages/forgejo-actions/), [Codeberg Pages output](https://docs.codeberg.org/codeberg-pages/pushing-output/) |
| GitLab Pages | A job with `pages: true` publishes the default `public` directory; the job can also use a `pages` hash for a `path_prefix`. Static HTML, CSS and JavaScript are supported through GitLab CI/CD. | [GitLab Pages](https://docs.gitlab.com/user/project/pages/) |
| Woodpecker CI | A workflow is a serial list of container steps with `image` and `commands`; branch/event filters belong in `when`, and secrets are injected through the pipeline environment rather than committed YAML. | [Woodpecker workflow syntax](https://woodpecker-ci.org/docs/usage/workflow-syntax) |
| Forgejo Actions | Fully qualified actions are recommended; the official checkout reference is `https://data.forgejo.org/actions/checkout@v6`. Short `actions/checkout@v6` resolves through the instance `DEFAULT_ACTIONS_URL`, which can vary. | [Forgejo Actions: Using Actions](https://forgejo.org/docs/v15.0/user/actions/actions/) |
| Gitea Actions | Gitea Actions is mostly compatible with GitHub Actions and requires a separately installed Gitea Runner. The official documentation lists `actions/checkout@v4` as a supported action reference and warns that runner trust matters for public instances. | [Gitea Actions overview](https://docs.gitea.com/usage/actions/overview) |

## boundary

GitHub Pages has a first-party artifact/deploy contract. Codeberg Pages has a git-pages Forgejo Action contract. Forgejo, Gitea and GitLab workflow files can build the same static output, but their hosting destination and token names are instance-specific. Woodpecker can build and publish artifacts, but a Pages deploy step requires the target host's configured service or a caller-owned token. No workflow in this release hardcodes credentials, hostnames or a private deployment target.
