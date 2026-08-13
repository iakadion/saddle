/**
 * markdown chunking preserves heading paths and uses paragraph boundaries before hard cuts.
 */
import { estimatetokens } from "./tokens.js";

export function chunkmarkdown(markdown, options = {}) {
  const maxtokens = options.maxtokens ?? 512;
  const overlap = options.overlaptokens ?? 50;
  const lines = String(markdown ?? "").split(/\r?\n/);
  const chunks = [];
  let headingpath = [];
  let buffer = [];
  function flush() { if (!buffer.length) return; const content = buffer.join("\n").trim(); if (content) chunks.push({ content, headingpath: [...headingpath], tokencount: estimatetokens(content, options.model) }); buffer = []; }
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flush(); const level = heading[1].length; headingpath = headingpath.slice(0, level - 1); headingpath[level - 1] = heading[2].trim(); buffer.push(line); continue; }
    buffer.push(line);
    if (estimatetokens(buffer.join("\n"), options.model) > maxtokens) { const last = buffer.pop(); flush(); const overlaptext = buffer.slice(-overlap).join("\n"); buffer = overlaptext ? [overlaptext, last] : [last]; }
  }
  flush();
  return chunks.map((chunk, index) => ({ ...chunk, id: `chunk${index}` }));
}
