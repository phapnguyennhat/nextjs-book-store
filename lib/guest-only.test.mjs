import assert from "node:assert/strict";
import { test } from "node:test";

import { guestOnlyRedirect } from "./guest-only.ts";

test("signed-out visitors and other pages pass through", () => {
  assert.equal(guestOnlyRedirect("/sign-in", "", false), null);
  assert.equal(guestOnlyRedirect("/verify-email", "?token=x", true), null);
  assert.equal(guestOnlyRedirect("/sign-in-help", "", true), null);
});

test("signed-in visitors leave sign-in and sign-up, keeping locale", () => {
  assert.equal(guestOnlyRedirect("/sign-in", "", true), "/");
  assert.equal(guestOnlyRedirect("/vi/sign-up", "", true), "/vi");
  assert.equal(guestOnlyRedirect("/en/sign-in", "", true), "/en");
  assert.equal(guestOnlyRedirect("/en/sign-up/", "", true), "/en");
});

test("a safe ?next= is honoured, an unsafe one is not", () => {
  assert.equal(guestOnlyRedirect("/sign-in", "?next=%2Forders", true), "/orders");
  assert.equal(guestOnlyRedirect("/en/sign-in", "?next=%2Forders", true), "/en/orders");
  assert.equal(guestOnlyRedirect("/vi/sign-in", "?next=%2Forders", true), "/vi/orders");
  assert.equal(guestOnlyRedirect("/sign-in", "?next=https%3A%2F%2Fevil.example", true), "/");
});
