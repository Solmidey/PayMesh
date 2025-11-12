import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

async function readInput(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

async function updateEnvExample(filePath: string, mapping: Record<string, string>) {
  if (!existsSync(filePath)) {
    return;
  }
  const raw = await readFile(filePath, 'utf8');
  let updated = raw;
  for (const [key, value] of Object.entries(mapping)) {
    const regex = new RegExp(`${key}=.*`, 'g');
    if (regex.test(updated)) {
      updated = updated.replace(regex, `${key}=${value}`);
    }
  }
  await writeFile(filePath, updated, 'utf8');
}

async function main() {
  const payload = (await readInput()) || process.argv[2];
  if (!payload) {
    console.error('No input provided for write-addresses script.');
    process.exit(1);
    return;
  }

  let data: Record<string, string>;
  try {
    data = JSON.parse(payload);
  } catch (err) {
    console.error('Failed to parse JSON payload', err);
    process.exit(1);
    return;
  }

  const outPath = resolve(process.cwd(), 'contracts.local.json');
  await writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);

  const mapping: Record<string, string> = {
    ESCROW_ADDR: data.escrow ?? '',
    REGISTRY_ADDR: data.registry ?? '',
    REPUTATION_ADDR: data.reputation ?? '',
    NEXT_PUBLIC_ESCROW: data.escrow ?? '',
    NEXT_PUBLIC_REGISTRY: data.registry ?? '',
    NEXT_PUBLIC_REPUTATION: data.reputation ?? '',
  };

  await updateEnvExample(resolve('packages/agents/buyer-orchestrator/.env.example'), mapping);
  await updateEnvExample(resolve('apps/web/.env.example'), mapping);
}

void main();
