export function ContractsStatus(){
  const env = {
    chain: process.env.NEXT_PUBLIC_CHAIN_ID,
    rpc: process.env.NEXT_PUBLIC_RPC_URL,
    registry: process.env.NEXT_PUBLIC_REGISTRY,
    escrow: process.env.NEXT_PUBLIC_ESCROW,
    reputation: process.env.NEXT_PUBLIC_REPUTATION
  };
  const ok = !!env.rpc && !!env.registry && !!env.escrow && !!env.reputation;
  return (
    <div style={{padding:12,border:"1px solid #ddd",borderRadius:8}}>
      <b>Contracts</b>
      <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env,null,2)}</pre>
      <p>Status: {ok ? "✅ wired" : "⚠️ using CI defaults"}</p>
    </div>
  );
}
