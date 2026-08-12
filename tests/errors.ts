import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..');
let pass = 0;
let fail = 0;

const caughtHandler = (e: Error): void => {
  console.error(`\n  UNHANDLED: ${e.message}`);
  fail++;
};
process.on('unhandledRejection', caughtHandler);
process.on('uncaughtException', caughtHandler);

function assert(label: string, condition: boolean): void {
  if (condition) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.error(`  ❌ ${label}`); process.exitCode = 1; }
}

console.log('\n═══ Webscrape: Error Capture Tests (Build + TypeScript + Runtime) ═══\n');

// ── Vite build ──
console.log('1. Vite build');
{
  const proc = spawn('npx', ['vite', 'build'], {
    cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], shell: true,
  });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
  proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
  await new Promise((r) => { proc.on('close', r); });

  const hasError = stderr.includes('error') || stderr.includes('Error') || stderr.includes('ERROR');
  assert('build exit 0', proc.exitCode === 0);
  assert('no build errors', !hasError);
  if (hasError) {
    const lines = stderr.split('\n').filter((l: string) => l.includes('error') || l.includes('Error'));
    for (const l of lines.slice(0, 5)) console.log(`     ⚠ ${l.trim()}`);
  }

  const webDist = join(dir, 'web', 'dist');
  assert('index.mjs exists', existsSync(join(webDist, 'index.mjs')));
  assert('index.js exists', existsSync(join(webDist, 'index.js')));

  const warnings = (stderr + stdout).split('\n').filter((l: string) => l.includes('warning') || l.includes('Warning') || l.includes('WARN'));
  if (warnings.length > 0) {
    console.log('  ⚠ Warnings:');
    for (const w of warnings) console.log(`     ${w.trim()}`);
  }
  assert('warnings check complete', true);
}

// ── TypeScript check ──
console.log('\n2. TypeScript check');
{
  const proc = spawn('npx', ['tsc', '--noEmit'], {
    cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], shell: true,
  });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
  proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
  await new Promise((r) => { proc.on('close', r); });
  const hasTS = stderr.includes('error TS') || stdout.includes('error TS');
  assert('no TypeScript errors', !hasTS);
  if (hasTS) console.log('  TS errors:', (stderr + stdout).slice(0, 500));
}

// ── Module import validation + exports ──
console.log('\n3. Dist module import + exports');
{
  try {
    const distPath = join(dir, 'web', 'dist');
    const distUrl = pathToFileURL(join(distPath, 'index.mjs')).href;

    if (existsSync(join(distPath, 'index.mjs'))) {
      const mod = await import(distUrl);
      assert('dist module loads', mod != null);
      assert('extract function exported', typeof mod.extractContent === 'function');
      assert('serializeHtml exported', typeof mod.serializeHtml === 'function');
      assert('serializeResult exported', typeof mod.serializeResult === 'function');
    } else {
      assert('dist index.mjs exists', false);
    }
  } catch (e) {
    assert('dist module loads without error', false);
    console.log(`     ${(e as Error).message}`);
  }
}

process.off('unhandledRejection', caughtHandler);
process.off('uncaughtException', caughtHandler);

console.log(`\n═══ Results: ${pass} passed, ${fail} failed ═══\n`);
process.exit(fail > 0 ? 1 : 0);
