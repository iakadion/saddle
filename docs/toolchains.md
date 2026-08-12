# toolchain policy

The repository uses a current-runtime CI lane while preserving a compatible library engine range. Node.js `26.7.0` is the current release, while the official release table identifies Node.js `24.x` as LTS; CI and the container therefore use `26.7.0`, while `package.json` keeps `engines.node >=22` until a deliberate compatibility release changes that contract.[1][2]

| Area | Selected version or alias | Policy |
| --- | --- | --- |
| GitHub Actions checkout | `actions/checkout@v7` | Latest stable action referenced by current official examples |
| GitHub Actions Node | `actions/setup-node@v7` with `26.7.0` | Exact current Node release for CI, release validation and all package workflows |
| Docker runtime | `node:26.7.0-alpine` and `node:26.7.0-bookworm-slim` | Exact Node release for the two-stage container image; both tags are official Node image variants [3] |
| Maven | `actions/setup-java@v5` with `java-version: latest` | Latest stable GA JDK resolved by the action; Maven remains independently versioned |
| NuGet | `actions/setup-dotnet@v6` with `dotnet-version: latest` | Latest stable .NET SDK resolved by the action |
| RubyGems | `ruby/setup-ruby@v1` with `ruby-version: ruby` | Latest stable MRI supported by the action |
| Bun | `oven-sh/setup-bun@v2` with `bun-version: latest` | Latest Bun release in the cross-runtime matrix |
| Deno | `denoland/setup-deno@v2` with `deno-version: latest` | Latest stable Deno release in the cross-runtime matrix |
| Docker publishing actions | `docker/login-action@v4`, `docker/build-push-action@v7` | Current stable action majors from the official Docker repositories [4][5] |

The package release version is intentionally not coupled to these toolchain versions. Each publishing workflow resolves the version from the release tag, checks it against `package.json`, and only then creates the registry artifact. A toolchain update alone does not create a release, move a tag, or publish to npmjs, GHCR, Maven, NuGet or RubyGems.

The public npm workflow remains blocked until the owner replaces the invalid or unauthorized `NPM_TOKEN`. The maintenance commit does not trigger any package publish job because the publish workflows listen for a release or explicit manual dispatch.

## References

[1]: https://nodejs.org/en/blog/release/v26.7.0 "Node.js v26.7.0 release"
[2]: https://nodejs.org/en/about/previous-releases "Node.js release status table"
[3]: https://hub.docker.com/_/node "Docker Official Image: node"
[4]: https://github.com/docker/login-action "docker/login-action"
[5]: https://github.com/docker/build-push-action "docker/build-push-action"
