import { getJSON, postJSON, Logging, Validation, Types } from "@paymesh/shared";

export type Status = Types.StatusResponse;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RunJobOptions {
  pollIntervalMs?: number;
  maxAttempts?: number;
  requestTimeoutMs?: number;
  logger?: Logging.Logger;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const DEFAULT_MAX_ATTEMPTS = 30;

export async function runJob(providerUrl: string, spec: unknown, options?: RunJobOptions): Promise<{ jobId: number; status: Status }> {
  if (!providerUrl) {
    throw new Validation.ValidationError("providerUrl is required");
  }
  const logger = (options?.logger ?? Logging.createLogger("orchestrator")).child("runJob");
  const specObject = Validation.ensureSpec(spec);
  const requestOptions = { timeoutMs: options?.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS, logger };

  logger.info("requesting quote", { providerUrl });
  const quote = await postJSON<Types.QuoteResponse>(`${providerUrl}/quote`, { spec: specObject }, requestOptions);
  logger.info("quote received", quote);

  const jobId = Math.floor(Math.random() * 1e9);
  logger.info("funded escrow (stub)", { jobId, priceWei: quote.priceWei });

  const start = await postJSON<Types.StartResponse>(`${providerUrl}/start`, {
    jobId,
    escrowAddress: "0xEscrowPLACEHOLDER",
    spec: specObject
  }, requestOptions);
  logger.info("job started", start);

  let attempts = 0;
  let status: Status = { state: "queued" };
  while (attempts < (options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)) {
    await sleep(options?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS);
    status = await getJSON<Status>(`${providerUrl}${start.heartbeatURI}`, requestOptions);
    logger.info("heartbeat", { jobId, status: status.state });
    if (status.state === "submitted" && status.cid && status.hash) {
      logger.info("submission verified", { jobId, cid: status.cid });
      return { jobId, status };
    }
    attempts += 1;
  }

  throw new Error(`Job ${jobId} did not complete after ${attempts} attempts`);
}
