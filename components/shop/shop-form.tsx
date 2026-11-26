"use client";

import * as React from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CircleAlertIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { applyApiError } from "@/lib/api/form-errors";
import { createShop, updateShop, type MyShop } from "@/lib/api/shop";
import {
  createShopSchema,
  toShopRequest,
  type ShopValues,
} from "@/lib/validations/shop";

const FIELDS = [
  "name",
  "slug",
  "description",
  "phone",
  "email",
  "pickupAddress",
] as const satisfies readonly Path<ShopValues>[];

/** Step 1 of selling: the store itself. Creates it, or edits it when `shop` is given. */
export function ShopForm({
  shop,
  defaultEmail,
  onSaved,
}: {
  shop?: MyShop;
  defaultEmail: string;
  onSaved: (shop: MyShop) => void;
}) {
  const t = useTranslations("Shop");
  const tv = useTranslations("Validation");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const [formError, setFormError] = React.useState<string | null>(null);
  const schema = React.useMemo(() => createShopSchema(tv), [tv]);
  const form = useForm<ShopValues>({
    resolver: zodResolver(schema),
    defaultValues: shop
      ? {
          name: shop.name,
          slug: shop.slug,
          description: shop.description ?? "",
          phone: shop.phone,
          email: shop.email,
          pickupAddress: shop.pickupAddress,
        }
      : {
          name: "",
          slug: "",
          description: "",
          phone: "",
          email: defaultEmail,
          pickupAddress: "",
        },
  });

  async function onSubmit(values: ShopValues) {
    setFormError(null);
    try {
      const body = toShopRequest(values);
      onSaved(await (shop ? updateShop(body, locale) : createShop(body, locale)));
    } catch (error) {
      setFormError(
        applyApiError(
          error,
          form.setError,
          FIELDS,
          { network: te("network"), unexpected: te("unexpected") },
          { "shop.slug-taken": "slug" },
        ),
      );
    }
  }

  const text = (
    name: (typeof FIELDS)[number],
    props: React.ComponentProps<typeof Input> = {},
    hint?: string,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`shop-${name}`}>{t(`${name}.label`)}</FieldLabel>
          {name === "description" ? (
            <Textarea
              {...field}
              id={`shop-${name}`}
              rows={3}
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              {...props}
              id={`shop-${name}`}
              aria-invalid={fieldState.invalid}
            />
          )}
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : (
            hint && <FieldDescription>{hint}</FieldDescription>
          )}
        </Field>
      )}
    />
  );

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {text("name", { autoComplete: "organization" })}
        {text(
          "slug",
          { autoCapitalize: "none", spellCheck: false },
          t("slug.hint"),
        )}
        {text("description", {}, t("description.hint"))}
        <div className="grid gap-5 sm:grid-cols-2">
          {text("phone", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
          {text("email", { type: "email", inputMode: "email", autoComplete: "email" })}
        </div>
        {text("pickupAddress", { autoComplete: "street-address" }, t("pickupAddress.hint"))}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            className="sm:ml-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
            {t(shop ? "save" : "submit")}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
