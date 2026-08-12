import { scrapeUrl, scrapeHtml } from '../scrape.js';
import { serializeResult } from '../serialize.js';
import { formatForAgent } from '../agent.js';

const TEST_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>DevThink WebScrape - Documentation</title>
  <meta name="description" content="Web scraping toolkit for AI agents">
  <meta name="author" content="DevThink Team">
</head>
<body>
  <h1>DevThink WebScrape</h1>
  <p>An AI-powered web scraping toolkit powered by Playwright.</p>
  <h2>Features</h2>
  <ul>
    <li>Agent Browser with Playwright</li>
    <li>Multi-format serialization (Markdown, XML, JSON, Redis)</li>
    <li>AI agent-friendly output</li>
    <li>Pygame integration for rendering</li>
  </ul>
  <h2>Quick Start</h2>
  <pre><code>npm install @devthink/webscrape</code></pre>
  <p>Visit <a href="https://github.com/devthink/webscrape">GitHub</a> for more info.</p>
  <table>
    <thead><tr><th>Format</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>Markdown</td><td>Clean markdown output</td></tr>
      <tr><td>JSON</td><td>Structured data</td></tr>
      <tr><td>XML</td><td>Hierarchical format</td></tr>
      <tr><td>Redis</td><td>JSON.SET commands</td></tr>
    </tbody>
  </table>
</body>
</html>`;

async function main() {
  console.log('=== Scrape HTML ===');
  const result = await scrapeHtml(TEST_HTML, {
    extractLinks: true,
    extractImages: true,
    extractTables: true,
    format: 'markdown',
  });
  console.log(`Title: ${result.title}`);
  console.log(`Links: ${result.links.length}`);
  console.log(`Images: ${result.images.length}`);
  console.log(`Tables: ${result.tables.length}`);
  console.log(`Duration: ${result.duration}ms`);
  console.log(`Size: ${result.size} bytes`);
  console.log(`\n--- Markdown ---\n${result.content.slice(0, 500)}...`);

  console.log('\n\n=== Serialize to JSON ===');
  const json = serializeResult(result, { format: 'json', pretty: true, includeMetadata: true });
  console.log(json.content.slice(0, 500));

  console.log('\n\n=== Format for Agent ===');
  const agent = formatForAgent(result);
  console.log(`Summary: ${agent.summary}`);
  console.log(`Key Points: ${agent.keyPoints.length}`);
  console.log(`Tokens: ${agent.tokens}`);
  console.log(`\n${agent.content.slice(0, 500)}...`);
}

main().catch(console.error);
