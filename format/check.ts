/**
 * format check validates the public root based JavaScript layout before release.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const roots = ["core", "domain", "memory", "runners", "runtime", "storage", "sessions", "modes", "adapters", "persistence", "queue", "dispatch", "scrape", "crawl", "api", "mcp", "browser", "proxy", "captcha", "ai", "webhook", "surfaces", "library", "errors", "retry", "server", "binary", "deploy", "workflow", "packager", "bot", "protocol", "cli"];

/** Finds JavaScript files that do not follow the skill formatting contract. */
export async function formatissues(root = process.cwd()) {
  const issues = [];
  for (const directory of roots) for (const file of await javascriptfiles(join(root, directory))) { const relative = file.slice(root.length + 1); const source = await readFile(file, "utf8"); if (/[A-Z_-]/.test(relative)) issues.push(`${relative}: invalid path format`); if (!source.includes("/**")) issues.push(`${relative}: missing jsdoc`); }
  return issues;
}

/** Runs the check as a CLI and throws a short diagnostic on failure. */
export async function runformatcheck() { const issues = await formatissues(); if (issues.length) throw new Error(issues.join("\n")); return { ok: true, checked: roots.length }; }

async function javascriptfiles(directory) { let entries; try { entries = await readdir(directory, { withFileTypes: true }); } catch { return []; } const files = []; for (const entry of entries) { const file = join(directory, entry.name); if (entry.isDirectory()) files.push(...await javascriptfiles(file)); else if (entry.name.endsWith(".js")) files.push(file); } return files; }

if (import.meta.url === `file://${process.argv[1]}`) runformatcheck().then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
