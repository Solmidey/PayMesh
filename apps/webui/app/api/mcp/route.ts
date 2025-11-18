export const runtime = 'edge';

function baseFor(provider: string | null) {
  return provider === '7002'
    ? 'http://127.0.0.1:7002/mcp'
    : 'http://127.0.0.1:7001/mcp';
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const action = url.searchParams.get('action'); // "quote" | "start"
  const base = baseFor(provider);

  if (action === 'quote' || action === 'start') {
    const body = await req.text();
    const r = await fetch(`${base}/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const txt = await r.text();
    return new Response(txt, {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'unsupported action' }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const action = url.searchParams.get('action'); // "status"
  const jobId = url.searchParams.get('jobId');
  const base = baseFor(provider);

  if (action === 'status' && jobId) {
    const r = await fetch(`${base}/status/${jobId}`);
    const txt = await r.text();
    return new Response(txt, {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'unsupported action' }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}
