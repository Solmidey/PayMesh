import express from 'express';
import bodyParser from 'body-parser';
import { randomUUID } from 'node:crypto';
import { sha256Hex, Deliverable } from '@paymesh/shared';

interface JobState {
  state: 'pending' | 'completed';
  deliverable?: Deliverable;
}

const app = express();
app.use(bodyParser.json());

const jobs = new Map<string, JobState>();
const PORT = Number(process.env.PORT ?? 7001);

app.post('/quote', (req, res) => {
  const { spec } = req.body ?? {};
  const summary = typeof spec?.topic === 'string' ? spec.topic : 'generic-research';
  res.json({
    id: randomUUID(),
    provider: '0x000000000000000000000000000000000000dEaD',
    price: '0.05',
    currency: 'ETH',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    metadataCid: `ipfs://${randomUUID()}`,
    summary,
  });
});

app.post('/start', (req, res) => {
  const jobId = randomUUID();
  jobs.set(jobId, { state: 'pending' });

  const specSummary = JSON.stringify(req.body ?? {});
  setTimeout(() => {
    const summary = `Research synthesis for ${specSummary}`;
    const deliverable: Deliverable = {
      quoteId: String(req.body?.quoteId ?? 'unknown'),
      cid: `ipfs://${randomUUID()}`,
      hash: `0x${sha256Hex(JSON.stringify(summary))}`,
      deliveredAt: new Date().toISOString(),
      summary,
    };
    jobs.set(jobId, { state: 'completed', deliverable });
  }, 300);

  res.json({ jobId });
});

app.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ state: 'unknown' });
    return;
  }
  res.json(job);
});

app.post('/submit', (req, res) => {
  res.json({ status: 'accepted', received: req.body });
});

app.listen(PORT, () => {
  console.log(`Research MCP listening on port ${PORT}`);
});
