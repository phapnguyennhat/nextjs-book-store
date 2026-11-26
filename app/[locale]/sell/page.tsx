import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Sell } from "@/components/shop/sell";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sell">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Sell" });
  return { title: t("metaTitle") };
}

// Static shell; everything about the seller is loaded in the browser (see SessionProvider for why).
export default async function SellPage({ params }: PageProps<"/[locale]/sell">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Sell");

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-night bg-[radial-gradient(circle_at_18%_0%,var(--dusk)_0,var(--night)_40%,var(--night-deep)_75%)] text-moon">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-night-ink">{t("lead")}</p>
          </div>
          <Sell />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
