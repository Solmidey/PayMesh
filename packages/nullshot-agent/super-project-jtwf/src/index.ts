import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['X-Session-Id'],
    maxAge: 86400,
  }),
);

// Simple PayMesh integration tool
export async function paymeshJobTool(args: { prompt: string }) {
  try {
    const res = await fetch('https://paymesh.pages.dev/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // leave as plain text if not JSON
    }

    return {
      ok: res.ok,
      status: res.status,
      body: parsed,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: String(error),
    };
  }
}

// Handle agent chat directly here (no Durable Object loop to avoid hangs)
app.post('/agent/chat/:sessionId?', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const messages = Array.isArray((body as any).messages) ? (body as any).messages : [];
  const last = messages.length > 0 ? messages[messages.length - 1] : null;
  const content: string | null =
    last && typeof last.content === 'string' ? last.content : null;

  // If message starts with "use paymesh", call the PayMesh worker
  if (content && /^\s*use paymesh\b/i.test(content)) {
    const result = await paymeshJobTool({ prompt: content });
    return c.json(
      {
        source: 'paymesh',
        input: content,
        result,
      },
      200,
    );
  }

  // Fallback stub for the "chat" path so we never hang
  return c.json(
    {
      source: 'stub',
      message:
        'Agent chat path is stubbed in this dev worker. Configure Anthropic and Durable Objects to enable full conversational flow.',
      input: content,
    },
    200,
  );
});

// Stub Durable Object so Wrangler is happy
export class SimplePromptAgent {
  constructor(state: DurableObjectState, env: Env) {
    // stub
  }
  async fetch(request: Request) {
    return new Response('SimplePromptAgent stub', { status: 200 });
  }
}

// Default export for the Worker
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
