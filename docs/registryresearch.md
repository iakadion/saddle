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

The repository now uses one release-triggered workflow per destination. `publishgithubnpm.yml` publishes a GitHub Packages npm variant under the repository owner scope, currently `@iakadion/saddle`, with `GITHUB_TOKEN`; the public npm workflow keeps the canonical name `@devthink/saddle`. `publishghcr.yml` publishes `ghcr.io/iakadion/saddle`; `publishmaven.yml`, `publishnuget.yml`, and `publishrubygems.yml` publish minimal ecosystem metadata to the corresponding GitHub Packages registries. Every GitHub Packages job grants only `contents: read` and `packages: write`.

`publishnpmjs.yml` is intentionally separate from GitHub Packages. It uses Node 24, disables package-manager caching for the release job, and runs `npm publish --access public` against `https://registry.npmjs.org` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`. The secret name is public by design, but its value must remain owner-managed and absent from logs and source files.

The public npm package must be created under the owner account before the first successful publication. The current path uses the owner-managed `NPM_TOKEN` secret for that bootstrap and subsequent releases. The exposed credential from the prior conversation must never be used.

The GitHub Packages npm workflow must use a package scope authorized for the workflow token. `@devthink` is a GitHub organization namespace, while the selected repository currently belongs to `iakadion`; the first run confirmed that publishing `@devthink/saddle` was rejected with HTTP 403. The workflow now changes only the package metadata in the CI workspace to `@iakadion/saddle` before publishing, while the committed `package.json` and public npm package remain `@devthink/saddle`. The two registries therefore have independent package names and access rules.

The GHCR package is linked automatically by publishing from this repository and includes the OCI source label in `dockerfile.saddle`. GitHub creates a first container package as private by default, so the owner must change its package visibility to public if public pulls are required. The same visibility review applies to the Maven, NuGet, RubyGems, and GitHub npm packages after their first publication.

The live GHCR workflow `31544093172` completed successfully, and the public package page shows `ghcr.io/iakadion/saddle:latest` with a published image digest. The Maven workflow `31544137277` uploaded `io.devthink:saddle:1.0.0` to `maven.pkg.github.com/iakadion/saddle`. The NuGet workflow `31544179046` pushed `Saddle.1.0.0.nupkg` to `nuget.pkg.github.com/iakadion`. The first RubyGems workflow `31544228642` failed because the host had an extra trailing slash; after removing it, workflow `31544354107` registered `saddle (1.0.0)` successfully.

## live verification

The first `publishgithubnpm.yml` run failed with HTTP 403 because `@devthink/saddle` was not an authorized package namespace for the `iakadion/saddle` workflow. The corrected run `31543249301` completed successfully after rewriting the package name in the CI workspace to `@iakadion/saddle`. However, the repository Packages page still returned an empty listing immediately afterward, and the available GitHub API token could not read the user package namespace. The next verification must query the owner package page directly and inspect the workflow publish logs before treating the successful exit code as visible package availability.

The v1.7.0 release verification used workflow logs as the available artifact evidence. GitHub npm run `31549603859` published `@iakadion/saddle@1.7.0`; GHCR run `31549603838` pushed `ghcr.io/iakadion/saddle:1.7.0` and `latest`; Maven retry run `31549802841` uploaded `io.devthink:saddle:1.7.0`; RubyGems retry run `31549804286` registered `saddle (1.7.0)`; and NuGet retry run `31549972311` created and pushed `Saddle.1.7.0.nupkg`. The GitHub package-list API was not readable with the available integration token, so these statements are limited to successful workflow upload evidence rather than an independent package-page listing.

The first public npmjs run `31549603849` used OIDC and returned HTTP 404. Retry `31551708958` used the configured `NPM_TOKEN` secret, and retry `31551771374` confirmed that the masked secret reached the runner after newline normalization; both still returned HTTP 404 for `@devthink/saddle`. The remaining blocker is npm package ownership or scope permission: the owner must create or bootstrap `@devthink/saddle` under the intended npm account or organization and ensure the token can publish that scope. The exposed token from the prior conversation remains deliberately unused.

The cross-runtime workflow `31552266171` and its manual rerun `31552272176` completed successfully. The matrix ran the root probe on Node, Bun and Deno and the deterministic Node suite. The root entry no longer imports filesystem, Node HTTP, persistent queue, file-session or local-memory adapters; those remain explicit Node-only subpaths.

## sources

1. GitHub Docs — About permissions for GitHub Packages: https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages
2. npm Docs — Trusted publishing for npm packages: https://docs.npmjs.com/trusted-publishers
3. GitHub Docs — Working with the Container registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry
4. GitHub Docs — Working with the Apache Maven registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry
5. GitHub Docs — Working with the NuGet registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry
6. GitHub Docs — Working with the RubyGems registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-rubygems-registry
