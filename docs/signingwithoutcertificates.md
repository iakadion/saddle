# Signing Saddle without owning platform certificates

Saddle cannot generate a certificate that Windows, Apple or an app store already trusts. A local self-signed certificate proves only that a test key signed the file; it does not establish publisher identity for public users. The reliable choices are a platform store, a managed signing provider, an open-source signing program or a certificate purchased and held by the project owner.

## Decision matrix

| Surface                | Route without an owned production certificate                                                                                                | What the project still needs                                                                                          | Result in the workflow                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Windows                | Submit an MSIX package to Microsoft Store, where Microsoft re-signs the package; apply to SignPath Foundation; or use Azure Artifact Signing | Store/SignPath/Azure acceptance and a release identity                                                                | Trusted only when the external provider or store has signed the artifact |
| Windows direct EXE/MSI | SignPath Foundation or Azure Artifact Signing; traditional OV certificate is the paid fallback                                               | Provider account, repository binding and timestamp configuration                                                      | `caller-owned` signing status; unsigned output remains a test artifact   |
| macOS                  | Mac App Store distribution or Apple Developer ID plus notarization                                                                           | Apple Developer Program membership, Account Holder access, certificate, hardened runtime and notarization credentials | `notarized` only after Apple accepts and staples the ticket              |
| Android Play           | Google Play App Signing                                                                                                                      | Play Console account and a secret upload key; Google protects the final app-signing key                               | Google signs store APKs; direct APKs still require Saddle signing        |
| Android direct APK     | Generate and protect a project keystore with `keytool`                                                                                       | Secret keystore, alias and separate passwords                                                                         | `caller-key` only after `apksigner verify` passes                        |
| iOS App Store          | Apple signing and provisioning through the Apple Developer Program and App Store Connect                                                     | Apple team, distribution certificate, provisioning profile and export credentials                                     | IPA/app is distributable only after Apple signing succeeds               |
| Browser extension      | No platform certificate is required for a local ZIP; store publishing uses the store account                                                 | Store publisher account and review                                                                                    | Package is identified by its manifest and release checksums              |

Microsoft explicitly distinguishes free Microsoft Store MSIX re-signing from MSI/EXE submission, which still requires an Authenticode chain trusted by Microsoft. The same guidance lists self-signed and unsigned artifacts as development or testing options, not public-trust solutions [1]. SignPath Foundation is a legitimate open-source program that can provide a certificate for eligible projects and keeps the private key in an HSM; it is an application and approval process, not a package that manufactures trust locally [2].

Apple requires a Developer ID certificate for Gatekeeper confidence outside the Mac App Store and recommends notarization after signing. The Developer ID certificate is created from an Apple Developer account by the Account Holder [3]. Android requires installable APKs to be signed; Play App Signing lets Google protect the final app-signing key while the project retains an upload key [4].

## Recommended path for Saddle

The first practical route is to apply to the [SignPath Foundation](https://signpath.org/apply) for Windows signing and simultaneously keep the current unsigned mode for artifacts produced before approval. If Microsoft Store distribution is acceptable, add an MSIX/AppX packaging target and submit that package instead of promising SmartScreen trust for the existing EXE/MSI files. OpenCode demonstrates the managed-provider route publicly: its release workflow uses Azure Artifact Signing with an endpoint, account name and certificate profile [5].

For macOS and iOS, the project needs an Apple Developer Program team. No open-source framework can produce a universally trusted Developer ID certificate or Apple provisioning profile from source code. Android can use Google Play App Signing for Play distribution, but direct APK files still require a project-controlled upload/release key.

## GitHub configuration steps

The repository owner should acquire or be accepted by the appropriate provider first. The private files and passwords must never be pasted into chat, committed to the repository or printed by a workflow. In GitHub, open **Saddle → Settings → Secrets and variables → Actions → New repository secret** and add the values as repository or protected-environment secrets [6].

The current workflow contracts are:

| Provider               | Secrets                                                                                                                                             | Variables                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Windows Authenticode   | `WINDOWS_CERTIFICATE_BASE64`, `WINDOWS_CERTIFICATE_PASSWORD`                                                                                        | `WINDOWS_TIMESTAMP_URL`                       |
| Azure/SignPath adapter | Provider-specific endpoint, account/profile and OIDC or token values after approval                                                                 | Provider-specific non-secret identifiers      |
| macOS desktop          | `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `KEYCHAIN_PASSWORD`, `APPLE_ID`, `APPLE_APP_PASSWORD`, `APPLE_TEAM_ID` | None required by the current desktop contract |
| Android                | `ANDROID_KEY_BASE64`, `ANDROID_KEY_ALIAS`, `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_PASSWORD`                                                         | None required                                 |
| iOS                    | `IOS_CERTIFICATE_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `KEYCHAIN_PASSWORD`                                        | `IOS_PROVISIONING_PROFILE_NAME`               |

The workflow must run signing only for a trusted release event. Fork and Dependabot workflows do not receive normal repository secrets, so those jobs should build, scan and report unsigned/test status rather than attempting production signing [6]. The release manifest must state `unsigned`, `ci-test-key`, `caller-owned` or `notarized`; it must never equate a successful build with platform trust.

## What not to do

The project must not download a “universal certificate,” use a private key from another project, reuse a certificate from OpenCode or Zed, place a self-signed certificate in the public repository, or claim that SmartScreen, Gatekeeper or Play will trust an unsigned file. Those approaches either fail for users or create an impersonation and supply-chain risk.

## References

[1]: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options "Microsoft code signing options for Windows app developers"
[2]: https://signpath.org/ "SignPath Foundation"
[3]: https://developer.apple.com/developer-id/ "Apple Developer ID signing and notarization"
[4]: https://developer.android.com/studio/publish/app-signing "Android app signing and Play App Signing"
[5]: https://raw.githubusercontent.com/anomalyco/opencode/dev/.github/workflows/publish.yml "OpenCode publish workflow"
[6]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets "Using secrets in GitHub Actions"
