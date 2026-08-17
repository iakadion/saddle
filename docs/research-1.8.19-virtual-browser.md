# 1.8.19 virtual browser research record

## Scope

This record evaluates Neko as a public reference for remote browser architecture. It is not an instruction to deploy Neko, a Docker runtime, a TURN server, a browser image or a micro-VM.

## Findings

| Finding | Planning consequence |
| --- | --- |
| Neko is self-hosted, uses Docker and streams a desktop through WebRTC. | A browser service requires an operator-managed runtime, network and remote-display transport; it cannot live inside a static package or GitHub Pages site. |
| Neko's GHCR workflow builds a base image then runs a matrix for separate Firefox, Chromium, Chrome, Edge, Brave, Vivaldi, Opera, Tor Browser and desktop images. | Saddle should model engine and distribution selection as separate capabilities rather than claim source-level fusion of browser engines. |
| Neko treats file access and browser profile persistence as explicit configuration changes. | Saddle must keep transfers, downloads, uploads and persistence denied by default and adapter-owned. |
| Neko's remote interaction relies on WebRTC networking, with additional TURN or port configuration in some deployments. | A Saddle remote-browser adapter needs display transport, signaling, authentication and network-policy declarations before a real session can be claimed. |
| Neko supports other Linux desktop applications in addition to browsers. | Saddle can generalize its remote-runner contract beyond browsers while keeping every effect outside the root library. |

## Disposition

1.8.19 will introduce a data-only remote-browser capability model and test fixtures first. It will not bundle Neko, browser binaries, Docker, container images, TURN credentials, browser profiles or a persistent remote browser service. Those are future caller-selected adapters and operator deployments.

## Sources

- https://github.com/m1k1o/neko
- https://raw.githubusercontent.com/m1k1o/neko/master/.github/workflows/ghcr.yml
- https://raw.githubusercontent.com/m1k1o/neko/master/.github/workflows/image_base.yml
- https://raw.githubusercontent.com/m1k1o/neko/master/.github/workflows/image_app.yml
- https://neko.m1k1o.net/docs/v2
