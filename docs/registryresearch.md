# registry research

## verified facts

GitHub's documentation states that GitHub Actions can use the workflow `GITHUB_TOKEN` to publish, install, delete, and restore packages in GitHub Packages without storing a personal access token. The workflow still needs the correct job permission, normally `packages: write`, and the package must target a GitHub Packages registry rather than the public npm registry.

npmjs is a separate registry. This repository now uses the owner-managed GitHub Actions secret `NPM_TOKEN` for public npm publication. The value is injected only at runtime through `NODE_AUTH_TOKEN`; it is never committed, printed or used for GitHub Packages. Trusted Publishing remains a possible future migration, but it is not required by the current workflow.

The repository therefore needs separate npm workflows: one with `registry-url: https://npm.pkg.github.com` and `GITHUB_TOKEN` for GitHub Packages, and one with `registry-url: https://registry.npmjs.org` and `NPM_TOKEN` for public npmjs. The same package name and version cannot be published to both registries by assuming they are the same destination.

GitHub's Container registry documentation confirms that a workflow can authenticate to `ghcr.io` with `GITHUB_TOKEN` for packages associated with the workflow repository. The recommended publication path also links the container package to the repository automatically; the Dockerfile should include an OCI source label so the association remains explicit. The image's first publication is private by default and its visibility must be changed in GitHub package settings if a public image is desired.

GitHub's Maven documentation confirms that the Maven distribution URL is `https://maven.pkg.github.com/OWNER/REPOSITORY`, that the POM must use a matching `github` server id, and that a workflow may use `GITHUB_TOKEN` to publish a package associated with the workflow repository. The artifact id must contain only lowercase letters, digits, or hyphens.

GitHub's NuGet documentation confirms that the source endpoint is `https://nuget.pkg.github.com/NAMESPACE/index.json` and that a GitHub Actions workflow can add that source with `secrets.GITHUB_TOKEN` before running `dotnet nuget push`. The package metadata should use a package id and repository URL that identify the GitHub owner and repository.

GitHub's RubyGems documentation confirms that GitHub Packages uses `https://rubygems.pkg.github.com/NAMESPACE/` and a `~/.gem/credentials` entry in the form `:github: Bearer TOKEN`. In a workflow the token can be the automatically supplied `GITHUB_TOKEN`; no long-lived RubyGems token belongs in the repository.

The RubyGems workflow must pass the host without a trailing slash, matching the official `gem push --host https://rubygems.pkg.github.com/NAMESPACE` form. RubyGems appends its API path to that host; leaving an extra slash caused the first publish attempt to redirect permanently and fail.

## workflow decisions

The repository now uses one release-triggered workflow per destination. After the repository transfer, `publishgithubnpm.yml` derives the GitHub Packages npm scope from `github.repository_owner`, so the v1.8.2 run targets `@wenathlan/saddle` with `GITHUB_TOKEN`; the public npm workflow publishes the same canonical package with `NPM_TOKEN`. `publishghcr.yml` derives `ghcr.io/wenathlan/saddle`; `publishmaven.yml` publishes `io.wenathlan:saddle`; NuGet and RubyGems retain their ecosystem-compatible unscoped package identities. Every GitHub Packages job grants only `contents: read` and `packages: write`.

