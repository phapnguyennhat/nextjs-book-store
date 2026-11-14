"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import { login } from "@/lib/api/auth";
import { applyApiError } from "@/lib/api/form-errors";
import { safeNext } from "@/lib/safe-redirect";
import { createSignInSchema, type SignInValues } from "@/lib/validations/auth";

export function SignInForm() {
  const t = useTranslations("SignIn");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const schema = React.useMemo(() => createSignInSchema(tv), [tv]);
  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setFormError(null);
    try {
      await login(values, locale); // the backend sets httpOnly auth cookies on this origin
      // Read at submit time (not useSearchParams) so the form stays in the static prerender.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(safeNext(next));
      router.refresh(); // re-render server components so they see the new cookies
    } catch (error) {
      setFormError(
        applyApiError(error, form.setError, ["email", "password"], {
          network: te("network"),
          unexpected: te("unexpected"),
        }),
      );
    }
  }

  return (
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
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-in-email">{t("email")}</FieldLabel>
              <Input
                {...field}
                id="sign-in-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-4">
                <FieldLabel htmlFor="sign-in-password">
                  {t("password")}
                </FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <PasswordInput
                {...field}
                id="sign-in-password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
