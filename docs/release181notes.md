# Saddle 1.8.1

Saddle 1.8.1 is a follow-up release that changes the canonical public npm identity to `@wenathlan/saddle`. The previous `v1.8.0` tag remains immutable and is not rewritten.

## package identity

The public npm workflow publishes `@wenathlan/saddle` using the owner-managed `NPM_TOKEN`. GitHub Packages continues to publish its repository-owned variant as `@iakadion/saddle` through the workspace namespace rewrite in `publishgithubnpm.yml`. Maven, NuGet, RubyGems and GHCR keep their existing artifact identities.

## validation

The candidate must pass `npm run check`, `npm run formatcheck`, `npm test`, `npm run pack:check` and `git diff --check`. The package version is derived from the `v1.8.1` tag by the shared release action; no workflow receives a manually typed release version.

## publication boundary

The release workflows remain separate at the registry job level because each destination requires a different protocol and credential. Shared checkout, Node setup, version resolution and package validation use local actions; incompatible publish commands remain isolated by registry.
