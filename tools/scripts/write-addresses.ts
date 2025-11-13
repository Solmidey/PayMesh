// tools/scripts/write-addresses.ts
import * as fs from "fs";
import * as path from "path";

type Addrs = { registry: string; escrow: string; reputation: string };

function parseJsonLine(s: string): Addrs {
  const obj = JSON.parse(s.trim());
  if (!obj.registry || !obj.escrow || !obj.reputation) {
    throw new Error("Missing keys in JSON. Need {registry,escrow,reputation}");
  }
  return obj;
}

function tryFromArg(): Addrs | null {
  const idx = process.argv.findIndex(a => a.startsWith("{") && a.endsWith("}"));
  if (idx !== -1) {
    return parseJsonLine(process.argv[idx]);
  }
  return null;
}

function tryFromDeployLog(): Addrs | null {
  const p = path.resolve("deploy.log");
  if (!fs.existsSync(p)) return null;
  const lines = fs.readFileSync(p, "utf8").trim().split(/\r?\n/).reverse();
  for (const line of lines) {
    if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
      try {
        return parseJsonLine(line);
      } catch { /* keep scanning */ }
    }
  }
  return null;
}

function writeContractsLocal(a: Addrs) {
  const out = path.resolve("contracts.local.json");
  fs.writeFileSync(out, JSON.stringify(a, null, 2));
  console.log("Wrote", out);
}

function updateEnvExamples(a: Addrs) {
  const envTargets = [
    "apps/web/.env.example",
    "packages/agents/buyer-orchestrator/.env.example"
  ];
  for (const rel of envTargets) {
    const p = path.resolve(rel);
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, "utf8");
    s = s
      .replace(/^NEXT_PUBLIC_REGISTRY=.*$/m, `NEXT_PUBLIC_REGISTRY=${a.registry}`)
      .replace(/^NEXT_PUBLIC_ESCROW=.*$/m, `NEXT_PUBLIC_ESCROW=${a.escrow}`)
      .replace(/^NEXT_PUBLIC_REPUTATION=.*$/m, `NEXT_PUBLIC_REPUTATION=${a.reputation}`)
      .replace(/^REGISTRY_ADDR=.*$/m, `REGISTRY_ADDR=${a.registry}`)
      .replace(/^ESCROW_ADDR=.*$/m, `ESCROW_ADDR=${a.escrow}`)
      .replace(/^REPUTATION_ADDR=.*$/m, `REPUTATION_ADDR=${a.reputation}`);
    fs.writeFileSync(p, s);
    console.log("Updated", rel);
  }
}

(function main() {
  const src = tryFromArg() ?? tryFromDeployLog();
  if (!src) {
    console.error("No JSON found. Pass JSON as arg or put it as last line of deploy.log.");
    process.exit(1);
  }
  writeContractsLocal(src);
  updateEnvExamples(src);
})();
