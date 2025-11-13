# PayMesh — Project Write-Up

## Problem
Agent workflows lack trust, settlement, and verifiable integrity across tools. Buyers need escrow, artifact verification, and lightweight reputation.

## Solution
PayMesh composes **blockchain settlement** (Escrow + Reputation) with **MCP-style providers** and a buyer orchestrator. The orchestrator funds escrow, starts jobs, polls status, validates `{cid,hash}`, then releases funds and bumps provider reputation.

## Architecture
- Providers: HTTP `/quote`, `/start`, `/status` (+ optional `/artifact`)
- Orchestrator: drives the flow and optionally settles on-chain with ethers
- Contracts: Escrow fund/release; Reputation bump (Foundry)
- Storage: IPFS via Thirdweb (CI-safe shim returns deterministic fake CIDs)

## Goals
Trust after verification • Interoperability via small HTTP surface • Extensibility (copy provider template; return `{cid,hash}`)

## Track Fit
**MCPs/Agents using other frameworks** — demonstrates agentic interoperability + on-chain composability.

## Status
Two providers + orchestrator + minimal contracts; local and Anvil demos complete.

## Next
Disputes/refunds; milestone payouts; real IPFS upload & gateway verification; provider registry + scores.
