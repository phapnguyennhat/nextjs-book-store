"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { ResendVerification } from "@/components/auth/verify-email";
import { Link, useRouter } from "@/i18n/navigation";

/** Sign-up form, then the "check your inbox" step in the same card once the account exists. */
export function SignUp() {
  const t = useTranslations("SignUp");
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  if (sentTo) return <CheckEmail email={sentTo} />;

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

function CheckEmail({ email }: { email: string }) {
  const t = useTranslations("SignUp");
  const router = useRouter();
  const region = React.useRef<HTMLDivElement>(null);

  // The form the user was in just disappeared: move focus to the new content so keyboard and
  // screen-reader users land on it instead of on <body>.
  React.useEffect(() => region.current?.focus(), []);

  return (
    <AuthCard
      title={t("checkEmailTitle")}
      description={t("checkEmailDescription")}
    >
      <div
        ref={region}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="flex flex-col gap-6 outline-none"
      >
        <p className="sr-only">{t("checkEmailTitle")}</p>
        {/* The address block of a parcel label: where the verification letter went. */}
        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {t("checkEmailSentTo")}
          </p>
          <p className="truncate text-base font-semibold" title={email}>
            {email}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("checkEmailHint")}
        </p>
        <ResendVerification
          variant="outline"
          initialCooldown={60}
          onAlreadyVerified={() => router.replace("/")}
        />
        <Link
          href="/"
          className="self-center text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {t("checkEmailHome")}
        </Link>
      </div>
    </AuthCard>
  );
}
