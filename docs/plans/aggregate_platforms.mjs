import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'C:/allan2/devthink/saddle/docs/plans/sites.md';
const OUT = 'C:/allan2/devthink/saddle/docs/plans/platforms.md';

const raw = readFileSync(FILE, 'utf8');
const lines = raw.split(/\r?\n/);

const PASTE_HEAD = /^#\s*Plataformas\s*\/\s*Sites\s*extraídos\s*de\s*sites\.md/i;

let category = 'Geral';
let inPaste = false;
const entries = []; // {name, url|null, cat, line}
let totalLines = lines.length;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineno = i + 1;

  if (PASTE_HEAD.test(line)) {
    inPaste = true;
  }
  // tudo a partir do primeiro bloco colado (10446+) são cópias de outputs anteriores
  if (inPaste) continue;

  const h = /^\s*(#{1,6})\s+(.+)$/.exec(line);
  if (h) {
    const htext = h[2].trim();
    if (!/^(ou|ou,|e)\s*$/i.test(htext)) {
      category = htext;
    }
    continue;
  }

  const trimmed = line.trim();
  if (!trimmed || /^```/.test(trimmed)) continue;
  // pula checkboxes de tarefa ("- [ ]", "- [x]") que são instruções, não sites
  if (/^[-*+]\s*\[[ xX]?\]/.test(trimmed)) continue;
  // pula rótulos de seção com emoji no início (separadores visuais do fonte)
  if (/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(trimmed)) continue;
  // pula linhas de tabela markdown e divisores
  if (trimmed.includes('|')) continue;

  // URL(s) present on this line
  const urls = [...trimmed.matchAll(/https?:\/\/[^\s)\]">'”]+/gi)].map((m) => m[0]);

  // 1) markdown link [Name](url)
  const mdLinks = [...trimmed.matchAll(/\[([^\]]+)\]\((\s*https?:\/\/[^)\s]+)\)/g)];
  for (const m of mdLinks) {
    entries.push({ name: clean(m[1]), url: m[2].trim(), cat: category, line: lineno });
  }

  // 2) "**Name**" appears -> a named entry (URL colhida da mesma linha ou é SEMURL)
  const bold = /(?:\*\*([^*]+)\*\*|\*\*([^*]+)\*\*)/.exec(trimmed);
  const arrow = /([A-Za-z0-9][^\n→]{1,120})\s*→\s*/.exec(trimmed);

  if (bold) {
    const nm = clean(bold[1] || bold[2]);
    const url = urls[0] || null;
    const isProse = nm.length > 120 || /\?/.test(nm)
      || /(entendeu|quero|vamos|mano|continuar|posso|não é|pesquisar|opções|exluindo|misturad|duplicad|de novo|basicamente|Sim, |Vou fazer)/i.test(nm);
    if (nm && !isProse) entries.push({ name: nm, url, cat: category, line: lineno });
  } else if (arrow && !mdLinks.length) {
    const nm = clean(arrow[1]);
    const url = urls[0] || null;
    const isProse = nm.length > 120 || /\?/.test(nm)
      || /(entendeu|quero|vamos|mano|continuar|posso|não é|pesquisar|opções|exluindo|misturad|duplicad|de novo|basicamente|Sim, |Vou fazer|Aqui vai|lista com os hiperlinks|Trabalhou por)/i.test(nm);
    if (nm && nm.length > 2 && !isProse) entries.push({ name: nm, url, cat: category, line: lineno });
  } else if (urls.length && !mdLinks.length && !bold) {
    // bare URL line -> nome = tem um rótulo no início da linha, senão domínio
    const label = trimmed.replace(/https?:\/\/\S+/gi, ' ').trim();
    const url = urls[0];
    const isPlaceholder = /^(URL|Link|Hiperlink|url|link)\s*[:.\-]?\s*$/i.test(label) || /^(URL|Link|Hiperlink)/i.test(label) && label.length < 20;
    const name = label && label.length <= 160 && !label.startsWith('wget') && !isPlaceholder
      ? clean(label.replace(/^[-\d.\s]+/, ''))
      : hostname(url);
    if (name && name.length > 1) entries.push({ name, url, cat: category, line: lineno });
  } else if (!urls.length && !inPaste) {
    // possível nome sem link: linha curta, não é bloco blacklist gigante
    if (trimmed.length >= 4 && trimmed.length <= 90 && /^[^A-ZÁÉÍÓÚÀÂÊÔa-záéíóúàâêôç]/i.test(trimmed)
        && !/[?].*?$/.test(trimmed)
        && !/(de novo|misturad|continuar|posso |quer\b|beleza|ok,?|vamos|entendi|acho que|acho\b)/i.test(trimmed)
        && !/^eu |^tem |^mano|^não |^é |^vou |^só |^sim |^quer|^posso|^gosto|^preciso|^você|^pode|^pega|^mais de|^tá /i.test(trimmed)) {
      const nm = clean(trimmed).replace(/^(Lista completa|Obs|Quer|Beleza|Vou|Posso|Aqui|Mais|Outras|Extras|Plataformas|Nomes|Todos|Não|É|Daqui|Não\s|Posso|Pode|Tem|Acho|Separe|Foque|Estou|Peguei|Traga|Gostaria|Anote|Seguem|Encontrei|São|Além)/i, '').trim();
      if (nm.length > 2 && nm.length <= 140) {
        entries.push({ name: nm, url: null, cat: category, line: lineno });
      }
    }
  }
}

function clean(s) {
  return String(s).replace(/^[\s*\-–—•\d.\]]+|[\s*\]'”".,;:]+$/g, '').trim();
}
function hostname(u) {
  try { return new URL(u).host; } catch { return u; }
}

// ---- DEDUP: por (name lower), mantendo o que tiver URL; na mesma categoria
const seen = new Map();
for (const e of entries) {
  const key = e.name.toLowerCase();
  if (!seen.has(key)) { seen.set(key, e); continue; }
  const cur = seen.get(key);
  if (!cur.url && e.url) seen.set(key, e);
}

// ---- Grupo por categoria
const byCat = new Map();
for (const e of seen.values()) {
  if (!byCat.has(e.cat)) byCat.set(e.cat, []);
  byCat.get(e.cat).push(e);
}

const catNames = [...byCat.keys()].sort((a, b) => a.localeCompare(b));

const out = [];
out.push('# Plataformas / Sites extraídos de sites.md (agrupado por categoria)');
out.push(`Total de plataformas (agrupadas): ${seen.size}`);
out.push(`Total de categorias: ${byCat.size}`);
out.push('');

let withUrl = 0, withoutUrl = 0;
for (const cat of catNames) {
  const list = byCat.get(cat).sort((a, b) => a.name.localeCompare(b.name));
  out.push(`## ${cat}`);
  out.push('');
  for (const e of list) {
    if (e.url) { withUrl++; out.push(`### ${e.name}`); out.push(`URL: ${e.url}`); }
    else { withoutUrl++; out.push(`### ${e.name} _(sem link)_`); }
    out.push('');
  }
}

out.push('## Nomes citados sem link (faltando URL)');
out.push('');
for (const e of seen.values()) {
  if (!e.url) out.push(`- ${e.name} _(linha ${e.line})_`);
}
out.push('');

writeFileSync(OUT, out.join('\n'), 'utf8');
console.log(`Linhas lidas: ${totalLines}`);
console.log(`Total de plataformas (agrupadas): ${seen.size}`);
console.log(`Total de categorias: ${byCat.size}`);
console.log(`Com URL: ${withUrl} | Sem URL: ${withoutUrl}`);