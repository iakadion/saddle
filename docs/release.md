# saddle release 1.0

## release path

The release path is intentionally split into source validation, package validation, tag creation, GitHub release creation, and independent registry publication. The repository never contains a registry token.

| step | owner | condition |
|---|---|---|
| package version | repository | `package.json` is `1.0.0` |
| quality gate | GitHub Actions | `npm run pack:check` passes |
| tag | repository owner | tag `v1.0.0` points to the verified commit |
| GitHub release | repository owner | release `v1.0.0` already exists |
| GitHub Packages | GitHub Actions | `publishgithubnpm.yml`, `publishghcr.yml`, `publishmaven.yml`, `publishnuget.yml`, and `publishrubygems.yml` use `GITHUB_TOKEN` |
| public npmjs | npm Trusted Publishing | `publishnpmjs.yml` uses OIDC; first publication may require one-time bootstrap authentication |

## credential rule

The npm token previously sent in chat is compromised and must not be used. GitHub Packages publication does not require a manually created secret because the workflows use the short-lived `GITHUB_TOKEN`. Public npmjs publication is configured for OIDC Trusted Publishing and contains no long-lived npm credential. If npm requires a first-version bootstrap, the owner must create that credential directly in GitHub Actions secrets and revoke it immediately after migration; it must never be committed to source or sent through chat.

## manual release

```text
npm run pack:check
git tag v1.0.0
git push origin v1.0.0
```

The release-created event is the publication trigger for the registry workflows. A dry-run verifies package shape and local tests, but cannot verify registry ownership, Trusted Publisher configuration, package scope authorization, or package visibility; those remain settings controlled by the owner.
