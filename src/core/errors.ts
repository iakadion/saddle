// Engine core: typed errors keep recovery decisions explicit at the orchestration boundary.
export type SaddleErrorCode = "INVALID_INPUT" | "ARTIFACT_NOT_FOUND" | "STORAGE_FAILURE" | "RUNNER_UNAVAILABLE" | "JOB_FAILED" | "SESSION_INVALID";

export type SaddleErrorOptions = { code: SaddleErrorCode; retryable?: boolean; details?: Record<string, unknown>; cause?: unknown };

export class SaddleError extends Error {
  readonly code: SaddleErrorCode;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;
  constructor(message: string, options: SaddleErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "SaddleError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends SaddleError {
  constructor(message: string, details?: Record<string, unknown>) { super(message, { code: "INVALID_INPUT", details }); this.name = "ValidationError"; }
}

export class ArtifactNotFoundError extends SaddleError {
  constructor(key: string) { super(`Artifact not found: ${key}`, { code: "ARTIFACT_NOT_FOUND", details: { key } }); this.name = "ArtifactNotFoundError"; }
}

export class RunnerUnavailableError extends SaddleError {
  constructor(jobId: string) { super(`No runner is available for job ${jobId}`, { code: "RUNNER_UNAVAILABLE", retryable: true, details: { jobId } }); this.name = "RunnerUnavailableError"; }
}

export function asSaddleError(error: unknown, jobId: string): SaddleError {
  if (error instanceof SaddleError) return error;
  return new SaddleError(`Job ${jobId} failed`, { code: "JOB_FAILED", cause: error, details: { jobId } });
}
