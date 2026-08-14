# Container platform decision for 1.8.17

## Scope

Version 1.8.17 expands the Saddle OCI image from an unqualified single-platform publication to a Linux manifest index containing `linux/amd64`, `linux/arm64`, and `linux/ppc64le`. The selection is based on the current `node:26.7.0-bookworm-slim` base manifest, which exposes those Linux architectures. Buildx can publish a manifest index and select the compatible variant when a consumer pulls the common tag.[1]

## Platform matrix

`linux/amd64` is published because it is the primary GitHub runner architecture and the local smoke-test platform. `linux/arm64` is published because the current Node Debian slim base manifest exposes it as a first-class Buildx multi-platform target.[1] [2] `linux/ppc64le` is published because the same base manifest exposes it and QEMU-enabled Buildx can build the selected variant.[1] [2]

`linux/arm/v7` and `linux/386` are deferred because the inspected `node:26.7.0-bookworm-slim` manifest does not include them. `windows/amd64` is deferred because the current Dockerfile uses Debian Linux stages. A Windows container needs a Windows-specific base image, compatible Windows runner, and selected Windows base tag; the inspected Node 26.7.0 Windows base-tag candidates were unavailable, and Windows host/image compatibility is materially stricter than Linux compatibility.[3]

`unknown/*` is rejected because OCI `unknown` descriptors are not a runnable operating-system or CPU target and must not be advertised as a Saddle container platform.

## Workflow design

The release workflow must register QEMU before Buildx, scan a loadable `linux/amd64` image, and push all selected Linux variants through one Buildx invocation. The post-push verification must inspect the registry manifest index for the three Linux architectures, then pull and execute the `linux/amd64` variant to retain the existing label verification and CLI smoke test. GitHub-hosted runners cannot load a multi-platform image into the default local image store, so the scan build stays single-platform while the publication is pushed directly to GHCR.[2]

Windows containers are intentionally out of scope for 1.8.17. A future Windows implementation must introduce a separate Windows Dockerfile, an explicitly versioned Windows base image, a Windows runner, platform-specific smoke tests, and compatibility documentation. It must not be merged into the Linux image by declaring a platform string alone.

## Publication claims

The version 1.8.17 release notes and registry documentation may claim only the three verified Linux variants after the pushed image index is inspected. They must not claim Windows support, an `unknown` platform, or a universal OS image.

## References

[1]: https://docs.docker.com/build/building/multi-platform/ "Docker multi-platform builds"
[2]: https://docs.docker.com/build/ci/github-actions/multi-platform/ "Multi-platform image with GitHub Actions"
[3]: https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility "Windows container version compatibility"
