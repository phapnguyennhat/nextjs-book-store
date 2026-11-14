"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { useGuestOnly } from "@/components/auth/use-guest-only";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { CheckEmail } from "@/components/auth/check-email";

/** Sign-up form, then the "check your inbox" step in the same card once the account exists. */
export function SignUp() {
  const t = useTranslations("SignUp");
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  // Signed in already: on the way out (see useGuestOnly), so render nothing.
  if (useGuestOnly()) return null;

  if (sentTo) return <CheckEmail email={sentTo} reason="signedUp" />;

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={{
        prompt: t("haveAccount"),
        href: "/sign-in",
        label: t("signInLink"),
      }}
    >
      <SignUpForm onSignedUp={setSentTo} />
    </AuthCard>
  );
}
