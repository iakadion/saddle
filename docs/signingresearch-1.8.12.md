# Binary signing research for Saddle 1.8.12

## Scope and conclusion

This investigation covered 30 search queries across official Microsoft, Apple, Android and GitHub documentation; open-source project workflows; signing-tool repositories; Stack Overflow, Security Stack Exchange, Reddit and public community discussions; and academic or standards sources on provenance and reproducible builds. The central conclusion is direct: **an open-source library can implement signing formats, but it cannot mint a certificate that Windows already trusts**. Public trust comes from a platform root program, a store, a certificate authority, a managed signing provider or an approved open-source signing program.

The free options are therefore conditional rather than magical. Microsoft Store MSIX distribution can be re-signed by Microsoft. SignPath Foundation can sign eligible open-source projects. Google Play App Signing can protect the final Android key after the project creates an upload identity. Sigstore, Cosign, SLSA and in-toto can provide strong provenance and transparency, but they do not replace Authenticode for SmartScreen. macOS and iOS still require Apple program identities for public trust.

## Research matrix

|   # | Question investigated                                       | Evidence class                                     | Decision                                                                                                                         |
| --: | ----------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
|   1 | How does Authenticode establish Windows publisher identity? | Microsoft documentation                            | It validates a certificate chain and signature; a free local key does not become a public identity.                              |
|   2 | What signals does SmartScreen use?                          | Microsoft documentation                            | Publisher reputation and file-hash reputation both matter.                                                                       |
|   3 | Does a new signed binary always avoid SmartScreen?          | Microsoft documentation                            | No. New signed files can still produce an initial warning while reputation accumulates.                                          |
|   4 | Does EV still bypass SmartScreen?                           | Microsoft documentation                            | No. Microsoft states that EV no longer provides the former instant bypass.                                                       |
|   5 | Does an unsigned binary inherit reputation?                 | Microsoft documentation                            | No. Unsigned versions begin with zero reputation for each new file.                                                              |
|   6 | Does Microsoft Store distribution avoid the warning?        | Microsoft documentation                            | Store-distributed MSIX packages are re-signed by Microsoft and are the most reliable route.                                      |
|   7 | Does the Store re-sign MSI and EXE installers?              | Microsoft documentation                            | No. MSI/EXE submissions still require a trusted Authenticode chain.                                                              |
|   8 | Is Azure Artifact Signing free?                             | Microsoft documentation                            | It is a managed service with identity validation and a recurring cost; it is not an OSS certificate generator.                   |
|   9 | Does SignPath Foundation offer OSS signing?                 | SignPath Foundation                                | Yes, for eligible projects; the service verifies repository-to-binary linkage and keeps keys in an HSM.                          |
|  10 | Does SignPath issue a certificate locally?                  | SignPath Foundation                                | No. The provider controls the signing service and approval process.                                                              |
|  11 | Can `osslsigncode` create public trust?                     | Open-source repository                             | It can implement Authenticode signing, but trust still depends on the certificate and chain supplied to it.                      |
|  12 | Can Jsign create public trust?                              | Open-source repository                             | It can sign and timestamp PE, installer and script files; it does not create a trusted publisher identity.                       |
|  13 | Can SignTool create a public certificate?                   | Microsoft tooling                                  | SignTool signs with an existing certificate and private key; it does not issue one.                                              |
|  14 | Can Sigstore Cosign replace Authenticode?                   | Sigstore documentation                             | It provides keyless signatures and transparency for software artifacts, not a Windows Trusted Root certificate.                  |
|  15 | Can Fulcio or Rekor make SmartScreen trust a PE file?       | Sigstore specifications                            | No evidence supports that substitution; use Sigstore as an integrity/provenance complement.                                      |
|  16 | What does SLSA guarantee?                                   | SLSA specification                                 | It records how an artifact was built and can support verification; it does not establish Windows publisher reputation.           |
|  17 | What does in-toto guarantee?                                | Academic and project sources                       | It protects supply-chain steps and provenance; it does not replace platform certificate trust.                                   |
|  18 | Do reproducible builds remove SmartScreen warnings?         | Standards and Microsoft behavior                   | No. They improve independent verification, not Microsoft publisher or hash reputation.                                           |
|  19 | Can timestamping make an unsigned artifact trusted?         | Authenticode tooling guidance                      | No. Timestamping preserves a valid signature after certificate expiry; it cannot create a signature.                             |
|  20 | Does signing only the installer cover embedded executables? | Installer signing guidance                         | No general assumption is safe; embedded PE files should be signed and verified independently.                                    |
|  21 | Can MSIX test certificates be used for public users?        | Microsoft MSIX guidance                            | No. Test certificates are for development or managed trust deployment.                                                           |
|  22 | Can Google Play sign Android releases?                      | Android documentation                              | Yes, Play App Signing protects the final app-signing key after an upload key is configured.                                      |
|  23 | Can Google Play sign direct APK downloads?                  | Android documentation                              | No. Direct APK distribution requires the project to sign the APK.                                                                |
|  24 | Is Android upload-key generation free?                      | Android tooling                                    | Key generation is free, but the identity and distribution account are still project responsibilities.                            |
|  25 | Can Apple Developer ID be generated by a library?           | Apple documentation                                | No. It is associated with an Apple Developer Program account and Account Holder privileges.                                      |
|  26 | Can macOS notarization be performed without Developer ID?   | Apple documentation                                | No. Notarization is a service for Developer ID-signed software.                                                                  |
|  27 | Can iOS provisioning be generated from source alone?        | Apple documentation                                | No. It is tied to an Apple team, certificates and profiles.                                                                      |
|  28 | How does OpenCode sign Windows binaries?                    | Public OpenCode workflow                           | It uses Azure Artifact Signing with provider credentials and certificate profile data.                                           |
|  29 | What does Zed demonstrate?                                  | Public Zed workflow                                | Release automation and package publishing can be open while provider and organization secrets remain private.                    |
|  30 | What do community reports say about free certificates?      | Stack Overflow, Reddit and Security Stack Exchange | SignPath is repeatedly identified as the credible OSS route; anecdotal “certificate generators” do not establish platform trust. |

