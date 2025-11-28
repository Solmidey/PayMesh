import { Logging } from "@paymesh/shared";
import { runJob } from "./flow";

const logger = Logging.createLogger("buyer-orchestrator");

const provider: string = process.env.PROVIDER_URL || process.argv[2] || "http://localhost:7001";
const spec: unknown = { task: "demo research on agentic economy" };

runJob(provider, spec, { logger })
  .then(({ jobId, status }) => {
    logger.info("done", { jobId, status });
    process.exit(0);
  })
  .catch((e: unknown) => {
    logger.error("failed", { error: e instanceof Error ? e.message : String(e) });
    process.exit(1);
  });

export { runJob };
export type { Status, RunJobOptions } from "./flow";
