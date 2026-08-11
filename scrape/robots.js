/**
 * robots rules are parsed locally and enforced before a fetch is attempted.
 */
export function robotsrules(text = "") {
  const groups = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") { current = { agents: [value.toLowerCase()], disallow: [], allow: [], delay: undefined, sitemaps: [] }; groups.push(current); }
    else if (current && key === "disallow" && value) current.disallow.push(value);
    else if (current && key === "allow" && value) current.allow.push(value);
    else if (current && key === "crawl-delay" && Number.isFinite(Number(value))) current.delay = Number(value);
    else if (key === "sitemap") (current ?? { sitemaps: [] }).sitemaps.push(value);
  }
  return { groups };
}

export function robotsallowed(rules, target, agent = "*") {
  const pathname = new URL(target).pathname || "/";
  const candidates = rules.groups.filter((group) => group.agents.includes(agent.toLowerCase()) || group.agents.includes("*"));
  if (!candidates.length) return true;
  const disallowed = candidates.flatMap((group) => group.disallow).filter((path) => pathname.startsWith(path));
  const allowed = candidates.flatMap((group) => group.allow).filter((path) => pathname.startsWith(path));
  return allowed.some((path) => path.length >= Math.max(...disallowed.map((item) => item.length), 0)) || disallowed.length === 0;
}

export function robotsdelay(rules, agent = "*") { return rules.groups.find((group) => group.agents.includes(agent.toLowerCase()) || group.agents.includes("*"))?.delay ?? 0; }
