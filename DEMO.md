# PayMesh — Demo Guide (3–5 min)

## Prereqs
- Node 20+, pnpm 10+
- Foundry (only for optional on-chain demo)

## Build
pnpm install
pnpm -r --if-present run build
(cd packages/contracts && forge build)

## Run (3 terminals)
Terminal A: pnpm --filter @paymesh/research-mcp start  
Terminal B: pnpm --filter @paymesh/framegen-mcp start  
Terminal C: pnpm --filter @paymesh/buyer-orchestrator start | tee demo.log

Expected: QUOTE → START → STATUS running → STATUS submitted { cid, hash } → DONE
## (Optional) Verify artifact hash
curl -s "http://localhost:7001/artifact?jobId=123" > artifact.json   # if you added /artifact
node -e 'const fs=require("fs");const c=fs.readFileSync("artifact.json");const h=require("crypto").createHash("sha256").update(c).digest("hex");console.log(h)'

## (Optional) On-chain (Anvil)
anvil  # new window
export RPC_URL="http://127.0.0.1:8545"
export PRIVKEY="0x<ANVIL_ACCOUNT0_PRIVATE_KEY>"
(cd packages/contracts && forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVKEY" --broadcast | tee ../../deploy.log)
pnpm -w run addrs:write
pnpm --filter @paymesh/buyer-orchestrator start
