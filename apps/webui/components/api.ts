export type Quote = { priceWei: string; estSeconds: number; schemaURI: string };
export type StartResp = { ok: boolean; heartbeatURI: string };
export type StatusResp = { state: "queued" | "running" | "submitted"; cid?: string; hash?: string };

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${url} ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} ${res.status}`);
  return res.json() as Promise<T>;
}

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const enc = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
