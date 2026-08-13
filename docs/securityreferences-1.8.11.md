# Saddle 1.8.11 security references

Android requires APKs to be digitally signed. Google Play separates the app signing key from the upload key and recommends keeping signing data out of Gradle files and public source. The Saddle workflow must use repository secrets or an external signing service, emit a test signed artifact only when explicitly labeled as such, and never commit a keystore.

GitHub CodeQL supports JavaScript and TypeScript, Rust, Swift, Java and Kotlin, among other languages, as well as GitHub Actions workflows. Its findings can be displayed as code scanning alerts, and advanced setup can upload results to the repository. CodeQL complements, but does not replace, dependency advisory scanners such as `cargo audit`, npm audit and OSV based scanners.

Sources:

1. [Android app signing](https://developer.android.com/studio/publish/app-signing)
2. [GitHub CodeQL code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)
