"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, MailCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { forgotPassword } from "@/lib/api/auth";
import { applyApiError } from "@/lib/api/form-errors";
import { createSignInSchema } from "@/lib/validations/auth";

const COOLDOWN_SECONDS = 60; // matches the backend's one-email-per-minute limit

/**
 * Asks for a reset link. The endpoint always answers 204 (unknown and rate-limited emails alike) so it can't
 * be used to probe which emails have accounts, hence the conditional "if this email…" confirmation.
 */
export function ForgotPassword() {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const [sent, setSent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [formError, setFormError] = React.useState<string | null>(null);
  const schema = React.useMemo(
    () => createSignInSchema(tv).pick({ email: true }),
    [tv],
  );
  const form = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function onSubmit({ email }: { email: string }) {
    setFormError(null);
    try {
      await forgotPassword(email, locale);
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(
        applyApiError(error, form.setError, ["email"], {
          network: te("network"),
          unexpected: te("unexpected"),
        }),
      );
    }
  }

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={{ prompt: "", href: "/sign-in", label: t("backToSignIn") }}
    >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="forgot-email">{t("email")}</FieldLabel>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div role="status" aria-live="polite">
            {sent && (
              <Alert>
                <MailCheckIcon className="text-teal" />
                <AlertDescription>{t("sent")}</AlertDescription>
              </Alert>
            )}
          </div>
          {formError && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting || cooldown > 0}
          >
            {form.formState.isSubmitting && (
              <Spinner data-icon="inline-start" />
            )}
            {cooldown > 0
              ? t("resendCooldown", { seconds: cooldown })
              : t("submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
