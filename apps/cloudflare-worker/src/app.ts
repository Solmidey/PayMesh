import express from "express";
import type { Request, Response } from "express";
import bodyParser from "body-parser";
import { createResearchApp } from "@paymesh/research-mcp";
import { createFramegenApp } from "@paymesh/framegen-mcp";
import { runJob } from "@paymesh/buyer-orchestrator";
import { Errors, Logging, Validation, ExpressHelpers } from "@paymesh/shared";

export interface WorkerEnv {
  DEFAULT_PROVIDER_URL?: string;
}

export function createWorkerApp(env?: WorkerEnv): express.Application {
  const logger = Logging.createLogger("paymesh-worker");
  const app = express();

  app.use(bodyParser.json());
  app.use(Logging.requestLogger(logger.child("http")));

  app.use("/research", createResearchApp(logger.child("research")));
  app.use("/framegen", createFramegenApp(logger.child("framegen")));

  app.post(
    "/orchestrate",
    ExpressHelpers.asyncHandler(async (req: Request, res: Response) => {
      const body = Validation.ensureObject(req.body, "orchestrate payload must be an object");
      const providerUrl = typeof body.providerUrl === "string" && body.providerUrl.length > 0
        ? body.providerUrl
        : env?.DEFAULT_PROVIDER_URL;
      if (!providerUrl) {
        throw new Validation.ValidationError("providerUrl is required");
      }
      const spec = Validation.ensureSpec(body.spec ?? {});
      const result = await runJob(providerUrl, spec, { logger: logger.child("orchestrate") });
      res.json({ ok: true, jobId: result.jobId, status: result.status });
    })
  );

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    Errors.sendError(res, err, logger);
  });

  return app;
}
