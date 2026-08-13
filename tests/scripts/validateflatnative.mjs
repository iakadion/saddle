import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** Returns whether a path exists without turning a missing generated path into a failure. */
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Verifies project-owned native surfaces stay flat while allowing generated Capacitor internals. */
async function validateFlatNative() {
  const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
  const forbidden = [
    join(repositoryRoot, "desktop", "src-tauri"),
    join(repositoryRoot, "android", "app"),
    join(repositoryRoot, "android", "src"),
    join(repositoryRoot, "ios", "src"),
  ];

  for (const path of forbidden) {
    if (await exists(path)) {
      throw new Error(`Forbidden project-owned native path exists: ${path}`);
    }
  }
}

try {
  await validateFlatNative();
  console.log("Flat native surface validation passed.");
} catch (error) {
  console.error("Flat native surface validation failed.", error);
  process.exitCode = 1;
}
