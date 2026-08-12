import type { ScrapeResult, AgentOutput } from './types.js';
import { estimateTokens } from './tokens.js';
import { chunkMarkdown } from './chunking.js';

export interface AgentFormatOptions {
  includeSummary?: boolean;
  includeKeyPoints?: boolean;
  includeUrls?: boolean;
  includeRaw?: boolean;
  maxTokens?: number;
  chunkSize?: number;
  model?: 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'gemini' | 'default';
}

const DEFAULT_OPTIONS: Required<AgentFormatOptions> = {
  includeSummary: true,
  includeKeyPoints: true,
  includeUrls: true,
  includeRaw: true,
  maxTokens: 8000,
  chunkSize: 512,
  model: 'default',
};

function generateSummary(result: ScrapeResult): string {
  const wordCount = result.text.split(/\s+/).length;
  return `This page titled "${result.title}" contains approximately ${wordCount} words with ${result.links.length} links and ${result.images.length} images.`;
}

function generateKeyPoints(result: ScrapeResult): string[] {
  const points: string[] = [];
  const text = result.text.slice(0, 5000);

  if (result.metadata.author) points.push(`Author: ${result.metadata.author}`);
  if (result.metadata.publishedDate) points.push(`Published: ${result.metadata.publishedDate}`);
  if (result.metadata.description) points.push(`Description: ${result.metadata.description.slice(0, 200)}`);

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  for (const s of sentences.slice(0, 5)) {
    const trimmed = s.trim();
    if (trimmed.length > 30) points.push(trimmed);
  }

  return points.slice(0, 8);
}

function buildSystemPrompt(result: ScrapeResult): string {
  let prompt = `# Web Page Content\n\n`;
  prompt += `## Title\n${result.title}\n\n`;
  prompt += `## URL\n${result.url}\n\n`;

  if (result.metadata.description) {
    prompt += `## Description\n${result.metadata.description}\n\n`;
  }

  if (result.tables.length > 0) {
    prompt += `## Tables (${result.tables.length} found)\n`;
    for (const t of result.tables.slice(0, 3)) {
      prompt += `- ${t.caption || 'Unnamed table'}: ${t.headers.join(', ')}\n`;
    }
    prompt += '\n';
  }

  prompt += `## Content\n${result.content}\n\n`;
  return prompt;
}

export function formatForAgent(result: ScrapeResult, options?: AgentFormatOptions): AgentOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let content = '';

  if (opts.includeSummary) {
    content += `## Summary\n${generateSummary(result)}\n\n`;
  }

  if (opts.includeKeyPoints) {
    const points = generateKeyPoints(result);
    content += `## Key Points\n${points.map(p => `- ${p}`).join('\n')}\n\n`;
  }

  if (opts.includeUrls) {
    const externalUrls = result.links.filter(l => l.isExternal).slice(0, 15);
    if (externalUrls.length) {
      content += `## External Links\n${externalUrls.map(l => `- [${l.text || l.href}](${l.href})`).join('\n')}\n\n`;
    }
    const internalUrls = result.links.filter(l => l.isInternal).slice(0, 10);
    if (internalUrls.length) {
      content += `## Internal Links\n${internalUrls.map(l => `- [${l.text || l.href}](${l.href})`).join('\n')}\n\n`;
    }
  }

  if (opts.includeRaw) {
    content += `## Full Content\n${result.content}\n\n`;
  }

  const totalTokens = estimateTokens(content, opts.model);

  if (totalTokens > opts.maxTokens) {
    const charLimit = Math.floor(opts.maxTokens * 4);
    content = content.slice(0, charLimit) + '\n\n... (truncated)';
  }

  const chunks = chunkMarkdown(content, { maxTokens: opts.chunkSize });

  const output: AgentOutput = {
    summary: generateSummary(result),
    content,
    keyPoints: generateKeyPoints(result),
    relevantUrls: result.links.filter(l => l.isExternal).map(l => l.href).slice(0, 10),
    tokens: estimateTokens(content, opts.model),
  };

  if (chunks.length > 1) {
    (output as unknown as Record<string, unknown>).chunks = chunks.map(c => c.content);
  }

  return output;
}

export function buildContext(result: ScrapeResult): string {
  return buildSystemPrompt(result);
}
