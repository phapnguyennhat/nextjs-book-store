import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignUp } from "@/components/auth/sign-up";
import type { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-up">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "SignUp",
  });
  return { title: t("metaTitle") };
}

export default async function SignUpPage({
  params,
}: PageProps<"/[locale]/sign-up">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <SignUp />;
}
