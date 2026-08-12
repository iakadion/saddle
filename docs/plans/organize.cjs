const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // docs/plans
const MESSY = path.join(ROOT, 'messy');
const APPLY = process.argv.includes('--apply');

// Boilerplate that pollutes the messy files ("mocado"):
//  - the whole V8-FLAT preamble block
//  - the repeated "SQL Sentido ..." template fragment
function isBoilerplateLine(l) {
  return (
    /V8 ?FLAT/i.test(l) ||
    /Este arquivo faz parte da estrutura/i.test(l) ||
    /Todo conteudo V1-V7/i.test(l) ||
    /migrado para arquivos planos numerados/i.test(l) ||
    /^>\s*V8/i.test(l) ||
    /^Regra:/i.test(l) ||
    /^-\s*(NOME|SEM|Flat)\b/i.test(l) ||
    /Conteudo original de:/i.test(l) ||
    /^SQL Sentido/i.test(l) ||
    /^E DDL\. E CREATE/i.test(l) ||
    /^Trigger: \/api\/init/i.test(l)
  );
}

// strip every boilerplate line, collapse 3+ blank lines into 2, trim
function stripStub(text) {
  const stripped = text
    .split(/\r?\n/)
    .filter((l) => !isBoilerplateLine(l))
    .join('\n');
  return stripped.replace(/\n{3,}/g, '\n\n').trim() + (stripped.includes('\n') ? '\n' : '');
}

