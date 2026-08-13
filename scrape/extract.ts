/**
 * scrape extraction context groups dependency-free HTML extraction and the
 * historical structured extraction facade under one TypeScript contract.
 */

export interface LinkInfo { href: string; text: string; isInternal: boolean; isExternal: boolean; }
export interface ImageInfo { src: string; alt: string; width?: number; height?: number; }
export interface TableInfo { headers: string[]; rows: string[][]; caption?: string; }
export interface PageMetadata { title: string; description?: string; favicon?: string; charset?: string; language?: string; author?: string; publishedDate?: string; ogImage?: string; ogType?: string; keywords?: string[]; }
export interface ExtractOptions { readable?: boolean; preserveLinks?: boolean; preserveImages?: boolean; preserveTables?: boolean; removeSelectors?: string[]; maxLength?: number; }
export interface ExtractedContent { content: string; text: string; links: LinkInfo[]; images: ImageInfo[]; tables: TableInfo[]; metadata: PageMetadata; jsonLd: unknown[]; }

/** Extracts the compact active scrape result without a DOM dependency. */
export function extracthtml(html: string, url?: string) { const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i); const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ?? match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i); const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((item) => resolveurl(item[1], url)).filter((value): value is string => Boolean(value)); const text = htmltotext(html); return { url, title: decode(title ?? ""), description: decode(description ?? ""), text, links: [...new Set(links)] }; }

/** Extracts structured content for historical TypeScript callers. */
export async function extractContent(html: string, options: ExtractOptions = {}): Promise<ExtractedContent> {
  let source = html;
  for (const selector of options.removeSelectors ?? []) source = removeSelector(source, selector);
  const metadata = extractmetadata(source);
  const text = options.readable ? readabletext(source) : htmltotext(source);
  const content = options.maxLength ? text.slice(0, options.maxLength) : text;
  return { content, text, links: options.preserveLinks === false ? [] : extractlinks(source), images: options.preserveImages === false ? [] : extractimages(source), tables: options.preserveTables === false ? [] : extracttables(source), metadata, jsonLd: extractjsonld(source) };
}

/** Extracts readable page text from a document string. */
export async function extractReadable(html: string): Promise<string> { return (await extractContent(html, { readable: true })).content; }

function match(value: string, expression: RegExp): string | undefined { return value.match(expression)?.[1]?.trim(); }
function decode(value: string): string { return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'"); }
function resolveurl(value: string, base?: string): string | null { try { const parsed = new URL(value, base); return parsed.pathname === "/" && !parsed.search && !parsed.hash ? `${parsed.protocol}//${parsed.host}` : parsed.href; } catch { return null; } }
function htmltotext(html: string): string { return decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()); }
function readabletext(html: string): string { const selectors = [/ <article[\s\S]*?<\/article>/i, /<main[\s\S]*?<\/main>/i, /<body[\s\S]*?<\/body>/i]; for (const selector of selectors) { const matchvalue = html.match(selector)?.[0]; if (matchvalue) return htmltotext(matchvalue); } return htmltotext(html); }
function extractmetadata(html: string): PageMetadata { return { title: match(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? match(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ?? "", description: matchmeta(html, "description") ?? matchmeta(html, "og:description"), favicon: match(html, /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*)["']/i), language: match(html, /<html[^>]+lang=["']([^"']*)["']/i), author: matchmeta(html, "author"), ogImage: matchmeta(html, "og:image"), ogType: matchmeta(html, "og:type"), keywords: matchmeta(html, "keywords")?.split(",").map((value) => value.trim()) }; }
function matchmeta(html: string, name: string): string | undefined { return match(html, new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, "i")) ?? match(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`, "i")); }
function extractlinks(html: string): LinkInfo[] { return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((item) => ({ href: resolveurl(item[1]) ?? item[1], text: htmltotext(item[2]).slice(0, 200), isInternal: false, isExternal: true })); }
function extractimages(html: string): ImageInfo[] { return [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((item) => ({ src: item[1], alt: match(item[0], /alt=["']([^"']*)["']/i) ?? "", width: numberattribute(item[0], "width"), height: numberattribute(item[0], "height") })); }
function numberattribute(value: string, name: string): number | undefined { const parsed = Number(match(value, new RegExp(`${name}=["'](\\d+)["']`, "i"))); return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined; }
function extracttables(html: string): TableInfo[] { return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((table) => { const source = table[0]; const body = source.match(/<tbody[^>]*>[\s\S]*?<\/tbody>/i)?.[0] ?? source; return { headers: [...source.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((item) => htmltotext(item[1])), rows: [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((item) => htmltotext(item[1]))).filter((row) => row.length) }; }); }
function extractjsonld(html: string): unknown[] { const values: unknown[] = []; for (const item of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) try { values.push(JSON.parse(item[1])); } catch { /* malformed structured data remains non fatal */ } return values; }
function removeSelector(html: string, selector: string): string { const tag = selector.match(/^\s*([a-z][a-z0-9]*)\s*$/i)?.[1]; if (tag) return html.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\/${tag}>`, "gi"), ""); const className = selector.match(/^\.([a-z0-9_-]+)$/i)?.[1]; return className ? html.replace(new RegExp(`<([a-z][a-z0-9]*)[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/\\1>`, "gi"), "") : html; }
