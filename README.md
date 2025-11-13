# PayMesh — Escrow + Reputation for MCP Providers

**PayMesh aligns multi-agent compute by combining escrowed settlement, verifiable artifacts, and lightweight on-chain reputation for MCP-compatible providers.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE) ![Node 20+](https://img.shields.io/badge/node-20%2B-blue.svg) ![pnpm 10+](https://img.shields.io/badge/pnpm-10%2B-orange.svg)

## What is PayMesh? (Executive summary)
- Escrowed settlement that funds work up-front and releases on artifact acceptance.
- MCP-style provider interface exposing `/quote`, `/start`, and `/status` across research + frame generation flows.
- Artifact integrity enforced with `{ cid, hash }` pairs persisted via the shared storage shim.
- Simple on-chain reputation bump that records completed jobs and provider scores.

## NullShot Season 0 Submission (Checklist)
- **Track:** Track 2 — MCPs/Agents using other frameworks.
- **Links:**
  - Repository: [PayMesh Repository](<REPOSITORY_URL>)
  - Demo Video (3–5 min): <DEMO_VIDEO_URL>
  - Write-Up: [PROJECT_WRITEUP.md](PROJECT_WRITEUP.md)
- **Included Assets:** README, install guide, runnable demo, contracts, orchestrator, providers.

## Judges’ quick-run TL;DR
```bash
# Fresh clone quick-start
pnpm install
pnpm -r --if-present run build
pnpm --filter @paymesh/research-mcp start &
pnpm --filter @paymesh/framegen-mcp start &
pnpm --filter @paymesh/buyer-orchestrator start
```

## Architecture Overview
PayMesh wires a buyer-facing orchestrator to multiple MCP providers, hashes every artifact to a CID-like payload, and can optionally settle escrow + reputation events on-chain.

```
Buyer Orchestrator ──HTTP──> MCP Provider(s) ──┐
     │                                         │  (artifact JSON)
     │   (fund/release/bump on-chain)          ├──> IPFS Shim (CID, SHA-256)
     └───────────────> Escrow + Reputation <───┘
```

## Repository Layout
- `packages/mcp-providers/research-mcp` – JSON research provider.
- `packages/mcp-providers/framegen-mcp` – image/manifest provider.
- `packages/agents/buyer-orchestrator` – CLI that funds/starts/polls/releases.
- `packages/shared` – HTTP + hashing + storage shim (CI-safe fake CID).
- `packages/contracts` – Registry, Escrow, Reputation (Foundry).

## Prerequisites
- Node 20+
- pnpm 10+
- (Optional) Foundry for Solidity contract workflows

```bash
node -v
pnpm -v
forge --version  # optional
```

## Quickstart (Local, No Chain)
```bash
pnpm install
pnpm -r --if-present run build
(cd packages/contracts && forge build)   # compiles solidity; okay if not used locally

# Terminal A (provider 1)
pnpm --filter @paymesh/research-mcp start
# Terminal B (provider 2)
pnpm --filter @paymesh/framegen-mcp start
# Terminal C (orchestrator)
pnpm --filter @paymesh/buyer-orchestrator start
```

## Expected output
Lifecycle: `QUOTE → START → STATUS (running) → STATUS (submitted {cid, hash}) → DONE` with the orchestrator logging each transition and the providers confirming artifact submission.

## On-Chain Demo (Optional)
```bash
# Terminal D
anvil

# Terminal E
export RPC_URL="http://127.0.0.1:8545"
export PRIVKEY="0x<ANVIL_ACCOUNT0_PRIVATE_KEY>"
(cd packages/contracts && forge script script/Deploy.s.sol \
  --rpc-url "$RPC_URL" --private-key "$PRIVKEY" --broadcast | tee ../../deploy.log)

# Write addresses for orchestrator (uses the JSON line printed by Forge)
pnpm -w run addrs:write

# Rerun orchestrator (it will now fund/release/bump on-chain)
pnpm --filter @paymesh/buyer-orchestrator start
```

**Base Sepolia:** Use a burner key funded via the official faucet, export `RPC_URL` and `PRIVKEY` for Base Sepolia, and re-run the deploy + `addrs:write` steps. Never commit secrets.

## Provider API (Contract)
| Endpoint | Method | Returns |
| --- | --- | --- |
| `/quote` | POST | `{ priceWei, estSeconds, schemaURI }`
| `/start` | POST | `{ jobId, escrowAddress, spec } → { ok, heartbeatURI }`
| `/status` | GET | `?jobId= → { state: queued\|running\|submitted, cid?, hash? }`
| `/artifact` (optional) | GET | `?jobId= → raw artifact JSON`

## Hash Verification (Optional)
```bash
curl -s "http://localhost:7001/artifact?jobId=123" > artifact.json
node -e 'const fs=require("fs");const c=fs.readFileSync("artifact.json");const h=require("crypto").createHash("sha256").update(c).digest("hex");console.log(h)'
```

## Add Your Own Provider
1. Copy `packages/mcp-providers/research-mcp` to a new provider folder.
2. Implement logic in `/start` to produce artifact JSON and populate `{ cid, hash }` when complete.
3. Ensure `/quote` exposes realistic `priceWei` and `/status` reports `submitted` once done.

## Security & Notes
- Never commit private keys; use environment variables (`RPC_URL`, `PRIVKEY`).
- Storage defaults to a CI-safe shim; swap to Thirdweb credentials if available.
- `.gitignore` covers `.env*`, `deploy.log`, `contracts.local.json`, and `*.tsbuildinfo`.

## Troubleshooting
- **Ports already in use:** `EADDRINUSE` on 7001/7002 → kill prior processes or change ports.
- **TypeScript missing express types:** `pnpm -w add -D @types/express @types/body-parser`.
- **Foundry remapping error (`forge-std/Script.sol`):** run commands inside `packages/contracts` or pass `--root packages/contracts`; ensure `forge install foundry-rs/forge-std`.

## NullShot Submission Guide (for Judges and Team)
- **What’s included:** public repo, demo video (3–5 min), README/install guide, write-up, Foundry contracts.
- **How to review quickly:** follow Quickstart, observe `{ cid, hash }` in orchestrator logs, optionally run the on-chain demo.
- **Community Choice template:** "Built PayMesh — Escrow + Reputation for MCP Providers. Watch <DEMO_VIDEO_URL>, code at <REPOSITORY_URL>." (Edit with final links.)

## Project Status / Roadmap
- **Done:** two providers, orchestrator, minimal contracts, local + Anvil demos.
- **Next:** disputes/refunds, milestone payouts, real IPFS upload & gateway verification, provider registry & scores.

## License
MIT — see [LICENSE](LICENSE).

## Credits
- NullShot
- Edenlayer
- (Optional) Thirdweb infra codes acknowledgment
