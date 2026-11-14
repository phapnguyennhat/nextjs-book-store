import assert from "node:assert/strict";
import { test } from "node:test";

import { safeNext } from "./safe-redirect.ts";

test("same-site paths pass through", () => {
  assert.equal(safeNext("/verify-email"), "/verify-email");
  assert.equal(safeNext("/orders?page=2"), "/orders?page=2");
});

test("missing, absolute and protocol-relative targets fall back", () => {
  for (const bad of [
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeNext(bad), "/", String(bad));
  }
});
