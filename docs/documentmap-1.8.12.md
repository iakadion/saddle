# Document map for 1.8.12

## Canonical root documents

Project policies, notices and contribution guidance remain at the repository root so package consumers and forge interfaces can discover them without entering `docs`. The canonical license is the extensionless `LICENSE` file containing the official unmodified GNU GPL v3.0 text. Human-readable project policies use one Markdown file per context: `acceptable-use-policy.md`, `authors.md`, `bug-report.md`, `cla.md`, `code-of-conduct.md`, `contributing.md`, `copyright.md`, `disclaimer.md`, `eula.md`, `export-control.md`, `governance.md`, `notice.md`, `privacy-policy.md`, `pull-request-template.md`, `security.md`, `support.md`, `terms-and-conditions.md`, `terms-of-use.md`, `third-party-notices.md` and `trademark-policy.md`.

The public scope README remains `/home/ubuntu/upload/README.md` and was not modified. The repository's own `README.md` remains a public project document and can receive release or signing-policy updates separately from the immutable scope reference.

## Removed exact duplicates

The following root `.txt` files were byte-identical copies of their Markdown counterparts and were removed: `authors.txt`, `code-of-conduct.txt`, `contributing.txt`, `copyright.txt`, `disclaimer.txt`, `notice.txt`, `privacy-policy.txt`, `security.txt`, `terms-and-conditions.txt`, `terms-of-use.txt` and `trademark-policy.txt`. The old `license.md` and `license.txt` were also removed because they duplicated a now-canonical root license context while carrying the obsolete proprietary view-only text.

The README files under `docs/plans` and `docs/talks9` were not treated as root policy duplicates. They preserve plan or conversation context and are intentionally outside the root legal-document set.

## Policy rule

A policy document may describe repository operations, hosted-service behavior, privacy, security, trademarks or community conduct, but it must not revoke rights granted by GPL-3.0-only. Third-party component licenses remain separate and are recorded through package manifests, lockfiles and release inventories.
