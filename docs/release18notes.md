# Saddle 1.8.0

Saddle 1.8.0 extends the transport-neutral engine with a browser worker bridge, package export import coverage, and a current-runtime validation lane. The release also updates the audited CI and container toolchains to Node.js 26.7.0 while preserving the package engine range for existing consumers.

## included changes

The release includes `runtimecontract`, `memorystorage`, the Node/Bun/Deno root probe, `workerbridge`, all public surface contracts from the first product-surface slice, and deterministic import coverage for every declared package export. The container uses official Node 26.7.0 Alpine and Bookworm Slim bases.

## validation

The candidate is required to pass `npm run check`, `npm run formatcheck`, `npm test`, `npm run pack:check` and `git diff --check`. The current candidate contains 83 passing tests and produces `devthink-saddle-1.8.0.tgz`. Registry publication is performed only by the release workflows after the tag is created.

## registry behavior

Maven, NuGet, RubyGems, GHCR and GitHub Packages npm derive `1.8.0` from the `v1.8.0` tag. Public npmjs also derives the version automatically but requires the owner-managed `NPM_TOKEN`; the prior token check returned HTTP 401, so npmjs must be reported according to its actual workflow result rather than assumed successful.
