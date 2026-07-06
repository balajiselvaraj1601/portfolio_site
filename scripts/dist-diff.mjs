#!/usr/bin/env node
/**
 * Phase-0 dist-diff harness for zero-visual-change refactors.
 *
 * Builds the site, normalizes hash/scope noise out of a COPY of dist/ (never
 * mutates dist/ itself), and diffs it against a stored baseline.
 *
 *   node scripts/dist-diff.mjs --baseline [dir]   capture baseline (default .dist-baseline/)
 *   node scripts/dist-diff.mjs --compare  [dir]   build + diff vs baseline dir
 *   node scripts/dist-diff.mjs --self-test        baseline to tmp, rebuild, compare
 *
 * Normalization (applied to copies):
 *   - /_astro/<name>.<hash>.css|js refs in html/css/js  ->  <name>.HASH.css|js
 *   - data-astro-cid-XXXXXXXX attributes/selectors stripped
 *   - scoped class tokens astro-XXXXXXXX stripped
 *   - html: newline inserted between adjacent tags (text nodes untouched)
 *   - css: newline after each `}` for rule-level diffs
 *   - _astro/ css/js files renamed <name>.HASH.<ext>; same-stem collisions get
 *     a content-sorted ordinal (<name>.HASH.<n>.<ext>) so renames stay
 *     deterministic
 *   - everything else (images, fonts, xml, ...) compared byte-for-byte
 *
 * Exit codes: 0 = no differences, 1 = differences found, 2 = usage/build error.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const DEFAULT_BASELINE = join(root, '.dist-baseline');

const HASH = '[A-Za-z0-9_-]{8}';
const ASSET_REF = new RegExp(`\\.(${HASH})\\.(css|js)\\b`, 'g');
const CID_ATTR = new RegExp(
  `\\s*data-astro-cid-[A-Za-z0-9]{8}(="[^"]*")?`,
  'g'
);
const CID_SELECTOR = new RegExp(`\\[data-astro-cid-[A-Za-z0-9]{8}\\]`, 'g');
const SCOPE_CLASS = new RegExp(`astro-[A-Za-z0-9]{8}`, 'g');
const HASHED_FILE = new RegExp(`^(.+)\\.(${HASH})\\.(css|js)$`);

const MAX_DIFF_LINES_PER_FILE = 120;

function fail(message) {
  console.error(`dist-diff: ${message}`);
  process.exit(2);
}

function runBuild() {
  console.log('dist-diff: running `npm run build`...');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const tail = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
      .split('\n')
      .slice(-30)
      .join('\n');
    fail(`build failed (exit ${result.status}):\n${tail}`);
  }
  console.log('dist-diff: build OK');
}

function walk(dir, prefix = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walk(join(dir, entry.name), rel));
    else files.push(rel);
  }
  return files;
}

function normalizeContent(rel, buffer) {
  if (rel.endsWith('.html')) {
    return normalizeHtml(buffer.toString('utf8'));
  }
  if (rel.endsWith('.css')) {
    return normalizeCss(buffer.toString('utf8'));
  }
  if (rel.endsWith('.js') || rel.endsWith('.mjs')) {
    return normalizeJs(buffer.toString('utf8'));
  }
  return buffer;
}

function stripHashesAndScopes(text) {
  return text
    .replace(ASSET_REF, '.HASH.$2')
    .replace(CID_SELECTOR, '')
    .replace(CID_ATTR, '')
    .replace(SCOPE_CLASS, '');
}

function normalizeHtml(text) {
  // Only split between directly adjacent tags — text nodes stay untouched.
  return stripHashesAndScopes(text).replace(/></g, '>\n<');
}

function normalizeCss(text) {
  return stripHashesAndScopes(text).replace(/\}/g, '}\n');
}

function normalizeJs(text) {
  return stripHashesAndScopes(text);
}

/**
 * Map each dist-relative path to its normalized destination path. _astro
 * css/js bundles lose their hash; same-stem collisions ("two-same-stem-bundle"
 * gotcha) get an ordinal from sorting the colliding files by content.
 */
function planRenames(srcDir, files) {
  const targets = new Map(); // rel -> normalized rel
  const groups = new Map(); // normalized rel -> [rel, ...]
  for (const rel of files) {
    const parts = rel.split('/');
    const name = parts[parts.length - 1];
    const match = parts[0] === '_astro' ? name.match(HASHED_FILE) : null;
    const target = match
      ? [...parts.slice(0, -1), `${match[1]}.HASH.${match[3]}`].join('/')
      : rel;
    targets.set(rel, target);
    if (!groups.has(target)) groups.set(target, []);
    groups.get(target).push(rel);
  }
  for (const [target, members] of groups) {
    if (members.length < 2) continue;
    const sorted = [...members].sort((a, b) =>
      Buffer.compare(
        readFileSync(join(srcDir, a)),
        readFileSync(join(srcDir, b))
      )
    );
    sorted.forEach((rel, index) => {
      targets.set(rel, target.replace(/\.HASH\./, `.HASH.${index}.`));
    });
  }
  return targets;
}

