"use client";

import * as React from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldPath,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { DateField } from "@/components/shop/date-field";
import { DocumentUpload } from "@/components/shop/document-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { applyApiError } from "@/lib/api/form-errors";
import { saveKyc, submitKyc, type Kyc } from "@/lib/api/shop";
import {
  createKycSchema,
  emptyKycForm,
  fromKyc,
  isBusiness,
  SELLER_TYPES,
  toKycRequest,
  type KycFormValues,
} from "@/lib/validations/shop";

// Every leaf, so server field errors ("business.taxCode") can land on their inputs.
const FIELDS = [
  "sellerType",
  "legalName",
  "idNumber",
  "idIssueDate",
  "idIssuePlace",
  "dateOfBirth",
  "permanentAddress",
  "idFrontKey",
  "idBackKey",
  "selfieKey",
  "business.businessName",
  "business.registrationNumber",
  "business.registrationDate",
  "business.taxCode",
  "business.registeredAddress",
  "business.licenseKey",
  "bank.bankCode",
  "bank.accountNumber",
  "bank.accountHolder",
] as const satisfies readonly FieldPath<KycFormValues>[];
type Name = (typeof FIELDS)[number];
type Labelled = Exclude<Name, "sellerType">; // has a fields.* label

const fieldId = (name: Name) => `kyc-${name.replace(".", "-")}`;

/**
 * The seller's verification, on one page. "Save draft" keeps whatever is filled in (the backend still checks
 * the format of what's there); "Submit" requires everything, saves, then sends it for review.
 */
