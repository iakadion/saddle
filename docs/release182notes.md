# Saddle 1.8.2

Saddle 1.8.2 is the first release prepared after the repository transfer to `wenathlan`. The authenticated `iakadion` account still has administrator permission on the repository, while `wenathlan` is the repository owner and the canonical public npm owner.

## canonical identities

The JavaScript package is `@wenathlan/saddle` on public npm and GitHub Packages npm. GHCR resolves to `ghcr.io/wenathlan/saddle`, and Maven uses the owner-aligned coordinate `io.wenathlan:saddle`. NuGet keeps the unscoped package id `Saddle`, and RubyGems keeps the unscoped gem name `saddle`, because those registries do not use npm-style owner scopes; their authorship and repository metadata now point to `wenathlan`.

| Destination | 1.8.2 identity | Owner resolution |
| --- | --- | --- |
| public npm | `@wenathlan/saddle@1.8.2` | owner-managed `NPM_TOKEN` |
| GitHub Packages npm | `@wenathlan/saddle@1.8.2` | `${{ github.repository_owner }}` and `GITHUB_TOKEN` |
| GHCR | `ghcr.io/wenathlan/saddle:1.8.2` | `${{ github.repository_owner }}` and `GITHUB_TOKEN` |
| Maven | `io.wenathlan:saddle:1.8.2` | transferred GitHub Packages owner path |
| NuGet | `Saddle 1.8.2` | unscoped NuGet package id with `wenathlan` repository metadata |
| RubyGems | `saddle 1.8.2` | unscoped gem name with `wenathlan` metadata |
| extension | `saddle-extension-1.8.2.zip` | release-tag-derived asset |

## included engine changes

This release includes the minimal extension permission policy, deterministic extension packaging, context-aware window/tab/frame replay, the transport-neutral export graph audit, and bounded content-type normalization for JSON, XML, Markdown, text, HTML and binary results. The package remains root-based JavaScript ESM and keeps Node-only adapters in explicit subpaths.

## validation boundary

The release must pass `npm run check`, `npm run formatcheck`, `npm test`, `npm run pack:check` and `git diff --check` before the tag is created. Each registry workflow remains isolated because its package protocol and credential boundary differ. Publication evidence is reported only after the workflow succeeds and the target registry can be queried independently.
