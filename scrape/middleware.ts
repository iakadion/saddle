export interface MiddlewareContext<T = Record<string, unknown>> {
  data: T;
  state: Record<string, unknown>;
  startTime: number;
  aborted: boolean;
  abort(): void;
}

export type MiddlewareNext = () => Promise<void>;
export type Middleware<T = Record<string, unknown>> = (
  ctx: MiddlewareContext<T>,
  next: MiddlewareNext
) => Promise<void>;

export class MiddlewarePipeline<T = Record<string, unknown>> {
  private middlewares: Middleware<T>[] = [];

  use(middleware: Middleware<T>): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(initialData: T): Promise<MiddlewareContext<T>> {
    const ctx: MiddlewareContext<T> = {
      data: initialData,
      state: {},
      startTime: Date.now(),
      aborted: false,
      abort() { this.aborted = true; },
    };

    let index = 0;

    const next = async (): Promise<void> => {
      if (ctx.aborted) return;
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(ctx, next);
      }
    };

    await next();
    return ctx;
  }

  clear(): void {
    this.middlewares = [];
  }
}

export function loggingMiddleware(logger?: { info: (msg: string) => void }): Middleware {
  return async (_ctx, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    logger?.info(`Request completed in ${duration}ms`);
  };
}

export function timeoutMiddleware(timeoutMs: number): Middleware {
  return async (ctx, next) => {
    const timer = setTimeout(() => ctx.abort(), timeoutMs);
    try {
      await next();
    } finally {
      clearTimeout(timer);
    }
  };
}

export function retryMiddleware(maxRetries: number, delayMs: number): Middleware {
  return async (ctx, next) => {
    let attempt = 0;
    while (attempt <= maxRetries) {
      ctx.state.attempt = attempt;
      try {
        await next();
        return;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
        attempt++;
      }
    }
  };
}

export function createPipeline<T = Record<string, unknown>>(): MiddlewarePipeline<T> {
  return new MiddlewarePipeline<T>();
}
