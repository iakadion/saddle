import { JSDOM } from 'jsdom';
import type { SerializeOptions, SerializedOutput, ScrapeResult } from './types.js';
import { chunkText } from './utils.js';

function htmlToMarkdown(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  let md = '';

  function processNode(node: globalThis.Node, depth = 0): void {
    if (node.nodeType === 3) {
      const text = (node as globalThis.Text).textContent?.trim();
      if (text) md += text + ' ';
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as globalThis.Element;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const level = parseInt(tag[1]);
        md += '\n' + '#'.repeat(level) + ' ' + el.textContent?.trim() + '\n\n';
        break;
      }
      case 'p':
        md += '\n' + el.textContent?.trim() + '\n\n';
        break;
      case 'br':
        md += '\n';
        break;
      case 'hr':
        md += '\n---\n\n';
        break;
      case 'ul': case 'ol': {
        el.childNodes.forEach(li => {
          if (li.nodeType === 1) {
            const liEl = li as globalThis.Element;
            if (liEl.tagName.toLowerCase() === 'li') {
              md += '  '.repeat(depth) + '- ' + liEl.textContent?.trim() + '\n';
            }
          }
        });
        md += '\n';
        break;
      }
      case 'a': {
        const href = el.getAttribute('href') || '';
        const text = el.textContent?.trim() || href;
        if (href && href !== '#') md += `[${text}](${href}) `;
        else md += text + ' ';
        break;
      }
      case 'img': {
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || '';
        if (src) md += `![${alt}](${src}) `;
        break;
      }
      case 'strong': case 'b':
        md += '**' + el.textContent?.trim() + '** ';
        break;
      case 'em': case 'i':
        md += '*' + el.textContent?.trim() + '* ';
        break;
      case 'code':
        md += '`' + el.textContent?.trim() + '` ';
        break;
      case 'pre': {
        const code = el.querySelector('code');
        const lang = code?.getAttribute('class')?.replace(/^language-/, '') || '';
        md += '\n```' + lang + '\n' + (code || el).textContent + '\n```\n\n';
        break;
      }
      case 'blockquote':
        md += '\n> ' + el.textContent?.trim().replace(/\n/g, '\n> ') + '\n\n';
        break;
      case 'table': {
        const rows = el.querySelectorAll('tr');
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll('td, th');
          md += '| ' + Array.from(cells).map(c => c.textContent?.trim()).join(' | ') + ' |\n';
          if (i === 0 && row.parentElement?.tagName === 'THEAD') {
            md += '|' + Array.from(cells).map(() => ' --- ').join('|') + '|\n';
          }
        });
        md += '\n';
        break;
      }
      default:
        el.childNodes.forEach(child => processNode(child, depth));
    }
  }

  doc.body?.childNodes.forEach((child: globalThis.Node) => processNode(child));
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

function htmlToXml(html: string, root = 'document'): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  function serialize(el: globalThis.Element, depth = 0): string {
    const indent = '  '.repeat(depth);
    const tag = el.tagName.toLowerCase();
    if (el.childNodes.length === 0) {
      return `${indent}<${tag} />\n`;
    }
    const text = el.textContent?.trim();
    if (el.childNodes.length === 1 && el.firstChild?.nodeType === 3 && text) {
      return `${indent}<${tag}>${escapeXml(text)}</${tag}>\n`;
    }
    let xml = `${indent}<${tag}>\n`;
    el.childNodes.forEach(child => {
      if (child.nodeType === 1) xml += serialize(child as globalThis.Element, depth + 1);
      else if (child.nodeType === 3 && (child as globalThis.Text).textContent?.trim()) {
        xml += `${indent}  ${escapeXml((child as globalThis.Text).textContent!.trim())}\n`;
      }
    });
    xml += `${indent}</${tag}>\n`;
    return xml;
  }

  function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n`;
  doc.body?.childNodes.forEach((child: globalThis.Node) => {
    if (child.nodeType === 1) xml += serialize(child as globalThis.Element, 1);
  });
  xml += `</${root}>\n`;
  return xml;
}

function htmlToRedisJson(html: string, key = 'page'): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  function extract(el: globalThis.Element): Record<string, unknown> {
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.children);
    if (children.length === 0) return { _tag: tag, _text: el.textContent?.trim() || '' };
    const result: Record<string, unknown> = { _tag: tag };
    if (el.getAttribute('href')) result.href = el.getAttribute('href')!;
    if (el.getAttribute('src')) result.src = el.getAttribute('src')!;
    if (el.getAttribute('alt')) result.alt = el.getAttribute('alt')!;
    if (el.getAttribute('class')) result.class = el.getAttribute('class')!;
    children.forEach(child => {
      const childTag = child.tagName.toLowerCase();
      if (result[childTag]) {
        if (!Array.isArray(result[childTag])) result[childTag] = [result[childTag]];
        (result[childTag] as unknown[]).push(extract(child));
      } else {
        result[childTag] = extract(child);
      }
    });
    return result;
  }

  const title = doc.title;
  const bodyArr: Record<string, unknown>[] = [];
  doc.body?.childNodes.forEach((child: globalThis.Node) => {
    if (child.nodeType === 1) bodyArr.push(extract(child as globalThis.Element));
  });

  const json: Record<string, unknown> = {
    title,
    body: bodyArr,
    links: Array.from(doc.querySelectorAll('a[href]')).map((a) => ({
      href: (a as globalThis.Element).getAttribute('href'),
      text: (a as globalThis.Element).textContent?.trim(),
    })),
    images: Array.from(doc.querySelectorAll('img[src]')).map((img) => ({
      src: (img as globalThis.Element).getAttribute('src'),
      alt: (img as globalThis.Element).getAttribute('alt'),
    })),
  };

  return `JSON.SET ${key} $ ${JSON.stringify(json, null, 2)}`;
}

function plainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, '')
    .replace(/<script[^>]*>.*?<\/script>/gs, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/th>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tableToMarkdown(headers: string[], rows: string[][], caption?: string): string {
  let md = caption ? `### ${caption}\n\n` : '';
  md += '| ' + headers.join(' | ') + ' |\n';
  md += '|' + headers.map(() => ' --- ').join('|') + '|\n';
  for (const row of rows) {
    md += '| ' + row.join(' | ') + ' |\n';
  }
  return md + '\n';
}

