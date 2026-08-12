#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WS_ROOT = join(__dirname, '..');

let passed = 0;
let failed = 0;

async function run(label: string, cmd: string, args: string[], opts: Record<string, unknown> = {}): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n── ${label} ──\n`);
    const proc = spawn(cmd, args, {
      cwd: WS_ROOT,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env },
      ...opts,
    });
    proc.on('close', (code: number | null) => {
      if (code === 0) passed++;
      else failed++;
      resolve(code === 0);
    });
  });
}

console.log('='.repeat(55));
console.log('  DevThink Webscrape — Test Runner');
console.log('='.repeat(55));
console.log(`  CWD: ${WS_ROOT}`);
console.log('='.repeat(55));

const start = Date.now();

await run('Vitest (core + agent-utils)', 'npx', ['vitest', 'run']);

const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log();
console.log('='.repeat(55));
console.log(`  Results: ${passed} passed, ${failed} failed, ${elapsed}s`);
console.log('='.repeat(55));

process.exit(failed > 0 ? 1 : 0);
