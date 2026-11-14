// Run: node --test lib/api/form-errors.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError, NetworkError } from "./client.ts";
import { applyApiError } from "./form-errors.ts";

const fallback = { network: "NET", unexpected: "OOPS" };
const recorder = () => {
  const set = {};
  return { set, setError: (field, { message }) => (set[field] = message) };
};

test("network failures become the network message", () => {
  const { setError } = recorder();
  assert.equal(
    applyApiError(new NetworkError(), setError, ["email"], fallback),
    "NET",
  );
});

test("validation errors land on known fields; no form alert", () => {
  const { set, setError } = recorder();
  const err = new ApiError({
    status: 400,
    code: "validation",
    detail: "bad",
    errors: { email: "e!", password: "p!" },
  });
  assert.equal(
    applyApiError(err, setError, ["email", "password"], fallback),
    null,
  );
  assert.deepEqual(set, { email: "e!", password: "p!" });
});

test("validation error on an unknown field also shows the form alert", () => {
  const { setError } = recorder();
  const err = new ApiError({
    status: 400,
    code: "validation",
    detail: "bad",
    errors: { other: "x" },
  });
  assert.equal(applyApiError(err, setError, ["email"], fallback), "bad");
});

test("field codes route to their field", () => {
  const { set, setError } = recorder();
  const err = new ApiError({
    status: 409,
    code: "auth.email-taken",
    detail: "taken",
  });
  assert.equal(
    applyApiError(err, setError, ["email"], fallback, {
      "auth.email-taken": "email",
    }),
    null,
  );
  assert.deepEqual(set, { email: "taken" });
});

test("other API errors show their translated detail", () => {
  const { setError } = recorder();
  const err = new ApiError({
    status: 401,
    code: "auth.invalid-credentials",
    detail: "wrong",
  });
  assert.equal(applyApiError(err, setError, ["email"], fallback), "wrong");
});
