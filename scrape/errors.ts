export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_URL: 'INVALID_URL',
  TIMEOUT: 'TIMEOUT',
  BLOCKED: 'BLOCKED',
  RATE_LIMITED: 'RATE_LIMITED',
  PROXY_ERROR: 'PROXY_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  BROWSER_NOT_AVAILABLE: 'BROWSER_NOT_AVAILABLE',
  CRAWL_DEPTH_EXCEEDED: 'CRAWL_DEPTH_EXCEEDED',
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export class WebScrapeError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly timestamp: string;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    isRetryable: boolean,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = 'WebScrapeError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    this.timestamp = new Date().toISOString();
    this.details = details;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        isRetryable: this.isRetryable,
        timestamp: this.timestamp,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.VALIDATION_FAILED, 400, false, details, cause);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.TIMEOUT, 504, true, details, cause);
    this.name = 'TimeoutError';
  }
}

export class BlockedError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.BLOCKED, 403, false, details, cause);
    this.name = 'BlockedError';
  }
}

export class RateLimitError extends WebScrapeError {
  public readonly retryAfterMs?: number;
  constructor(
    message: string,
    retryAfterMs?: number,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.RATE_LIMITED, 429, true, { ...details, retryAfterMs }, cause);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class ProxyError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.PROXY_ERROR, 502, true, details, cause);
    this.name = 'ProxyError';
  }
}

export class ParseError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.PARSE_ERROR, 422, false, details, cause);
    this.name = 'ParseError';
  }
}

export class AuthError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.AUTH_REQUIRED, 401, false, details, cause);
    this.name = 'AuthError';
  }
}

export class NetworkError extends WebScrapeError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, details, cause);
    this.name = 'NetworkError';
  }
}

export class BrowserNotAvailableError extends WebScrapeError {
  constructor(
    message: string = 'Playwright is not installed. Install it with: npm install playwright',
    details?: Record<string, unknown>
  ) {
    super(message, ErrorCode.BROWSER_NOT_AVAILABLE, 500, false, details);
    this.name = 'BrowserNotAvailableError';
  }
}
