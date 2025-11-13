# PayMesh — Escrow + Reputation for MCP-Style Providers

Summary: Quote → Fund → Start → Verify {cid,hash} → Release — escrowed settlement and lightweight reputation for MCP-style providers, orchestrated end-to-end.

# Badges (info)

Node ≥ 20 · pnpm ≥ 10 · Foundry (optional, for on-chain)

Monorepo: pnpm workspaces

License: MIT

# What is PayMesh?

PayMesh brings escrowed settlement and reputation to providers that expose a simple agent-friendly HTTP surface (/quote, /start, /status).
A buyer orchestrator drives the lifecycle:

1. QUOTE — ask a provider for priceWei, ETA, schema.

2. FUND — (optional) escrow the quoted amount.

3. START — provider begins the job; returns a heartbeat URL.

4. STATUS — poll until { state: "submitted", cid, hash }.

5. VERIFY & RELEASE — verify artifact hash matches; release escrow and bump provider reputation.

Storage defaults to a CI-safe IPFS shim (deterministic “fake” CIDs for tests/CI). You can swap to real IPFS/Thirdweb later with minimal changes.

# Architecture Overview

Short path from intent to settlement:

Buyer Orchestrator ──HTTP──────>  Provider(s) (7001/7002)
       │                          /quote  /start  /status
       │                                    │
       │                                    ├── produces Artifact JSON
       │                                    │        └─> IPFS (CID) + SHA-256
       │
       ├── (optional) on-chain actions ─────────────────────────────────┐
       │                                                                │
       └────────── fund / release / reputation.bump  ──>  Escrow + Reputation


- Providers: minimal, interoperable HTTP surface.

- Orchestrator: drives the flow and performs verification before release.

- Contracts (Foundry): escrowed settlement + reputation bump.

- Storage: CI-safe IPFS shim by default; swap to real IPFS/Thirdweb later.

# Repository Layout
packages/
  mcp-providers/
    research-mcp/        # JSON research provider (quote/start/status[/artifact])
    framegen-mcp/        # image/manifest provider (quote/start/status)
  agents/
    buyer-orchestrator/  # CLI: quote → fund → start → poll → verify → release → bump
  shared/                # HTTP helpers, hashing, storage shim (fake CID for CI)
  contracts/             # Registry, Escrow, Reputation (Foundry)

# Prerequisites

Node ≥ 20: node -v

pnpm ≥ 10: pnpm -v

(Optional) Foundry (for on-chain demo): forge --version

# Quickstart (Local, No Chain)
```bash
pnpm install
pnpm -r --if-present run build
(cd packages/contracts && forge build)   # harmless locally, useful for on-chain demo

# Providers (in two terminals)
pnpm --filter @paymesh/research-mcp start    # http://localhost:7001
pnpm --filter @paymesh/framegen-mcp start    # http://localhost:7002

# Orchestrator (third terminal): prints the lifecycle and final {cid, hash}
pnpm --filter @paymesh/buyer-orchestrator start
```

# Expected output

- QUOTE { priceWei, estSeconds, schemaURI }

- START { ok: true, heartbeatURI }

- STATUS { state: "running" } → eventually

- STATUS { state: "submitted", cid, hash }

- DONE (release + reputation bump are logged when on-chain mode is active)

# On-Chain Demo (Optional)
Anvil (no faucet needed)

Terminal D
```bash
anvil
```

Terminal E
```bash
export RPC_URL="http://127.0.0.1:8545"
export PRIVKEY="0x<ANVIL_ACCOUNT0_PRIVATE_KEY>"

# Deploy Registry, Escrow, Reputation
cd packages/contracts
forge script script/Deploy.s.sol \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVKEY" \
  --broadcast | tee ../../deploy.log
cd ../..

# Write addresses for the orchestrator (parses the Forge JSON line)
pnpm -w run addrs:write

# Run orchestrator in on-chain mode (funds, releases, bumps)
pnpm --filter @paymesh/buyer-orchestrator start
```

