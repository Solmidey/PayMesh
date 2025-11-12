import { randomUUID } from 'node:crypto';

async function main() {
  console.log('--- PayMesh demo seed starting ---');
  console.log('Generating mock provider IDs...');
  const providerId = randomUUID();
  console.log(`Mock provider registered: ${providerId}`);

  console.log('Pretending to seed IPFS content via Thirdweb mock...');
  console.log('CID:', `ipfs://${randomUUID()}`);

  console.log('Writing local addresses skipped in CI environment.');
  console.log('--- PayMesh demo seed complete ---');
}

void main();
