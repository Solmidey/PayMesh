import assert from "node:assert";
import test from "node:test";
import { Hashing, Validation } from "@paymesh/shared";

test("sha256Hex returns deterministic hash", () => {
  const h1 = Hashing.sha256Hex("hello world");
  const h2 = Hashing.sha256Hex(Buffer.from("hello world"));
  assert.strictEqual(h1, h2);
  assert.strictEqual(h1.length, 64);
});

test("validation helpers throw on bad input", () => {
  assert.throws(() => Validation.ensureNumber("nope" as unknown as number));
  assert.throws(() => Validation.ensureString(123));
  assert.throws(() => Validation.ensureSpec(null));
});
