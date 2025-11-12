import express from 'express';
import bodyParser from 'body-parser';
import { randomUUID } from 'node:crypto';
import { Deliverable } from '@paymesh/shared';

interface FrameJobState {
  state: 'pending' | 'completed';
  deliverable?: Deliverable;
}

const app = express();
app.use(bodyParser.json());

const jobs = new Map<string, FrameJobState>();
const PORT = Number(process.env.PORT ?? 7002);

app.post('/quote', (req, res) => {
  const summary = req.body?.summary ?? 'visual';
  res.json({
    id: randomUUID(),
    provider: 'framegen',
    price: '0.01',
    currency: 'ETH',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    metadataCid: `ipfs://${randomUUID()}`,
    summary,
  });
});

app.post('/start', (req, res) => {
  const jobId = randomUUID();
  jobs.set(jobId, { state: 'pending' });

  setTimeout(() => {
    const description = String(req.body?.summary ?? 'frame');
    const deliverable: Deliverable = {
      quoteId: String(req.body?.quoteId ?? 'unknown'),
      cid: `ipfs://${randomUUID()}`,
      hash: `0x${Buffer.from(description).toString('hex')}`,
      deliveredAt: new Date().toISOString(),
      summary: `Frame generated for ${description}`,
    };
    jobs.set(jobId, { state: 'completed', deliverable });
  }, 200);

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
  res.json({ status: 'frame-accepted', received: req.body });
});

app.listen(PORT, () => {
  console.log(`FrameGen MCP listening on port ${PORT}`);
});
