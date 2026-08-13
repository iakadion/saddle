/**
 * typed engine errors keep recovery decisions explicit.
 */
export const errorcodes = Object.freeze({
  invalidinput: "INVALID_INPUT",
  artifactnotfound: "ARTIFACT_NOT_FOUND",
  storagefailure: "STORAGE_FAILURE",
  runnerunavailable: "RUNNER_UNAVAILABLE",
  jobfailed: "JOB_FAILED",
  sessioninvalid: "SESSION_INVALID"
});

export function saddleerror(message, options = {}) {
  const error = new Error(message, { cause: options.cause });
  error.name = "saddleerror";
  error.code = options.code ?? errorcodes.jobfailed;
  error.retryable = options.retryable ?? false;
  error.details = options.details ?? {};
  return error;
}

export function validationerror(message, details = {}) {
  return saddleerror(message, { code: errorcodes.invalidinput, details });
}

export function artifactnotfound(key) {
  return saddleerror(`artifact not found: ${key}`, { code: errorcodes.artifactnotfound, details: { key } });
}

export function runnerunavailable(jobid) {
  return saddleerror(`no runner is available for job ${jobid}`, { code: errorcodes.runnerunavailable, retryable: true, details: { jobid } });
}

export function aserror(error, jobid) {
  if (error?.name === "saddleerror") return error;
  return saddleerror(`job ${jobid} failed`, { code: errorcodes.jobfailed, cause: error, details: { jobid } });
}

/** Scrape error presets keep status, recovery and retry decisions explicit. */
export const errorcatalog = Object.freeze({
  timeout: { code: "E1001", statuscode: 504, retryable: true, recovery: "WAIT_AND_RETRY" },
  connectionrefused: { code: "E1002", statuscode: 503, retryable: true, recovery: "WAIT_AND_RETRY" },
  dns: { code: "E1003", statuscode: 503, retryable: true, recovery: "ROTATE_PROXY" },
  ratelimited: { code: "E2001", statuscode: 429, retryable: true, recovery: "WAIT_AND_RETRY" },
  forbidden: { code: "E2002", statuscode: 403, retryable: false, recovery: "REVIEW_ROBOTS_TXT" },
  notfound: { code: "E2003", statuscode: 404, retryable: false, recovery: "STOP_CRAWLING" },
  parse: { code: "E4002", statuscode: 422, retryable: false, recovery: "STOP_CRAWLING" },
  captcha: { code: "E4003", statuscode: 403, retryable: false, recovery: "REVIEW_ROBOTS_TXT" },
  session: { code: "E5001", statuscode: 401, retryable: true, recovery: "ROTATE_USER_AGENT" },
  config: { code: "E6001", statuscode: 400, retryable: false, recovery: "STOP_CRAWLING" }
});

/** Creates a stable scrape error with recovery metadata. */
export function webscrapeerror(kind, message, options = {}) { const preset = errorcatalog[kind] ?? errorcatalog.config; const error = new Error(message, { cause: options.cause }); error.name = "webscrapeerror"; error.code = options.code ?? preset.code; error.statuscode = options.statuscode ?? preset.statuscode; error.retryable = options.retryable ?? preset.retryable; error.recovery = options.recovery ?? preset.recovery; error.severity = options.severity ?? (error.statuscode >= 500 ? "high" : "medium"); error.details = options.details ?? {}; return error; }

/** Converts unknown failures into the stable scrape taxonomy. */
export function classifyerror(error) { if (error?.name === "webscrapeerror") return error; const message = String(error?.message ?? error); if (/timeout|aborted/i.test(message)) return webscrapeerror("timeout", message, { cause: error }); if (/dns|enotfound/i.test(message)) return webscrapeerror("dns", message, { cause: error }); return webscrapeerror("config", message, { cause: error }); }
