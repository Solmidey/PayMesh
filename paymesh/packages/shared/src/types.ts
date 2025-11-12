export type Quote = { priceWei: string; estSeconds: number; schemaURI: string };
export type Deliverable = {
  jobId: number; milestone: number; artifactCID: string; artifactHash: string;
  meta?: { contentType?: string; schemaURI?: string };
};
