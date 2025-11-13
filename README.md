# PayMesh — Escrow + Reputation for MCP Providers (NullShot Hacks: Season 0)

**Track:** MCPs/Agents using other frameworks  
**Tagline:** On-chain escrow + simple reputation for MCP-style providers, coordinated by a buyer-orchestrator that funds, starts, polls, verifies, and releases — end-to-end in one command.

## TL;DR (run in ~60s)
```bash
pnpm install && pnpm -r --if-present run build && (cd packages/contracts && forge build)
# Terminal A
pnpm --filter @paymesh/research-mcp start
# Terminal B
pnpm --filter @paymesh/framegen-mcp start
# Terminal C (prints CID + SHA-256)
pnpm --filter @paymesh/buyer-orchestrator start



## Why PayMesh
Agents need **trust** (escrowed settlement), **interoperability** (MCP-style HTTP surface), and **integrity** (verify artifact hash before release). PayMesh combines:
- **Blockchain composability** — Escrow + Reputation contracts
- **AI interoperability** — Providers expose `/quote`, `/start`, `/status`
- **Simple orchestration** — Buyer CLI that handles the full lifecycle

## Repo layout
- `packages/mcp-providers/research-mcp` — JSON research provider (quote/start/status/artifact)
- `packages/mcp-providers/framegen-mcp` — image manifest provider (quote/start/status)
- `packages/agents/buyer-orchestrator` — CLI orchestrator (drives the flow)
- `packages/shared` — HTTP helpers, hashing, storage shim (CI-safe fake CID)
- `packages/contracts` — minimal Registry, Escrow, Reputation (Foundry)
## Local demo (no chain needed)
Follow the TL;DR above. End result is a `{ cid, hash }` you can later verify.

### Provider endpoints
- `POST /quote` → `{ priceWei, estSeconds, schemaURI }`
- `POST /start` → `{ jobId, escrowAddress, spec }` ⇒ `{ ok, heartbeatURI }`
- `GET  /status?jobId=` → `{ state: queued|running|submitted, cid?, hash? }`
- *(optional)* `GET /artifact?jobId=` (raw artifact JSON to verify hash)
## On-chain demo (optional)
Use **Anvil** (no faucet) or **Base Sepolia** (faucet burner).

**Anvil quickstart**
```bash
# window 1
anvil
# window 2
export RPC_URL="http://127.0.0.1:8545"
export PRIVKEY="0x<ANVIL_ACCOUNT0_PRIVATE_KEY>"
(cd packages/contracts && forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVKEY" --broadcast | tee ../../deploy.log)
pnpm -w run addrs:write
pnpm --filter @paymesh/buyer-orchestrator start   # funds/releases/bump on-chain
Buyer Orchestrator ──HTTP──> MCP Provider(s) ──(CID)──> IPFS (via Thirdweb shim)
        │                                             │
        └──────(fund / release / bump)────────> Escrow + Reputation (on-chain)
