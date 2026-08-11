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
