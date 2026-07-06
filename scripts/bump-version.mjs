#!/usr/bin/env node
/**
 * Bump semver in package.json and package-lock.json root entry.
 * Prints the new version on stdout (single line) for CI shell substitution.
 *
 * Usage:
 *   node scripts/bump-version.mjs --bump patch|minor|major
 *   node scripts/bump-version.mjs --new-version X.Y.Z
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'package.json');
const lockPath = join(root, 'package-lock.json');

/** @param {string} s */
function parseVersion(s) {
  const parts = s.trim().split('.');
  if (parts.length !== 3 || parts.some((p) => !/^\d+$/.test(p))) {
    throw new Error(`Invalid version (expected X.Y.Z): ${s}`);
  }
  return { major: +parts[0], minor: +parts[1], patch: +parts[2] };
}

/** @param {{ major: number; minor: number; patch: number }} v */
function formatVersion(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

/** @param {{ major: number; minor: number; patch: number }} v @param {'patch'|'minor'|'major'} bump */
function bumped(v, bump) {
  if (bump === 'patch') return { ...v, patch: v.patch + 1 };
  if (bump === 'minor') return { major: v.major, minor: v.minor + 1, patch: 0 };
  return { major: v.major + 1, minor: 0, patch: 0 };
}

/** @param {string[]} argv */
function parseArgs(argv) {
  let bump = null;
  let newVersion = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--bump' && argv[i + 1]) {
      bump = argv[++i];
    } else if (argv[i] === '--new-version' && argv[i + 1]) {
      newVersion = argv[++i];
    }
  }
  if (newVersion) return { newVersion: parseVersion(newVersion) };
  if (bump === 'patch' || bump === 'minor' || bump === 'major') return { bump };
  console.error(
    'Usage: bump-version.mjs --bump patch|minor|major | --new-version X.Y.Z'
  );
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const current = parseVersion(pkg.version);
const args = parseArgs(process.argv.slice(2));
const next = args.newVersion ?? bumped(current, args.bump);

if (formatVersion(next) === formatVersion(current)) {
  console.error(
    `bump-version: new version equals current (${formatVersion(current)}); nothing to do`
  );
  process.exit(1);
}

const nextStr = formatVersion(next);
pkg.version = nextStr;
if (lock.packages?.['']) {
  lock.packages[''].version = nextStr;
}
if (lock.version !== undefined) {
  lock.version = nextStr;
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
process.stdout.write(`${nextStr}\n`);
