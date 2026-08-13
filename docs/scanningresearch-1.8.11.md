# Saddle 1.8.11 scanning research

## OSV Scanner

The official OSV Scanner GitHub Action documents separate pull request and full scheduled scans. The full reusable workflow can run on pushes, schedules and releases, upload SARIF to GitHub code scanning, and fail when a vulnerability is found. The action requires `actions: read`, `contents: read` and `security-events: write` permissions for SARIF reporting.

Source: [OSV Scanner GitHub Action](https://google.github.io/osv-scanner/github-action/)

## Cargo audit

The official RustSec `cargo audit` documentation states that the tool audits dependencies for advisories in the RustSec database, operates on the top level Cargo project and requires Rust 1.74 or later. The Saddle workflow must run it against the resolved desktop `Cargo.lock`, keep any ignore entry narrowly justified, and prefer upgrading the vulnerable crate over suppressing the advisory.

Source: [RustSec cargo audit README](https://github.com/rustsec/rustsec/blob/main/cargo-audit/README.md)

## Pipeline decision

Saddle should combine CodeQL for source and workflow analysis, OSV Scanner for multi ecosystem dependency intelligence and SARIF, `cargo audit` for RustSec coverage, npm audit for Node lockfiles, dependency review on pull requests, secret scanning, SBOM generation and artifact level checks. The pipeline should distinguish existing baseline findings from newly introduced findings, while release gates fail closed for high or critical reachable vulnerabilities and for the specifically reported glib advisory.
