# PayMesh Demo Runbook

Follow these steps to run the complete PayMesh mesh locally.

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Compile Contracts

```bash
cd packages/contracts
forge build
cd ../..
```

## 3. Deploy Contracts (optional)

```bash
cd packages/contracts
forge script script/Deploy.s.sol --broadcast --rpc-url https://sepolia.base.org --private-key 0x... --slow
cd ../..
```

Capture the broadcast JSON output and feed it into the helper:

```bash
forge script script/Deploy.s.sol --rpc-url <url> --private-key <key> | pnpm tsx tools/scripts/write-addresses.ts
```

## 4. Seed Demo Data

```bash
pnpm tsx tools/scripts/demo-seed.ts
```

## 5. Launch Providers

```bash
pnpm --filter @paymesh/research-mcp start
# In another terminal
pnpm --filter @paymesh/framegen-mcp start
```

## 6. Run Buyer Orchestrator

```bash
pnpm --filter @paymesh/buyer-orchestrator start
```

The orchestrator will request a quote, simulate escrow funding, verify the deliverable hash, pin the deliverable via the
Thirdweb mock, and log the resulting CIDs.

## 7. Start Dashboard

```bash
pnpm --filter paymesh-web dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect environment readiness, architecture, and the live demo
playbook.
