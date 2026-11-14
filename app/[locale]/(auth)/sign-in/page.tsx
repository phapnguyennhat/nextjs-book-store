import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignIn } from "@/components/auth/sign-in";
import type { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "SignIn",
  });
  return { title: t("metaTitle") };
}

export default async function SignInPage({
  params,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <SignIn />;
}
