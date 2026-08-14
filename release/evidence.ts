/**
 * Release evidence evaluates caller-supplied metadata without fetching, signing,
 * scanning, publishing or claiming an artifact has more assurance than proven.
 */

const evidencestatuses = new Set(["notProvided", "declared", "parsed", "checked", "verified", "rejected", "unknown"]);
const verifiedstatuses = new Set(["checked", "verified"]);

/** Normalizes an immutable, caller-supplied artifact evidence record. */
export function releaseevidence(input: Record<string, unknown> = {}) {
  const status = normalizestatus(input.status ?? "notProvided");
  const kind = requiredtext(input.kind, "evidence kind");
  const subjectdigest = optionaldigest(input.subjectdigest, "subject digest");
  const producer = optionaltext(input.producer);
  const workflow = optionaltext(input.workflow);
  const method = optionaltext(input.verificationmethod);
  const verifiedat = optionaltime(input.verifiedat, "verification time");
  if (verifiedstatuses.has(status) && !subjectdigest) throw new TypeError("checked evidence requires a subject digest");
  if (verifiedstatuses.has(status) && !method) throw new TypeError("checked evidence requires a verification method");
  if (status === "verified" && !producer) throw new TypeError("verified evidence requires a producer");
  if (status === "verified" && !verifiedat) throw new TypeError("verified evidence requires a verification time");
  return { version: 1, kind, status, subjectdigest, producer, workflow, verificationmethod: method, verifiedat, metadata: objectcopy(input.metadata) };
}

/** Evaluates evidence against a caller-owned policy and returns reason codes, never a trust claim. */
export function evaluateevidence(input: Record<string, unknown> = {}) {
  const evidence = Array.isArray(input.evidence) ? input.evidence.map((entry) => releaseevidence(objectvalue(entry, "evidence entry"))) : [];
  const policy = objectcopy(input.policy);
  const requiredkinds = stringlist(policy.requiredkinds, "required kinds");
  const allowedstatuses = new Set(stringlist(policy.allowedstatuses ?? ["verified"], "allowed statuses"));
  const expectedproducer = textmap(policy.expectedproducer, "expected producer");
  const expectedworkflow = textmap(policy.expectedworkflow, "expected workflow");
  const subjectdigest = optionaldigest(input.subjectdigest, "subject digest");
  const reasons = new Set<string>();
  for (const kind of requiredkinds) {
    const matches = evidence.filter((entry) => entry.kind === kind);
    if (matches.length === 0) { reasons.add(`required-evidence-missing:${kind}`); continue; }
    const accepted = matches.some((entry) => evidenceaccepted(entry, { allowedstatuses, expectedproducer, expectedworkflow, subjectdigest }, reasons));
    if (!accepted) reasons.add(`required-evidence-unsatisfied:${kind}`);
  }
  const evaluated = requiredkinds.length === 0 ? evidence : evidence.filter((entry) => requiredkinds.includes(entry.kind));
  for (const entry of evaluated) evidenceaccepted(entry, { allowedstatuses, expectedproducer, expectedworkflow, subjectdigest }, reasons);
  const ordered = [...reasons].sort();
  const rejected = ordered.some((reason) => reason.startsWith("evidence-rejected:") || reason.startsWith("producer-mismatch:") || reason.startsWith("workflow-mismatch:") || reason.startsWith("subject-mismatch:"));
  const decision = rejected ? "rejected" : ordered.length > 0 ? "insufficient" : "accepted";
  return { version: 1, decision, reasons: ordered, subjectdigest, requiredkinds, evidence };
}

