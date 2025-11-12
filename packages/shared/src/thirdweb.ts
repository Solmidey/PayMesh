import { randomUUID } from 'node:crypto';

export interface ThirdwebClient {
  clientId: string;
  uploadJSON: (data: unknown) => Promise<string>;
  fetchJSON: (cid: string) => Promise<unknown>;
}

type MemoryBucket = Map<string, unknown>;
const memoryBucket: MemoryBucket = new Map();

export function createThirdwebClient(clientId: string | undefined): ThirdwebClient {
  const safeId = clientId ?? 'local-placeholder';
  return {
    clientId: safeId,
    async uploadJSON(data: unknown): Promise<string> {
      const cid = `ipfs://${randomUUID()}`;
      memoryBucket.set(cid, data);
      return cid;
    },
    async fetchJSON(cid: string): Promise<unknown> {
      if (memoryBucket.has(cid)) {
        return memoryBucket.get(cid);
      }
      // Resolve even for unknown CIDs to avoid build failures in CI.
      return { cid, notice: 'Data not available in local mock' };
    },
  };
}

export async function putJSON(client: ThirdwebClient, data: unknown): Promise<string> {
  return client.uploadJSON(data);
}

export async function getJSON<T>(client: ThirdwebClient, cid: string): Promise<T> {
  return (await client.fetchJSON(cid)) as T;
}
