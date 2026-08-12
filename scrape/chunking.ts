import { estimateTokens } from './tokens.js';

export interface ChunkOptions {
  maxTokens?: number;
  overlapTokens?: number;
  preserveCodeBlocks?: boolean;
  includeHeadingPath?: boolean;
}

export interface Chunk {
  content: string;
  headingPath: string[];
  tokenCount: number;
  index: number;
}

const DEFAULT_CHUNK_OPTIONS: Required<ChunkOptions> = {
  maxTokens: 512,
  overlapTokens: 50,
  preserveCodeBlocks: true,
  includeHeadingPath: true,
};

function splitByHeaders(markdown: string): { heading: string; level: number; content: string }[] {
  const sections: { heading: string; level: number; content: string }[] = [];
  const lines = markdown.split('\n');
  let currentHeading = '';
  let currentLevel = 0;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      if (currentContent.length > 0 || currentHeading) {
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          content: currentContent.join('\n').trim(),
        });
      }
      currentLevel = headerMatch[1].length;
      currentHeading = headerMatch[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0 || currentHeading) {
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
}

function splitByParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0);
}

function splitBySentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

export function chunkMarkdown(markdown: string, options: ChunkOptions = {}): Chunk[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };
  const chunks: Chunk[] = [];
  const sections = splitByHeaders(markdown);
  const headingPath: string[] = [];
  let headingDepth = 0;

  for (const section of sections) {
    while (headingDepth > 0 && headingDepth >= section.level) {
      headingDepth--;
      headingPath.pop();
    }
    if (section.heading) {
      headingDepth = section.level;
      headingPath.push(section.heading);
    }

    const sectionText = section.heading ? `#${'#'.repeat(section.level - 1)} ${section.heading}\n\n${section.content}` : section.content;

    if (estimateTokens(sectionText) <= opts.maxTokens) {
      chunks.push({
        content: sectionText,
        headingPath: opts.includeHeadingPath ? [...headingPath] : [],
        tokenCount: estimateTokens(sectionText),
        index: chunks.length,
      });
    } else {
      const paragraphs = splitByParagraphs(sectionText);
      let currentChunk = '';

      for (const paragraph of paragraphs) {
        const testChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

        if (estimateTokens(testChunk) <= opts.maxTokens) {
          currentChunk = testChunk;
        } else {
          if (currentChunk) {
            chunks.push({
              content: currentChunk,
              headingPath: opts.includeHeadingPath ? [...headingPath] : [],
              tokenCount: estimateTokens(currentChunk),
              index: chunks.length,
            });
          }

          if (estimateTokens(paragraph) > opts.maxTokens) {
            const sentences = splitBySentences(paragraph);
            let sentenceChunk = '';
            for (const sentence of sentences) {
              const testSentence = sentenceChunk ? `${sentenceChunk} ${sentence}` : sentence;
              if (estimateTokens(testSentence) <= opts.maxTokens) {
                sentenceChunk = testSentence;
              } else {
                if (sentenceChunk) {
                  chunks.push({
                    content: sentenceChunk,
                    headingPath: opts.includeHeadingPath ? [...headingPath] : [],
                    tokenCount: estimateTokens(sentenceChunk),
                    index: chunks.length,
                  });
                }
                sentenceChunk = sentence;
              }
            }
            currentChunk = sentenceChunk;
          } else {
            currentChunk = paragraph;
          }
        }
      }

      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          headingPath: opts.includeHeadingPath ? [...headingPath] : [],
          tokenCount: estimateTokens(currentChunk),
          index: chunks.length,
        });
      }
    }
  }

  return chunks;
}

export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };
  const chunks: Chunk[] = [];
  const paragraphs = splitByParagraphs(text);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const testChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    if (estimateTokens(testChunk) <= opts.maxTokens) {
      currentChunk = testChunk;
    } else {
      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          headingPath: [],
          tokenCount: estimateTokens(currentChunk),
          index: chunks.length,
        });
      }
      currentChunk = paragraph;
    }
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      headingPath: [],
      tokenCount: estimateTokens(currentChunk),
      index: chunks.length,
    });
  }

  return chunks;
}

export function formatChunksForRAG(chunks: Chunk[]): string {
  return chunks.map(chunk => {
    const heading = chunk.headingPath.length > 0 ? `## ${chunk.headingPath.join(' > ')}\n\n` : '';
    return `${heading}${chunk.content}`;
  }).join('\n\n---\n\n');
}