## Open-source tools versus trusted identities

The following tools are useful for Saddle, but none of them is a certificate authority:

| Tool or project                | What it can do                                                                                                                                                                | What it cannot do                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `osslsigncode`                 | Authenticode sign, timestamp, verify, remove and extract signatures for PE, CAB, CAT, MSI, APPX and scripts                                                                   | Issue a Microsoft-trusted certificate                                     |
| Jsign                          | Apache-licensed, cross-platform Authenticode signing, timestamping and verification for PE, MSI, MSIX, scripts and other formats; integrates with HSM and cloud key providers | Establish the publisher identity without a certificate or remote provider |
| SignTool                       | Native Windows signing and verification                                                                                                                                       | Bypass certificate-chain or SmartScreen rules                             |
| `rcodesign` / `apple-codesign` | Open implementation of Apple signing and notarization client workflows                                                                                                        | Create an Apple Developer ID identity                                     |
| `apksigner`                    | Sign and verify Android APKs using a keystore                                                                                                                                 | Create a Google Play publisher account or replace Play App Signing        |
| Cosign / Sigstore              | Keyless signatures, transparency and artifact verification                                                                                                                    | Make SmartScreen treat a PE file as Authenticode-signed                   |
| SLSA / in-toto                 | Build provenance, attestations and supply-chain integrity                                                                                                                     | Become a platform trust root                                              |
| Reproducible-build tooling     | Let independent parties rebuild and compare bytes                                                                                                                             | Remove first-download reputation warnings                                 |

## Cost and trust classification

| Route                        | Direct cost                                                                    | Identity requirement                   | SmartScreen/Gatekeeper result                                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------- |
| Self-signed test certificate | Free                                                                           | None beyond local key control          | Test or managed-enterprise trust only; public warnings remain |
| No signature                 | Free                                                                           | None                                   | Strong warning and possible enterprise/SAC block              |
| Microsoft Store MSIX         | Store and publisher onboarding costs may apply                                 | Store account and certification        | Microsoft re-signs the delivered MSIX                         |
| SignPath Foundation          | Free for eligible OSS projects                                                 | Project review and provider acceptance | Provider signs the approved artifact                          |
| Azure Artifact Signing       | Paid managed service; current Microsoft guidance lists approximately $10/month | Identity validation and cloud account  | Valid signing; reputation still builds over time              |
| Traditional OV certificate   | Paid annual certificate                                                        | CA identity validation                 | Valid signing; new publisher/file reputation can still warn   |
| EV certificate               | Paid and operationally heavier                                                 | Stronger CA validation                 | No longer a SmartScreen bypass by itself                      |
| Apple Developer ID           | Paid Apple membership                                                          | Apple Developer Program team           | Developer ID signing plus notarization required               |
| Google Play App Signing      | Play developer account and project onboarding                                  | Upload key and Play identity           | Google signs store-delivered APKs                             |
| Sigstore                     | Often free for public CI identities                                            | OIDC identity and policy               | Verifiable provenance, not Authenticode trust                 |

