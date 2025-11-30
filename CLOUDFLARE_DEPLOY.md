# PayMesh on Cloudflare Workers

This repository now bundles the MCP providers and a lightweight orchestrator into a single Worker-friendly Express surface.

## Prerequisites

- Node.js 20+
- pnpm 10+
- (Recommended) Wrangler CLI v3/v4 installed globally for `pnpm dev:cf` / `pnpm deploy:cf`.
- Optional: Foundry if you plan to build/test the Solidity contracts.

## Local development

```bash
pnpm install
pnpm build
# Run the Worker locally (uses wrangler dev and the Cloudflare Node.js compatibility layer)
pnpm dev:cf
# In another shell, exercise the endpoints
curl -X POST http://127.0.0.1:8787/research/quote -d '{"spec": {"task": "demo"}}' -H "content-type: application/json"
curl -X POST http://127.0.0.1:8787/research/start -d '{"jobId":123,"spec": {"task":"demo"}}' -H "content-type: application/json"
curl http://127.0.0.1:8787/research/status?jobId=123

# Or run the orchestrator surface (defaults to the /research provider path)
curl -X POST http://127.0.0.1:8787/orchestrate -H "content-type: application/json" \\
  -d '{"providerUrl":"http://127.0.0.1:8787/research","spec":{"task":"demo research"}}'
```

`wrangler.toml` points at `apps/cloudflare-worker/src/worker.ts` and enables the Node.js HTTP compatibility flags required for Express. You can tweak the `DEFAULT_PROVIDER_URL` var for the `/orchestrate` endpoint.

## Deploying to Cloudflare

```bash
# Ensure you are authenticated with Wrangler first: wrangler login
pnpm build
pnpm deploy:cf
```

The deployment exposes:
- `/research/*` for the research MCP provider
- `/framegen/*` for the frame generator MCP provider
- `/orchestrate` to run the buyer orchestrator over HTTP (provide `providerUrl` and `spec` in the JSON body)

### Environment

- `DEFAULT_PROVIDER_URL` (Worker var) – optional default provider base used by `/orchestrate` when none is supplied. In `wrangler.toml` it defaults to `http://127.0.0.1:8787/research` for local dev.
- `THIRDWEB_CLIENT_ID` / `THIRDWEB_SECRET_KEY` – optional; if set the storage shim can be swapped to a real upload implementation. Without them the providers return deterministic fake CIDs suitable for demos/testing.

### Error handling & logging

All public endpoints validate inputs and return `{ ok: false, error: "..." }` with HTTP 4xx/5xx codes on failure. Lightweight structured logging is provided via the shared logger and is safe to use on Workers.

## On-chain contracts

The Solidity contracts under `packages/contracts` remain optional. They are not required for Worker runtime and can be built with Foundry (`pnpm --filter @paymesh/contracts build`) when a Foundry toolchain is available.
