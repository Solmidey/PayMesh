export type JobState = "queued" | "running" | "submitted";

export interface QuoteResponse {
  priceWei: string;
  estSeconds: number;
  schemaURI: string;
}

export interface StartRequest {
  jobId: number;
  escrowAddress?: string;
  spec: Record<string, unknown>;
}

export interface StartResponse {
  ok: boolean;
  heartbeatURI: string;
}

export interface StatusResponse {
  state: JobState;
  cid?: string;
  hash?: string;
  message?: string;
}

export interface ErrorResponseBody {
  ok: false;
  error: string;
}
