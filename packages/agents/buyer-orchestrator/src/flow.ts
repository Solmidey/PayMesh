import { postJSON, getJSON } from "@paymesh/shared";

export type Status = { state: "queued"|"running"|"submitted"; cid?: string; hash?: string };
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function runJob(providerUrl: string, spec: unknown): Promise<{ jobId: number; status: Status }> {
  const quote = await postJSON<any>(`${providerUrl}/quote`, { spec });
  console.log("QUOTE:", quote);

  const jobId = Math.floor(Math.random() * 1e9);
  console.log("FUNDED jobId", jobId, "(stub funding)");

  const start = await postJSON<{ ok: boolean; heartbeatURI: string }>(`${providerUrl}/start`, {
    jobId, escrowAddress: "0xEscrowPLACEHOLDER", spec
  });
  console.log("START:", start);

  let status: Status = { state: "queued" };
  while (status.state !== "submitted") {
    await sleep(1000);
    status = await getJSON<Status>(`${providerUrl}${start.heartbeatURI}`);
    console.log("STATUS:", status);
  }

  console.log("SUBMITTED:", status);
  console.log("RELEASE (stub) + REPUTATION.bump (stub)");
  return { jobId, status };
}
