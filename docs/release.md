# saddle release 1.8.5

## release path

The release path is intentionally split into source validation, package validation, tag creation, GitHub release creation, and independent registry publication. The repository never contains a registry token.

| step | owner | condition |
|---|---|---|
| package version | repository | `package.json` is `1.8.5` |
| quality gate | GitHub Actions | `npm run pack:check` passes |
| tag | repository owner | tag `v1.8.5` points to the validated release commit |
| GitHub release | repository owner | release `v1.8.5` is created from the validated tag |
| GitHub Packages | GitHub Actions | `publishgithubnpm.yml`, `publishghcr.yml`, `publishmaven.yml`, `publishnuget.yml`, and `publishrubygems.yml` use `GITHUB_TOKEN` |
| public npmjs | owner-managed GitHub Actions secret | `publishnpmjs.yml` uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` and derives the version from the release tag or latest release in manual maintenance runs |
| extension zip | GitHub Actions | `buildextension.yml` derives the version from the release tag, validates the unpacked artifact and attaches `saddle-extension-<version>.zip` |

## credential rule

The npm token previously sent in chat is compromised and must not be used. GitHub Packages publication does not require a manually created secret because the workflows use the short-lived `GITHUB_TOKEN`. Public npmjs publication uses the owner-managed repository secret `NPM_TOKEN`, injected only as `NODE_AUTH_TOKEN` during the publish step. Its value must never be committed, printed, or sent through chat. Toolchain maintenance does not trigger publication; a release event or explicit manual dispatch is still required.

## manual release

```text
npm run pack:check
git tag v1.8.2
git push origin v1.8.2
```

The release-created event is the publication and extension-asset trigger for the release workflows. A dry-run verifies package shape and local tests, but cannot verify registry ownership, Trusted Publisher configuration, package scope authorization, package visibility or browser-store submission; those remain settings controlled by the owner.
