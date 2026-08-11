/**
 * token helpers use configurable model ratios and never require a provider tokenizer.
 */
const ratios = Object.freeze({ default: 4, gpt: 3.5, claude: 3.2, gemini: 3.5 });

export function estimatetokens(text, model = "default") { const ratio = ratios[model] ?? ratios.default; return Math.ceil(String(text ?? "").length / ratio); }
export function fitscontext(text, context, model = "default") { return estimatetokens(text, model) <= context; }
export function tokenbudget(text, options = {}) { const tokens = estimatetokens(text, options.model); return { tokens, context: options.context ?? null, fits: options.context == null ? true : tokens <= options.context, remaining: options.context == null ? null : Math.max(0, options.context - tokens) }; }
export function settokenratios(values = {}) { Object.assign(ratios, values); return { ...ratios }; }
