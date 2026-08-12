export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
}

export class CookieJar {
  private cookies = new Map<string, Cookie>();

  set(cookie: Cookie): void {
    const key = `${cookie.domain || ''}:${cookie.path || '/'}:${cookie.name}`;
    this.cookies.set(key, cookie);
  }

  get(name: string, domain?: string, _path?: string): Cookie | undefined {
    for (const [key, cookie] of this.cookies) {
      if (cookie.name !== name) continue;
      if (domain && cookie.domain && !domain.includes(cookie.domain)) continue;
      if (cookie.expires && cookie.expires < Date.now()) {
        this.cookies.delete(key);
        continue;
      }
      return cookie;
    }
    return undefined;
  }

  getAll(domain?: string): Cookie[] {
    const result: Cookie[] = [];
    const now = Date.now();
    for (const [key, cookie] of this.cookies) {
      if (cookie.expires && cookie.expires < now) {
        this.cookies.delete(key);
        continue;
      }
      if (domain && cookie.domain && !domain.includes(cookie.domain)) continue;
      result.push(cookie);
    }
    return result;
  }

  toString(domain?: string): string {
    return this.getAll(domain)
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
  }

  parseSetCookie(header: string, defaultDomain?: string): void {
    const parts = header.split(';').map(s => s.trim());
    const [nameValue, ...attrs] = parts;
    const [name, ...valueParts] = nameValue.split('=');
    const value = valueParts.join('=');

    const cookie: Cookie = {
      name: name.trim(),
      value: value.trim(),
      domain: defaultDomain,
      path: '/',
    };

    for (const attr of attrs) {
      const [key, val] = attr.split('=').map(s => s.trim());
      const lower = key.toLowerCase();
      if (lower === 'domain') cookie.domain = val;
      else if (lower === 'path') cookie.path = val;
      else if (lower === 'expires') cookie.expires = new Date(val).getTime();
      else if (lower === 'httponly') cookie.httpOnly = true;
      else if (lower === 'secure') cookie.secure = true;
    }

    this.set(cookie);
  }

  clear(): void {
    this.cookies.clear();
  }
}

export class ScrapingSession {
  public readonly cookieJar: CookieJar;
  public readonly id: string;
  private data = new Map<string, unknown>();

  constructor(id?: string) {
    this.id = id || crypto.randomUUID();
    this.cookieJar = new CookieJar();
  }

  get<T = unknown>(key: string): T | undefined {
    return this.data.get(key) as T;
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  clear(): void {
    this.cookieJar.clear();
    this.data.clear();
  }
}

export function createSession(id?: string): ScrapingSession {
  return new ScrapingSession(id);
}
