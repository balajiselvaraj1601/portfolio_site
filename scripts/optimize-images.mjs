#!/usr/bin/env node
/**
 * Generate WebP + AVIF siblings for raster images in public/assets/images/.
 * Re-compresses PNG sources in place when the optimized copy is smaller.
 *
 * Usage: node scripts/optimize-images.mjs [--check]
 *   --check  Exit 1 if WebP/AVIF siblings are missing (CI guard).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'public/assets/images');
const CHECK_ONLY = process.argv.includes('--check');

/** Max edge length per asset (display size × ~2 for retina). */
const MAX_WIDTH = {
  balaji: 720,
  thiruvalluvar: 480,
  'aacr-2025': 640,
};

async function optimizePng(base) {
  const src = path.join(IMAGE_DIR, `${base}.png`);
  if (!fs.existsSync(src)) {
    console.warn(`skip missing ${base}.png`);
    return;
  }

  const maxW = MAX_WIDTH[base] ?? 640;
  const meta = await sharp(src).metadata();
  const w = Math.min(meta.width ?? maxW, maxW);

  const webpOut = path.join(IMAGE_DIR, `${base}.webp`);
  const avifOut = path.join(IMAGE_DIR, `${base}.avif`);

  if (CHECK_ONLY) {
    if (!fs.existsSync(webpOut) || !fs.existsSync(avifOut)) {
      throw new Error(`Missing modern formats for ${base}.png — run npm run optimize:images`);
    }
    return;
  }

  const resized = sharp(src).resize(w, w, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  await resized.clone().webp({ quality: 80 }).toFile(webpOut);
  await resized.clone().avif({ quality: 65 }).toFile(avifOut);

  const optPng = path.join(IMAGE_DIR, `${base}.opt.png`);
  await resized
    .clone()
    .png({ compressionLevel: 9, palette: meta.hasAlpha ? false : true })
    .toFile(optPng);

  const origSize = fs.statSync(src).size;
  const optSize = fs.statSync(optPng).size;
  if (optSize < origSize) {
    fs.renameSync(optPng, src);
  } else {
    fs.unlinkSync(optPng);
  }

  const report = ['png', 'webp', 'avif']
    .map((ext) => {
      const f = path.join(IMAGE_DIR, `${base}.${ext}`);
      return `${ext}:${fs.existsSync(f) ? fs.statSync(f).size : 0}`;
    })
    .join(' ');
  console.log(`${base} ${report}`);
}

async function main() {
  if (!fs.existsSync(IMAGE_DIR)) {
    console.log('No public/assets/images directory — nothing to optimize.');
    return;
  }

  const bases = fs
    .readdirSync(IMAGE_DIR)
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.replace(/\.png$/, ''));

  for (const base of bases) {
    await optimizePng(base);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