# Base Sepolia (burner key)

- Use a burner private key (never commit keys); faucet a small amount.

- Set RPC_URL to Base Sepolia and PRIVKEY to your burner.

- Repeat deploy + addrs:write + run steps.

- Never store secrets in the repo; prefer env vars or Codespaces secrets.

# Provider API (Contract)
Method & Path	Request Body (JSON)	Response (JSON)
POST /quote	{ "spec": { ... } } (free-form spec)	{ "priceWei": "…", "estSeconds": 8, "schemaURI": "ipfs://quote.schema.json" }
POST /start	{ "jobId": "…", "escrowAddress": "…", "spec": {…} }	{ "ok": true, "heartbeatURI": "/status?jobId=…" }
GET /status?jobId=XYZ	—	`{ "state": "queued"
GET /artifact?jobId=XYZ (opt)	—	returns raw artifact JSON (for local hash verification)

*Providers can model spec as they like; the orchestrator only needs quote → start → status(submitted {cid,hash}).*

# Local Hash Verification (Optional)

After the provider reports hash in /status, you can re-compute it locally:
```bash
curl -s "http://localhost:7001/artifact?jobId=123" > artifact.json
node -e 'const fs=require("fs");const c=fs.readFileSync("artifact.json");const h=require("crypto").createHash("sha256").update(c).digest("hex");console.log(h)'
# compare the printed hash with /status.hash
```

# Add Your Own Provider (3 Steps)

1. Copy packages/mcp-providers/research-mcp to a new folder.

2. Implement /start to produce your artifact JSON and, when ready, set { state: "submitted", cid, hash }.

3. Ensure /quote returns a realistic priceWei, and /status transitions from "running" → "submitted".

The orchestrator needs no changes as long as the three endpoints conform.

# CI / Typecheck / Contracts — Avoiding Common Build Errors

- Pin Node & pnpm in CI:

  - Node 20.x, pnpm 10.x (align with local).

- Install before building:
```bash
pnpm install
pnpm -r --if-present run build
(cd packages/contracts && forge build)
```

- Do not import deep src paths across packages. Use @paymesh/shared (barrel) not @paymesh/shared/src/....

- TypeScript config: if CI uses Node16/NodeNext resolution, either add .js to relative imports, or use a bundler-friendly moduleResolution in package tsconfigs.

- Forge remappings: run solidity builds from packages/contracts or pass --root packages/contracts. Ensure forge-std is installed there.

- Ignore local-only files (already in .gitignore):
```pgsql
.env
.env.*
deploy.log
contracts.local.json
**/*.tsbuildinfo
```

- Ports in CI (if you smoke-test servers): ensure 7001/7002 are free or parameterize via env.

# Troubleshooting

- EADDRINUSE: 7001/7002
A provider is already running. Stop it or change the port.

- Could not find a declaration file for module 'express'
Add types at the workspace root:
pnpm -w add -D @types/express @types/body-parser

- TS2835: Relative import paths need explicit file extensions
Use the shared barrel (@paymesh/shared) or add .js to relative imports, or set moduleResolution: "Bundler" in the package’s tsconfig.json.

- forge-std/Script.sol not found
From packages/contracts run:
forge install foundry-rs/forge-std@v1
Then: forge build

- CI: typecheck or contracts job fails
Ensure the job runs pnpm install and then the workspace build; run Foundry compile inside packages/contracts.

# Project Status / Roadmap

Done: two reference providers, buyer orchestrator, minimal contracts, local & Anvil demos, CI-safe storage shim, hash verification path.
Next: disputes/refunds, milestone payments, provider registry + scores, real IPFS uploads via Thirdweb client, gateway hash verification.

# License

MIT — see LICENSE.

# Credits

Thanks to contributors and infra providers that make agentic Web3 experiments fast to build and demo.
