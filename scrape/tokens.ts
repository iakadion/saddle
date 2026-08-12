export type ModelType = 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'gemini' | 'default';

const MODEL_TOKEN_RATIOS: Record<ModelType, number> = {
  'gpt-4o': 3.5,
  'gpt-4': 3.5,
  'gpt-3.5-turbo': 4,
  'claude': 3.2,
  'gemini': 3.5,
  'default': 4,
};

export function estimateTokens(text: string, model: ModelType = 'default'): number {
  const ratio = MODEL_TOKEN_RATIOS[model] || 4;
  return Math.ceil(text.length / ratio);
}

export function countTokens(text: string, model: ModelType = 'default'): number {
  return estimateTokens(text, model);
}

export function fitsInContext(text: string, maxTokens: number, model: ModelType = 'default'): boolean {
  return estimateTokens(text, model) <= maxTokens;
}

export function truncateToTokens(text: string, maxTokens: number, model: ModelType = 'default'): string {
  const estimatedTokens = estimateTokens(text, model);
  if (estimatedTokens <= maxTokens) return text;
  const charLimit = Math.floor(maxTokens * (MODEL_TOKEN_RATIOS[model] || 4));
  return text.slice(0, charLimit) + '...';
}

export function tokenCost(text: string, model: ModelType, pricePer1kTokens: number): number {
  const tokens = estimateTokens(text, model);
  return (tokens / 1000) * pricePer1kTokens;
}

export const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
};
