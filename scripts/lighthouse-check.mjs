#!/usr/bin/env node
/**
 * Lighthouse performance smoke check against the preview server.
 * Requires preview running on PREVIEW_PORT (default 4331).
 *
 * Usage: npm run preview (separate terminal) && npm run perf:lighthouse
 */
import { spawn } from 'node:child_process';
import { PREVIEW_PORT } from './ports.mjs';

const TARGET_URL = `http://localhost:${PREVIEW_PORT}/`;
const LCP_BUDGET_MS = 2500;
const PERF_SCORE_MIN = 95;

function runLighthouse() {
  return new Promise((resolve, reject) => {
    const args = [
      TARGET_URL,
      '--only-categories=performance',
      '--form-factor=mobile',
      '--throttling.cpuSlowdownMultiplier=4',
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      '--chrome-flags=--headless --no-sandbox',
    ];

    const child = spawn('npx', ['lighthouse@12', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `lighthouse exited ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error('Failed to parse Lighthouse JSON output'));
      }
    });
  });
}

async function main() {
  console.log(`Lighthouse → ${TARGET_URL}`);
  const report = await runLighthouse();
  const perf = report.categories?.performance;
  const score = Math.round((perf?.score ?? 0) * 100);
  const lcp = report.audits?.['largest-contentful-paint']?.numericValue ?? Infinity;

  console.log(`Performance score: ${score}`);
  console.log(`LCP: ${Math.round(lcp)} ms`);

  let failed = false;
  if (score < PERF_SCORE_MIN) {
    console.error(`FAIL: Performance ${score} < ${PERF_SCORE_MIN}`);
    failed = true;
  }
  if (lcp > LCP_BUDGET_MS) {
    console.error(`FAIL: LCP ${Math.round(lcp)} ms > ${LCP_BUDGET_MS} ms`);
    failed = true;
  }

  if (failed) process.exit(1);
  console.log('PASS: performance budgets met');
}

main().catch((err) => {
  console.error(err.message ?? err);
  console.error(
    'Tip: start preview first — npm run preview:restart — then rerun npm run perf:lighthouse'
  );
  process.exit(1);
});
