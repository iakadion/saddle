/**
 * semantic extraction exposes bounded headings, landmarks, controls and links without evaluating page code.
 */

/** Extracts semantic page facts from HTML using safe built-in parsing heuristics. */
export function extractsemantic(html, url) {
  const source = String(html ?? "");
  const headings = [...source.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].slice(0, 100).map((match) => ({ level: Number(match[1]), text: clean(match[2]) })).filter((item) => item.text);
  const landmarks = [...source.matchAll(/<(main|nav|header|footer|aside|section|article)\b([^>]*)>/gi)].slice(0, 100).map((match) => ({ role: match[1].toLowerCase(), label: attribute(match[2], "aria-label") ?? attribute(match[2], "id") ?? "" }));
  const controls = [...source.matchAll(/<(button|input|textarea|select|a)\b([^>]*)>([\s\S]*?)<\/\1>|<(input)\b([^>]*)\/?\s*>/gi)].slice(0, 200).map((match, index) => {
    const tag = (match[1] ?? match[4]).toLowerCase();
    const attrs = match[2] ?? match[5] ?? "";
    return { ref: `e${index + 1}`, role: attribute(attrs, "role") ?? tag, name: attribute(attrs, "aria-label") ?? attribute(attrs, "placeholder") ?? clean(match[3] ?? ""), type: attribute(attrs, "type") };
  });
  const links = [...source.matchAll(/<a\b([^>]*)href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 500).map((match) => ({ url: resolve(match[2], url), text: clean(match[3]), rel: attribute(match[1], "rel") })).filter((link) => link.url);
  return { url, title: clean(source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""), headings, landmarks, controls, links: dedupe(links, (item) => item.url), semantictext: clean(source.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).slice(0, 100000) };
}

function clean(value) { return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").trim(); }
function attribute(value, name) { return value.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1] ?? null; }
function resolve(value, base) { try { return new URL(value, base).href; } catch { return null; } }
function dedupe(values, key) { const seen = new Set(); return values.filter((value) => { const item = key(value); if (seen.has(item)) return false; seen.add(item); return true; }); }
