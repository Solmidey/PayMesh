import express from "express";
import bodyParser from "body-parser";
import { Errors, Hashing, Logging, Validation, Types, ExpressHelpers, putJSON } from "@paymesh/shared";

const SUBMISSION_DELAY_MS = 2000;

type JobRecord = Types.StatusResponse & { startedAt: number };

function validateStartRequest(body: unknown): { jobId: number; spec: Record<string, unknown> } {
  const obj = Validation.ensureObject(body, "start payload must be an object");
  const jobId = Validation.ensureNumber(obj.jobId, "jobId is required");
  const spec = Validation.ensureSpec(obj.spec);
  return { jobId, spec };
}

function validateStatusQuery(query: unknown): number {
  const jobId = Number((query as Record<string, unknown>)?.jobId);
  if (!Number.isFinite(jobId)) {
    throw new Validation.ValidationError("jobId query param is required");
  }
  return jobId;
}

export function createResearchApp(logger = Logging.createLogger("research-mcp")): express.Application {
  const app = express();
  const scopedLogger = logger.child("http");
  const jobs = new Map<number, JobRecord>();

  app.use(bodyParser.json());
  app.use(Logging.requestLogger(scopedLogger));

  app.post("/quote", (_req, res) => {
    const payload: Types.QuoteResponse = { priceWei: "1000000000000000", estSeconds: 8, schemaURI: "ipfs://quote.schema.json" };
    scopedLogger.info("quote", payload);
    res.json(payload);
  });

  app.post(
    "/start",
    ExpressHelpers.asyncHandler(async (req, res) => {
      const { jobId, spec } = validateStartRequest(req.body);
      scopedLogger.info("start", { jobId });

      jobs.set(jobId, { state: "running", startedAt: Date.now() });

      setTimeout(async () => {
        const content = { type: "research", spec, bullets: ["Agentic economy 101", "MCP networks", "Onchain escrow patterns"] };
        const cid = await putJSON(content);
        const hash = Hashing.sha256Hex(JSON.stringify(content));
        jobs.set(jobId, { state: "submitted", cid, hash, startedAt: Date.now() });
        scopedLogger.info("submitted", { jobId, cid });
      }, SUBMISSION_DELAY_MS);

      const response: Types.StartResponse = { ok: true, heartbeatURI: `/status?jobId=${jobId}` };
      res.json(response);
    })
  );

  app.get("/status", (req, res) => {
    const jobId = validateStatusQuery(req.query);
    const job = jobs.get(jobId) ?? { state: "queued", message: "pending start" };
    res.json(job);
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    Errors.sendError(res, err, scopedLogger);
  });

  return app;
}
