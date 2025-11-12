export interface Quote {
  id: string;
  provider: string;
  price: string;
  currency: 'USDC' | 'ETH' | 'DAI';
  expiresAt: string;
  metadataCid: string;
}

export interface Deliverable {
  quoteId: string;
  cid: string;
  hash: string;
  deliveredAt: string;
  summary: string;
}
