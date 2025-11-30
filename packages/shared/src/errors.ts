import type { Response } from "express";
import type { ErrorResponseBody } from "./types";
import { ValidationError } from "./validation";
import type { Logger } from "./logging";

export function normalizeError(error: unknown): { status: number; body: ErrorResponseBody } {
  if (error instanceof ValidationError) {
    return { status: error.status, body: { ok: false, error: error.message } };
  }
  if (error instanceof Error) {
    return { status: 500, body: { ok: false, error: error.message } };
  }
  return { status: 500, body: { ok: false, error: "Unknown error" } };
}

export function sendError(res: Response, error: unknown, logger?: Logger): void {
  const { status, body } = normalizeError(error);
  if (logger) {
    logger.error("request failed", { status, error: body.error });
  }
  res.status(status).json(body);
}
