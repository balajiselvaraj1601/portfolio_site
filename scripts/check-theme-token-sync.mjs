#!/usr/bin/env node
/**
 * SSOT drift check: THEME_BG in src/lib/theme-colors.ts must match the --bg
 * values in the light and dark theme blocks of src/styles/global.css. Fails
 * (exit 1) on any mismatch, missing key, or unparseable source. Wired into
 * `npm run verify`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const tsSource = readFileSync(join(root, 'src/lib/theme-colors.ts'), 'utf8');
const cssSource = readFileSync(join(root, 'src/styles/global.css'), 'utf8');

const tsBlock = tsSource.match(/THEME_BG\s*=\s*\{([\s\S]*?)\}\s*as const/);
if (!tsBlock) {
  console.error(
    'check-theme-token-sync: could not locate THEME_BG in src/lib/theme-colors.ts'
  );
  process.exit(1);
}

const tsTokens = new Map(
  [...tsBlock[1].matchAll(/(\w+)\s*:\s*['"]([^'"]+)['"]/g)].map(([, k, v]) => [
    k,
    v.toLowerCase(),
  ])
);

function cssBg(theme) {
  const block = cssSource.match(
    new RegExp(`:root\\[data-theme=['"]${theme}['"]\\][^{]*\\{([\\s\\S]*?)\\}`)
  );
  if (!block) return undefined;
  const bg = block[1].match(/--bg\s*:\s*([^;]+);/);
  return bg
    ? bg[1]
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
        .toLowerCase()
    : undefined;
}

const cssTokens = new Map();
for (const theme of ['light', 'dark']) {
  const value = cssBg(theme);
  if (value !== undefined) cssTokens.set(theme, value);
}

const errors = [];
for (const [key, tsValue] of tsTokens) {
  if (!cssTokens.has(key)) {
    errors.push(
      `--bg for "${key}" theme missing in global.css (THEME_BG has ${tsValue})`
    );
  } else if (cssTokens.get(key) !== tsValue) {
    errors.push(
      `"${key}": global.css --bg is ${cssTokens.get(key)}, THEME_BG.${key} is ${tsValue}`
    );
  }
}
for (const key of cssTokens.keys()) {
  if (!tsTokens.has(key)) {
    errors.push(
      `THEME_BG missing "${key}" (global.css defines --bg for that theme)`
    );
  }
}

if (tsTokens.size === 0 || cssTokens.size === 0) {
  errors.push(
    `parsed ${tsTokens.size} TS tokens and ${cssTokens.size} CSS tokens — parser drift?`
  );
}

if (errors.length > 0) {
  console.error('check-theme-token-sync: FAIL');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `check-theme-token-sync: OK (${tsTokens.size} tokens in sync: ${[...tsTokens.keys()].join(', ')})`
);
