# Saddle 1.8.11 security research

## Advisory scope

The reported advisory is `GHSA-wrw7-89jp-8q8g`, also identified as `RUSTSEC-2024-0429`. It affects the Rust crate `glib` from version `0.15.0` through versions before `0.20.0`. The patched line is `glib >= 0.20.0`.

The issue is an unsound `VariantStrIter` implementation. The affected iterator methods can reach a mutable C out-argument through an immutable Rust reference, which can lead to undefined behavior and null pointer dereference crashes in optimized builds. GitHub classifies the advisory as **Moderate**, with CVSS 4.0 base score `6.9`; no CVE identifier is assigned.

The advisory is relevant to Saddle's native dependency graph because the desktop Tauri surface uses Rust and GTK/WebKit platform dependencies. The first remediation step is to inspect the resolved Cargo graph rather than assume that the direct application manifest is the only source of `glib`.

## Required checks

The security workflow must run `cargo tree` and `cargo audit` against the resolved desktop graph, report every `glib` version, and fail when an affected version is reachable in a release build. A direct dependency override must not be added blindly: GTK generation compatibility and the actual Tauri platform dependency graph must be checked before selecting an upgrade, patch release, or platform-specific mitigation.

## Sources

1. [GitHub Advisory Database: GHSA-wrw7-89jp-8q8g](https://github.com/advisories/GHSA-wrw7-89jp-8q8g)
2. [RustSec: RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html)
3. [gtk-rs-core fix discussion](https://github.com/gtk-rs/gtk-rs-core/pull/1343)
