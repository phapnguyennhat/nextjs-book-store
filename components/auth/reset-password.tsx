"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { useSession } from "@/components/session-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { logout, resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { applyApiError } from "@/lib/api/form-errors";
import { cn } from "@/lib/utils";
import {
  createResetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/auth";

type Status = "form" | "success" | "invalid" | "missing";

export function ResetPassword() {
  const t = useTranslations("ResetPassword");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const params = useSearchParams();
  const { user, setUser } = useSession();
  // Read once: the effect below strips it from the URL.
  const [token] = React.useState(() => params.get("token"));
  const [outcome, setStatus] = React.useState<Status>("form");
  const status: Status = token ? outcome : "missing";
  const [invalidDetail, setInvalidDetail] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const schema = React.useMemo(() => createResetPasswordSchema(tv), [tv]);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    // Drop the token from the address bar so it doesn't linger in history or get shared by copy-paste.
    if (token) window.history.replaceState(null, "", window.location.pathname);
  }, [token]);

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    try {
      await resetPassword(token!, values.password, locale);
      // The backend revoked every session, but this browser still holds the cookies, and with them proxy.ts
      // would bounce "Sign in" back home. Clear them; failure only means they expire on their own.
      if (user) await logout(locale).catch(() => {});
      setUser(null);
      setStatus("success");
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "auth.reset-token-invalid"
      ) {
        setInvalidDetail(error.problem.detail ?? t("invalidTitle"));
        return setStatus("invalid");
      }
      setFormError(
        applyApiError(error, form.setError, ["password"], {
          network: te("network"),
          unexpected: te("unexpected"),
        }),
      );
    }
  }

  const view = {
    form: { title: t("title"), description: t("description") },
    success: { title: t("successTitle"), description: t("successBody") },
    invalid: { title: t("invalidTitle"), description: t("invalidHint") },
    missing: { title: t("invalidTitle"), description: t("missingToken") },
  }[status];

  return (
    <AuthCard title={view.title} description={view.description}>
      {status === "form" ? (
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {formError && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{t("errorTitle")}</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password">
                    {t("password")}
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="reset-password"
                    autoComplete="new-password"
                    aria-describedby="reset-password-hint"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription id="reset-password-hint">
                      {t("passwordHint")}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-confirm">
                    {t("confirmPassword")}
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="reset-confirm"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Spinner data-icon="inline-start" />
              )}
              {t("submit")}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col gap-6">
          {/* The visible heading changes outside this region; repeat it here so screen readers hear the outcome. */}
          <p className="sr-only">{view.title}</p>
          {status === "invalid" && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>{invalidDetail}</AlertTitle>
            </Alert>
          )}
          <Link
            href={status === "success" ? "/sign-in" : "/forgot-password"}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {status === "success" ? t("signIn") : t("requestNew")}
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