// a file is a pure stub if, after stripping boilerplate, only a title/whitespace remains
function isStub(text) {
  const body = stripStub(text)
    .replace(/^#{1,6}\s.*$/m, '')
    .replace(/[\r\n#*`>\-\s]/g, '')
    .trim();
  return body.length < 50;
}

const normExt = (n) => path.extname(n).toLowerCase().replace(/^\./, '');
const hash = (b) => crypto.createHash('sha256').update(b).digest('hex');

// canonical docs (md/txt) -> numbered plans doc. TXT and MD are the same: result is MD.
const DOCS = [
  ['README.md', '47.multiforge.readme.md'],
  ['V4 TEORIA COMPLETA.md', '48.theory.v4.repo.os.md'],
  ['V5 THIRD PARTY.md', '49.third.party.infra.md'],
  ['V6 FILE AS COMPUTE.md', '50.file.as.compute.md'],
  ['ARCHITECTURE.md', '51.architecture.virtual.processor.md'],
  ['000 Manifesto V8 Flat.txt', '52.manifesto.v8.md'],
  ['001 Documentacao Objetivo.md', '53.objective.md'],
  ['002 Documentacao Arquitetura Flat.md', '54.architecture.flat.md'],
  ['003 Documentacao V7 Postmortem Pastas.md', '55.v7.postmortem.md'],
  ['004 Documentacao Regras Nomenclatura.md', '56.naming.rules.md'],
  ['005 Documentacao Indice Completo.md', '57.index.complete.md'],
  ['10 CDNS.md', '58.cdn.list.md'],
  ['SQL FRAMEWORKS.md', '59.sql.frameworks.md'],
  ['1 sql thirdparty.md', '60.sql.thirdparty.md'],
  ['1 Objetivo.md', '61.objective.multiforge.md'],
  ['1 huggingface upload.md', '62.huggingface.upload.md'],
  ['1 kaggle upload.md', '63.kaggle.upload.md'],
  ['1 npm storage.md', '64.npm.storage.md'],
  ['1 rclone terabox.md', '65.rclone.terabox.md'],
  ['Human-Operator-Relatório-Completo.md', '69.report.human.operator.md'],
  ['Relatório-Brain2Qwerty-+-Acupuntura-vs-EMS.md', '70.report.brain2qwerty.ems.md'],
  ['Relatório-HD-Infinito-e-VRAM-Limites-e-Arquitetura-Viável.md', '71.report.hd.infinito.vram.md'],
  ['Plano-30-Soluções-HD-Infinito-via-Node.md', '72.plan.hd.infinito.node.md'],
  ['Plano-de-Tópicos-Sci-Fi-com-Repos.md', '73.plan.scifi.repos.md'],
];
const DOC_SRC_SET = new Set(DOCS.map((d) => d[0]));

// stale stub-topic fragments (011-050) are routed into these consolidation docs
const TODO_BASE = {
  '66.buckets.and.models.todo.md':
    '# Buckets & Models (TODO)\n\nConsolidated placeholder for stub topics originally in `docs/plans/messy` (011-018).\n\n- Hugging Face Datasets bucket\n- Hugging Face Models bucket\n- Cloudflare R2 config\n- Local file system\n- Whisper transcription\n- Embeddings / vectors\n- LLM classification\n- Vision OCR\n\nSee also: `10.cloudinary.storage.md`, `08.production.infra.md`.',
  '67.database.todo.md':
    '# Database (TODO)\n\nConsolidated placeholder for stub topics originally in `docs/plans/messy` (019-025).\n\n- Prisma schema\n- Drizzle schema\n- SQLite local\n- Turso / libSQL\n- Postgres Neon\n- Auto migrations\n- BigInt pointers\n\nSee also: `09.database.schema.md`, `06.dependencies.md`.',
  '68.deploy.packages.todo.md':
    '# Deploy & Packages (TODO)\n\nConsolidated placeholder for stub topics originally in `docs/plans/messy` (032-050).\n\n- Vercel config\n- Package scripts\n- Env vars\n- Build pipeline\n- Packages: better-sqlite3, libsql-client, drizzle-orm, prisma-client, vercel-blob, netlify-blobs, unstorage, piscina, p-queue, isolated-vm\n- Storage queue / atomic rename / pending jobs\n\nSee also: `37.deploystrategy.md`, `40.npm.publish.md`, `09.database.schema.md`, `21.research.batch.concurrency.md`, `04.research.sandbox.ai.md`, `24.research.memory.persistence.md`.',
};
const TODO_ORDER = [
  '66.buckets.and.models.todo.md',
  '67.database.todo.md',
  '68.deploy.packages.todo.md',
];
const notesByTodo = {
  '66.buckets.and.models.todo.md': new Map(),
  '67.database.todo.md': new Map(),
  '68.deploy.packages.todo.md': new Map(),
};
function routeNote(dest, h, content) {
  const m = notesByTodo[dest];
  if (!m.has(h)) m.set(h, content);
}

// merged single-file name per code extension (formats kept separate)
const CODE_NAME = {
  ts: 'saddle.ts',
  sh: 'script.sh',
  py: 'farm.py',
  prisma: 'schema.prisma',
  yml: 'workflows.yml',
  yaml: 'workflows.yaml',
};

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full).forEach((x) => out.push(x));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

const all = walk(MESSY);
const actions = [];
const outputs = []; // { dest, content }
const codeByExt = {};
const htmlSeen = new Set();
const htmlOut = [];
const mdDocSeen = new Set();
let docStray = 74;
let nDoc = 0;
let nCode = 0;
let nHtml = 0;

// 1) canonical docs
for (const [src, dest] of DOCS) {
  const abs = path.join(MESSY, src);
  if (!fs.existsSync(abs)) {
    actions.push(`MISSING ${src}`);
    continue;
  }
  let raw;
  try {
    raw = fs.readFileSync(abs, 'utf8');
  } catch {
    actions.push(`READERR ${src}`);
    continue;
  }
  const clean = stripStub(raw);
  if (isStub(clean)) {
    actions.push(`SKIP-STUB ${src}`);
    continue;
  }
  mdDocSeen.add(hash(Buffer.from(clean)));
  outputs.push({ dest, content: clean });
  nDoc++;
  actions.push(`DOC    ${src} -> ${dest}`);
}

// 2) everything else: merge code per ext, keep html separate, catch stray md/txt
for (const f of all) {
  const rel = path.relative(MESSY, f);
  const ext = normExt(f);
  let raw;
  try {
    raw = fs.readFileSync(f, 'utf8');
  } catch {
    continue; // binary / unreadable -> skip
  }
  const clean = stripStub(raw);
  if (isStub(clean)) continue; // drop stubs (incl. the "SQL Sentido" template-only files)

  if (ext === 'md' || ext === 'txt') {
    if (DOC_SRC_SET.has(rel)) continue; // already handled as canonical doc
    const h = hash(Buffer.from(clean));
    const n = parseInt((path.basename(f).match(/^(\d+)/) || [])[1] || '0', 10);
    if (n >= 11 && n <= 18) { routeNote('66.buckets.and.models.todo.md', h, clean); actions.push(`NOTE   66 <- ${rel}`); continue; }
    if (n >= 19 && n <= 25) { routeNote('67.database.todo.md', h, clean); actions.push(`NOTE   67 <- ${rel}`); continue; }
    if (n >= 32 && n <= 50) { routeNote('68.deploy.packages.todo.md', h, clean); actions.push(`NOTE   68 <- ${rel}`); continue; }
    // other genuinely-real md/txt -> keep as separate numbered doc
    if (mdDocSeen.has(h)) continue;
    mdDocSeen.add(h);
    const base = path
      .basename(f)
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.');
    const dest = `${docStray++}.${base}.md`;
    outputs.push({ dest, content: clean });
    nDoc++;
    actions.push(`DOC*   ${rel} -> ${dest}`);
    continue;
  }

  if (ext === 'html') {
    const h = hash(Buffer.from(clean));
    if (htmlSeen.has(h)) continue;
    htmlSeen.add(h);
    const name = path.basename(f).replace(/[ ()]/g, '_');
    htmlOut.push({ name, content: clean });
    nHtml++;
    actions.push(`HTML   ${rel}`);
    continue;
  }

  // code / other text formats -> merge into one file per extension (no name prefixes)
  const arr = codeByExt[ext] || (codeByExt[ext] = []);
  const h = hash(Buffer.from(clean));
  if (arr.some((x) => x.hash === h)) continue; // skip byte-identical copies
  arr.push({ content: clean, hash: h });
}

// 3) build merged code files (one per extension; concatenated clean content, skip empty)
for (const ext of Object.keys(codeByExt).sort()) {
  const parts = codeByExt[ext];
  const body = parts
    .map((p) => p.content)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (isStub(body)) {
    actions.push(`SKIP-MERGE ${ext} (boilerplate only)`);
    continue;
  }
  const name = CODE_NAME[ext] || `all.${ext}`;
  outputs.push({ dest: `sources/${name}`, content: body + '\n' });
  nCode++;
  actions.push(`MERGE  ${ext} (${parts.length}) -> sources/${name}`);
}

// 4) html outputs
for (const h of htmlOut) {
  outputs.push({ dest: `sources/html/${h.name}`, content: h.content });
}

// 5) consolidation docs (66/67/68) with any captured real fragments
const todoDocs = TODO_ORDER.map((dest) => {
  let c = TODO_BASE[dest];
  const notes = [...notesByTodo[dest].values()];
  if (notes.length) {
    c += '\n\n## Captured notes (real fragments from messy/)\n';
    for (const note of notes) c += `\n---\n\n${note}\n`;
  }
  return [dest, c];
});
for (const [dest, content] of todoDocs) {
  outputs.push({ dest, content });
  actions.push(`CREATE ${dest}`);
}

const lines = [...actions];
if (APPLY) {
  const srcDir = path.join(ROOT, 'sources');
  if (fs.existsSync(srcDir)) fs.rmSync(srcDir, { recursive: true, force: true });
  for (const o of outputs) {
    const p = path.join(ROOT, o.dest);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, o.content);
  }
  try {
    fs.rmSync(MESSY, { recursive: true, force: true });
    lines.push('removed messy/');
  } catch (e) {
    lines.push('messy/ not removed: ' + e.message);
  }
}
lines.push('');
lines.push(
  `${APPLY ? '[APPLY] ' : '[DRY-RUN] '}docs=${nDoc} codeMerge(exts)=${nCode} html=${nHtml} todo=${todoDocs.length} totalOutputs=${outputs.length}`
);
console.log(lines.join('\n'));
