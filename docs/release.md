# saddle release 1.0

## release path

The release path is intentionally split into source validation, package validation, tag creation, GitHub release creation, and independent registry publication. The repository never contains a registry token.

| step | owner | condition |
|---|---|---|
| package version | repository | `package.json` is `1.7.0` |
| quality gate | GitHub Actions | `npm run pack:check` passes |
| tag | repository owner | tag `v1.7.0` points to the validated release commit |
| GitHub release | repository owner | release `v1.7.0` already exists |
| GitHub Packages | GitHub Actions | `publishgithubnpm.yml`, `publishghcr.yml`, `publishmaven.yml`, `publishnuget.yml`, and `publishrubygems.yml` use `GITHUB_TOKEN` |
| public npmjs | owner-managed GitHub Actions secret | `publishnpmjs.yml` uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` and derives the version from the release tag |

## credential rule

The npm token previously sent in chat is compromised and must not be used. GitHub Packages publication does not require a manually created secret because the workflows use the short-lived `GITHUB_TOKEN`. Public npmjs publication uses the owner-managed repository secret `NPM_TOKEN`, injected only as `NODE_AUTH_TOKEN` during the publish step. Its value must never be committed, printed, or sent through chat.

## manual release

```text
npm run pack:check
git tag v1.7.0
git push origin v1.7.0
```

The release-created event is the publication trigger for the registry workflows. A dry-run verifies package shape and local tests, but cannot verify registry ownership, Trusted Publisher configuration, package scope authorization, or package visibility; those remain settings controlled by the owner.
