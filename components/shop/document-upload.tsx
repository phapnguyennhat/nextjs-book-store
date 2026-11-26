"use client";

import * as React from "react";
import { FileTextIcon, ImageIcon, UploadIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/client";
import { uploadDocument, type DocumentType } from "@/lib/api/shop";
import { cn } from "@/lib/utils";
import { MAX_DOCUMENT_BYTES } from "@/lib/validations/shop";

const IMAGE_TYPES = ["image/jpeg", "image/png"];

/**
 * One KYC document: picks a file, uploads it to S3 right away and reports the key. The key is saved with the
 * next draft save, so an upload alone changes nothing on the KYC.
 */
export function DocumentUpload({
  id,
  type,
  savedUrl,
  value,
  onChange,
  invalid,
  disabled,
  describedBy,
}: {
  id: string;
  type: DocumentType;
  /** Presigned link to the saved document, if any (expires in minutes; fine for a preview). */
  savedUrl?: string;
  value: string;
  onChange: (key: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}) {
  const t = useTranslations("Kyc.upload");
  const te = useTranslations("Errors");
  const locale = useLocale();
  const accepted =
    type === "BUSINESS_LICENSE" ? [...IMAGE_TYPES, "application/pdf"] : IMAGE_TYPES;
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [local, setLocal] = React.useState<{ url: string; pdf: boolean } | null>(
    null,
  );

  React.useEffect(
    () => () => {
      if (local) URL.revokeObjectURL(local.url);
    },
    [local],
  );

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // picking the same file again still fires change
    if (!file) return;
    setError(null);
    if (!accepted.includes(file.type)) return setError(t("wrongType"));
    if (file.size > MAX_DOCUMENT_BYTES) return setError(t("tooBig"));
    setBusy(true);
    try {
      const key = await uploadDocument(type, file, locale);
      setLocal({
        url: URL.createObjectURL(file),
        pdf: file.type === "application/pdf",
      });
      onChange(key);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.problem.detail ?? t("failed"))
          : te("network"),
      );
    } finally {
      setBusy(false);
    }
  }

  const preview = local ?? (value && savedUrl ? { url: savedUrl, pdf: false } : null);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-muted/50",
          invalid && "border-destructive",
        )}
      >
        {preview && !preview.pdf ? (
          // Plain <img>: presigned S3 links aren't worth configuring next/image remotePatterns for.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt={t("previewAlt")}
            className="size-full object-cover"
            // A saved PDF license comes back as a link with no type info: fall back to the file icon.
            onError={() => setLocal((l) => l ?? { url: "", pdf: true })}
          />
        ) : preview?.pdf || value ? (
          <FileTextIcon aria-hidden="true" className="size-8 text-muted-foreground" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-8 text-muted-foreground" />
        )}
      </div>
      <label
        className={cn(
          buttonVariants({ variant: "outline" }),
          "relative w-full cursor-pointer focus-within:ring-3 focus-within:ring-ring/50",
          (busy || disabled) && "pointer-events-none opacity-50",
        )}
      >
        <input
          id={id}
          type="file"
          accept={accepted.join(",")}
          disabled={busy || disabled}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => void pick(e)}
          className="sr-only"
        />
        {busy ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
        {busy ? t("uploading") : value ? t("replace") : t("choose")}
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
