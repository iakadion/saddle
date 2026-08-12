import { chromium, firefox, webkit, type Browser, type BrowserContext, type Page } from 'playwright';
import type { BrowserAgentConfig, ChromeCommand, RenderOptions } from './types.js';
import { WebScrapeError, ErrorCode, BrowserNotAvailableError } from './errors.js';

export class AgentBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: Required<Omit<BrowserAgentConfig, 'userAgent' | 'geolocation'>> & Pick<BrowserAgentConfig, 'userAgent' | 'geolocation'>;

  private static DEFAULTS = {
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timeout: 30000,
    recordVideo: false,
    proxy: '',
    storageState: '',
    blockAds: true,
    stealth: true,
  };

  constructor(config: Partial<BrowserAgentConfig> = {}) {
    this.config = { ...AgentBrowser.DEFAULTS, ...config };
  }

  async launch(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<void> {
    try {
      const launcher = { chromium, firefox, webkit }[browserType];
      const launchOpts: Parameters<typeof chromium.launch>[0] = {
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      };
      if (this.config.proxy) {
        launchOpts.proxy = { server: this.config.proxy };
      }
      this.browser = await launcher.launch(launchOpts);

      const ctxOpts: Parameters<Browser['newContext']>[0] = {
        viewport: this.config.viewport,
        locale: this.config.locale,
        userAgent: this.config.userAgent,
      };
      if (this.config.recordVideo) {
        ctxOpts.recordVideo = { dir: './videos' };
      }
      if (this.config.geolocation) {
        ctxOpts.geolocation = this.config.geolocation;
        ctxOpts.permissions = ['geolocation'];
      }
      if (this.config.storageState) {
        ctxOpts.storageState = this.config.storageState;
      }
      this.context = await this.browser.newContext(ctxOpts);

      if (this.config.blockAds) {
        await this.context.route('**/*.{png,jpg,jpeg,gif,svg,ico,css,woff,woff2,mp4,webm}', r => r.abort());
      }

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.config.timeout);
    } catch (error) {
      if ((error as Error).message?.includes('playwright') || (error as Error).message?.includes('chromium')) {
        throw new BrowserNotAvailableError();
      }
      throw error;
    }
  }

  async navigate(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.goto(url, { waitUntil, timeout: this.config.timeout });
  }

  async screenshot(opts: RenderOptions = {}): Promise<Buffer> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    return this.page.screenshot({
      fullPage: opts.fullPage ?? false,
      type: opts.type ?? 'png',
      quality: opts.quality ?? 80,
    }) as Promise<Buffer>;
  }

  async evaluate<T = unknown>(fn: string | (() => T), args?: unknown[]): Promise<T> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    if (typeof fn === 'string') {
      return this.page.evaluate(new Function(fn) as () => T);
    }
    return this.page.evaluate(fn, args);
  }

  async click(selector: string): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.click(selector);
  }

  async type(selector: string, text: string, delayMs = 0): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.fill(selector, '');
    await this.page.type(selector, text, { delay: delayMs });
  }

  async scrollToBottom(step = 800, delayMs = 300, maxScrolls = 50): Promise<number> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    let scrolls = 0;
    let prevHeight = 0;
    while (scrolls < maxScrolls) {
      const height = await this.page.evaluate(() => document.body.scrollHeight);
      if (height === prevHeight && scrolls > 2) break;
      prevHeight = height;
      await this.page.evaluate(y => window.scrollBy(0, y), step);
      await new Promise(r => setTimeout(r, delayMs));
      scrolls++;
    }
    return scrolls;
  }

  async scrollTo(x: number, y: number): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.evaluate(([px, py]) => window.scrollTo(px, py), [x, y]);
  }

  async waitFor(selector: string, timeout?: number): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.waitForSelector(selector, { timeout: timeout ?? this.config.timeout });
  }

  async waitForLoad(): Promise<void> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    await this.page.waitForLoadState('networkidle');
  }

  async html(): Promise<string> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    return this.page.content();
  }

  async text(): Promise<string> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    return this.page.evaluate(() => document.body.innerText);
  }

  async title(): Promise<string> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    return this.page.title();
  }

  async url(): Promise<string> {
    if (!this.page) throw new WebScrapeError('Browser not launched', ErrorCode.BROWSER_NOT_AVAILABLE, 500, false);
    return this.page.url();
  }

  async executeCommands(commands: ChromeCommand[]): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const cmd of commands) {
      switch (cmd.action) {
        case 'goto':
          await this.navigate(cmd.args?.url as string);
          results.push({ ok: true });
          break;
        case 'click':
          await this.click(cmd.args?.selector as string);
          results.push({ ok: true });
          break;
        case 'type':
          await this.type(cmd.args?.selector as string, cmd.args?.text as string);
          results.push({ ok: true });
          break;
        case 'screenshot':
          results.push(await this.screenshot(cmd.args as RenderOptions));
          break;
        case 'evaluate':
          results.push(await this.evaluate(cmd.args?.fn as string));
          break;
        case 'wait':
          await this.waitFor(cmd.args?.selector as string);
          results.push({ ok: true });
          break;
        case 'scroll':
          if (cmd.args?.to) {
            await this.scrollTo(0, cmd.args.to as number);
          } else {
            await this.scrollToBottom();
          }
          results.push({ ok: true });
          break;
        case 'extract':
          results.push({
            html: await this.html(),
            text: await this.text(),
            title: await this.title(),
          });
          break;
      }
    }
    return results;
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close().catch(() => {});
    if (this.context) await this.context.close().catch(() => {});
    if (this.browser) await this.browser.close().catch(() => {});
    this.page = null;
    this.context = null;
    this.browser = null;
  }

  isConnected(): boolean {
    return this.browser?.isConnected() ?? false;
  }
}

export function createBrowser(config?: BrowserAgentConfig): AgentBrowser {
  return new AgentBrowser(config);
}
