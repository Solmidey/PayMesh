import { runJob } from "./flow.js";
const provider = process.argv[2] || "http://localhost:7001";
const spec = { task: "demo research on agentic economy" };
runJob(provider, spec).then(id => console.log("Job started", id)).catch(console.error);
