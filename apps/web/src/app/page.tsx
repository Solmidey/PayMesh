import { ContractsStatus } from '../../components/ContractsStatus';

const envChecks = [
  ['NEXT_PUBLIC_CHAIN_ID', process.env.NEXT_PUBLIC_CHAIN_ID],
  ['NEXT_PUBLIC_RPC_URL', process.env.NEXT_PUBLIC_RPC_URL],
  ['NEXT_PUBLIC_TW_CLIENT_ID', process.env.NEXT_PUBLIC_TW_CLIENT_ID],
];

const missingEnvs = envChecks.filter(([, value]) => !value);

const asciiDiagram = `
Buyer Agent --> Escrow Contract --> Provider MCP --> IPFS (Thirdweb) --> Reputation Contract --> Release Funds
`;

export default function Page() {
  return (
    <main>
      <h1>PayMesh Control Center</h1>
      <p>
        PayMesh weaves together payments, escrow, and reputation for multi-agent coordination. This dashboard is a
        zero-config demo that surfaces contract readiness, provider health, and data availability.
      </p>

      {missingEnvs.length > 0 && (
        <div className="banner">
          <strong>Environment notice:</strong> The following variables use safe defaults:{' '}
          {missingEnvs.map(([name]) => name).join(', ')}
        </div>
      )}

      <div className="card-grid">
        <ContractsStatus />
        <div className="card">
          <h2>Architecture</h2>
          <pre>{asciiDiagram}</pre>
          <p>
            Orchestrators request quotes from MCP providers, park deliverables on Thirdweb/IPFS, verify hashes, and then
            trigger escrow release plus reputation bumps when the mesh agrees.
          </p>
        </div>
        <div className="card">
          <h2>Demo Playbook</h2>
          <ol>
            <li>Deploy contracts via Foundry or reuse local mocks.</li>
            <li>Run MCP providers (research + framegen) to accept jobs.</li>
            <li>Execute the buyer orchestrator to stitch the flow together.</li>
            <li>Inspect deliverable metadata stored through the Thirdweb client mock.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
