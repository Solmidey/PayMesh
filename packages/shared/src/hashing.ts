import { createHash } from "crypto";
export function sha256Hex(buf: Buffer | string): string {
  const h = createHash("sha256");
  h.update(typeof buf === "string" ? Buffer.from(buf) : buf);
  return h.digest("hex");
}
