// Run: node --test lib/api/client.test.mjs
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { api, ApiError, NetworkError } from "./client.ts";

const realFetch = globalThis.fetch;
afterEach(() => (globalThis.fetch = realFetch));

const respond = (status, body, type = "application/problem+json") =>
  new Response(body, { status, headers: body ? { "Content-Type": type } : {} });

test("a bare 401 (no body) is an ApiError with that status, not a network error", async () => {
  globalThis.fetch = async () => respond(401, null);
  const err = await api("/api/auth/login", {
    method: "POST",
    locale: "vi",
  }).catch((e) => e);
  assert.ok(err instanceof ApiError);
  assert.equal(err.status, 401);
});

test("a problem detail keeps its code and translated detail", async () => {
  globalThis.fetch = async () =>
    respond(
      429,
      JSON.stringify({
        status: 429,
        code: "auth.verify-resend-too-soon",
        detail: "wait",
      }),
    );
  const err = await api("/api/auth/login", {
    method: "POST",
    locale: "vi",
  }).catch((e) => e);
  assert.equal(err.code, "auth.verify-resend-too-soon");
  assert.equal(err.problem.detail, "wait");
});

test("a 5xx HTML page or a failed fetch is a network error", async () => {
  globalThis.fetch = async () =>
    respond(500, "<html>Internal Server Error</html>", "text/html");
  assert.ok(
    (await api("/api/x", { locale: "vi" }).catch((e) => e)) instanceof
      NetworkError,
  );
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.ok(
    (await api("/api/x", { locale: "vi" }).catch((e) => e)) instanceof
      NetworkError,
  );
});

test("401 on a protected endpoint refreshes once, then replays the request", async () => {
  const calls = [];
  globalThis.fetch = async (path) => {
    calls.push(path);
    if (path === "/api/auth/refresh")
      return respond(200, "{}", "application/json");
    return calls.filter((p) => p === "/api/auth/me").length === 1
      ? respond(401, null)
      : respond(200, '{"id":1}', "application/json");
  };
  assert.deepEqual(await api("/api/auth/me", { locale: "vi" }), { id: 1 });
  assert.deepEqual(calls, [
    "/api/auth/me",
    "/api/auth/refresh",
    "/api/auth/me",
  ]);
});
