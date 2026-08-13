import { mkdir, readFile, writeFile } from "node:fs/promises";

const reportPath = process.argv[2];
const summaryPath =
  process.env.SECURITY_SUMMARY_PATH ?? "build/security/cargo-audit-summary.md";
const acceptedAdvisory = "RUSTSEC-2024-0429";

if (!reportPath) {
  throw new TypeError("cargo audit report path is required");
}

/** Returns the advisory identifiers attached to one cargo audit finding. */
function advisoryids(finding) {
  const advisory = finding?.advisory ?? {};
  return [advisory.id, finding?.id, ...(advisory.aliases ?? [])]
    .filter(Boolean)
    .map(String);
}

/** Returns a stable package label for a cargo audit finding. */
function packagelabel(finding) {
  const packageinfo = finding?.package ?? {};
  return `${packageinfo.name ?? "unknown"}@${packageinfo.version ?? "unknown"}`;
}

const raw = await readFile(reportPath, "utf8");
let report;
try {
  report = JSON.parse(raw);
} catch (error) {
  throw new Error(`cargo audit produced invalid JSON: ${error.message}`);
}

const findings = Array.isArray(report?.vulnerabilities?.list)
  ? report.vulnerabilities.list
  : [];
const accepted = findings.filter(
  (finding) =>
    advisoryids(finding).includes(acceptedAdvisory) &&
    packagelabel(finding).startsWith("glib@"),
);
const unexpected = findings.filter((finding) => !accepted.includes(finding));
const warnings = Object.values(report?.warnings ?? {}).flatMap((value) =>
  Array.isArray(value) ? value : [],
);
const status =
  unexpected.length > 0
    ? "fail"
    : accepted.length > 0
      ? "accepted-risk"
      : "pass";
const lines = [
  "# Cargo audit security gate",
  "",
  `Status: **${status}**`,
  `Findings: ${findings.length}`,
  `Accepted transitive glib findings: ${accepted.length}`,
  `Unexpected findings: ${unexpected.length}`,
  `Warnings: ${warnings.length}`,
  "",
  "## Findings",
  "",
];

if (findings.length === 0)
  lines.push("No RustSec vulnerability findings were returned.", "");
for (const finding of findings) {
  const ids = advisoryids(finding).join(", ") || "unknown-advisory";
  const classification = accepted.includes(finding)
    ? "accepted transitive glib risk"
    : "release blocking";
  lines.push(`- ${classification}: ${ids} (${packagelabel(finding)})`);
}

lines.push(
  "",
  "The accepted glib entry is limited to the Tauri GTK3 transitive dependency documented in `docs/tauri-glib-risk-1.8.11.md`; any other advisory fails this gate.",
  "",
);
await mkdir(new URL(".", `file://${process.cwd()}/${summaryPath}`).pathname, {
  recursive: true,
}).catch(() => {});
await writeFile(summaryPath, `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
if (unexpected.length > 0) process.exitCode = 1;
