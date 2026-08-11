/**
 * url normalization removes tracking noise before frontier deduplication.
 */
const tracking = /^(utm_|fbclid$|msclkid$|gclid$|gclsrc$|dclid$|gbraid$|wbraid$|twclid$|campaign$|content$|term$|source$|medium$|ref$|share_id$)/i;

export function normalizeurl(value) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (tracking.test(key)) url.searchParams.delete(key);
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

export function sameorigin(left, right) { return new URL(left).origin === new URL(right).origin; }
