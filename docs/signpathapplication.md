# SignPath Foundation application

The public application page is `https://signpath.org/apply`.

The visible first section requests the project name, repository URL, homepage URL, download URL and privacy policy URL. SignPath states that the homepage should be a project website or repository page, while the download page must mention that the project uses SignPath Foundation for code signing. The application must be completed with public project information first; personal email and final submission remain caller-owned.

The recommended Saddle integration is GitHub Actions because the repository has public release workflows and a reproducible build path. A generic CI/CD label is broader, while GitHub Actions identifies the trusted build system that SignPath can verify.

The selected project license is GPL-3.0-only, an OSI-approved open-source license. The repository now keeps one canonical root `LICENSE` file with the official GPL v3.0 text and declares `GPL-3.0-only` in its package manifests. The public download page documents the requested SignPath Foundation code-signing policy while clearly marking approval as pending.

The form is rendered by an embedded HubSpot flow. The page visually shows the public fields, but the browser automation layer does not expose those inputs as indexable controls, so direct coordinate entry is not reliable. The safe continuation is a user browser takeover on the already-open page. The agent must not enter the user's email or submit the application without an explicit final confirmation.
