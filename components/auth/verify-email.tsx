"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerification } from "@/components/auth/resend-verification";
import { Postmark } from "@/components/auth/stamp-sheet";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type State =
  | { status: "verifying" }
  | { status: "success"; date: string }
  | { status: "invalid"; detail: string }
  | { status: "error" }
  | { status: "missing" };

function verifiedNow(): State {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return { status: "success", date: `${month}.${now.getFullYear()}` };
}

const tealLink =
  "font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none";

export function VerifyEmail() {
  const t = useTranslations("VerifyEmail");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const params = useSearchParams();
  const token = React.useRef<string | null>(null);
  const started = React.useRef(false);
  const [state, setState] = React.useState<State>({ status: "verifying" });

  const run = React.useCallback(async () => {
    if (!token.current) return setState({ status: "missing" });
    setState({ status: "verifying" });
    try {
      await verifyEmail(token.current, locale);
      setState(verifiedNow());
    } catch (error) {
      setState(
        error instanceof ApiError && error.code === "auth.verify-token-invalid"
          ? {
              status: "invalid",
              detail: error.problem.detail ?? t("invalidTitle"),
            }
          : { status: "error" },
      );
    }
  }, [locale, t]);

  React.useEffect(() => {
    // The token is single-use, so post it exactly once: StrictMode runs effects twice in development.
    if (started.current) return;
    started.current = true;
    token.current = params.get("token");
    // Drop the token from the address bar so it doesn't linger in history or get shared by copy-paste.
    if (token.current)
      window.history.replaceState(null, "", window.location.pathname);
    void run();
  }, [params, run]);

  const view = {
    verifying: { title: t("verifyingTitle"), description: t("verifyingBody") },
    success: { title: t("successTitle"), description: t("successBody") },
    invalid: { title: t("invalidTitle"), description: t("invalidHint") },
    error: { title: t("errorTitle"), description: te("network") },
    missing: { title: t("invalidTitle"), description: t("missingToken") },
  }[state.status];

  return (
    <AuthCard title={view.title} description={view.description}>
      <div role="status" aria-live="polite" className="flex flex-col gap-6">
        {/* The visible heading changes outside this region; repeat it here so screen readers hear the outcome. */}
        <p className="sr-only">{view.title}</p>
        {state.status === "verifying" && (
          <Spinner
            aria-hidden="true"
            role={undefined}
            className="size-6 text-teal"
          />
        )}

        {state.status === "success" && (
          <>
            <Postmark
              id="verify-email"
              label={t("postmark")}
              date={state.date}
              ink="teal"
              responsive={false}
              className="postmark mx-auto w-56 sm:w-64"
            />
            <div className="flex flex-col items-center gap-4">
              {/* Unverified accounts can't sign in, so signing in is the next step now. */}
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                {t("signIn")}
              </Link>
              <Link href="/" className={cn(tealLink, "text-sm")}>
                {t("goHome")}
              </Link>
            </div>
          </>
        )}

        {(state.status === "invalid" || state.status === "missing") && (
          <>
            {state.status === "invalid" && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{state.detail}</AlertTitle>
              </Alert>
            )}
            {/* Signed out by definition (unverified accounts can't sign in), so it asks for the email. */}
            <ResendVerification />
            <Link href="/" className={cn(tealLink, "self-center text-sm")}>
              {t("backHome")}
            </Link>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="flex flex-col items-center gap-4">
              <Button size="lg" className="w-full" onClick={() => void run()}>
                {t("retry")}
              </Button>
              <Link href="/" className={cn(tealLink, "text-sm")}>
                {t("backHome")}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  );
}