export function KycForm({
  initial,
  onSubmitted,
  onBack,
}: {
  initial: Kyc | null;
  onSubmitted: (kyc: Kyc) => void;
  /** Back to step 1; this form stays mounted, so unsaved answers survive. */
  onBack: () => void;
}) {
  const t = useTranslations("Kyc");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const format = useFormatter();
  const locale = useLocale();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [documents, setDocuments] = React.useState(initial?.documents ?? {});
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [busy, setBusy] = React.useState<"draft" | "submit" | null>(null);

  // Business details are required only for business sellers, so the schema follows the chosen type.
  const resolver = React.useCallback<Resolver<KycFormValues>>(
    (values, ctx, options) =>
      zodResolver(createKycSchema(tv, isBusiness(values.sellerType)))(
        values,
        ctx,
        options,
      ),
    [tv],
  );
  const form = useForm<KycFormValues>({
    resolver,
    defaultValues: initial ? fromKyc(initial) : emptyKycForm,
  });
  const sellerType = useWatch({ control: form.control, name: "sellerType" });

  async function save(values: KycFormValues) {
    const kyc = await saveKyc(toKycRequest(values), locale);
    setDocuments(kyc.documents);
    setSavedAt(new Date());
    return kyc;
  }

  function fail(error: unknown) {
    setFormError(
      applyApiError(
        error,
        form.setError,
        FIELDS,
        { network: te("network"), unexpected: te("unexpected") },
        { "kyc.account-holder-mismatch": "bank.accountHolder" },
      ),
    );
  }

  async function saveDraft() {
    setFormError(null);
    form.clearErrors();
    setBusy("draft");
    try {
      await save(form.getValues());
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  async function submit(values: KycFormValues) {
    setFormError(null);
    setBusy("submit");
    try {
      await save(values);
      onSubmitted(await submitKyc(locale));
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null;

  const text = (
    name: Labelled,
    props: React.ComponentProps<typeof Input> = {},
    hint?: string,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId(name)}>{t(`fields.${name}`)}</FieldLabel>
          <Input
            {...props}
            name={field.name}
            ref={field.ref}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            id={fieldId(name)}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : (
            hint && <FieldDescription>{hint}</FieldDescription>
          )}
        </Field>
      )}
    />
  );

  const date = (name: Labelled, yearsAgo?: number) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId(name)}>{t(`fields.${name}`)}</FieldLabel>
          <DateField
            id={fieldId(name)}
            value={field.value as Date | undefined}
            onChange={(d) => {
              field.onChange(d);
              field.onBlur();
            }}
            invalid={fieldState.invalid}
            disabled={disabled}
            placeholder={t("pickDate")}
            defaultYearsAgo={yearsAgo}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  const doc = (
    name: Labelled,
    type: "ID_FRONT" | "ID_BACK" | "SELFIE" | "BUSINESS_LICENSE",
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId(name)}>{t(`fields.${name}`)}</FieldLabel>
          <DocumentUpload
            id={fieldId(name)}
            type={type}
            savedUrl={documents[type]}
            value={field.value as string}
            onChange={(key) => {
              field.onChange(key);
              form.clearErrors(name);
            }}
            invalid={fieldState.invalid}
            disabled={disabled}
            describedBy={`${fieldId(name)}-hint`}
          />
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : (
            <FieldDescription id={`${fieldId(name)}-hint`}>
              {t(`docHints.${type}`)}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );

  // On a wrapper: a <legend> would straddle its own fieldset's border.
  const section = "border-t border-border pt-8 first:border-t-0 first:pt-0";
  const legend = "mb-4 text-lg font-bold tracking-tight";

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)}>
      <FieldGroup className="gap-8">
        <div className={section}>
          <FieldSet>
            <FieldLegend className={legend}>{t("sections.type")}</FieldLegend>
            <Controller
              name="sellerType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                    aria-label={t("sections.type")}
                    aria-invalid={fieldState.invalid}
                    disabled={disabled}
                    className="gap-3 sm:grid-cols-3"
                  >
                    {SELLER_TYPES.map((value) => (
                      <FieldLabel key={value} htmlFor={`kyc-type-${value}`}>
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <RadioGroupItem
                            value={value}
                            id={`kyc-type-${value}`}
                            aria-invalid={fieldState.invalid}
                          />
                          <div className="flex flex-col gap-1">
                            <FieldTitle>{t(`sellerTypes.${value}.title`)}</FieldTitle>
                            <FieldDescription>
                              {t(`sellerTypes.${value}.body`)}
                            </FieldDescription>
                          </div>
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>
        </div>

        <div className={section}>
          <FieldSet>
            <FieldLegend className={legend}>
              {t(isBusiness(sellerType) ? "sections.representative" : "sections.identity")}
            </FieldLegend>
            <FieldDescription className="-mt-4">{t("identityLead")}</FieldDescription>
            <FieldGroup>
              {text("legalName", { autoComplete: "name" })}
              <div className="grid gap-5 sm:grid-cols-2">
                {date("dateOfBirth", 30)}
                {text("idNumber", { inputMode: "numeric", maxLength: 12 })}
                {date("idIssueDate")}
                {text("idIssuePlace")}
              </div>
              {text("permanentAddress")}
              <div className="grid gap-5 sm:grid-cols-3">
                {doc("idFrontKey", "ID_FRONT")}
                {doc("idBackKey", "ID_BACK")}
                {doc("selfieKey", "SELFIE")}
              </div>
            </FieldGroup>
          </FieldSet>
        </div>

        {isBusiness(sellerType) && (
          <div className={section}>
            <FieldSet>
              <FieldLegend className={legend}>{t("sections.business")}</FieldLegend>
              <FieldGroup>
                {text("business.businessName", { autoComplete: "organization" })}
                <div className="grid gap-5 sm:grid-cols-2">
                  {text("business.registrationNumber")}
                  {date("business.registrationDate")}
                  {text("business.taxCode", { inputMode: "numeric" }, t("taxCodeHint"))}
                </div>
                {text("business.registeredAddress")}
                <div className="grid gap-5 sm:grid-cols-3">
                  {doc("business.licenseKey", "BUSINESS_LICENSE")}
                </div>
              </FieldGroup>
            </FieldSet>
          </div>
        )}

        <div className={section}>
          <FieldSet>
            <FieldLegend className={legend}>{t("sections.bank")}</FieldLegend>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                {/* shortcut: free-text bank code; switch to a bank picker when payouts are wired */}
                {text("bank.bankCode", { autoCapitalize: "characters" }, t("bankCodeHint"))}
                {text("bank.accountNumber", { inputMode: "numeric" })}
              </div>
              {text("bank.accountHolder", { autoCapitalize: "characters" }, t("accountHolderHint"))}
            </FieldGroup>
          </FieldSet>
        </div>

        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" size="lg" disabled={disabled} onClick={onBack}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t("back")}
          </Button>
          <p aria-live="polite" className="text-sm text-muted-foreground sm:mr-auto">
            {savedAt &&
              t("savedAt", {
                time: format.dateTime(savedAt, { hour: "2-digit", minute: "2-digit" }),
              })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled}
            onClick={() => void saveDraft()}
          >
            {busy === "draft" && <Spinner data-icon="inline-start" />}
            {t("saveDraft")}
          </Button>
          <Button type="submit" size="lg" disabled={disabled}>
            {busy === "submit" && <Spinner data-icon="inline-start" />}
            {t("submit")}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
