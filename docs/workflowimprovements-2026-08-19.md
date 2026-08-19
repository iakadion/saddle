# Workflow improvement assessment — 2026-08-19

## Scope and method

This assessment reviewed the 19 tracked GitHub Actions workflows, the two local composite actions, the operational record, and the workflow categories supplied by the user: continuous integration, security, Pages, automation and deployment. It distinguishes controls already implemented from candidates that would add observable value. A candidate is not treated as implemented merely because a starter template exists.

GitHub exposes starter workflows as a catalog that can be filtered by category; templates can require secrets or extra setup and are not automatically suitable for a repository.[1] The current repository already covers its TypeScript engine, browser-facing web build, native artifacts, six registries, security scans, cache retention and GitHub Pages. The correct next step is selective hardening rather than adding every template.

## Current coverage

| Area                   | Assessment                                                                                                                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continuous integration | Engine build, type and syntax checks, active and legacy tests, package smoke check, cross-runtime compatibility and UKA tests form a strong baseline. Node 26.7.0 is used for the central engine path.                                                      |
| Workflow security      | CodeQL scans GitHub Actions, JavaScript/TypeScript and Rust. The security workflow also runs dependency review, npm audit, cargo audit with an explicit reviewed-risk gate, OSV, TruffleHog, Trivy filesystem scanning and SBOM generation.                 |
| Release and artifacts  | Release validation, target plans, extension, container archive, seven-target desktop matrix, Android/iOS paths, GHCR and five package registry workflows are present. Local composite actions centralize release-version resolution and package validation. |
| Web deployment         | GitHub Pages builds the unified `web/` surface, normalizes the repository base path, creates a fallback, uploads the Pages artifact and deploys with serialized concurrency.                                                                                |
| Maintenance            | Cache retention has a dry-run default, dependency updates run weekly and release workflows expose manual dispatches.                                                                                                                                        |

## Implemented improvement

The repository now includes `workflow lint`. It runs only for pull requests that change workflow or local composite-action files, uses a read-only token, and checks workflow syntax, expressions, action inputs, reusable workflow calls, cron syntax and common workflow-security errors. `actionlint` performs these checks without running project code, making it an appropriate low-cost complement to CodeQL's broader Actions analysis.[2]

The action references are pinned to full commit SHAs. GitHub identifies full SHA pinning as the immutable form of action reference and recommends least-privilege workflow tokens.[3] The new workflow has only `contents: read`; it introduces no secrets, package publishing, network credentials or self-hosted runner.

## Prioritized candidates

### High priority

**Dependabot grouping.** Group minor and patch updates by ecosystem while keeping major upgrades separate. This would reduce branch and pull-request churn after the recent cleanup while retaining update coverage. The grouping policy changes the review unit, so it should be approved separately before implementation.

**Release-readiness aggregation.** Add a manually invoked report that aggregates completed validation, artifact availability and registry evidence before a public release is created. This can reuse the existing serializable release-evidence API and requires no new secret. It must not claim that release-event workflows can prevent a release that has already been published.

### Medium priority

**OpenSSF Scorecard in report-only mode.** Scorecard can identify supply-chain policy gaps involving action pinning, token permissions and branch protection. It is feasible for this public repository but needs a narrowly scoped job permission of `security-events: write` and `id-token: write` to publish results. It should not become a merge-blocking gate until findings are reviewed.[4]

**Reusable release workflows.** Extract repeated release-only preparation steps into one or more reusable workflows. GitHub supports explicit inputs and secrets in reusable workflows, but permissions can only be maintained or reduced through nested calls. A refactor must preserve the current release-tag behavior exactly.[5]

**Artifact-attestation inventory.** Add a report that records which non-container artifacts have checksums, manifests, SBOMs or provenance. This should make evidence easier to inspect without claiming signing or trust that does not exist. GHCR already performs provenance and SBOM publication; desktop and mobile signing remain caller-owned.

**Persistent failure summary.** Add a human-readable summary only for repeated failures, so GitHub 503 service outages can be distinguished from source failures. This is deferred because it needs a destination, issue policy and write permission; it must not create or close issues automatically without a retention policy.

### Low or conditional priority

**PR labels, greetings and stale automation.** These improve triage only. They are not recommended now because the repository has no open PRs and automatic stale closure could conflict with deliberate archival decisions.

**Additional language scanners.** They are not recommended. The repository has substantive TypeScript and Rust code already covered by CodeQL. Package metadata for Maven, NuGet and RubyGems does not justify Java, C# or Ruby source scanning.

**OIDC trusted publishing.** This can replace long-lived publishing credentials for registries that support it, but it requires a registry-specific trust configuration owned by the account administrator. It cannot be enabled correctly through source changes alone.[6]

**Browser micro-VM or remote browser tests.** These require images, network policy, credentials and an isolated runtime. They are not a current CI candidate: GitHub-hosted runners must not be represented as the user's browser, storage or VM.

## Controls intentionally not added

The repository does not add self-hosted runners, automatic PR creation or approval, long-lived cloud credentials, SaaS scanner credentials, browser downloads or remote execution. GitHub warns that public-repository self-hosted runners can be persistently compromised by untrusted pull-request code.[3] The public workflows should remain on ephemeral GitHub-hosted runners until a later design establishes a separately isolated, operator-owned execution plane.

The analysis also does not recommend duplicate security scanners merely to increase the workflow count. Trivy, OSV, npm audit, cargo audit, CodeQL, TruffleHog, dependency review and SBOM generation have different purposes. An additional scanner should be introduced only with a defined signal, owner, remediation route and operating cost.

## Recommended sequence

The next low-risk work is to observe the new workflow-lint gate on normal workflow changes. The next design task is a non-publishing release-readiness aggregation command and report. Dependabot grouping and Scorecard should follow only after the desired review policy is chosen. Remote browser or micro-VM integration remains a 1.8.19 adapter and infrastructure design task, not a GitHub Actions template.

## References

[1]: https://docs.github.com/actions/writing-workflows/using-workflow-templates "GitHub Docs: Using workflow templates"
[2]: https://github.com/rhysd/actionlint "actionlint: static checker for GitHub Actions workflows"
[3]: https://docs.github.com/en/actions/reference/security/secure-use "GitHub Docs: Secure use reference"
[4]: https://github.com/ossf/scorecard-action "OpenSSF Scorecard Action"
[5]: https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows "GitHub Docs: Reuse workflows"
[6]: https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments "GitHub Docs: Security hardening your deployments"
