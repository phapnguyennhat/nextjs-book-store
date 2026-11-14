"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Link } from "@/i18n/navigation";

const tealLink =
  "self-center text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none";

/**
 * "Go verify your email" card, shown in place of a form.
 * - "signedUp": the backend sent the email during sign-up; resend is a quiet fallback with a cooldown.
 * - "unverified": sign-in was refused (403 auth.email-not-verified); a fresh email goes out on arrival,
 *   since the old link may have expired, and the user can go back to the form.
 */
export function CheckEmail({
  email,
  reason,
  onBack,
}: {
  email: string;
  reason: "signedUp" | "unverified";
  /** Shown as "back to sign in" when the card replaced the sign-in form. */
  onBack?: () => void;
}) {
  const t = useTranslations("CheckEmail");
  const region = React.useRef<HTMLDivElement>(null);

  // This card replaces the form the user was in: move focus to it so keyboard and screen-reader
  // users land on the new content instead of on <body>.
  React.useEffect(() => region.current?.focus(), []);

  return (
    <AuthCard
      title={t(`${reason}Title`)}
      description={t(`${reason}Description`)}
    >
      <div
        ref={region}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="flex flex-col gap-6 outline-none"
      >
        <p className="sr-only">{t(`${reason}Title`)}</p>
        {/* The address block of a parcel label: where the verification letter went. */}
        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">{t("sentTo")}</p>
          <p className="truncate text-base font-semibold" title={email}>
            {email}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(`${reason}Hint`)}
        </p>
        <ResendVerification
          email={email}
          variant="outline"
          initialCooldown={reason === "signedUp" ? 60 : 0}
          autoSend={reason === "unverified"}
        />
        {onBack ? (
          <button type="button" onClick={onBack} className={tealLink}>
            {t("backToSignIn")}
          </button>
        ) : (
          <Link href="/" className={tealLink}>
            {t("home")}
          </Link>
        )}
      </div>
    </AuthCard>
  );
}
