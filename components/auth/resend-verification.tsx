"use client";

import * as React from "react";
import { CircleAlertIcon, MailCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { resendVerification } from "@/lib/api/auth";
import { ApiError, NetworkError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { createSignInSchema } from "@/lib/validations/auth";

const COOLDOWN_SECONDS = 60; // matches the backend's one-email-per-minute limit

type Resend =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

/**
 * Asks for a new verification email. The endpoint is public and always answers 204 (unknown, verified and
 * rate-limited emails alike) so it can't be used to probe which emails have accounts. Hence:
 * - `email` given (we know the account: sign-in, sign-up): confirm plainly that an email was sent.
 * - no `email` (verify-email page): the visitor types it, and the confirmation stays conditional.
 */
export function ResendVerification({
  email: knownEmail,
  variant = "default",
  initialCooldown = 0,
  autoSend = false,
}: {
  email?: string;
  /** "outline" where resend is a fallback rather than the main action. */
  variant?: "default" | "outline";
  /** Seconds before the first resend, e.g. right after an email was sent. */
  initialCooldown?: number;
  /** Send once on mount (unverified sign-in), then lock like a manual send. Needs `email`. */
  autoSend?: boolean;
}) {
  const t = useTranslations("VerifyEmail");
  const te = useTranslations("Errors");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const [typedEmail, setTypedEmail] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [resend, setResend] = React.useState<Resend>(
    autoSend && knownEmail ? { kind: "sending" } : { kind: "idle" },
  );
  const [cooldown, setCooldown] = React.useState(initialCooldown);
  const autoSent = React.useRef(false);
  const emailSchema = React.useMemo(
    () => createSignInSchema(tv).shape.email,
    [tv],
  );

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // State changes happen only in the request's callbacks, so the auto-send effect can share this.
  const request = React.useCallback(
    (email: string) =>
      resendVerification(email, locale).then(
        () => {
          setResend({ kind: "sent" });
          setCooldown(COOLDOWN_SECONDS);
        },
        (error) => {
          if (error instanceof ApiError && error.problem.errors?.email) {
            setFieldError(error.problem.errors.email);
            return setResend({ kind: "idle" });
          }
          setResend({
            kind: "error",
            message:
              error instanceof NetworkError
                ? te("network")
                : ((error as ApiError).problem?.detail ?? te("unexpected")),
          });
        },
      ),
    [locale, te],
  );

  React.useEffect(() => {
    // Once only: StrictMode runs effects twice in development, and each run would send an email.
    if (!autoSend || !knownEmail || autoSent.current) return;
    autoSent.current = true;
    void request(knownEmail);
  }, [autoSend, knownEmail, request]);

  function send(event: React.FormEvent) {
    event.preventDefault();
    let email = knownEmail;
    if (!email) {
      const parsed = emailSchema.safeParse(typedEmail);
      if (!parsed.success) return setFieldError(parsed.error.issues[0].message);
      email = parsed.data;
    }
    setFieldError(null);
    setResend({ kind: "sending" });
    void request(email);
  }

  return (
    <form noValidate onSubmit={send} className="flex flex-col gap-4">
      {!knownEmail && (
        <Field data-invalid={!!fieldError}>
          <FieldLabel htmlFor="resend-email">
            {t("resendEmailLabel")}
          </FieldLabel>
          <Input
            id="resend-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("resendEmailPlaceholder")}
            value={typedEmail}
            onChange={(e) => setTypedEmail(e.target.value)}
            aria-invalid={!!fieldError}
          />
          {fieldError && <FieldError>{fieldError}</FieldError>}
        </Field>
      )}
      {resend.kind === "sent" && (
        <Alert>
          <MailCheckIcon className="text-teal" />
          <AlertDescription>
            {knownEmail ? t("resendSent") : t("resendSentMaybe")}
          </AlertDescription>
        </Alert>
      )}
      {resend.kind === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{resend.message}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        size="lg"
        variant={variant}
        className={cn("w-full", variant === "outline" && "bg-transparent")}
        disabled={resend.kind === "sending" || cooldown > 0}
      >
        {resend.kind === "sending" && <Spinner data-icon="inline-start" />}
        {cooldown > 0
          ? t("resendCooldown", { seconds: cooldown })
          : t("resend")}
      </Button>
    </form>
  );
}
