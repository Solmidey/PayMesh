// packages/mcp-providers/research-mcp/src/server.ts
import express from "express";
import bodyParser from "body-parser";
import { putJSON } from "@paymesh/shared/src/thirdweb";
import { createHash } from "crypto";

type Job = { state: "queued"|"running"|"submitted"; cid?: string; hash?: string };

const app = express();
app.use(bodyParser.json());

const jobs = new Map<number, Job>();

app.post("/quote", (_req, res) => {
  res.json({ priceWei: "1000000000000000", estSeconds: 8, schemaURI: "ipfs://quote.schema.json" });
});

app.post("/start", async (req, res) => {
  const { jobId, spec } = req.body as { jobId: number; spec: any };
  jobs.set(jobId, { state: "running" });

  // Simulate async work
  setTimeout(async () => {
    const content = { type: "research", spec, bullets: ["Agentic economy 101", "MCP networks", "Onchain escrow patterns"] };
    const cid = await putJSON(content);
    const hash = createHash("sha256").update(JSON.stringify(content)).digest("hex");
    jobs.set(jobId, { state: "submitted", cid, hash });
  }, 2000);

  res.json({ ok: true, heartbeatURI: `/status?jobId=${jobId}` });
});

app.get("/status", (req, res) => {
  const id = Number(req.query.jobId);
  res.json(jobs.get(id) ?? { state: "queued" });
});

app.post("/submit", async (req, res) => {
  const { jobId, result } = req.body;
  const cid = await putJSON(result);
  const hash = createHash("sha256").update(JSON.stringify(result)).digest("hex");
  jobs.set(jobId, { state: "submitted", cid, hash });
  res.json({ ok: true, cid, hash });
});

const port = Number(process.env.PORT || 7001);
app.listen(port, () => console.log("research-mcp on", port));
