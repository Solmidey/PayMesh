# PayMesh Video Script (3–5 Minutes)

## Scene 1 – Opening (0:00–0:30)
- Show the PayMesh dashboard landing page.
- Narration: “Welcome to PayMesh, a mesh network of payments, escrow, and reputation for MCP-native agents.”
- Highlight the architecture card and mention the agent-to-contract flow.

## Scene 2 – Contracts & Tooling (0:30–1:30)
- Switch to terminal showing `packages/contracts`.
- Run `forge build` and note the passing tests.
- Narration: “The on-chain foundation covers provider registration, escrow settlement, and reputation bumps—all tested with Foundry.”
- Briefly open `Deploy.s.sol` to show the single-shot deployment script.

## Scene 3 – Providers in Action (1:30–2:15)
- Start the research MCP server (`pnpm --filter @paymesh/research-mcp start`).
- Start the framegen MCP server in another terminal.
- Narration: “Each MCP provider implements the Nullshot-style HTTP surface—quote, start, status, submit.”

## Scene 4 – Buyer Orchestrator (2:15–3:15)
- Run `pnpm --filter @paymesh/buyer-orchestrator start` with the sample spec.
- Narration: “The buyer orchestrator validates quotes with JSON Schema, mocks escrow funding, and verifies deliverables before bumping reputation.”
- Pause when the console logs the pinned Thirdweb CID.

## Scene 5 – Dashboard & Wrap (3:15–4:30)
- Return to the Next.js dashboard.
- Explain how environment variables toggle the status indicators.
- Narration: “PayMesh ships with bulletproof CI, devcontainers, and scripts to sync deployed addresses—ready for production hardening.”
- End with call-to-action: “Fork the repo, plug in your providers, and weave them into the PayMesh.”
