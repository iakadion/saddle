# Objective driven batches 1.8.16 to 1.8.20

The uploaded scope README remains an objective reference. It describes the intended package behavior, runtime independence, storage-to-compute bridge and public target surfaces; it does not prescribe a deterministic file sequence or implementation recipe.

| Batch | Selected objective | Acceptance evidence |
|---|---|---|
| 1.8.16 | Complete the generic S3-compatible storage surface with caller-signed paginated listing. | XML listing fixtures, prefix and continuation handling, malformed-response errors and adapter contract tests. |
| 1.8.17 | Make sitemap index traversal bounded, recursive, deduplicated and cycle-safe. | Nested index fixtures, duplicate URLs, cycles, `maxUrls` and network-error tests. |
| 1.8.18 | Make browser action recording bounded and exportable without losing snapshot correlation. | Event limit, clear/export behavior, immutable manifest copies and correlation tests. |
| 1.8.19 | Add explicit workflow input validation and deterministic trigger matching for caller-owned CI dispatch. | Strict input fixtures, unknown input rejection, event filtering and registry tests. |
| 1.8.20 | Add a cross-runtime capability report for library, browser, desktop, mobile, CLI and binary modes. | Stable capability matrix, caller overrides and no host, port or credential ownership. |

The batches are deliberately grouped by objective rather than by a fixed folder plan. Each batch must pass focused tests before the next batch is selected. Version bumps, commits, tags and releases remain separate delivery actions and wait for the user's explicit authorization.
