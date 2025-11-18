export const runtime = "nodejs";

const baseFor = (p: string) => (p === "7002" ? "http://127.0.0.1:7002" : "http://127.0.0.1:7001");

export async function POST(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") ?? "7001";
  const action = url.searchParams.get("action") ?? "quote";
  const base = baseFor(provider);

  if (action === "quote" || action === "start") {
    const body = await req.text();
    return fetch(\`\${base}/\${action}\`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body
    });
  }

  if (action === "status") {
    const { jobId } = await req.json();
    if (!jobId) return new Response(JSON.stringify({ error: "jobId required" }), { status: 400 });
    return fetch(\`\${base}/status?jobId=\${encodeURIComponent(jobId)}\`);
  }

  return new Response(JSON.stringify({ error: "unknown action" }), { status: 400 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") ?? "7001";
  const action = url.searchParams.get("action");
  const jobId = url.searchParams.get("jobId");
  const base = baseFor(provider);

  if (action === "status" && jobId) {
    return fetch(\`\${base}/status?jobId=\${encodeURIComponent(jobId)}\`);
  }

  return new Response(JSON.stringify({ error: "unsupported GET" }), { status: 400 });
}
