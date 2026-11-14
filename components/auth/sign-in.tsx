"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { useGuestOnly } from "@/components/auth/use-guest-only";
import { CheckEmail } from "@/components/auth/check-email";
import { SignInForm } from "@/components/auth/sign-in-form";

/** Sign-in form, or the "verify your email" step when the backend refuses an unverified account. */
export function SignIn() {
  const t = useTranslations("SignIn");
  // Kept in memory, not the URL, so the address doesn't end up in history or server logs.
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(
    null,
  );

  // Signed in already: on the way out (see useGuestOnly), so render nothing.
  if (useGuestOnly()) return null;

  if (unverifiedEmail) {
    return (
      <CheckEmail
        email={unverifiedEmail}
        reason="unverified"
        onBack={() => setUnverifiedEmail(null)}
      />
    );
  }

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={{
        prompt: t("noAccount"),
        href: "/sign-up",
        label: t("signUpLink"),
      }}
    >
      <SignInForm onUnverified={setUnverifiedEmail} />
    </AuthCard>
  );
}
