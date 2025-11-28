// packages/shared/src/thirdweb.ts
/**
 * Thirdweb v5-style storage helper with a safe fallback.
 * - If THIRDWEB_CLIENT_ID or THIRDWEB_SECRET_KEY is set, we attempt real uploads.
 * - Otherwise (CI/default), we return a deterministic FAKE ipfs:// CID.
 *
 * Later: replace the placeholder upload with real thirdweb client init, e.g.:
 *   import { createThirdwebClient } from "thirdweb";
 *   const client = createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID! });
 *   await upload({ client, data: obj });
 */

import { createHash } from "crypto";

function env(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
}

function fakeCidFor(obj: unknown): string {
  const h = createHash("sha256").update(JSON.stringify(obj)).digest("hex").slice(0, 46);
  // not a real CID, but good enough for demos & CI
  return `ipfs://FAKE_${h}`;
}

export async function putJSON(obj: unknown): Promise<string> {
  if (env("THIRDWEB_CLIENT_ID") || env("THIRDWEB_SECRET_KEY")) {
    // TODO: wire real thirdweb upload here.
    // Example pseudo-code (replace with real SDK calls):
    // const client = createThirdwebClient({ clientId: process.env.THIRDWEB_CLIENT_ID! });
    // const uri = await upload({ client, data: obj });
    // return uri;
    return fakeCidFor(obj); // TEMP until you wire SDK
  }
  return fakeCidFor(obj);
}

export async function getJSON<T>(_uri: string): Promise<T> {
  throw new Error("Not implemented: add gateway fetch if you need reads. For demo we only upload.");
}
