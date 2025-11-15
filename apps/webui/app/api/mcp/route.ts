import { NextRequest, NextResponse } from "next/server";
function providerBase(p: string) {
  if (p === "7001" || p.toLowerCase() === "research") return "http://127.0.0.1:7001";
  if (p === "7002" || p.toLowerCase() === "framegen") return "http://127.0.0.1:7002";
  throw new Error("Unknown provider: " + p);
}
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider"); const action = searchParams.get("action");
    if (!provider || !action) return NextResponse.json({ error: "provider & action required" }, { status: 400 });
    const base = providerBase(provider);
    const body = await req.json();
    const r = await fetch(`${base}/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const json = await r.json();
    return NextResponse.json(json, { status: r.status });
  } catch (e:any) { return NextResponse.json({ error: String(e?.message||e) }, { status: 500 }); }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider"); const action = searchParams.get("action"); const jobId = searchParams.get("jobId") || "";
    if (!provider || !action) return NextResponse.json({ error: "provider & action required" }, { status: 400 });
    const base = providerBase(provider);
    const path = action === "status" ? `/status?jobId=${encodeURIComponent(jobId)}` : action === "artifact" ? `/artifact?jobId=${encodeURIComponent(jobId)}` : `/${action}`;
    const r = await fetch(`${base}${path}`, { cache: "no-store" }); const text = await r.text();
    try { return NextResponse.json(JSON.parse(text), { status: r.status }); }
    catch { return new NextResponse(text, { status: r.status, headers: { "content-type": r.headers.get("content-type") || "application/json" } }); }
  } catch (e:any) { return NextResponse.json({ error: String(e?.message||e) }, { status: 500 }); }
}