function normalizeDist(srcDir, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const files = walk(srcDir);
  const targets = planRenames(srcDir, files);
  for (const rel of files) {
    const target = targets.get(rel);
    const destination = join(outDir, ...target.split('/'));
    mkdirSync(dirname(destination), { recursive: true });
    const normalized = normalizeContent(rel, readFileSync(join(srcDir, rel)));
    if (typeof normalized === 'string') writeFileSync(destination, normalized);
    else cpSync(join(srcDir, rel), destination);
  }
  return files.length;
}

function printFileDiff(baselinePath, currentPath, rel) {
  const result = spawnSync(
    'diff',
    [
      '-u',
      '--label',
      `baseline/${rel}`,
      '--label',
      `current/${rel}`,
      baselinePath,
      currentPath,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.error) {
    console.log(`  (diff tool unavailable: ${result.error.message})`);
    return;
  }
  const lines = (result.stdout ?? '').split('\n');
  for (const line of lines.slice(0, MAX_DIFF_LINES_PER_FILE)) console.log(line);
  if (lines.length > MAX_DIFF_LINES_PER_FILE) {
    console.log(
      `  ... (${lines.length - MAX_DIFF_LINES_PER_FILE} more diff lines truncated)`
    );
  }
}

function isTextPath(rel) {
  return /\.(html|css|js|mjs|xml|txt|json|svg|webmanifest)$/.test(rel);
}

function compareDirs(baselineDir, currentDir) {
  const baselineFiles = new Set(walk(baselineDir));
  const currentFiles = new Set(walk(currentDir));

  const onlyBaseline = [...baselineFiles].filter((f) => !currentFiles.has(f));
  const onlyCurrent = [...currentFiles].filter((f) => !baselineFiles.has(f));
  const differing = [];

  for (const rel of baselineFiles) {
    if (!currentFiles.has(rel)) continue;
    const a = readFileSync(join(baselineDir, rel));
    const b = readFileSync(join(currentDir, rel));
    if (!a.equals(b)) differing.push(rel);
  }

  if (onlyBaseline.length + onlyCurrent.length + differing.length === 0) {
    console.log(
      `dist-diff: OK — ${currentFiles.size} files, zero differences vs baseline`
    );
    return 0;
  }

  console.log('dist-diff: DIFFERENCES FOUND');
  for (const rel of onlyBaseline) console.log(`  only in baseline: ${rel}`);
  for (const rel of onlyCurrent) console.log(`  only in current:  ${rel}`);
  for (const rel of differing) console.log(`  differs:          ${rel}`);
  console.log('');
  for (const rel of differing) {
    if (isTextPath(rel)) {
      printFileDiff(join(baselineDir, rel), join(currentDir, rel), rel);
    } else {
      console.log(`--- ${rel}: binary content differs`);
    }
  }
  console.log(
    `dist-diff: FAIL — ${onlyBaseline.length} removed, ${onlyCurrent.length} added, ${differing.length} changed`
  );
  return 1;
}

function captureBaseline(dir) {
  runBuild();
  if (!existsSync(distDir)) fail('dist/ not found after build');
  const count = normalizeDist(distDir, dir);
  console.log(
    `dist-diff: baseline captured — ${count} files normalized into ${relative(root, dir) || dir}`
  );
}

function compareAgainst(dir) {
  if (!existsSync(dir)) {
    fail(`baseline dir not found: ${dir} (run --baseline first)`);
  }
  runBuild();
  if (!existsSync(distDir)) fail('dist/ not found after build');
  const tempDir = mkdtempSync(join(tmpdir(), 'dist-diff-'));
  try {
    normalizeDist(distDir, tempDir);
    return compareDirs(dir, tempDir);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function selfTest() {
  const baselineDir = mkdtempSync(join(tmpdir(), 'dist-diff-selftest-'));
  try {
    console.log('dist-diff: self-test — capturing baseline build');
    captureBaseline(baselineDir);
    console.log('dist-diff: self-test — rebuilding and comparing');
    const code = compareAgainst(baselineDir);
    console.log(
      code === 0
        ? 'dist-diff: self-test PASS (two consecutive builds normalize identically)'
        : 'dist-diff: self-test FAIL (consecutive builds differ after normalization)'
    );
    return code;
  } finally {
    rmSync(baselineDir, { recursive: true, force: true });
  }
}

function resolveDir(value) {
  if (!value || value.startsWith('--')) return DEFAULT_BASELINE;
  return value.startsWith(sep) ? value : join(root, value);
}

const args = process.argv.slice(2);
const mode = args[0];

if (mode === '--baseline') {
  captureBaseline(resolveDir(args[1]));
  process.exit(0);
} else if (mode === '--compare') {
  process.exit(compareAgainst(resolveDir(args[1])));
} else if (mode === '--self-test') {
  process.exit(selfTest());
} else {
  fail(
    'usage: node scripts/dist-diff.mjs --baseline [dir] | --compare [dir] | --self-test'
  );
}
