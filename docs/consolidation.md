# Saddle consolidation record

## Purpose

This record preserves the result of a Git-history review performed for the 1.8.17 cycle. It consolidates durable implementation themes without replacing the repository README, which remains a non-deterministic scope reference.

## Historical review

The review inspected all 41 historical revisions of the root README available through Git. It also identified the platform-specific README paths that appeared over the repository history. The enduring implementation themes are the storage-backed working set, replaceable third-party runners, bounded browser and scraping contracts, transport-neutral protocols, deterministic packaging, native conversion surfaces, explicit security boundaries, and caller-owned credentials and signing.

The consolidation does not promote speculative provider capabilities, hosted-service assumptions, obsolete package identities, or older runtime requirements into active commitments. Historical release records remain historical evidence rather than current metadata.

## Version-reference audit

The Git review inspected the 41 historical root README revisions and their version references. Those revisions preserve an evolving record spanning earlier 1.8 releases; their version strings are historical evidence and must not be rewritten as if they described the current release.

The current README contains legacy 1.8.14 statements and direct references to internal material. It is intentionally retained unchanged because it remains the repository scope reference. The active-version statement is therefore provided by this record and the manifest matrix below rather than by editing historical text in place.

| Reference class                                                    | Handling                                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Active package, native, crawler, extension, and container metadata | Must resolve to `1.8.17`.                                                                                                     |
| Release notes, changelog, artifact records, and historical READMEs | Retained as immutable evidence for their own release period.                                                                  |
| Deterministic test fixtures                                        | Retained with their fixture versions; they do not select a package or registry version.                                       |
| Current README scope text                                          | Preserved unchanged; its stale version and internal-reference findings are recorded here instead of being silently rewritten. |

The external consolidation has no direct links to materials under `docs/`. It is the active reference for the 1.8.17 matrix while the repository README remains the preserved scope reference.

## Whole-repository audit

The current tracked tree was searched for pre-1.8.17 version tokens with numeric boundaries. All product manifests resolve to 1.8.17. The only non-product match outside preserved historical material is an AndroidX dependency version in the Android build variables; it is a library dependency and not a Saddle release version.

The remaining version references belong to historical release evidence, changelog entries, archival research, deterministic test fixtures, automation assertions, or preserved README scope text. They must retain their original values because replacing them would make the evidence, fixture assertions, and historical descriptions false.

## Historical behavior disposition

The historical README review identified the following enduring themes and records how each is represented in the active consolidation.

| Historical theme                                                       | Active disposition                                                                                                                |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Storage as compute, file-as-compute, memory engine, and memory tiers   | Represented by the storage-backed working-set, memory modes, objects, transforms, planner, and bounded materialization contracts. |
| Repo-as-CPU, multi-forge operation, and distributed execution          | Represented by caller-owned, replaceable runners and transport-neutral job, workflow, and delivery contracts.                     |
| Content types, API communication, extraction, crawling, and cache      | Represented by JSON-family protocols, bounded scraping, normalization, schema, robots, crawling, and cache contracts.             |
| Request strategies, validation, concurrency, and recovery              | Represented by retry, queue, idempotency, saga, abort, compatibility, worker, and circuit-breaker boundaries.                     |
| Browser context, fingerprinting, proxy, captcha, and stealth proposals | Retained only as caller-owned boundaries; the active record makes no bypass, provider, or anti-detection guarantee.               |
| Database and SQL proposals                                             | Retained as historical proposals. The active engine does not provision or require a database.                                     |

The review intentionally excludes historical secret names, provider-specific credentials, speculative dependencies, and unimplemented hosted-service claims from the active record.

## Active 1.8.17 reference matrix

| Surface                         | Active metadata                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| JavaScript package and lockfile | `@wenathlan/saddle` version `1.8.17`                                                  |
| Maven                           | revision `1.8.17`                                                                     |
| NuGet                           | package version `1.8.17`                                                              |
| RubyGems                        | package version `1.8.17`                                                              |
| Browser extension               | manifest version `1.8.17`                                                             |
| Desktop shell                   | package and application version `1.8.17`                                              |
| iOS                             | marketing version `1.8.17`, build `1008017`                                           |
| Crawler identity                | user agent `Saddle/1.8.17`                                                            |
| Capacitor boundary              | active 1.8.17 native-conversion comment                                               |
| Container                       | OCI release tag `1.8.17` with verified Linux `amd64`, `arm64`, and `ppc64le` variants |

## Documentation and archive boundary

The current README is preserved unchanged. The active release, architecture, security, packaging, and operational records remain separate from historical research material. The encrypted archival operation is deliberately independent from this consolidation record and stores no passphrase, recovery material, or archive contents here.

## Maintenance rule

Future releases must update active manifest metadata together and retain completed release documentation as immutable historical evidence. New capability claims require implementation and independently observed validation before they are added to current release records.
