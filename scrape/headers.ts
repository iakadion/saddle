export interface HeaderProfile {
  userAgent: string;
  accept: string;
  acceptLanguage: string;
  secChUa: string;
  secChUaPlatform: string;
}

const CHROME_PROFILES: HeaderProfile[] = [
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Chromium";v="131", "Not_A Brand";v="24"',
    secChUaPlatform: '"Windows"',
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Chromium";v="131", "Not_A Brand";v="24"',
    secChUaPlatform: '"macOS"',
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    acceptLanguage: 'en-US,en;q=0.5',
    secChUa: '',
    secChUaPlatform: '"Windows"',
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '',
    secChUaPlatform: '"macOS"',
  },
];

export function getRandomProfile(): HeaderProfile {
  return CHROME_PROFILES[Math.floor(Math.random() * CHROME_PROFILES.length)];
}

export function getHeaders(profile?: HeaderProfile): Record<string, string> {
  const p = profile || getRandomProfile();
  const headers: Record<string, string> = {
    'User-Agent': p.userAgent,
    'Accept': p.accept,
    'Accept-Language': p.acceptLanguage,
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  };
  if (p.secChUa) {
    headers['sec-ch-ua'] = p.secChUa;
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = p.secChUaPlatform;
  }
  return headers;
}

export function mergeHeaders(
  base: Record<string, string>,
  override: Record<string, string>
): Record<string, string> {
  return { ...base, ...override };
}
