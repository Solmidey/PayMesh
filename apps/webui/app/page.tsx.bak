"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/components/store";
import Hero3D from "@/components/Hero3D";
import Timeline from "@/components/Timeline";
import CopyRow from "@/components/CopyRow";
import { getJSON, postJSON, Quote, StartResp, StatusResp, sha256Hex } from "@/components/api";

export default function Page() {
  const { providers, selected, setSelected, job, startJob, pushEvent, setStatus, reset } = useApp();
  const [spec, setSpec] = useState<string>('{"task":"demo"}');
  const provider = providers[selected];

  async function doQuote() {
    pushEvent("Requesting quote…");
    const q = await postJSON<Quote>(`${provider.baseURL}&action=quote`, { spec: JSON.parse(spec) });
    pushEvent("Quote received", q);
  }

  async function doStart() {
    const jobId = Math.floor(100000 + Math.random() * 900000).toString();
    startJob({ id: jobId, provider: provider.label, events: [{ t: Date.now(), label: "Job created"}] });
    pushEvent("Starting job…");
    const s = await postJSON<StartResp>(`${provider.baseURL}&action=start`, {
      jobId,
      escrowAddress: "0x0000000000000000000000000000000000000000",
      spec: JSON.parse(spec)
    });
    pushEvent("Start OK", s);
  }

  async function pollStatus() {
    if (!job) return;
    const s = await getJSON<StatusResp>(`${provider.baseURL}/status?jobId=${job.id}`);
    setStatus(s);
    pushEvent(`Status: ${s.state}`, s);
  }

  async function verifyHash() {
    if (!job?.status?.hash) return;
    // If your provider serves /artifact, fetch; else verify spec for demo
    try {
      const res = await fetch(`${provider.baseURL}/artifact?jobId=${job.id}`);
      const text = await res.text();
      const local = await sha256Hex(text);
      pushEvent(local === job.status.hash ? "Hash verified ✅" : "Hash mismatch ❌", { local });
    } catch {
      // fallback demo: hash local spec
      const local = await sha256Hex(spec);
      pushEvent(local === job.status.hash ? "Hash verified (spec) ✅" : "Hash mismatch (spec) ❌", { local });
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" width={40} height={40} alt="PayMesh logo" className="rounded-xl" />
          <div>
            <h1 className="text-2xl font-semibold">PayMesh</h1>
            <p className="text-sm opacity-70">Escrow + Reputation for MCP-style providers</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={reset}>Reset</button>
        </div>
      </div>

      {/* Hero */}
      <Hero3D />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Provider & Spec */}
        <motion.div className="card p-5 space-y-4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
          <h2 className="text-lg font-medium">Provider</h2>
          <select
            className="input w-full"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {providers.map((p, i) => (
              <option key={p.label} value={i}>{p.label} — {p.baseURL}</option>
            ))}
          </select>

          <h3 className="text-sm font-medium opacity-80">Spec (JSON)</h3>
          <textarea
            className="input w-full h-32 font-mono text-sm"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
          />

          <div className="flex gap-2">
            <button className="btn" onClick={doQuote}>Get Quote</button>
            <button className="btn-ghost" onClick={doStart}>Start</button>
          </div>
        </motion.div>

        {/* Lifecycle & Status */}
        <motion.div className="card p-5 space-y-4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:.05}}>
          <h2 className="text-lg font-medium">Lifecycle</h2>
          <Timeline items={job?.events ?? []} />
          <div className="h-px bg-white/10 my-2" />
          <div className="space-y-2">
            <CopyRow label="Job ID" value={job?.id} />
            <CopyRow label="State" value={job?.status?.state} />
            <CopyRow label="CID" value={job?.status?.cid} />
            <CopyRow label="SHA-256" value={job?.status?.hash} />
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-ghost" onClick={pollStatus}>Poll Status</button>
            <button className="btn" onClick={verifyHash} disabled={!job?.status?.hash}>Verify Hash</button>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div className="card p-5 space-y-3" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:.1}}>
          <h2 className="text-lg font-medium">Notes</h2>
          <ul className="list-disc list-inside text-sm opacity-85 space-y-1">
            <li>Use providers on <code>7001</code> and <code>7002</code> (configurable in code if needed).</li>
            <li><strong>Quote → Start → Status → Submitted</strong> shows as timeline events.</li>
            <li>Hash verification runs client-side via <code>crypto.subtle</code>.</li>
            <li>UI doesn’t sign on-chain; use CLI for fund/release/bump to avoid secrets in browser.</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
