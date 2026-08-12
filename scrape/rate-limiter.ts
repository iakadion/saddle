interface TokenBucket {
	tokens: number;
	lastRefill: number;
	maxTokens: number;
	refillRate: number;
}

export interface RateLimiterConfig {
	maxTokensPerInterval: number;
	intervalMs: number;
	maxConcurrent?: number;
}

const DEFAULT_CONFIG: Required<RateLimiterConfig> = {
	maxTokensPerInterval: 10,
	intervalMs: 1000,
	maxConcurrent: 5,
};

export class RateLimiter {
	private buckets = new Map<string, TokenBucket>();
	private active = new Map<string, number>();
	private config: Required<RateLimiterConfig>;

	constructor(config: Partial<RateLimiterConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	private getBucket(key: string): TokenBucket {
		if (!this.buckets.has(key)) {
			this.buckets.set(key, {
				tokens: this.config.maxTokensPerInterval,
				lastRefill: Date.now(),
				maxTokens: this.config.maxTokensPerInterval,
				refillRate: this.config.maxTokensPerInterval / (this.config.intervalMs / 1000),
			});
		}
		return this.buckets.get(key)!;
	}

	private refill(bucket: TokenBucket): void {
		const now = Date.now();
		const elapsed = (now - bucket.lastRefill) / 1000;
		bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
		bucket.lastRefill = now;
	}

	async acquire(key: string): Promise<void> {
		const bucket = this.getBucket(key);
		const currentActive = this.active.get(key) || 0;

		if (currentActive >= this.config.maxConcurrent) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			return this.acquire(key);
		}

		this.refill(bucket);

		if (bucket.tokens < 1) {
			const waitMs = ((1 - bucket.tokens) / bucket.refillRate) * 1000;
			await new Promise((resolve) => setTimeout(resolve, Math.ceil(waitMs)));
			this.refill(bucket);
		}

		bucket.tokens -= 1;
		this.active.set(key, currentActive + 1);
	}

	release(key: string): void {
		const current = this.active.get(key) || 0;
		if (current <= 1) {
			this.active.delete(key);
		} else {
			this.active.set(key, current - 1);
		}
	}

	getStats(key: string): { tokens: number; active: number } {
		const bucket = this.buckets.get(key);
		if (bucket) this.refill(bucket);
		return {
			tokens: bucket?.tokens ?? this.config.maxTokensPerInterval,
			active: this.active.get(key) || 0,
		};
	}

	clear(): void {
		this.buckets.clear();
		this.active.clear();
	}
}

export function createRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
	return new RateLimiter(config);
}
