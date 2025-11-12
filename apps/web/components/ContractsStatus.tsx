'use client';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isAddressReady(address: string | undefined | null) {
  return Boolean(address && address !== ZERO_ADDRESS && address.startsWith('0x') && address.length === 42);
}

export function ContractsStatus() {
  const registry = process.env.NEXT_PUBLIC_REGISTRY;
  const escrow = process.env.NEXT_PUBLIC_ESCROW;
  const reputation = process.env.NEXT_PUBLIC_REPUTATION;

  return (
    <div className="card">
      <h2>Contract Addresses</h2>
      <ul>
        <li>
          Registry:{' '}
          <span className={isAddressReady(registry) ? 'status-ok' : 'status-warn'}>
            {registry ?? 'not set'}
          </span>
        </li>
        <li>
          Escrow:{' '}
          <span className={isAddressReady(escrow) ? 'status-ok' : 'status-warn'}>
            {escrow ?? 'not set'}
          </span>
        </li>
        <li>
          Reputation:{' '}
          <span className={isAddressReady(reputation) ? 'status-ok' : 'status-warn'}>
            {reputation ?? 'not set'}
          </span>
        </li>
      </ul>
    </div>
  );
}
