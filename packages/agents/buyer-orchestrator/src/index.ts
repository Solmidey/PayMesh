#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runBuyerFlow } from './flow.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

async function main() {
  const [, , specArg] = process.argv;
  const specPath = specArg ? resolve(specArg) : resolve(currentDir, '../specs/research.sample.json');
  const researchUrl = process.env.RESEARCH_URL ?? 'http://localhost:7001';
  const framegenUrl = process.env.FRAMEGEN_URL ?? 'http://localhost:7002';

  try {
    await runBuyerFlow({
      researchProviderUrl: researchUrl,
      framegenProviderUrl: framegenUrl,
      specPath,
    });
  } catch (err) {
    console.error('Buyer orchestrator failed', err);
    process.exitCode = 1;
  }
}

void main();
