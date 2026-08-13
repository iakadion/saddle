# Saddle Android surface

The Android surface is a Capacitor conversion target for the shared Saddle web application. The TypeScript library remains the source of engine logic, while the compiled `web/dist/public` directory supplies the WebView payload. Android-specific files contain application metadata, Gradle configuration, resources and signing hooks only.

The workflow runs `npm run web:build:pages`, `npx cap sync android` and Gradle release tasks. Release builds enable R8 code shrinking and resource shrinking. A production keystore is never committed; the workflow uses repository secrets only when caller-owned signing is configured. Debug output is reserved for test diagnostics and is not presented as a store artifact.

The public artifact contract is version-derived and uses dotted lowercase names such as `saddle.apk.1.8.10.arm64.apk` and `saddle.aab.1.8.10.aab`. Native helper binaries, generated build directories and copied web assets remain excluded from version control.
