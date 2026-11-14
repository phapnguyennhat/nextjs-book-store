"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subYears } from "date-fns";
import { enUS, vi } from "react-day-picker/locale";
import { CalendarIcon, CircleAlertIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { signup } from "@/lib/api/auth";
import { applyApiError } from "@/lib/api/form-errors";
import { cn } from "@/lib/utils";
import {
  createSignUpSchema,
  MIN_AGE,
  SEX_VALUES,
  type SignUpInput,
  type SignUpValues,
} from "@/lib/validations/auth";

const linkClass =
  "font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none";

const calendarLocales = { vi, en: enUS };

export function SignUpForm({
  onSignedUp,
}: {
  onSignedUp: (email: string) => void;
}) {
  const t = useTranslations("SignUp");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const format = useFormatter();
  const locale = useLocale();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [dobOpen, setDobOpen] = React.useState(false);
  const schema = React.useMemo(() => createSignUpSchema(tv), [tv]);
  const form = useForm<SignUpInput, unknown, SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: undefined,
      sex: undefined,
      acceptTerms: false,
    },
  });

  async function onSubmit(values: SignUpValues) {
    setFormError(null);
    try {
      await signup(values, locale);
    } catch (error) {
      setFormError(
        applyApiError(
          error,
          form.setError,
          ["fullName", "email", "password", "dateOfBirth", "sex"],
          { network: te("network"), unexpected: te("unexpected") },
          { "auth.email-taken": "email" },
        ),
      );
      return;
    }
    // No sign-in here: the backend refuses unverified accounts, so the next step is the email.
    onSignedUp(values.email);
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
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-name">{t("fullName")}</FieldLabel>
              <Input
                {...field}
                id="sign-up-name"
                autoComplete="name"
                placeholder={t("fullNamePlaceholder")}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-email">{t("email")}</FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
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
              <FieldLabel htmlFor="sign-up-password">
                {t("password")}
              </FieldLabel>
              <PasswordInput
                {...field}
                id="sign-up-password"
                autoComplete="new-password"
                aria-describedby="sign-up-password-hint"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription id="sign-up-password-hint">
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
              <FieldLabel htmlFor="sign-up-confirm">
                {t("confirmPassword")}
              </FieldLabel>
              <PasswordInput
                {...field}
                id="sign-up-confirm"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="dateOfBirth"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-dob">{t("dateOfBirth")}</FieldLabel>
              <Popover open={dobOpen} onOpenChange={setDobOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="sign-up-dob"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className="w-full justify-between bg-transparent font-normal"
                    />
                  }
                >
                  <span
                    className={
                      field.value ? undefined : "text-muted-foreground"
                    }
                  >
                    {field.value
                      ? format.dateTime(field.value, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : t("dateOfBirthPlaceholder")}
                  </span>
                  <CalendarIcon data-icon="inline-end" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DobCalendar
                    value={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      field.onBlur();
                      setDobOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  {t("dateOfBirthHint", { minAge: MIN_AGE })}
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="sex"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend
                variant="label"
                className={cn(fieldState.invalid && "text-destructive")}
              >
                {t("sex")}
              </FieldLegend>
              <RadioGroup
                name={field.name}
                value={field.value ?? null}
                onValueChange={(value) => field.onChange(value)}
                aria-invalid={fieldState.invalid}
                className="grid-cols-3"
              >
                {SEX_VALUES.map((value) => (
                  <FieldLabel key={value} htmlFor={`sign-up-sex-${value}`}>
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <RadioGroupItem
                        value={value}
                        id={`sign-up-sex-${value}`}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldTitle>{t(`sexOptions.${value}`)}</FieldTitle>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        <Controller
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="sign-up-terms"
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel
                  htmlFor="sign-up-terms"
                  className="inline font-normal"
                >
                  {t.rich("terms", {
                    terms: (chunks) => (
                      <Link href="/terms" className={linkClass}>
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link href="/privacy" className={linkClass}>
                        {chunks}
                      </Link>
                    ),
                  })}
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
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

// Mounted only while the popover is open, so "today" is read at interaction time, not at prerender.
function DobCalendar({
  value,
  onSelect,
}: {
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  const locale = useLocale();
  const today = new Date();
  return (
    <Calendar
      mode="single"
      locale={calendarLocales[locale]}
      className="[--cell-size:--spacing(9)]"
      captionLayout="dropdown"
      selected={value}
      defaultMonth={value ?? subYears(today, 20)}
      startMonth={new Date(1920, 0)}
      endMonth={today}
      disabled={{ after: today }}
      onSelect={onSelect}
    />
  );
}
