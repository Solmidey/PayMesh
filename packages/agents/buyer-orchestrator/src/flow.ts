import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';
import quoteSchema from '@paymesh/shared/src/schemas/quote.schema.json';
import deliverableSchema from '@paymesh/shared/src/schemas/deliverable.schema.json';
import { Quote, Deliverable, sha256Hex, MCPClient, createThirdwebClient, getConfig } from '@paymesh/shared';
import { ethers } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isConfiguredAddress(address: string): boolean {
  return address.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FlowOptions {
  researchProviderUrl: string;
  framegenProviderUrl: string;
  specPath: string;
}

export async function runBuyerFlow(options: FlowOptions): Promise<void> {
  const config = getConfig();
  const ajv = new Ajv({ allErrors: true });
  const validateQuote = ajv.compile<Quote>(quoteSchema as unknown as Record<string, unknown>);
  const validateDeliverable = ajv.compile<Deliverable>(deliverableSchema as unknown as Record<string, unknown>);
  const thirdwebClient = createThirdwebClient(config.thirdwebClientId);

  const specRaw = await readFile(options.specPath, 'utf8');
  const spec = JSON.parse(specRaw);

  const researchClient = new MCPClient({ baseUrl: options.researchProviderUrl });
  const frameClient = new MCPClient({ baseUrl: options.framegenProviderUrl });

  console.log('Requesting research quote...');
  const quoteResponse = await researchClient.quote({ spec });
  if (!validateQuote(quoteResponse)) {
    console.warn('Quote response failed validation', validateQuote.errors);
    return;
  }
  const quote = quoteResponse as Quote;
  console.log('Received quote', quote);

  if (isConfiguredAddress(config.escrowAddress)) {
    console.log('Escrow configured, preparing on-chain interaction...');
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.privateKey, provider);
    const escrow = new ethers.Contract(
      config.escrowAddress,
      [
        {
          inputs: [{ internalType: 'address', name: 'provider', type: 'address' }],
          name: 'fund',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'payable',
          type: 'function',
        },
        {
          inputs: [{ internalType: 'uint256', name: 'jobId', type: 'uint256' }],
          name: 'release',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      wallet,
    );

    try {
      const value = ethers.parseEther(quote.price);
      const providerAddress = ethers.isAddress(quote.provider) ? quote.provider : wallet.address;
      const tx = await escrow.fund.populateTransaction(providerAddress, { value });
      console.log('Prepared fund transaction', tx);
    } catch (err) {
      console.warn('Unable to prepare fund transaction in demo mode', err);
    }
  } else {
    console.log('Escrow not configured, skipping chain simulation.');
  }

  console.log('Starting research job...');
  const startResponse = await researchClient.start({ quoteId: quote.id, spec });
  const jobId = (startResponse as { jobId: string }).jobId;
  console.log(`Research job started with id ${jobId}`);

  let deliverable: Deliverable | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await delay(500);
    const status = await researchClient.status(jobId);
    if (status && (status as { state?: string }).state === 'completed') {
      const deliverableCandidate = (status as { deliverable: Deliverable }).deliverable;
      if (!validateDeliverable(deliverableCandidate)) {
        console.warn('Deliverable failed validation', validateDeliverable.errors);
        return;
      }
      deliverable = deliverableCandidate;
      break;
    }
    console.log(`Waiting for deliverable (attempt ${attempt + 1})`);
  }

  if (!deliverable) {
    console.warn('Research provider did not complete in time.');
    return;
  }

  console.log('Deliverable received', deliverable);
  const expectedHash = sha256Hex(JSON.stringify(deliverable.summary));
  if (deliverable.hash.toLowerCase().replace(/^0x/, '') !== expectedHash) {
    console.warn('Hash mismatch detected, aborting release.');
    return;
  }

  const cid = await thirdwebClient.uploadJSON(deliverable);
  console.log('Pinned deliverable to mock Thirdweb storage at', cid);

  console.log('Requesting frame generation based on deliverable summary...');
  const frameQuote = await frameClient.quote({ summary: deliverable.summary });
  console.log('Frame MCP quote', frameQuote);

  if (isConfiguredAddress(config.reputationAddress)) {
    console.log('Reputation contract configured; would bump provider reputation here.');
  } else {
    console.log('Reputation contract not configured; skipping bump.');
  }

  console.log('Buyer flow complete.');
}
