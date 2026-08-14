# Saddle 1.8.17

Saddle 1.8.17 expands the GHCR container from an unqualified single-platform publication to a Linux OCI manifest index. The release workflow builds and publishes `linux/amd64`, `linux/arm64`, and `linux/ppc64le`; it verifies the pushed index, then pulls and runs the amd64 variant for the existing OCI-label and CLI smoke checks. Windows containers are deliberately not claimed because the current Dockerfile is Linux-based and no compatible Node 26.7.0 Windows base was verified.

## Changes

| Area             | Change                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container matrix | Adds Buildx publication for `linux/amd64`, `linux/arm64`, and `linux/ppc64le`.                                                                                                             |
| Emulation        | Registers QEMU before Buildx so the GitHub-hosted Linux builder can create the selected non-native Linux variants.                                                                         |
| Validation       | Keeps a locally loadable `linux/amd64` scan target, verifies the pushed OCI index contains exactly the selected Linux architectures, checks the OCI version label, and runs `saddle help`. |
| Scope boundary   | Defers `windows/amd64`, `linux/arm/v7`, and `linux/386`; rejects `unknown/*` as a runtime target.                                                                                          |
| Dockerfile       | Removes an unused Alpine stage so the Dockerfile resolves only the Debian-based build and runtime stages that participate in the selected matrix.                                          |
| Versioning       | Aligns active package, registry, native, extension, crawler, Capacitor, and iOS metadata to `1.8.17`, with iOS build number `1008017`.                                                     |

## Container publication contract

| Image reference                   | Expected published Linux platforms            | Verification after push                                                                                    |
| --------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ghcr.io/wenathlan/saddle:1.8.17` | `linux/amd64`, `linux/arm64`, `linux/ppc64le` | OCI manifest-index inspection, amd64 pull, OCI version-label comparison, and CLI help smoke test.          |
| `ghcr.io/wenathlan/saddle:latest` | The same platforms as the version tag         | The version-specific tag is verified first; `latest` is not claimed until the registry workflow completes. |

`windows/amd64` requires a separate Windows Dockerfile, an explicitly versioned Windows base image, a compatible Windows runner, and Windows-specific smoke testing. It is not interchangeable with the Debian Linux image. `unknown/*` descriptors are not advertised as runnable platforms.

## Artifact contract

The release workflows derive all names from `v1.8.17`. The expected artifact matrix remains 38 files: 20 primary artifacts, nine manifests, and nine checksum files. The container archive name is `saddle.container.1.8.17.tar.gz`; its release manifest records the image reference but does not replace inspection of the pushed registry manifest index.

## Verification boundary

These notes describe the release candidate and expected outputs. Registry availability, image index contents, scan results, signatures, SBOM validity, Android signing, iOS artifacts, and any platform-specific execution claim are recorded only after the relevant workflow output independently confirms them.

## Verified publication results

The published [v1.8.17 release](https://github.com/wenathlan/saddle/releases/tag/v1.8.17) is neither a draft nor a prerelease and contains **38 attached assets**: 20 primary artifacts, nine manifests, and nine checksum files. The desktop, mobile, extension, and target workflows completed successfully. The Android manifest records `ci-test-key` and the container manifest records `caller-owned`; neither state is presented as production signing or registry trust.

The six tag-driven registry workflows completed successfully in container-first order: GHCR, GitHub Packages npm, public npmjs, Maven, NuGet GitHub Packages, and RubyGems. GHCR run `31847952976` passed its QEMU-enabled build, scan, publication, manifest-index assertion for `linux/amd64`, `linux/arm64`, and `linux/ppc64le`, amd64 pull, OCI version-label comparison, and `saddle help` smoke test.

## References

[1]: https://docs.docker.com/build/building/multi-platform/ "Docker multi-platform builds"
[2]: https://docs.docker.com/build/ci/github-actions/multi-platform/ "Multi-platform image with GitHub Actions"
[3]: https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility "Windows container version compatibility"
