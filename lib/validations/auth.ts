import { z } from "zod";

import type messages from "@/messages/vi.json";

export const MIN_AGE = 13;

export type ValidationKey = keyof (typeof messages)["Validation"];
/** Translator for the "Validation" namespace, e.g. useTranslations("Validation"). */
export type ValidationT = (
  key: ValidationKey,
  values?: Record<string, string | number>,
) => string;

/** True when someone born on `dob` has turned `years` by `today`. */
export function isAtLeastAge(dob: Date, years: number, today = new Date()) {
  const threshold = new Date(
    dob.getFullYear() + years,
    dob.getMonth(),
    dob.getDate(),
  );
  return threshold <= today;
}

export const emailSchema = (t: ValidationT) =>
  z
    .string()
    .trim()
    .min(1, { error: t("emailRequired"), abort: true })
    .pipe(z.email(t("emailInvalid")));

export const createSignInSchema = (t: ValidationT) =>
  z.object({
    email: emailSchema(t),
    password: z.string().min(1, t("passwordRequired")),
  });

export const SEX_VALUES = ["male", "female", "other"] as const;

export const createSignUpSchema = (t: ValidationT) =>
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, { error: t("fullNameRequired"), abort: true })
        .min(2, t("fullNameMin"))
        .max(100, t("fullNameMax")),
      email: emailSchema(t),
      password: z
        .string()
        .min(8, t("passwordMin"))
        .max(128, t("passwordMax")) // matches the backend SignupRequest limit
        .regex(/[A-Za-z]/, t("passwordLetter"))
        .regex(/\d/, t("passwordDigit")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
      dateOfBirth: z
        .date({ error: t("dateOfBirthRequired") })
        .refine((d) => d <= new Date(), t("dateOfBirthFuture"))
        .refine(
          (d) => isAtLeastAge(d, MIN_AGE),
          t("minAge", { minAge: MIN_AGE }),
        ),
      sex: z.enum(SEX_VALUES, { error: t("sexRequired") }),
      acceptTerms: z.boolean().refine((v) => v, t("termsRequired")),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

export type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpInput = z.input<ReturnType<typeof createSignUpSchema>>;
export type SignUpValues = z.output<ReturnType<typeof createSignUpSchema>>;
