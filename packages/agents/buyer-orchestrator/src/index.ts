import { runJob, type Status } from "./flow";

const provider: string = process.argv[2] || "http://localhost:7001";
const spec: unknown = { task: "demo research on agentic economy" };

runJob(provider, spec)
  .then(({ jobId, status }: { jobId: number; status: Status }) => {
    console.log("DONE jobId", jobId, status);
    process.exit(0);
  })
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
