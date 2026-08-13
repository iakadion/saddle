/**
 * llms text generation creates compact absolute links for agent consumption.
 */
export function llmstxt(options = {}) {
  const title = options.title ?? "saddle";
  const description = options.description ?? "binary computing engine and browser automation library";
  const pages = (options.pages ?? []).filter((page) => page?.url && /^https:\/\//.test(page.url)).slice(0, options.limit ?? 100);
  const lines = [`# ${title}`, `> ${description}`, "", "## pages", "", ...pages.map((page) => `- [${page.title ?? page.url}](${page.url}): ${(page.description ?? "").slice(0, 100)}`)];
  return `${lines.join("\n")}\n`;
}

export function llmsfull(options = {}) { return (options.pages ?? []).filter((page) => page?.url && /^https:\/\//.test(page.url)).map((page) => `# ${page.title ?? page.url}\n\nsource: ${page.url}\n\n${page.content ?? ""}`).join("\n\n---\n\n"); }
