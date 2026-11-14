"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CircleAlertIcon, MailCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { Postmark } from "@/components/auth/stamp-sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { resendVerification, verifyEmail } from "@/lib/api/auth";
import { ApiError, NetworkError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type State =
  | { status: "verifying" }
  | { status: "success"; date: string }
  | { status: "invalid"; detail: string }
  | { status: "error" }
  | { status: "missing" };

const RESEND_COOLDOWN_SECONDS = 60; // matches the backend's one-email-per-minute limit

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
              <Link
                href="/"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                {t("goHome")}
              </Link>
              <Link href="/sign-in" className={cn(tealLink, "text-sm")}>
                {t("signIn")}
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
            {/* A 409 here means the account is verified after all (e.g. a mail scanner used the link first). */}
            <ResendVerification
              onAlreadyVerified={() => setState(verifiedNow())}
            />
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

type Resend =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "needsLogin" }
  | { kind: "error"; message: string };

export function ResendVerification({
  onAlreadyVerified,
  variant = "default",
  initialCooldown = 0,
}: {
  onAlreadyVerified: () => void;
  /** "outline" where resend is a fallback rather than the main action (right after sign-up). */
  variant?: "default" | "outline";
  /** Seconds to wait before the first resend, e.g. when an email was just sent. */
  initialCooldown?: number;
}) {
  const t = useTranslations("VerifyEmail");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const [resend, setResend] = React.useState<Resend>({ kind: "idle" });
  const [cooldown, setCooldown] = React.useState(initialCooldown);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function send() {
    setResend({ kind: "sending" });
    try {
      await resendVerification(locale); // the email is written in this locale
      setResend({ kind: "sent" });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "auth.email-already-verified"
      )
        return onAlreadyVerified();
      if (error instanceof ApiError && error.status === 401)
        return setResend({ kind: "needsLogin" });
      setResend({
        kind: "error",
        message:
          error instanceof NetworkError
            ? te("network")
            : ((error as ApiError).problem?.detail ?? te("unexpected")),
      });
      if (
        error instanceof ApiError &&
        error.code === "auth.verify-resend-too-soon"
      ) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    }
  }

  if (resend.kind === "needsLogin") {
    return (
      <>
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>{t("resendNeedsLogin")}</AlertTitle>
        </Alert>
        <Link
          href={{ pathname: "/sign-in", query: { next: "/verify-email" } }}
          // Next keeps this route's state while away (cacheComponents), so reset now: back here signed in,
          // the user should see the resend button, not this prompt.
          onClick={() => setResend({ kind: "idle" })}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          {t("resendSignIn")}
        </Link>
      </>
    );
  }

  return (
    <>
      {resend.kind === "sent" && (
        <Alert>
          <MailCheckIcon className="text-teal" />
          <AlertDescription>{t("resendSent")}</AlertDescription>
        </Alert>
      )}
      {resend.kind === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{resend.message}</AlertDescription>
        </Alert>
      )}
      <Button
        size="lg"
        variant={variant}
        className={cn("w-full", variant === "outline" && "bg-transparent")}
        disabled={resend.kind === "sending" || cooldown > 0}
        onClick={() => void send()}
      >
        {resend.kind === "sending" && <Spinner data-icon="inline-start" />}
        {cooldown > 0
          ? t("resendCooldown", { seconds: cooldown })
          : t("resend")}
      </Button>
    </>
  );
}
