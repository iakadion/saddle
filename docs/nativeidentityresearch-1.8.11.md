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
