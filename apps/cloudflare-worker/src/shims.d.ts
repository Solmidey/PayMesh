declare module "cloudflare:node" {
  import type { IncomingMessage, ServerResponse } from "http";
  type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
  export function httpServerHandler(handler: RequestListener): (request: Request, env: unknown, context: { waitUntil(promise: Promise<unknown>): void }) => Promise<Response>;
}
