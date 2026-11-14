import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VerifyEmail } from "@/components/auth/verify-email";
import type { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/verify-email">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "VerifyEmail",
  });
  // Token links must never be indexed or followed by crawlers.
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function VerifyEmailPage({
  params,
}: PageProps<"/[locale]/verify-email">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // The token lives in ?token=, read on the client; Suspense keeps the rest of the page static.
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
