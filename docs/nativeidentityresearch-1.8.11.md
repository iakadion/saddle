# Saddle native identity research

## OpenCode comparison

The public OpenCode repository documents a desktop distribution alongside its CLI and package-manager routes. Its documented desktop matrix includes macOS Apple Silicon and Intel DMG installers, a Windows x64 executable, and Linux DEB, RPM and AppImage outputs. The comparison supports explicit platform and architecture naming in Saddle release assets, but it does not justify copying OpenCode branding, icons or implementation.

Source: [OpenCode repository and README](https://github.com/anomalyco/opencode)

## ZCode comparison

The public ZCode installation guide presents separate downloads for macOS Apple Silicon, macOS Intel, Windows x64, Windows ARM64 and Linux x64. Its Linux guidance uses an AppImage, while macOS uses a DMG to install an `.app` bundle and Windows uses an installer. This supports adding architecture-aware artifact labels and an explicit `.app` packaging path where the Apple runner supports it.

Source: [ZCode official installation guide](https://zcode.z.ai/en/docs/install)

## Saddle decisions

Saddle keeps one shared TypeScript library-first engine and uses flat, surface-owned build roots. The release matrix should distinguish architecture from package format, for example `saddle.browser.1.8.11.windows.x64.exe` and `saddle.browser.1.8.11.windows.arm64.exe`, instead of hiding architecture in a generic filename. The workflow must publish only artifacts actually built by the runner and must not claim a valid signature when signing credentials are absent.

Windows Authenticode, macOS Developer ID signing and notarization, Android release signing, and Apple provisioning remain caller-owned secret contracts. Public workflows can validate certificate presence, signer identity, timestamping and notarization status without embedding keys or manufacturing trust signals.

## Official signing constraints

Microsoft documents that Smart App Control accepts RSA-based code-signing certificates and does not currently support ECC signatures for this check. Trusted Signing is the preferred Microsoft route, while `signtool.exe` remains the command-line path for certificate-backed signing. An unsigned or locally signed binary cannot honestly be presented as trusted by the Saddle workflow.

Apple documents that macOS software distributed with Developer ID must be notarized, and that notarization scans for malicious components and code-signing issues. A production workflow therefore needs Developer ID signing, hardened runtime, a secure timestamp, notarization through `notarytool` or an equivalent service, and ticket stapling before the artifact is labeled notarized.

Sources: [Microsoft Smart App Control code signing](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control) and [Apple notarizing macOS software](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution).

## Windows without a private certificate

Microsoft's current comparison states that an MSIX package submitted through the Microsoft Store is re-signed by Microsoft at no certificate cost to the publisher. The same free treatment does not apply to an MSI or EXE submitted through the Store: those installers must already chain to a certificate trusted by Microsoft's root program. For direct distribution, Microsoft lists Azure Artifact Signing, traditional OV certificates, self-signed certificates and unsigned binaries as different trust levels; self-signed and unsigned outputs are for development or testing, not public trust. The page also identifies the SignPath Foundation as an open-source route worth evaluating rather than pretending that a generated self-signed key removes SmartScreen warnings.

Source: [Microsoft code signing options for Windows app developers](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options).

## Apple distribution without an owned certificate

Apple's Developer ID guidance states that Gatekeeper checks for a Developer ID certificate when software is distributed outside the Mac App Store. The Developer ID certificate is generated from an Apple Developer account by the Account Holder, and notarization scans Developer ID-signed software before Apple issues the ticket used by Gatekeeper. There is no public framework that manufactures an Apple-trusted Developer ID certificate for an unrelated project. An open-source project must either distribute through the Mac App Store, use an authorized organization account, or publish an unsigned/test artifact with an explicit warning.

Source: [Apple Developer ID signing and notarization](https://developer.apple.com/developer-id/).

## Android distribution without owning the Play signing key

Android still requires every installable APK to be digitally signed. Google Play App Signing changes who protects the production app-signing key: the publisher keeps an upload key, while Google signs the distributed APKs. This helps an open-source project avoid operating the final Play signing key, but it does not remove the need for a Play Console account, an upload key and a release identity. Direct APK distribution outside Google Play still requires Saddle to sign the APK itself.

Source: [Android app signing and Play App Signing](https://developer.android.com/studio/publish/app-signing).

## Open-source Windows certificate route

The SignPath Foundation states that it can provide code-signing certificates for eligible open-source projects, keeps the private key in its hardware security module and verifies that the binary came from the project's public repository. This is a real external approval program, not a library that generates a universally trusted certificate locally. Saddle can apply to the program, but the workflow must remain disabled or unsigned until the project is accepted and the provider-specific integration is configured.

Source: [SignPath Foundation](https://signpath.org/).

## What the OpenCode workflow actually does

The public OpenCode publish workflow invokes `azure/artifact-signing-action` with an Azure Trusted Signing endpoint, account name and certificate profile. This explains how a visible open-source project can distribute signed Windows binaries: the project has access to an external signing service and repository or organization secrets. It is not evidence that OpenCode generates a universally trusted certificate from source code. Saddle can follow the same pattern after an Azure Artifact Signing or SignPath application is approved, but must keep its unsigned mode until then.

Source: [OpenCode publish workflow](https://raw.githubusercontent.com/anomalyco/opencode/dev/.github/workflows/publish.yml).

## What the Zed workflow demonstrates

The public Zed post-release workflow focuses on refreshing release pages, publishing a WinGet manifest and deploying documentation. It references organization secrets for those integrations and does not expose a locally generated signing certificate. This is consistent with the broader pattern: open-source projects can publish broadly, but platform trust comes from a store, a managed signing provider or a certificate held by the project organization.

Source: [Zed post-release workflow](https://raw.githubusercontent.com/zed-industries/zed/main/.github/workflows/after_release.yml).

## Safe GitHub Actions secret handling

GitHub's documentation says repository or environment secrets are created from the repository Settings page and injected through the `secrets` context. Secrets are not passed to fork-triggered workflows or Dependabot events, and GitHub recommends OIDC for cloud providers that support it so long-lived credentials can be avoided. Saddle must therefore configure signing only on trusted release events, never expose values in command arguments or logs, and keep manual test keys separate from production signing credentials.

Source: [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).
