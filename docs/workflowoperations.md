# Workflow operations

Saddle keeps executable GitHub workflow definitions in `.github/workflows`. GitHub requires workflow YAML files in that directory. The repository currently uses lower-case `.yml` names for every workflow definition.[1]

Composite action metadata remains in `.github/actions/<action>/action.yml`. Those files are not standalone workflows: the repository invokes them as local actions from their directory, so moving them into the workflow directory would break their executable local-action path. Dependabot configuration remains at `.github/dependabot.yml`, which is the path GitHub requires on the default branch; it is dependency-update configuration rather than a runnable workflow.[2]

## Mobile release policy

The Android job first uses caller-provided production signing material only when all required repository secrets exist. If a release is published without that material, it automatically generates a temporary `ci-test-key`, attaches the APK and AAB, and records `ci-test-key` in the Android manifest. This keeps the release artifact flow automatic without representing the result as production-signed. Manual Android runs remain opt-in for the same fallback through `allow_test_signing=true`. iOS remains disabled until the caller enables its separate signing and provisioning path.

## Cache retention policy

The `cache retention` workflow runs after CodeQL completes and on a daily schedule. A manual run defaults to reporting candidates only; its `apply` input must be set to `true` to delete anything. It receives only `actions: write` and `contents: read`, and uses the repository-scoped cache API. It does not access artifacts, releases, packages, source checkouts, or external repositories.

| Scope                                  | Retention rule                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `refs/heads/main` CodeQL caches        | Retain the three most recently accessed entries.                                |
| `refs/heads/main` Node caches          | Retain the two most recently accessed entries.                                  |
| `refs/heads/main` Java or other caches | Retain the most recently accessed entry per family.                             |
| Non-default refs                       | Retain entries accessed within the latest six hours, then delete older entries. |

The policy is intentionally bounded because GitHub cache entries are mutable accelerators, not release evidence. GitHub documents default seven-day inactivity eviction and a default 10 GB per-repository quota; proactively keeping a small recent set prevents repeated CodeQL overlays and tag-scoped entries from consuming the whole quota.[3]

Release-only target planning and GitHub Packages npm publication explicitly disable the Node package-manager cache. Those jobs receive little benefit from a tag-scoped cache and otherwise create entries that cannot be reused by the default branch.

## References

[1]: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions "Workflow syntax for GitHub Actions"
[2]: https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file "About the dependabot.yml file"
[3]: https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching "Dependency caching reference"
