# Branch audit

This record preserves the branch tips and comparison results collected before the branch cleanup. Deleting a branch reference does not delete the commit objects or the tags that retain them; the hashes below remain available for audit and recovery while repository retention permits.

| Branch | Tip commit | Ahead of `main` | Behind `main` | Unique change | Action |
| --- | --- | ---: | ---: | --- | --- |
| `main` | `04acff11e7f3c0bc830fdaaf1fc7bad9bdf1fcfa` | 0 | 0 | Current release line | Keep |
| `dependabot/npm_and_yarn/lucide-react-1.31.0` | `45498007cc539d2c3df3d801cfb23dfdf575d859` | 1 | 11 | `package.json`, `package-lock.json` | Close PR #9 and delete branch |
| `dependabot/npm_and_yarn/multi-b251156d90` | `cff1abfbcfe6fffae1a5517082c76b9f3e6195ea` | 1 | 11 | `package.json`, `package-lock.json` | Close PR #7 and delete branch |
| `dependabot/npm_and_yarn/npm_and_yarn-2772e86c4e` | `4cb2a45cc8dd1bc53b05b5ffe8eeb07c1c46bc1c` | 1 | 13 | Root package files plus obsolete `scrape/` package files | Close PR #4 and delete branch |
| `dependabot/npm_and_yarn/react-resizable-panels-4.12.2` | `8dfa1d1999c6cf0b80d39f54c1194499c2943739` | 1 | 11 | `package.json`, `package-lock.json` | Close PR #5 and delete branch |
| `dependabot/npm_and_yarn/streamdown-2.5.0` | `ac04d2d01c2caa3c0bb9a8b7e8b952fd0af4b2d6` | 1 | 11 | `package.json`, `package-lock.json` | Close PR #6 and delete branch |
| `dependabot/npm_and_yarn/typescript-7.0.2` | `7d5d3f7b70d28ed2663a6d9b2d4f8a3280571525` | 1 | 11 | `package.json`, `package-lock.json` | Close PR #8 and delete branch |

All six non-main branches are single-commit Dependabot updates based on an older main tip. None is a second production line, and none should be merged blindly after the root web migration. The current `main` line keeps the release work; the branch tips above remain referenced by this audit until the remote branch refs are removed.

The cleanup was completed by creating the six `archive-dependabot-*` tags, closing PRs #4 through #9, and deleting the six non-main branch refs. The repository is now intentionally reduced to `main`; the archive tags preserve the exact tips listed above.

## Checks interpretation

The check count changed because the workflow set changed during the root migration. Duplicate and obsolete workflow definitions were removed, while the canonical engine CI, Uka-tests, cross-runtime compatibility and Pages workflows were retained. The final `main` workflow set passed the current checks; a lower count therefore reflects fewer active check definitions, not a loss of commits or a failed release line.
