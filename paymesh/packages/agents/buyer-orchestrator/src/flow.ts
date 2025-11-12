import { postJSON } from "@paymesh/shared/src/mcp.js";
import { ethers } from "ethers";
export async function runJob(providerUrl: string, spec: any) {
  const quote = await postJSON<any>(`${providerUrl}/quote`, { spec });
  // fund escrow (stubbed: in demo, you’ll replace with real call)
  const jobId = Math.floor(Math.random()*1e6);
  await postJSON<any>(`${providerUrl}/start`, { jobId, escrowAddress: "0xEscrow", spec });
  return jobId;
}
