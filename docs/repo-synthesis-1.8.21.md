# Comparative synthesis for Saddle 1.8.21

The evidence set contains 50 public repositories selected across browser, scraping, storage, workflow, extension and packaging categories. Metadata, README excerpts, relevant tree paths and up to two code excerpts per repository were collected through the GitHub API. This document records patterns, not copied code.

## Evidence coverage

| Measure | Result |
|---|---:|
| Repositories analyzed | 50 |
| Repositories with code samples | 28 |
| Code samples captured | 51 |
| Repositories with relevant paths | 45 |

## Category coverage

| Category | Repositories |
|---|---:|
| browser automation | 13 |
| web scraping crawler | 11 |
| s3 compatible storage | 11 |
| browser extension automation | 10 |
| package release artifacts | 4 |
| workflow engine ci cd | 1 |

## License and language signals

The license field is evidence for comparison, not permission to copy. Any code reuse would require a separate compatibility review against GPL-3.0-only and the repository's complete notices.

| License signal | Repositories |
|---|---:|
| unknown | 19 |
| MIT | 14 |
| Apache-2.0 | 8 |
| AGPL-3.0 | 4 |
| NOASSERTION | 2 |
| GPL-2.0 | 1 |
| WTFPL | 1 |
| BSD-3-Clause | 1 |

| Language | Repositories |
|---|---:|
| Python | 12 |
| TypeScript | 9 |
| JavaScript | 8 |
| Go | 4 |
| unknown | 4 |
| C++ | 3 |
| Jupyter Notebook | 2 |
| Rust | 1 |
| Java | 1 |
| PHP | 1 |
| Zig | 1 |
| Dockerfile | 1 |

## Recurring implementation signals

| Signal | Repositories with evidence |
|---|---:|
| queue | 20 |
| storage | 36 |
| browser | 32 |
| workflow | 29 |
| release | 39 |
| security | 25 |

## Most visible repositories in the evidence set

| Repository | Stars | License | Categories |
|---|---:|---|---|
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | 109120 | MIT | browser automation |
| [microsoft/playwright](https://github.com/microsoft/playwright) | 94485 | Apache-2.0 | browser automation |
| [scrapy/scrapy](https://github.com/scrapy/scrapy) | 63841 | BSD-3-Clause | web scraping crawler |
| [minio/minio](https://github.com/minio/minio) | 61393 | AGPL-3.0 | s3 compatible storage |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | 40571 | Apache-2.0 | browser automation |
| [SeleniumHQ/selenium](https://github.com/SeleniumHQ/selenium) | 34368 | Apache-2.0 | browser automation |
| [apify/crawlee](https://github.com/apify/crawlee) | 25377 | Apache-2.0 | web scraping crawler |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | 23931 | MIT | browser automation |
| [segment-boneyard/nightmare](https://github.com/segment-boneyard/nightmare) | 19779 | unknown | browser automation |
| [pinchtab/pinchtab](https://github.com/pinchtab/pinchtab) | 10034 | MIT | browser automation |
| [s3tools/s3cmd](https://github.com/s3tools/s3cmd) | 4899 | GPL-2.0 | s3 compatible storage |
| [saltbo/zpan](https://github.com/saltbo/zpan) | 2049 | AGPL-3.0 | s3 compatible storage |
| [laravel/dusk](https://github.com/laravel/dusk) | 1944 | MIT | browser automation |
| [hyperbrowserai/HyperAgent](https://github.com/hyperbrowserai/HyperAgent) | 1530 | NOASSERTION | browser automation |
| [apache/groovy-geb](https://github.com/apache/groovy-geb) | 1174 | Apache-2.0 | browser automation |

## Objective-driven candidate gaps for 1.8.21

The comparison suggests five independent feature directions. They are selected because they fit observed Saddle contracts and can be implemented without importing a provider's code or binding the library to hosted infrastructure.

| Candidate | Comparable pattern | Saddle implementation boundary | Decision |
|---|---|---|---|
| Durable request leases | Crawlee and workflow engines make queue ownership, retries and persistence explicit. | Extend the existing persistent queue with caller-owned lease, visibility timeout, attempt count and idempotency key; keep storage adapters injectable. | Select for implementation |
| Structured extraction contract | Stagehand and Crawlee separate observation/extraction from action execution. | Add schema-neutral extraction results with provenance, bounded payload size and injected parser; do not add an LLM or hosted browser dependency. | Select for implementation |
| Browser context budget | Stagehand emphasizes token-efficient context and deterministic locators. | Add bounded snapshot projection with field allowlist, max bytes and stable element references, reusing existing snapshot/diff contracts. | Select for implementation |
| Workflow cancellation and compensation | Temporal separates workflow state from worker execution and makes lifecycle state explicit. | Add an explicit cancellation transition and caller-owned compensation callback to the existing resumable run contract. | Select for implementation |
| Artifact retention policy | Crawlee, release systems and storage projects separate durable results from transient worker state. | Add retention metadata and deterministic pruning decisions to artifact manifests without deleting caller data implicitly. | Select for implementation |

## Rejected or deferred patterns

Hosted stealth browsers, automatic proxy rotation, CAPTCHA solving, embedded object stores, cloud-specific dispatch APIs, native worker modules in the universal export graph and copying provider-specific code are rejected or deferred. They either violate caller-owned infrastructure, expand the security boundary, conflict with transport neutrality or require a separate legal and operational decision.

## References

[1]: https://github.com/browserbase/stagehand "Stagehand repository"
[2]: https://github.com/apify/crawlee "Crawlee repository"
[3]: https://github.com/temporalio/sdk-typescript "Temporal TypeScript SDK repository"
[4]: https://github.com/minio/minio "MinIO repository"
[5]: https://github.com/browser-use/browser-use "Browser Use repository"
[6]: https://github.com/Scrapy/scrapy "Scrapy repository"