## Safe techniques that actually help

The useful “tricks” are process improvements, not bypasses. Saddle should sign every nested PE file before signing the installer, use SHA-256 with a trusted timestamp service, preserve the exact bytes after signing, keep a stable publisher identity, publish checksums and SBOMs, attach GitHub artifact attestations, use protected release environments, restrict OIDC to tag-based jobs, and retain verification logs. A stable identity lets reputation accumulate; changing certificates or rebuilding different bytes for the same version works against that goal.

The most reliable Windows user experience is Microsoft Store MSIX. The most realistic direct-download route for Saddle is to apply to SignPath Foundation or use Azure Artifact Signing. Until one of those approvals exists, the workflow should publish `unsigned` or `test` status and never claim that Windows will accept the binary without a warning. A generated local certificate may be useful for CI validation, but it must not be used as a public trust claim.

The Sigstore Cosign quickstart confirms that keyless signing obtains a short-lived certificate from Fulcio after OIDC authentication, records the event in Rekor and verifies the bundle against the signing identity. This is valuable for a Saddle release manifest and supply-chain audit, but the Sigstore certificate is not an Authenticode certificate in the Microsoft Trusted Root Program. It should be attached as an integrity and provenance proof, not described as a SmartScreen bypass [7].

The SLSA build-provenance specification describes the builder, external parameters, resolved dependencies and output subjects of a build. That lets an independent verifier establish where, when and how an artifact was produced, but it does not assert that Windows trusts the publisher or that SmartScreen will suppress a warning. Saddle should use SLSA-compatible provenance alongside, not instead of, platform signing [8].

VSCodium is a particularly relevant open-source comparison. Its public distribution page says that the project builds and publishes its own Windows, macOS and Linux binaries, uses package-manager routes in addition to GitHub releases, and explicitly credits SignPath.io for free Windows code signing with a SignPath Foundation certificate. It also credits a separate macOS certificate contributor, showing that open-source projects commonly combine a community signing program for Windows with an independently held Apple identity rather than generating a universal certificate [23].

The SignPath GitHub integration confirms the “hidden” mechanism that can look like a certificate generator from the outside: the workflow uploads the unsigned artifact, submits it with `SIGNPATH_API_TOKEN`, organization/project/policy identifiers and the GitHub artifact ID, then downloads the provider-signed output. SignPath checks that the build was performed by the expected GitHub workflow and that origin metadata came from GitHub rather than the build script. This is a legitimate managed-signing route, not a reusable certificate embedded in an open-source repository [24]. VSCodium's workflow directory also shows separate build and publish jobs for Linux, macOS and Windows, which supports the conclusion that the project uses explicit platform lanes rather than one cross-platform certificate [25].

The additional provider search found OSSign, which advertises free code signing for qualifying open-source projects and requires an active project, a public automated build and public source review. Its page also states that applications were temporarily suspended because of a backlog. This is a promising second provider to evaluate, but it is still a managed service with eligibility and queue constraints, not a local certificate generator [26]. Let's Encrypt explicitly says that it issues free TLS certificates but does not issue certificates for code signing; using an ACME certificate for Authenticode would be a category error [27].

Two additional IDE comparisons clarify the boundary. Lite XL documents newer Windows releases as self-signed and asks users to perform a first-run trust step; this is honest development or community distribution, but it does not remove public SmartScreen warnings. KeePassXC, in contrast, publicly raised funds to purchase a four-year Authenticode certificate for its Windows and macOS installers. The pair demonstrates that open-source projects either disclose a self-signed route or acquire/provider a real identity; neither approach generates a universally trusted certificate from source code [28] [29].

Certum provides a less obvious but legitimate route: its Open Source Code Signing product is a paid certificate marketed to open-source developers, with the page displaying a current price and requiring a Certum cryptographic card and reader for activation. This is a conventional CA product with an open-source qualification, not a free generated key. Codegic is the opposite case: its own page says its free certificate is not from a publicly trusted CA and only removes the unknown-publisher warning after a root is manually trusted. It is suitable only for controlled environments and must not be presented as a public SmartScreen solution [30] [31].

### Passive release-manifest reverse engineering

The public release APIs were inspected without executing or installing any downloaded binary. VSCodium exposes separate Windows setup assets for `x64` and `arm64`, user and machine setup variants, each accompanied by hash files. Lite XL exposes Windows `i686` and `x86_64` archives/installers, macOS architecture-specific DMGs and Linux portable/AppImage outputs, while its documentation is explicit about self-signed Windows releases. KeePassXC publishes Windows MSI/ZIP, macOS DMG and Linux AppImage assets together with detached `.sig` and `.DIGEST` files. VimR's latest public release endpoint exposes a source archive rather than a universal signed app asset. These observations support a Saddle design with explicit per-platform lanes, architecture labels, detached integrity proofs and a separate platform-signing status rather than one generic “signed” flag [32] [33] [34] [35].

