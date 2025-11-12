import dotenvFlow from 'dotenv-flow';

export interface PaymeshConfig {
  rpcUrl: string;
  privateKey: string;
  escrowAddress: string;
  registryAddress: string;
  reputationAddress: string;
  thirdwebClientId: string;
}

let loaded = false;

function ensureLoaded() {
  if (loaded) return;
  dotenvFlow.config({ silent: true });
  loaded = true;
}

function safeEnv(name: string, fallback: string): string {
  ensureLoaded();
  const value = process.env[name];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

export function getConfig(): PaymeshConfig {
  return {
    rpcUrl: safeEnv('RPC_URL', 'https://rpc.placeholder.invalid'),
    privateKey: safeEnv('PRIVKEY', '0x0000000000000000000000000000000000000000000000000000000000000001'),
    escrowAddress: safeEnv('ESCROW_ADDR', '0x0000000000000000000000000000000000000000'),
    registryAddress: safeEnv('REGISTRY_ADDR', '0x0000000000000000000000000000000000000000'),
    reputationAddress: safeEnv('REPUTATION_ADDR', '0x0000000000000000000000000000000000000000'),
    thirdwebClientId: safeEnv('TW_CLIENT_ID', 'placeholder-client'),
  };
}
