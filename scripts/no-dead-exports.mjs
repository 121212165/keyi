#!/usr/bin/env node
// 防止 3400 行不可达代码重演：packages/* 的导出必须被仓库内至少一处引用。
// 用法：pnpm dead-export-check [--strict]
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 以脚本自身位置定位仓库根，避免“在哪个目录调用”影响结果
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.turbo', '.git', '.next'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.tsx?$/.test(e.name)) yield p;
  }
}

const files = [];
for (const pkg of ['frontend/src']) {
  for await (const f of walk(join(ROOT, pkg))) files.push(f);
}

const sources = new Map();
for (const f of files) sources.set(f, await readFile(f, 'utf8'));

const exportNames = new Map();
for (const [f, src] of sources) {
  if (f.endsWith('index.ts') || f.endsWith('index.tsx')) continue;
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|class|type|interface|enum)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const n = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (n && n !== 'default') names.add(n);
    }
  }
  for (const n of names) exportNames.set(n, [...(exportNames.get(n) ?? []), f]);
}

const dead = [];
for (const [name, defs] of exportNames) {
  const used = [...sources].some(([f, src]) => {
    if (defs.includes(f)) return false;
    return new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`).test(src);
  });
  if (!used) dead.push(`${name}  ← ${defs.map((d) => relative(ROOT, d)).join(', ')}`);
}

if (dead.length) {
  console.log(`${dead.length} 个零引用导出：`);
  for (const d of dead.sort()) console.log('  ' + d);
  if (strict) process.exit(1);
} else {
  console.log('零引用导出：0');
}
