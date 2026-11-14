import { format } from "date-fns";

import { api } from "@/lib/api/client";
import type { SignInValues, SignUpValues } from "@/lib/validations/auth";

/** Mirrors the backend's UserResponse record. */
export type User = {
  id: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  dateOfBirth: string; // ISO LocalDate, yyyy-MM-dd
  sex: "MALE" | "FEMALE" | "OTHER";
  role: "USER" | "ADMIN";
};

/** Sets the access_token and refresh_token cookies on success. */
export function login(values: SignInValues, locale: string) {
  return api<User>("/api/auth/login", { method: "POST", body: values, locale });
}

/** Creates the account only; no cookies are set, so call login afterwards. */
export function signup(values: SignUpValues, locale: string) {
  return api<User>("/api/auth/signup", {
    method: "POST",
    locale,
    body: {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      // LocalDate: format in local time; toISOString() would shift the day for UTC+ users.
      dateOfBirth: format(values.dateOfBirth, "yyyy-MM-dd"),
      sex: values.sex.toUpperCase(),
    },
  });
}

/** One-time token from the verification email link. 204 on success; 400 auth.verify-token-invalid otherwise. */
export function verifyEmail(token: string, locale: string) {
  return api<void>("/api/auth/verify-email", {
    method: "POST",
    body: { token },
    locale,
  });
}

/** Needs a signed-in user. 204 sent; 409 auth.email-already-verified; 429 auth.verify-resend-too-soon (1/min). */
export function resendVerification(locale: string) {
  return api<void>("/api/auth/resend-verification", { method: "POST", locale });
}

export function logout(locale: string) {
  return api<void>("/api/auth/logout", { method: "POST", locale });
}

export function me(locale: string) {
  return api<User>("/api/auth/me", { locale });
}
