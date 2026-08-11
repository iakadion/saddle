# saddle release 1.0

## release path

The release path is intentionally split into source validation, package validation, tag creation, GitHub release creation, and npm publication. The repository never contains a registry token.

| step | owner | condition |
|---|---|---|
| package version | repository | `package.json` is `1.0.0` |
| quality gate | GitHub Actions | `npm run pack:check` passes |
| tag | repository owner | tag `v1.0.0` points to the verified commit |
| GitHub release | workflow | tag push starts `release.yml` |
| npm publish | npm secret or trusted publishing | `NPM_TOKEN` exists or npm OIDC is configured |

## credential rule

The npm token previously sent in chat is compromised and must not be used. The repository expects a replacement secret named `NPM_TOKEN`, or npm trusted publishing configured for the GitHub repository and workflow. The token is read only by GitHub Actions through `NODE_AUTH_TOKEN` and is never written to source, logs, or release files.

## manual release

```text
npm run pack:check
git tag v1.0.0
git push origin v1.0.0
```

The tag push is the publication trigger. A dry-run cannot verify npm ownership or secret configuration; those remain repository settings controlled by the owner.
