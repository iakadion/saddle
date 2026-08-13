# License audit for 1.8.12

## Current repository state

The repository contains three project license copies: `LICENSE`, `license.md` and `license.txt`. All three describe a custom Proprietary Source-Available License, View Only. They explicitly state that the software is not open source and prohibit copying, execution, modification, distribution and internal business use without written permission. `license.md` and `license.txt` contain minor author and link differences from `LICENSE`.

The package manifests do not match those documents. `package.json` declares `GPL-3.0-only`, `pom.xml` declares GNU GPL v3.0, `saddle.csproj` declares `GPL-3.0-only`, and `saddle.gemspec` declares `GPL-3.0`. This is a material licensing contradiction that must be resolved before a new release is tagged.

## Verified policy distinction

The Open Source Initiative requires an open source license to allow free redistribution, source distribution, derived works, and use in any field of endeavor, including business use [1]. The GNU GPL v3 grants permission to run and modify covered works and allows private works that are not conveyed without additional conditions; distribution activates the license obligations [2].

Therefore, “open source but only for our private use” is not one coherent license policy. A private or internal deployment is compatible with GPL use, but a license that prohibits other people from using, copying, modifying or distributing the software is source-available/proprietary, not OSI open source. The repository must choose one policy and express it consistently across the three license files, manifests, package metadata, README references and provider applications.

SignPath Foundation requires an OSI-approved open source license without commercial dual licensing for all components. It also requires active maintenance, an existing release, documented functionality, a public code-signing policy, verifiable builds and manual approval for every signed release [3]. The current view-only license would therefore be incompatible with the free SignPath Foundation route until the repository adopts and consistently declares an OSI-approved license.

## References

[1]: https://opensource.org/osd "Open Source Initiative: The Open Source Definition"
[2]: https://www.gnu.org/licenses/gpl-3.0.html "Free Software Foundation: GNU General Public License version 3"
[3]: https://signpath.org/terms.html "SignPath Foundation: Conditions for Open Source projects"
