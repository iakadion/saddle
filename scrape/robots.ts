export interface RobotsDirective {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsTxt {
  directives: RobotsDirective[];
  sitemaps: string[];
  crawlDelay?: number;
}

const cache = new Map<string, { robots: RobotsTxt; fetchedAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function parseRobotsTxt(content: string): RobotsTxt {
  const lines = content.split('\n').map(l => l.trim());
  const directives: RobotsDirective[] = [];
  const sitemaps: string[] = [];
  let current: RobotsDirective | null = null;
  let globalCrawlDelay: number | undefined;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'user-agent') {
      current = { userAgent: value, allow: [], disallow: [] };
      directives.push(current);
    } else if (key === 'allow' && current) {
      current.allow.push(value);
    } else if (key === 'disallow' && current) {
      if (value) current.disallow.push(value);
    } else if (key === 'crawl-delay' && current) {
      const delay = parseInt(value);
      if (!isNaN(delay)) {
        current.crawlDelay = delay;
        globalCrawlDelay = delay;
      }
    } else if (key === 'sitemap') {
      sitemaps.push(value);
    }
  }

  return { directives, sitemaps, crawlDelay: globalCrawlDelay };
}

function matchUserAgent(pattern: string, userAgent: string): boolean {
  const lowerPattern = pattern.toLowerCase();
  const lowerUA = userAgent.toLowerCase();
  if (lowerPattern === '*') return true;
  return lowerUA.includes(lowerPattern.replace(/\*/g, ''));
}

function isPathAllowed(path: string, directive: RobotsDirective): boolean {
  // Check disallow rules first
  for (const pattern of directive.disallow) {
    if (pattern === '/') return false;
    if (pattern && path.startsWith(pattern)) return false;
  }
  // Then check allow rules
  for (const pattern of directive.allow) {
    if (pattern === '/') return true;
    if (pattern && path.startsWith(pattern)) return true;
  }
  // Default: allowed
  return true;
}

export async function fetchRobotsTxt(siteUrl: string, options: { timeout?: number; userAgent?: string } = {}): Promise<RobotsTxt> {
  const base = siteUrl.replace(/\/$/, '');
  const robotsUrl = `${base}/robots.txt`;
  const userAgent = options.userAgent || 'DevThink-WebScrape/2.0';

  const cached = cache.get(robotsUrl);
  if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL) {
    return cached.robots;
  }

  try {
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(options.timeout || 5000),
    });

    if (!response.ok) {
      const robots: RobotsTxt = { directives: [], sitemaps: [], crawlDelay: undefined };
      cache.set(robotsUrl, { robots, fetchedAt: Date.now() });
      return robots;
    }

    const text = await response.text();
    const robots = parseRobotsTxt(text);
    cache.set(robotsUrl, { robots, fetchedAt: Date.now() });
    return robots;
  } catch {
    const robots: RobotsTxt = { directives: [], sitemaps: [], crawlDelay: undefined };
    cache.set(robotsUrl, { robots, fetchedAt: Date.now() });
    return robots;
  }
}

export function isAllowed(url: string, robots: RobotsTxt, userAgent: string = '*'): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    for (const directive of robots.directives) {
      if (matchUserAgent(directive.userAgent, userAgent)) {
        return isPathAllowed(path, directive);
      }
    }

    return true;
  } catch {
    return true;
  }
}

export function getCrawlDelay(robots: RobotsTxt, userAgent: string = '*'): number | undefined {
  for (const directive of robots.directives) {
    if (matchUserAgent(directive.userAgent, userAgent)) {
      return directive.crawlDelay;
    }
  }
  return robots.crawlDelay;
}

export function getSitemaps(robots: RobotsTxt): string[] {
  return robots.sitemaps;
}
