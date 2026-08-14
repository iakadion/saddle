# Saddle 1.8.16 comparative synthesis

## Scope and evidence boundary

This synthesis evaluates the 100 primary repository sources recorded in [repo-research-1.8.16.md](./repo-research-1.8.16.md). It does not copy source code, vendor dependencies, credentials, workflow configuration, service setup, operating assumptions, or claims of the reviewed projects. A candidate that lacked successful primary extraction is retained only as a pending source and is not used as implementation evidence.

The current baseline is Saddle 1.8.15. It already has deterministic storage pools and budgets, working-set planning, archive inspection, transform cache eligibility, provider-chain selection and cancellation plans, declarative delivery/PWA/surface requirements, release asset generation and local checksum verification. The selected 1.8.16 additions must remain additive, TypeScript-first, root-first, dependency-free, serializable and adapter-owned for all privileged or remote effects.

## Evidence-to-gap matrix

| Research theme | Repeated external pattern | Existing Saddle surface | Gap | Safe decision |
|---|---|---|---|---|
| Supply-chain provenance | Artifact digest, signer identity, issuer, evidence kind, explicit verification outcome | `release/assets.ts` produces metadata; `release/verify.ts` verifies checksum and declared signing state | Verification has no normalized evidence policy result or explicit unknown/not-provided state | **Adopt** data-only evidence evaluation receipt |
| SBOM and vulnerability assessment | SBOM subject, scanner provenance, policy checks, findings limitations, non-definitive heuristics | Asset metadata may include SBOM files; security gates run in CI | No portable envelope that preserves external scanner evidence without claiming secure/compliant | **Adopt** evidence envelope and policy evaluator |
| Release engineering | Distinct version, manifest, artifact plan, publish and verify stages | Tag-derived workflows and release verification exist | No serializable readiness receipt binding these claims before execution | **Adopt** release readiness receipt |
| Runner/forge portability | Workflow dialect, OS, architecture, image lifecycle, operator-controlled execution | Provider chain reports capacities and renders dispatch through injected adapters | No normalized environment evidence with freshness/source boundary | **Adopt later**; defer until runner reports need it |
| Storage/VFS | Content identity, range/replica/tier capability, mounting/daemon prerequisites | Storage pool, chunked storage and provider capability planning exist | Remote-operation evidence must remain separate from storage semantics | **Reject now**; current pool contracts cover the portable core |
| MCP/tool protocols | Schema identity, allow-list, read-only posture, consent and adapter boundary | MCP/browser/transport contracts exist | A generic tool-policy receipt is useful, but exposing one without a consumer would be premature | **Defer** |
| Agents/workflows | State transitions, approval and trace identity; runtime/telemetry ownership | Resumable workflow, cancellation/compensation and metrics exist | Full traces imply data retention and telemetry policy | **Defer**; preserve privacy boundaries |
| Browser/crawler | Session isolation, robots, structured extraction, bounded contexts | Browser snapshots, semantic/schema extraction and crawler policy exist | Common missing patterns center on stealth/evasion or service runtime | **Reject** incompatible patterns |
| Sandboxing/WASM | Explicit resources, filesystem/network policy and host-owned execution | Transform plans, archive inspection and injected isolation adapter exist | Runtime execution would require privileged host policy | **Reject now**; retain adapter-only design |
| Extension/PWA/Mini App | Manifest and lifecycle requirements distinct from host/platform behavior | Surface requirements and PWA plans exist | Lifecycle invocation requires platform integration | **Defer** |

## Selection method

Candidates were scored qualitatively against five mandatory criteria: evidence appears in more than one source; the addition fills a real public-contract gap; it can run without network, credentials, a daemon or privileged host action; it is testable through deterministic fixtures; and it preserves explicit uncertainty instead of manufacturing confidence.

| Candidate | Multi-source evidence | Gap clarity | Offline and deterministic | Risk | Decision |
|---|---:|---:|---:|---:|---|
| Evidence evaluation receipt | High | High | High | Low | **Selected** |
| Release readiness receipt | High | High | High | Low | **Selected** |
| Runner environment receipt | High | Medium | High | Low | Deferred after a consuming adapter is needed |
| Tool capability receipt | High | Medium | High | Medium | Deferred pending an explicit MCP use case |
| Execution trace receipt | High | Medium | Medium | Medium | Deferred due to retention/privacy policy |
| Storage identity receipt | High | Low | High | Medium | Rejected as overlapping existing storage contracts |
| Runtime sandbox controller | High | High | Low | High | Rejected: privileged execution is out of core scope |

## First implementation block: release evidence evaluation

The first 1.8.16 block will add a pure `release/evidence.ts` contract, exported through the package map, with no external dependencies and no network or filesystem side effects. It will:

1. Normalize a caller-supplied evidence record for an artifact subject digest, producer identity, evidence kind, verification method and timestamp.
2. Distinguish `notProvided`, `declared`, `parsed`, `checked`, `verified`, `rejected` and `unknown` states.
3. Require a subject digest before evidence can be `checked` or `verified`.
4. Allow a caller-defined policy with required evidence kinds, expected producer identity, expected workflow identity and allowed verification states.
5. Return a serializable decision of `accepted`, `rejected` or `insufficient`, with reason codes rather than claims such as “secure,” “trusted,” “signed,” “compliant,” or “vulnerability-free.”
6. Produce a release readiness receipt that binds source tag, observed manifest versions, required gates, artifact-plan digest, target list, signing state and missing evidence without creating tags, changing manifests, invoking workflows, publishing, signing or checking a registry.

## Explicit non-goals

The block must not download assets, parse arbitrary SBOM formats, query CVE feeds, call Sigstore, access a KMS, use OAuth/PATs, invoke CI, generate an SBOM, scan files, sign artifacts, publish releases, start a server, or use external services. Existing `verifyassets` remains the file-integrity verifier; the new contract evaluates evidence supplied by a caller or another verified adapter.

## Tests and release gates

The implementation must add active tests for normalization, state transitions, subject-digest validation, producer/workflow mismatch, missing required evidence, allowed-versus-rejected policy decisions, stable reason ordering and release readiness with incomplete data. It must run the active and legacy suites, engine build, web checks/build, formatting, `npm pack --dry-run`, high-severity audit and the flat-native validator before a commit. No version bump occurs until selected 1.8.16 blocks have passed the full release phase.
