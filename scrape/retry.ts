import pRetry, { AbortError } from "p-retry";
import type { RetryConfig } from "./types.js";

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
	retries: 3,
	delay: 1000,
	backoff: "exponential",
	maxDelay: 30000,
	statusCodes: [408, 429, 500, 502, 503, 504],
};

const RETRYABLE_NETWORK_CODES = ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EPIPE", "ENOTFOUND"];

export function isRetryableError(error: Error): boolean {
	const code = (error as any).code;
	if (code && RETRYABLE_NETWORK_CODES.includes(code)) return true;
	const status = (error as any).statusCode || (error as any).status;
	if (status && [408, 429, 500, 502, 503, 504].includes(status)) return true;
	if (error.name === "AbortError") return false;
	return false;
}

function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
	switch (config.backoff) {
		case "exponential":
			return Math.min(config.delay * 2 ** attempt, config.maxDelay);
		case "linear":
			return Math.min(config.delay * (attempt + 1), config.maxDelay);
		case "constant":
			return config.delay;
	}
}

export async function withRetry<T>(
	fn: (attemptNumber: number) => Promise<T>,
	config: Partial<RetryConfig> = {},
	onRetry?: (error: Error, attempt: number) => void,
): Promise<T> {
	const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };

	return pRetry(
		async (attemptNumber) => {
			try {
				return await fn(attemptNumber);
			} catch (error) {
				if (!isRetryableError(error as Error)) {
					throw new AbortError((error as Error).message);
				}
				throw error;
			}
		},
		{
			retries: cfg.retries,
			minTimeout: calculateDelay(0, cfg),
			maxTimeout: cfg.maxDelay,
			randomize: cfg.backoff === "exponential",
			onFailedAttempt: (context) => {
				onRetry?.(context.error, context.attemptNumber);
			},
		},
	);
}

export { AbortError };
