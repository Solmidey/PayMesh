import type { WorkerEnv } from "./app";
import { createWorkerApp } from "./app";
import { httpServerHandler } from "cloudflare:node";

let cachedHandler: ((request: Request, env: unknown, ctx: { waitUntil(promise: Promise<unknown>): void }) => Promise<Response>) | null = null;

function getHandler(env: WorkerEnv) {
  if (!cachedHandler) {
    const app = createWorkerApp(env);
    cachedHandler = httpServerHandler(app);
  }
  return cachedHandler;
}

export default {
  fetch(request: Request, env: WorkerEnv, ctx: { waitUntil(promise: Promise<unknown>): void }) {
    return getHandler(env)(request, env, ctx);
  }
};
