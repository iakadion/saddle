/**
 * structured first extraction uses small built in heuristics and returns serializable data.
 */
export function extracthtml(html, url) {
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((item) => resolveurl(item[1], url)).filter(Boolean);
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { url, title: decode(title ?? ""), description: decode(description ?? ""), text, links: [...new Set(links)] };
}

function match(value, expression) { return value.match(expression)?.[1]?.trim(); }
function decode(value) { return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"'); }
function resolveurl(value, base) { try { return base ? new URL(value, base).href : new URL(value).href; } catch { return null; } }
