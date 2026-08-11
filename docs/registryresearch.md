# registry research

## verified facts

GitHub's documentation states that GitHub Actions can use the workflow `GITHUB_TOKEN` to publish, install, delete, and restore packages in GitHub Packages without storing a personal access token. The workflow still needs the correct job permission, normally `packages: write`, and the package must target a GitHub Packages registry rather than the public npm registry.

npmjs is a separate registry. npm Trusted Publishing uses OIDC and removes the need for a long lived `NPM_TOKEN`, but it requires a trusted publisher configured on the npm package, GitHub Actions `id-token: write`, a supported recent npm CLI and Node runtime, and the exact workflow filename configured on npm. This is different from publishing `@scope/package` to GitHub Packages.

The repository therefore needs separate npm workflows: one with `registry-url: https://npm.pkg.github.com` and `GITHUB_TOKEN` for GitHub Packages, and one with `registry-url: https://registry.npmjs.org` and OIDC for public npmjs. The same package name and version cannot be published to both registries by assuming they are the same destination.

GitHub's Container registry documentation confirms that a workflow can authenticate to `ghcr.io` with `GITHUB_TOKEN` for packages associated with the workflow repository. The recommended publication path also links the container package to the repository automatically; the Dockerfile should include an OCI source label so the association remains explicit. The image's first publication is private by default and its visibility must be changed in GitHub package settings if a public image is desired.

GitHub's Maven documentation confirms that the Maven distribution URL is `https://maven.pkg.github.com/OWNER/REPOSITORY`, that the POM must use a matching `github` server id, and that a workflow may use `GITHUB_TOKEN` to publish a package associated with the workflow repository. The artifact id must contain only lowercase letters, digits, or hyphens.

GitHub's NuGet documentation confirms that the source endpoint is `https://nuget.pkg.github.com/NAMESPACE/index.json` and that a GitHub Actions workflow can add that source with `secrets.GITHUB_TOKEN` before running `dotnet nuget push`. The package metadata should use a package id and repository URL that identify the GitHub owner and repository.

GitHub's RubyGems documentation confirms that GitHub Packages uses `https://rubygems.pkg.github.com/NAMESPACE/` and a `~/.gem/credentials` entry in the form `:github: Bearer TOKEN`. In a workflow the token can be the automatically supplied `GITHUB_TOKEN`; no long-lived RubyGems token belongs in the repository.

## workflow decisions

The repository now uses one release-triggered workflow per destination. `publishgithubnpm.yml` publishes a GitHub Packages npm variant under the repository owner scope, currently `@iakadion/saddle`, with `GITHUB_TOKEN`; the public npm workflow keeps the canonical name `@devthink/saddle`. `publishghcr.yml` publishes `ghcr.io/iakadion/saddle`; `publishmaven.yml`, `publishnuget.yml`, and `publishrubygems.yml` publish minimal ecosystem metadata to the corresponding GitHub Packages registries. Every GitHub Packages job grants only `contents: read` and `packages: write`.

`publishnpmjs.yml` is intentionally separate from GitHub Packages. It requests `id-token: write`, uses Node 24, disables package-manager caching for the release job, and runs `npm publish --provenance` against `https://registry.npmjs.org`. It contains no `NPM_TOKEN` reference. The npm package must have a Trusted Publisher configured on npmjs.com with the GitHub owner `iakadion`, repository `saddle`, workflow filename `publishnpmjs.yml`, and the `npm publish` action enabled.

Trusted Publishing does not replace the first npmjs publication in every account configuration: npm's trusted-publisher settings are attached to an existing package, and current npm tooling may reject an OIDC publish for a package that has never been created. If npmjs has not yet created `@devthink/saddle`, the owner must perform one bootstrap publication through an approved npm authentication method and immediately migrate the package to Trusted Publishing; that one-time bootstrap is the only part that may require an npm credential. The exposed credential from the prior conversation must never be used.

The GitHub Packages npm workflow must use a package scope authorized for the workflow token. `@devthink` is a GitHub organization namespace, while the selected repository currently belongs to `iakadion`; the first run confirmed that publishing `@devthink/saddle` was rejected with HTTP 403. The workflow now changes only the package metadata in the CI workspace to `@iakadion/saddle` before publishing, while the committed `package.json` and public npm package remain `@devthink/saddle`. The two registries therefore have independent package names and access rules.

The GHCR package is linked automatically by publishing from this repository and includes the OCI source label in `dockerfile.saddle`. GitHub creates a first container package as private by default, so the owner must change its package visibility to public if public pulls are required. The same visibility review applies to the Maven, NuGet, RubyGems, and GitHub npm packages after their first publication.

## sources

1. GitHub Docs — About permissions for GitHub Packages: https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages
2. npm Docs — Trusted publishing for npm packages: https://docs.npmjs.com/trusted-publishers
3. GitHub Docs — Working with the Container registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry
4. GitHub Docs — Working with the Apache Maven registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry
5. GitHub Docs — Working with the NuGet registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry
6. GitHub Docs — Working with the RubyGems registry: https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-rubygems-registry
