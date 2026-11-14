import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
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
  const t = await getTranslations("SignIn");

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      footer={{
        prompt: t("noAccount"),
        href: "/sign-up",
        label: t("signUpLink"),
      }}
    >
      <SignInForm />
    </AuthCard>
  );
}
