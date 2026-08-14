# Sitemap traversal

The sitemap parser follows nested sitemap indexes with a caller-defined maximum depth and URL count. It tracks visited sitemap documents to prevent cycles and canonicalizes URL identities without fragments so repeated references do not consume the result budget. `fetchSitemap` also accepts an injected fetcher for deterministic tests and caller-owned transport policy.

```ts
const urls = await parseSitemap("https://example.test/sitemap.xml", {
  followIndexes: true,
  maxDepth: 8,
  maxUrls: 10000,
  timeout: 10000,
});
```

The parser does not select a proxy, browser, credential, host or port. Network failures continue to use the existing `WebScrapeError` contract, and the result remains a bounded array of normalized sitemap entries.
