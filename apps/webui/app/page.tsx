"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HeroBar from "@/components/ui/HeroBar";
import { useApp } from "@/components/store";
import { getJSON, postJSON, Quote, StartResp, StatusResp, sha256Hex } from "@/components/api";

export default function Page() {
  const {
    providers,
    selected,
    setSelected,
    job,
    startJob,
    pushEvent,
    setStatus,
    reset,
  } = useApp();

  const [spec, setSpec] = useState<string>('{"task":"demo"}');
  const provider = providers[selected];

  async function doQuote() {
    pushEvent("Requesting quote");
    const q = await postJSON<Quote>(`${provider.baseURL}&action=quote`, {
      spec: JSON.parse(spec),
    });
    pushEvent("Quote received", q);
  }

  async function doStart() {
    const jobId = Math.floor(100000 + Math.random() * 900000).toString();
    startJob({
      id: jobId,
      provider: provider.label,
      events: [{ t: Date.now(), label: "Job created" }],
    });
    pushEvent("Starting job");
    const s = await postJSON<StartResp>(`${provider.baseURL}&action=start`, {
      jobId,
      escrowAddress: "0x0000000000000000000000000000000000000000",
      spec: JSON.parse(spec),
    });
    pushEvent("Submitted", s);
  }

  async function checkStatus() {
    if (!job) return;
    const s = await getJSON<StatusResp>(`${provider.baseURL}&action=status&jobId=${job.id}`);
    setStatus(s);
    pushEvent("Status", s);
  }

  async function verifyHash() {
    if (!job?.status?.hash) return;
    // If your provider serves /artifact, fetch; else verify spec for demo
    try {
      const res = await fetch(`${provider.baseURL}/artifact?jobId=${job.id}`);
      const text = await res.text();
      const local = await sha256Hex(text);
      pushEvent(local === job.status.hash ? "Hash verified" : "Hash mismatch", { local });
    } catch {
      // fallback demo: hash local spec
      const local = await sha256Hex(spec);
      pushEvent(
        local === job.status.hash ? "Hash verified (spec)" : "Hash mismatch (spec)",
        { local }
      );
    }
  }

  return (
    <>
      <HeroBar />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Provider & Spec */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            className="card p-5 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-medium">Provider</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="w-full rounded-lg border bg-transparent px-3 py-2"
            >
              {providers.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label} — {p.baseURL}
                </option>
              ))}
            </select>

            <h2 className="text-lg font-medium mt-4">Job Spec (JSON)</h2>
            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              rows={10}
              className="w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-sm"
              spellCheck={false}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={doQuote}
                className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15"
              >
                Quote
              </button>
              <button
                onClick={doStart}
                className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15"
              >
                Start
              </button>
              <button
                onClick={checkStatus}
                className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15"
              >
                Status
              </button>
              <button
                onClick={verifyHash}
                className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15"
              >
                Verify Hash
              </button>
              <button
                onClick={reset}
                className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Status & Timeline */}
          <motion.div
            className="card p-5 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-lg font-medium">Status</h2>

            <div className="rounded-lg border p-3 text-sm space-y-1">
              <div>
                <span className="opacity-70">Job ID:</span>{" "}
                <code>{job?.id ?? "-"}</code>
              </div>
              <div>
                <span className="opacity-70">Provider:</span>{" "}
                <code>{job?.provider ?? "-"}</code>
              </div>
              <div className="break-words">
                <span className="opacity-70">Hash:</span>{" "}
                <code>{job?.status?.hash ?? "-"}</code>
              </div>
              <div className="break-words">
                <span className="opacity-70">State:</span>{" "}
                <code>{job?.status?.state ?? "-"}</code>
              </div>
            </div>

            <h3 className="text-base font-medium pt-2">Timeline</h3>
            <ul className="space-y-2 text-sm">
              {(job?.events ?? []).map((e) => (
                <li key={e.t} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white/60" />
                  <div>
                    <div className="font-medium">{e.label}</div>
                    {e.data ? (
                      <pre className="mt-1 whitespace-pre-wrap break-words text-xs opacity-80">
                        {JSON.stringify(e.data, null, 2)}
                      </pre>
                    ) : null}
                    <div className="text-xs opacity-60">
                      {new Date(e.t).toLocaleTimeString()}
                    </div>
                  </div>
                </li>
              ))}
              {(job?.events?.length ?? 0) === 0 && (
                <li className="text-sm opacity-70">No events yet.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Notes */}
        <motion.div
          className="card p-5 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-medium">Notes</h2>
          <ul className="list-disc list-inside text-sm opacity-85 space-y-1">
            <li>
              Use providers on <code>7001</code> and <code>7002</code> (configurable in code if
              needed).
            </li>
            <li>
              <strong>Quote → Start → Status → Submitted</strong> shows as timeline events.
            </li>
            <li>
              Hash verification runs client-side via <code>crypto.subtle</code>.
            </li>
            <li>
              UI doesn&apos;t sign on-chain; use CLI for fund/release/bump to avoid secrets in the
              browser.
            </li>
          </ul>
        </motion.div>
      </main>
    </>
  );
}