The KeePassXC release checklist adds a useful workflow pattern: it builds Windows `amd64` and `arm64` separately with an explicit signing identity, builds macOS `x86_64` and `arm64` with `--sign --notarize`, checks the installed binaries, signs release files with GPG and uploads signatures/digests alongside the assets. Its checklist also includes a Microsoft Store update, showing that direct-download signing and Store distribution are separate release surfaces [36]. VimR documents the same distinction in a simpler form: a normal release is signed and notarized, while `notarize=false` intentionally produces an ad-hoc signature for local development. The project therefore demonstrates a safe status model rather than a hidden universal key [37].

A passive byte inspection of a current KeePassXC MSI pair confirms that the `.DIGEST` asset is a textual SHA-256-style digest line, while the `.sig` asset begins with an ASCII-armored `PGP SIGNATURE` block. This is a reproducible pattern Saddle can adopt for detached integrity evidence, but it remains distinct from the embedded Windows Authenticode signature that controls publisher identity and SmartScreen behavior [34] [36].

SignServer Community is a genuine open-source signing engine and can centralize signing keys, policies and audit trails. Its own repository states that the Community edition is intended for learning, testing and prototyping rather than production, while production deployments require the commercial edition or an equivalent operational model. SignServer therefore provides a possible self-hosted engine for Saddle's internal signing architecture, but it does not grant a Microsoft-trusted root or a free public certificate; the operator still needs a valid CA/provider identity and secure key custody [38] [39].

The Eclipse Common Build Infrastructure documents a two-layer model that is useful for Saddle: projects sign all produced artifacts with a project-specific GPG web-of-trust key, and use platform code-signing certificates when deployment platforms can enforce them. Eclipse explicitly treats GPG as artifact integrity and platform signing as the mechanism that prevents platform warnings. The IntelliJ Platform comparison is different: it is an open-source foundation for building IDEs, but its source availability does not imply that every downstream IDE has the JetBrains publisher identity. In both cases, open source describes the code or build infrastructure, not a transferable signing identity [40] [41].

## Route classification for Saddle

| Classification               | Route                                                                                                                              | 1.8.12 decision                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Verified public route        | Microsoft Store MSIX/AppX                                                                                                          | Add as an optional distribution lane; Microsoft signs the Store-delivered package.                                                    |
| Verified conditional route   | SignPath Foundation                                                                                                                | Apply with the public repository and reproducible GitHub workflow; integrate only after acceptance and policy identifiers are issued. |
| Verified conditional route   | OSSign                                                                                                                             | Keep as a second application target; the current page reports a queue suspension, so it cannot be an immediate dependency.            |
| Verified paid route          | Azure Artifact Signing or Certum Open Source                                                                                       | Use only after account validation, billing/renewal acceptance and protected secret setup.                                             |
| Verified integrity route     | Cosign, GPG, detached digest, SLSA and in-toto                                                                                     | Add as release evidence; do not label it Authenticode or SmartScreen trust.                                                           |
| Controlled-environment route | Codegic, self-signed certificate or SignServer CE                                                                                  | Allow only in explicit `test` or `enterprise-root` mode; never claim public Windows trust.                                            |
| Unsupported route            | Let's Encrypt or an ordinary TLS ACME certificate                                                                                  | Reject because the issuer explicitly does not issue code-signing certificates.                                                        |
| Unsafe route                 | Scraped certificate, copied publisher metadata, reused third-party signature, reputation farming or “certificate generator” bypass | Reject outright; these create impersonation, malware and revocation risks.                                                            |

Academic measurements show why “a valid signature” is not the same as “safe software.” The USENIX study _The Broken Shield_ reports difficulties discovering abusive certificates, delays in revocation and failures in disseminating revocation information, which can leave clients trusting revoked certificates [21]. The arXiv study _Issued for Abuse_ documents underground trading of Authenticode certificates and connects that demand to attempts to bypass platform protections such as SmartScreen [22]. For Saddle, this means that a provider's identity review, HSM custody, protected release environment, provenance and revocation plan are security requirements, not optional decoration.

## 1.8.12 implementation plan

