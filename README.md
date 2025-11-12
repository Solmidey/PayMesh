# PayMesh

PayMesh is a production-ready monorepo that demonstrates how Nullshot-style TypeScript agents orchestrate payments,
escrow, and reputation for MCP-compatible providers. The stack pairs Foundry-based EVM contracts with a mocked
Thirdweb storage client and a Next.js dashboard for quick inspection.

## Why PayMesh?

- **Agent-first:** Agents communicate with MCP providers through predictable HTTP surfaces.
- **Deterministic builds:** Strict TypeScript configurations and CI guardrails ensure fast feedback loops.
- **Deployable rails:** Foundry contracts cover registry, escrow, and reputation flows with deploy scripts and tests.
- **Friendly demo:** A buyer orchestrator, research MCP, and frame generator MCP showcase the coordination loop.

## Architecture

```
Buyer Orchestrator -> Escrow Contract -> MCP Provider -> Thirdweb (IPFS) -> Verifier -> Reputation -> Release
```

## Quickstart

```bash
# Install toolchain
pnpm install

# Build all packages
pnpm run build

# Spin up providers
pnpm --filter @paymesh/research-mcp start
pnpm --filter @paymesh/framegen-mcp start

# Run the orchestrator
pnpm --filter @paymesh/buyer-orchestrator start

# Launch the dashboard
pnpm --filter paymesh-web dev
```

Foundry users can deploy the contracts via `forge script script/Deploy.s.sol --broadcast` inside
`packages/contracts` and capture addresses with `pnpm tsx tools/scripts/write-addresses.ts`.

## Adding a Provider

1. Scaffold a package under `packages/mcp-providers/<name>-mcp`.
2. Implement the `/quote`, `/start`, `/status/:id`, and `/submit` endpoints.
3. Export JSON schemas (if needed) and reference them from orchestrators.
4. Register the provider on-chain (optional) and point the orchestrator at the new base URL.

## Submission Checklist

- [x] `pnpm install` succeeds without secrets.
- [x] `pnpm -r --if-present run build` passes locally and in CI.
- [x] `forge build` runs successfully inside GitHub Actions.
- [x] All environment defaults fall back to safe placeholders.
- [x] Next.js build remains optional on forked PRs via conditional CI.
