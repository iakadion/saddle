# Saddle 1.8.4

Saddle 1.8.4 updates every active library and forge pipeline to Node.js 26.7.0 and adds deterministic package gates to GitLab, Forgejo, Gitea and Woodpecker workflows. GitHub Actions remains the authoritative multi-registry release path; the other forge files are caller-configured validation and artifact paths because their runners, secrets and package registries differ.

The legacy public Maven package `io.devthink.saddle` was identified under the `wenathlan` organization. Its deletion request was attempted through the GitHub Packages API, but the authenticated GitHub App integration returned HTTP 403 because it lacks package-management deletion permission. The new owner-aligned Maven coordinate is `io.wenathlan:saddle` and must not be removed.

The companion Saddle Pages repository now contains a GitHub Pages workflow using `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` and `actions/deploy-pages@v4`, plus caller-configured GitLab Pages, Forgejo, Codeberg Pages, Gitea and Woodpecker pipelines. The site builds only `dist/public` with `VITE_BASE_PATH=/saddle-pages/` and uses Node.js 26.7.0.