The next release should add an optional MSIX/AppX packaging lane, a SignPath or Azure provider adapter behind protected secrets, nested-PE signature verification, a signed-provenance bundle using Sigstore/SLSA-compatible metadata, and explicit release fields for `unsigned`, `caller-owned`, `provider-signed`, `store-signed` and `notarized`. The release must remain `1.8.12` only after the package manifests and release tag are intentionally bumped; the published `v1.8.11` tag must not be overwritten.

## References

[1]: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation "SmartScreen reputation for Windows app developers"
[2]: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options "Code signing options for Windows app developers"
[3]: https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart "Azure Artifact Signing quickstart"
[4]: https://signpath.org/ "SignPath Foundation"
[5]: https://github.com/mtrojnar/osslsigncode "osslsigncode"
[6]: https://github.com/ebourg/jsign "Jsign"
[7]: https://docs.sigstore.dev/quickstart/quickstart-cosign/ "Sigstore Cosign quickstart"
[8]: https://slsa.dev/spec/v1.2/build-provenance "SLSA build provenance"
[9]: https://in-toto.io/ "in-toto supply-chain integrity framework"
[10]: https://developer.apple.com/developer-id/ "Apple Developer ID"
[11]: https://developer.apple.com/programs/enroll/ "Apple Developer Program enrollment"
[12]: https://developer.android.com/studio/publish/app-signing "Android app signing and Play App Signing"
[13]: https://developer.android.com/tools/apksigner "Android apksigner"
[14]: https://raw.githubusercontent.com/anomalyco/opencode/dev/.github/workflows/publish.yml "OpenCode publish workflow"
[15]: https://raw.githubusercontent.com/zed-industries/zed/main/.github/workflows/after_release.yml "Zed post-release workflow"
[16]: https://docs.github.com/en/actions/concepts/security/openid-connect "GitHub Actions OpenID Connect"
[17]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets "Using secrets in GitHub Actions"
[18]: https://www.usenix.org/conference/usenixsecurity19/presentation/torres-arias "in-toto: Providing farm-to-table guarantees for bits and bytes"
[19]: https://stackoverflow.com/questions/78848067/can-i-post-a-non-signed-msix-app-on-the-microsoft-store "Stack Overflow: unsigned MSIX and Microsoft Store"
[20]: https://security.stackexchange.com/questions/139347/smart-screen-filter-still-complains-despite-i-signed-the-executable-why "Security Stack Exchange: SmartScreen after signing"
[21]: https://www.usenix.org/conference/usenixsecurity18/presentation/kim "The Broken Shield: Measuring Revocation Effectiveness in the Windows Code-Signing PKI"
[22]: https://arxiv.org/abs/1803.02931 "Issued for Abuse: Measuring the Underground Trade in Code Signing Certificate"
[23]: https://vscodium.com/ "VSCodium open-source binary distribution"
[24]: https://docs.signpath.io/trusted-build-systems/github "SignPath GitHub trusted build system"
[25]: https://github.com/VSCodium/vscodium/tree/master/.github/workflows "VSCodium public workflows"
[26]: https://ossign.org/ "OSSign code signing for open source"
[27]: https://letsencrypt.org/docs/faq/ "Let's Encrypt FAQ"
[28]: https://github.com/lite-xl/lite-xl "Lite XL source repository and release notes"
[29]: https://keepassxc.org/blog/2017-03-04-authenticode-cert/ "KeePassXC funding an Authenticode certificate"
[30]: https://certum.store/open-source-code-signing-code.html "Certum Open Source Code Signing certificate"
[31]: https://www.codegic.com/code-signing-certificate/ "Codegic code signing certificate limits"
[32]: https://github.com/VSCodium/vscodium/releases "VSCodium releases and architecture-specific assets"
[33]: https://github.com/lite-xl/lite-xl/releases "Lite XL releases and package matrix"
[34]: https://github.com/keepassxreboot/keepassxc/releases "KeePassXC releases with detached signatures and digests"
[35]: https://github.com/qvacua/vimr/releases "VimR releases"
[36]: https://github.com/keepassxreboot/keepassxc/wiki/Release-Checklist/ea3d900eedd4f765cf51763fc157ccee6b0118ab "KeePassXC release checklist"
[37]: https://github.com/qvacua/vimr "VimR signed, notarized and ad-hoc build modes"
[38]: https://www.signserver.org/ "SignServer Community open-source signing software"
[39]: https://github.com/Keyfactor/signserver-ce "SignServer Community repository and production limits"
[40]: https://eclipse.dev/cbi/best-practices/software-supply-chain/osssc-best-practices/ "Eclipse Open Source Software Supply Chain best practices"
[41]: https://www.jetbrains.com/opensource/intellij-platform/ "IntelliJ Platform open-source foundation"
