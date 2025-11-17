export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Method = 'GET' | 'POST';

function missing(name: string) {
  return new Response(JSON.stringify({ error: `Missing env: ${name}` }), { status: 500, headers: { 'content-type': 'application/json' }});
}

/**
 * Universal proxy for MCP providers from the UI:
 *   GET  /api/mcp?provider=research&path=quote
 *   POST /api/mcp?provider=framegen&path=start  (body forwarded)
 *
 * Required Cloudflare Pages env vars:
 *   RESEARCH_URL, FRAMEGEN_URL
 */
async function handle(method: Method, req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider') || 'research';
  const path = (url.searchParams.get('path') || '').replace(/^\/+/, '');

  const RESEARCH_URL = process.env.RESEARCH_URL;
  const FRAMEGEN_URL = process.env.FRAMEGEN_URL;

  if (!RESEARCH_URL) return missing('RESEARCH_URL');
  if (!FRAMEGEN_URL) return missing('FRAMEGEN_URL');

  const base =
    provider === 'framegen' ? FRAMEGEN_URL :
    provider === 'research' ? RESEARCH_URL :
    null;

  if (!base) {
    return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing ?path=' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  const forwardUrl = `${base.replace(/\/+$/, '')}/${path}`;
  const headers = new Headers({ 'content-type': 'application/json' });

  const init: RequestInit = { method, headers };
  if (method === 'POST') {
    // forward JSON body if present
    const text = await req.text();
    if (text) init.body = text;
  }

  try {
    const res = await fetch(forwardUrl, init);
    const ct = res.headers.get('content-type') || '';
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { 'content-type': ct || 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: String(e) }), {
      status: 502, headers: { 'content-type': 'application/json' }
    });
  }
}

export async function GET(req: Request)  { return handle('GET',  req); }
export async function POST(req: Request) { return handle('POST', req); }
