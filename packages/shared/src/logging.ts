import type { RequestHandler } from "express";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  scope: string;
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  child(scope: string): Logger;
}

function serializeMeta(meta?: unknown): string {
  if (meta === undefined) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return "";
  }
}

function logWithConsole(level: LogLevel, scope: string, message: string, meta?: unknown): void {
  const line = `[${scope}] ${message}${serializeMeta(meta)}`;
  const output = level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.info;
  output(line);
}

export function createLogger(scope: string): Logger {
  const base = scope.trim() || "paymesh";
  const logger: Logger = {
    scope: base,
    debug: (message, meta) => logWithConsole("debug", base, message, meta),
    info: (message, meta) => logWithConsole("info", base, message, meta),
    warn: (message, meta) => logWithConsole("warn", base, message, meta),
    error: (message, meta) => logWithConsole("error", base, message, meta),
    child: (suffix: string) => createLogger(`${base}:${suffix}`)
  };
  return logger;
}

export function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      logger.info("http", {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs: Date.now() - started
      });
    });
    next();
  };
}
