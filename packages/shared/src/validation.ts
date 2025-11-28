export class ValidationError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type UnknownRecord = Record<string, unknown>;

export function ensureObject(value: unknown, message = "Expected object"): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(message);
  }
  return value as UnknownRecord;
}

export function ensureNumber(value: unknown, message = "Expected number"): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(message);
  }
  return value;
}

export function ensureString(value: unknown, message = "Expected string"): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError(message);
  }
  return value;
}

export function ensureSpec(value: unknown): UnknownRecord {
  return ensureObject(value, "spec must be an object");
}
