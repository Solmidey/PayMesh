# PayMesh — 3–5 Minute Demo Script

1) Title (5–10s): “PayMesh — escrow + reputation for MCP providers”
2) Problem (10–15s): “Agents can do work; buyers need trust & verifiable settlement.”
3) Architecture (25–30s): Show README diagram; call out `/quote` `/start` `/status`, escrow/reputation.
4) Live demo (2–3m):
   - Term A: pnpm --filter @paymesh/research-mcp start (says “on 7001”)
   - Term B: pnpm --filter @paymesh/framegen-mcp start (says “on 7002”)
   - Term C: pnpm --filter @paymesh/buyer-orchestrator start
     Narrate: QUOTE → START → STATUS running → STATUS submitted { cid, hash } → DONE.
   - (If on-chain) mention tx on local Anvil or Base Sepolia.
5) Integrity (20s): Optionally curl `/artifact` and hash locally to match `/status.hash`.
6) Extensibility (20–30s): “Copy a provider, implement 3 endpoints; orchestrator unchanged.”
7) Close (10s): “Escrowed settlement + reputation for the agentic web.”
