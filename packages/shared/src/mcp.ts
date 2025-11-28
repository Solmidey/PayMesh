import type { Logger } from "./logging";

export interface JsonFetchOptions {
  timeoutMs?: number;
  logger?: Logger;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function buildAbortSignal(options?: JsonFetchOptions): AbortSignal | undefined {
  if (!options?.timeoutMs) return options?.signal;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }
  return controller.signal;
}

async function parseJsonResponse<T>(res: Response, url: string): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new HttpError(res.status, `Failed to parse JSON from ${url}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function fetchJson<T>(url: string, init: RequestInit, options?: JsonFetchOptions): Promise<T> {
  const signal = buildAbortSignal(options);
  const response = await fetch(url, { ...init, signal });
  if (!response.ok) {
    const text = await response.text();
    throw new HttpError(response.status, `Request to ${url} failed: ${text || response.statusText}`);
  }
  options?.logger?.debug("http", { url, status: response.status });
  return parseJsonResponse<T>(response, url);
}

export async function postJSON<T>(url: string, body: unknown, options?: JsonFetchOptions): Promise<T> {
  return fetchJson<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify(body)
  }, options);
}

export async function getJSON<T>(url: string, options?: JsonFetchOptions): Promise<T> {
  return fetchJson<T>(url, { method: "GET", headers: options?.headers }, options);
}
