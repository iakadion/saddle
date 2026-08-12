# Cross-forge pipelines

The library keeps GitHub Actions as the release-authoritative workflow because its six registry publishers already share the release-tag action and validation action. Forgejo, Gitea, GitLab and Woodpecker now execute the same deterministic gates with Node.js 26.7.0, but they do not assume a shared package registry, release API or secret name.

| Forge | File | Current role | Required caller configuration |
| --- | --- | --- | --- |
| GitLab | `.gitlab-ci.yml` | verify and package dry-run | runner, optional package registry credentials and artifact retention |
| Forgejo | `.forgejo/workflows/saddle.yml` | verify and package dry-run | trusted Forgejo runner and action source policy |
| Gitea | `.gitea/workflows/saddle.yml` | verify and package dry-run | Gitea Runner and instance action policy |
| Codeberg | Forgejo workflow files | verify plus optional Codeberg Pages action | Codeberg repository, `forge.token` and default-branch policy |
| Woodpecker | `.woodpecker/deploy.yml` | verify and package dry-run | trusted agent, image pull policy and optional artifact plugin |

These files intentionally do not invent a cross-forge release token or hardcode a host. A caller can add a publish step for the target forge after configuring its own secret and package endpoint. The public site has its own platform workflow set in the `saddle-pages` repository.
