/**
 * schema extraction accepts safe field descriptors and never evaluates source strings.
 */
export function extractwithschema(html, schema = {}, url) {
  const result = {};
  for (const [name, descriptor] of Object.entries(schema)) result[name] = extractfield(html, descriptor, url);
  return result;
}

function extractfield(html, descriptor, url) {
  if (typeof descriptor === "function") return descriptor({ html, url });
  if (typeof descriptor === "string") return textfromselector(html, descriptor);
  if (!descriptor || typeof descriptor.selector !== "string") throw new TypeError("schema field requires selector or function");
  if (descriptor.selector === "title") return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
  const escaped = descriptor.selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attribute = descriptor.attribute;
  const pattern = attribute ? new RegExp(`<[^>]+${escaped}[^>]*${attribute}=["']([^"']+)["'][^>]*>`, "i") : new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  return pattern.exec(html)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null;
}

function textfromselector(html, selector) { return extractfield(html, { selector }); }
