// Placeholder; later wire real Thirdweb client (TS v5).
export async function putJSON(_obj: unknown): Promise<string> {
  return "ipfs://FAKE_CID_PLACEHOLDER";
}
export async function getJSON<T>(_uri: string): Promise<T> {
  throw new Error("Not implemented: wire Thirdweb storage in non-CI flow.");
}