`publishnpmjs.yml` is intentionally separate from GitHub Packages. It uses Node 26.7.0, disables package-manager caching for the release job, and runs `npm publish --access public` against `https://registry.npmjs.org` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`. The secret name is public by design, but its value must remain owner-managed and absent from logs and source files.

The public npm package must be created under the owner account before the first successful publication. The current path uses the owner-managed `NPM_TOKEN` secret for that bootstrap and subsequent releases. The exposed credential from the prior conversation must never be used.

The GitHub Packages npm workflow uses the repository owner scope at runtime. The repository is now owned by `wenathlan`, while the authenticated `iakadion` account retains administrator permission, so the committed package metadata and the GitHub Packages workspace both resolve to `@wenathlan/saddle`. Public npm and GitHub Packages therefore share the canonical JavaScript identity for v1.8.2.

The GHCR package is linked automatically by publishing from this repository and includes the OCI source label in `dockerfile.saddle`. GitHub creates a first container package as private by default, so the owner must change its package visibility to public if public pulls are required. The same visibility review applies to the Maven, NuGet, RubyGems, and GitHub npm packages after their first publication.

The live GHCR workflow `31544093172` completed successfully, and the public package page shows `ghcr.io/iakadion/saddle:latest` with a published image digest. The Maven workflow `31544137277` uploaded `io.devthink:saddle:1.0.0` to `maven.pkg.github.com/iakadion/saddle`. The NuGet workflow `31544179046` pushed `Saddle.1.0.0.nupkg` to `nuget.pkg.github.com/iakadion`. The first RubyGems workflow `31544228642` failed because the host had an extra trailing slash; after removing it, workflow `31544354107` registered `saddle (1.0.0)` successfully.

## live verification

The first `publishgithubnpm.yml` run failed with HTTP 403 because `@devthink/saddle` was not an authorized package namespace for the `iakadion/saddle` workflow. The corrected run `31543249301` completed successfully after rewriting the package name in the CI workspace to `@iakadion/saddle`. However, the repository Packages page still returned an empty listing immediately afterward, and the available GitHub API token could not read the user package namespace. The next verification must query the owner package page directly and inspect the workflow publish logs before treating the successful exit code as visible package availability.

The v1.7.0 release verification used workflow logs as the available artifact evidence. GitHub npm run `31549603859` published `@iakadion/saddle@1.7.0`; GHCR run `31549603838` pushed `ghcr.io/iakadion/saddle:1.7.0` and `latest`; Maven retry run `31549802841` uploaded `io.devthink:saddle:1.7.0`; RubyGems retry run `31549804286` registered `saddle (1.7.0)`; and NuGet retry run `31549972311` created and pushed `Saddle.1.7.0.nupkg`. The GitHub package-list API was not readable with the available integration token, so these statements are limited to successful workflow upload evidence rather than an independent package-page listing.

The first public npmjs run `31549603849` used OIDC and returned HTTP 404. Retry `31551708958` used the configured `NPM_TOKEN` secret, and retry `31551771374` confirmed that the masked secret reached the runner after newline normalization; both still returned HTTP 404 for `@devthink/saddle`. The identity-check retry `31552368723` reached `npm whoami` with a masked token but npm returned HTTP 401. The remaining blocker is the token itself or its account/scope permission: the owner must replace `NPM_TOKEN` with a valid raw npm access token authorized to publish `@devthink/saddle`. The exposed token from the prior conversation remains deliberately unused.

The cross-runtime workflow `31552266171` and its manual rerun `31552272176` completed successfully. The matrix ran the root probe on Node, Bun and Deno and the deterministic Node suite. The root entry no longer imports filesystem, Node HTTP, persistent queue, file-session or local-memory adapters; those remain explicit Node-only subpaths.

Release `v1.8.0` was created from commit `9ddfd6c`. GitHub npm run `31556461901`, GHCR run `31556461887`, NuGet run `31556461883` and RubyGems run `31556461991` completed successfully for `1.8.0`. Maven run `31556461885` initially failed because setup-java rejects `latest`; after changing the workflow to JDK 26, manual run `31556549154` completed successfully. Public npmjs run `31556461909` produced the `@devthink/saddle@1.8.0` tarball but the registry rejected the PUT with HTTP 404 `Scope not found`; no public npmjs publication is claimed.

The active package identity on main is now `@wenathlan/saddle`. The repository has since transferred to `wenathlan`; the authenticated `iakadion` account retains administrator permission. Release `v1.8.2` is the first release prepared against the transferred repository owner for GitHub Packages npm, Maven and GHCR.

Release `v1.8.1` was created from the identity migration commit `efcbb02`. The npmjs workflow `31557618590` authenticated as `wenathlan`, generated `@wenathlan/saddle@1.8.1`, and ended with npm's `+ @wenathlan/saddle@1.8.1` success line. A later independent `npm view` returned `1.8.1`, and the direct registry metadata endpoint returned HTTP 200 with the same version record, confirming public visibility. The other v1.8.1 registry workflows also completed successfully: GitHub npm `31557618600`, GHCR `31557618571`, Maven `31557618597`, NuGet `31557618573` and RubyGems `31557618575`.

Release `v1.8.2` was created from commit `ac7c355` after the repository transfer to `wenathlan`. All release jobs succeeded: GitHub npm `31559770092` logged the owner-derived `@wenathlan/saddle` package, npmjs `31559770096` published the same public package, GHCR `31559770016` pushed `ghcr.io/wenathlan/saddle:1.8.2` and `latest`, Maven `31559770216` deployed `io.wenathlan:saddle:1.8.2`, NuGet `31559770142` created and pushed `Saddle.1.8.2.nupkg`, RubyGems `31559770023` registered `saddle (1.8.2)`, and extension build `31559769740` attached `saddle-extension-1.8.2.zip`. Release validation `31559770059` also succeeded. Independent checks confirmed npmjs `@wenathlan/saddle@1.8.2` and the GitHub release asset. The GitHub organization package-list API returned 403 for the available integration, while unauthenticated GHCR, Maven and NuGet endpoints returned 401; these protected visibility boundaries do not contradict the successful authenticated workflow logs.

## sources

1. GitHub Docs — About permissions for GitHub Packages: https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages
2. npm Docs — Trusted publishing for npm packages: https://docs.npmjs.com/trusted-publishers
3. GitHub Docs — Working with the Container registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry
4. GitHub Docs — Working with the Apache Maven registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry
5. GitHub Docs — Working with the NuGet registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry
6. GitHub Docs — Working with the RubyGems registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-rubygems-registry
