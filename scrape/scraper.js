/**
 * scraper composes robots policy cache transport and extraction without browser assumptions.
 */
import { transport } from "../adapters/transport.js";
import { extracthtml } from "./extract.js";
import { robotsallowed, robotsdelay, robotsrules } from "./robots.js";
import { ttlcache } from "./cache.js";

export function scraper(options = {}) {
  const client = options.transport ?? transport({ fetcher: options.fetcher, timeout: options.timeout, attempts: options.attempts });
  const cache = options.cache ?? ttlcache(options.cacheoptions);
  const agent = options.agent ?? "*";
  const policies = new Map();
  return {
    async robots(origin) {
      if (policies.has(origin)) return policies.get(origin);
      const url = new URL("/robots.txt", origin).href;
      const response = await client.request(url);
      const rules = robotsrules(response.ok ? await response.text() : "");
      policies.set(origin, rules);
      return rules;
    },
    async scrape(url) {
      const target = new URL(url);
      if (!["http:", "https:"].includes(target.protocol)) throw new TypeError("scraper accepts http and https only");
      const rules = await this.robots(target.origin);
      if (!robotsallowed(rules, target.href, agent)) throw new Error("robots policy disallows target");
      const cached = cache.get(target.href);
      if (cached) return cached;
      const wait = robotsdelay(rules, agent);
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      const response = await client.request(target.href, { headers: options.headers });
      if (!response.ok) throw new Error(`scrape request failed with ${response.status}`);
      const result = extracthtml(await response.text(), target.href);
      cache.set(target.href, result, { ttl: options.ttl });
      return result;
    },
    cache
  };
}
