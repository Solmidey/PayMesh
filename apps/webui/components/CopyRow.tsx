"use client";
import { useState } from "react";

export default function CopyRow({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm opacity-75">{label}</div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-white/5 px-2 py-1 rounded">{value ?? "-"}</code>
        <button
          className="btn-ghost"
          onClick={async () => {
            if (!value) return;
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 900);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