export function serializeResult(result: ScrapeResult, options: SerializeOptions): SerializedOutput {
  let content = '';

  if (options.includeMetadata !== false) {
    content += `# ${result.title}\n\n`;
    content += `- **URL:** ${result.url}\n`;
    content += `- **Extracted:** ${result.extractedAt}\n`;
    if (result.metadata.author) content += `- **Author:** ${result.metadata.author}\n`;
    if (result.metadata.publishedDate) content += `- **Published:** ${result.metadata.publishedDate}\n`;
    content += `- **Size:** ${result.size} bytes\n\n---\n\n`;
  }

  switch (options.format) {
    case 'markdown':
      content += result.content;
      if (result.tables.length) {
        content += '\n\n## Tables\n\n';
        for (const t of result.tables) {
          content += tableToMarkdown(t.headers, t.rows, t.caption);
        }
      }
      break;

    case 'text':
      content += result.text;
      break;

    case 'xml':
      content = htmlToXml(`<html><head><title>${result.title}</title></head><body>${result.content}</body></html>`, options.xmlRoot || 'document');
      break;

    case 'json':
      content = JSON.stringify({
        title: result.title,
        url: result.url,
        metadata: result.metadata,
        content: result.content,
        links: result.links,
        images: result.images,
        tables: result.tables,
        extractedAt: result.extractedAt,
        duration: result.duration,
      }, null, options.pretty ? 2 : undefined);
      break;

    case 'redis':
      content = htmlToRedisJson(`<html><head><title>${result.title}</title></head><body>${result.content}</body></html>`, options.redisKey || `page:${encodeURIComponent(result.url)}`);
      break;
  }

  const chunks = options.maxChunkSize ? chunkText(content, options.maxChunkSize) : [];

  const output: SerializedOutput = {
    format: options.format,
    content,
    chunks: chunks.length ? chunks : undefined,
    size: content.length,
  };

  if (options.includeMetadata) {
    output.metadata = {
      title: result.title,
      url: result.url,
      format: result.format,
      extractedAt: result.extractedAt,
      duration: result.duration,
      linkCount: result.links.length,
      imageCount: result.images.length,
      tableCount: result.tables.length,
    };
  }

  return output;
}

export function serializeHtml(html: string, options: SerializeOptions): SerializedOutput {
  const content = (() => {
    switch (options.format) {
      case 'markdown': return htmlToMarkdown(html);
      case 'xml': return htmlToXml(html, options.xmlRoot || 'document');
      case 'json': return JSON.stringify({ html }, null, options.pretty ? 2 : undefined);
      case 'redis': return htmlToRedisJson(html, options.redisKey || 'page:1');
      case 'text': return plainText(html);
      default: return plainText(html);
    }
  })();

  const chunks = options.maxChunkSize ? chunkText(content, options.maxChunkSize) : [];

  return {
    format: options.format,
    content,
    chunks: chunks.length ? chunks : undefined,
    size: content.length,
  };
}
