// Run: node --test lib/validations/auth.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSignInSchema,
  createSignUpSchema,
  isAtLeastAge,
} from "./auth.ts";

// Identity translator: messages come back as their keys.
const t = (key) => key;
const signInSchema = createSignInSchema(t);
const signUpSchema = createSignUpSchema(t);

test("isAtLeastAge turns true exactly on the birthday", () => {
  const dob = new Date(2013, 5, 15);
  assert.equal(isAtLeastAge(dob, 13, new Date(2026, 5, 14)), false);
  assert.equal(isAtLeastAge(dob, 13, new Date(2026, 5, 15)), true);
});

const validSignUp = {
  fullName: "Nguyễn Văn A",
  email: "a@vidu.com",
  password: "matkhau123",
  confirmPassword: "matkhau123",
  dateOfBirth: new Date(2000, 0, 1),
  sex: "female",
  acceptTerms: true,
};

test("sign up accepts valid input", () => {
  assert.equal(signUpSchema.safeParse(validSignUp).success, true);
});

test("sign up rejects mismatched passwords on confirmPassword", () => {
  const r = signUpSchema.safeParse({
    ...validSignUp,
    confirmPassword: "khac12345",
  });
  assert.equal(r.success, false);
  assert.deepEqual(r.error.issues[0].path, ["confirmPassword"]);
  assert.equal(r.error.issues[0].message, "passwordMismatch");
});

test("sign up rejects weak password, underage, missing terms", () => {
  assert.equal(
    signUpSchema.safeParse({
      ...validSignUp,
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    }).success,
    false,
  );
  assert.equal(
    signUpSchema.safeParse({ ...validSignUp, dateOfBirth: new Date() }).success,
    false,
  );
  assert.equal(
    signUpSchema.safeParse({ ...validSignUp, acceptTerms: false }).success,
    false,
  );
});

test("sign in trims email and requires password", () => {
  assert.equal(
    signInSchema.safeParse({ email: " a@vidu.com ", password: "x" }).success,
    true,
  );
  assert.equal(
    signInSchema.safeParse({ email: "a@vidu.com", password: "" }).success,
    false,
  );
});

test("empty full name reports only the required message", () => {
  const r = signUpSchema.safeParse({ ...validSignUp, fullName: "  " });
  const msgs = r.error.issues
    .filter((i) => i.path[0] === "fullName")
    .map((i) => i.message);
  assert.deepEqual(msgs, ["fullNameRequired"]);
});

test("vi and en message files have the same keys", async () => {
  const { readFile } = await import("node:fs/promises");
  const keys = (o, p = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`],
    );
  const vi = JSON.parse(
    await readFile(new URL("../../messages/vi.json", import.meta.url)),
  );
  const en = JSON.parse(
    await readFile(new URL("../../messages/en.json", import.meta.url)),
  );
  assert.deepEqual(keys(en).sort(), keys(vi).sort());
});