/** Builds a data-only readiness receipt for a release that a caller may later execute. */
export function releasereadiness(input: Record<string, unknown> = {}) {
  const sourcetag = requiredtext(input.sourcetag, "source tag");
  const manifestversions = textmap(input.manifestversions, "manifest versions");
  const requiredgates = textmap(input.requiredgates, "required gates");
  const artifactplandigest = optionaldigest(input.artifactplandigest, "artifact plan digest");
  const targets = stringlist(input.targets, "publication targets");
  const signingstatus = optionaltext(input.signingstatus) ?? "unknown";
  const evaluation = evaluateevidence(objectvalue(input.evaluation, "evidence evaluation"));
  const reasons = new Set(evaluation.reasons);
  if (Object.values(manifestversions).some((value) => value !== sourcetag.replace(/^v/, ""))) reasons.add("manifest-version-mismatch");
  for (const [gate, status] of Object.entries(requiredgates)) if (status !== "passed") reasons.add(`required-gate-not-passed:${gate}`);
  if (!artifactplandigest) reasons.add("artifact-plan-digest-missing");
  if (targets.length === 0) reasons.add("publication-targets-missing");
  if (signingstatus === "unknown") reasons.add("signing-status-unknown");
  const ordered = [...reasons].sort();
  const decision = evaluation.decision === "rejected" ? "rejected" : ordered.length > 0 ? "insufficient" : "accepted";
  return { version: 1, sourcetag, manifestversions, requiredgates, artifactplandigest, targets, signingstatus, evaluation, decision, ready: decision === "accepted", reasons: ordered };
}

function evidenceaccepted(entry: ReturnType<typeof releaseevidence>, policy: { allowedstatuses: Set<string>; expectedproducer: Record<string, string>; expectedworkflow: Record<string, string>; subjectdigest?: string }, reasons: Set<string>) {
  let accepted = true;
  if (entry.status === "rejected") { reasons.add(`evidence-rejected:${entry.kind}`); accepted = false; }
  if (!policy.allowedstatuses.has(entry.status)) { reasons.add(`evidence-status-not-allowed:${entry.kind}:${entry.status}`); accepted = false; }
  if (policy.subjectdigest && entry.subjectdigest !== policy.subjectdigest) { reasons.add(`subject-mismatch:${entry.kind}`); accepted = false; }
  if (policy.expectedproducer[entry.kind] && entry.producer !== policy.expectedproducer[entry.kind]) { reasons.add(`producer-mismatch:${entry.kind}`); accepted = false; }
  if (policy.expectedworkflow[entry.kind] && entry.workflow !== policy.expectedworkflow[entry.kind]) { reasons.add(`workflow-mismatch:${entry.kind}`); accepted = false; }
  return accepted;
}

function normalizestatus(value: unknown) { const status = requiredtext(value, "evidence status"); if (!evidencestatuses.has(status)) throw new TypeError(`unknown evidence status: ${status}`); return status; }
function requiredtext(value: unknown, label: string) { const text = optionaltext(value); if (!text) throw new TypeError(`${label} is required`); return text; }
function optionaltext(value: unknown) { const text = value === undefined || value === null ? undefined : String(value).trim(); return text || undefined; }
function optionaldigest(value: unknown, label: string) { const digest = optionaltext(value)?.toLowerCase(); if (digest && !/^[a-f0-9]{64}$/.test(digest)) throw new TypeError(`${label} must be a sha256 hex digest`); return digest; }
function optionaltime(value: unknown, label: string) { if (value === undefined || value === null) return undefined; const time = Number(value); if (!Number.isFinite(time) || time < 0) throw new TypeError(`${label} must be a non-negative finite number`); return time; }
function stringlist(value: unknown, label: string) { if (value === undefined || value === null) return []; if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`); return [...new Set(value.map((item) => requiredtext(item, label)))].sort(); }
function textmap(value: unknown, label: string) { if (value === undefined || value === null) return {} as Record<string, string>; const source = objectvalue(value, label); return Object.fromEntries(Object.entries(source).map(([key, item]) => [requiredtext(key, label), requiredtext(item, label)])); }
function objectcopy(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? { ...(value as Record<string, unknown>) } : {}; }
function objectvalue(value: unknown, label: string) { if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`); return value as Record<string, unknown>; }
