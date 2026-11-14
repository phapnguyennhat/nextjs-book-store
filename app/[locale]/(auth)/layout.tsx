import { getTranslations, setRequestLocale } from "next-intl/server";

import { StampSheet } from "@/components/auth/stamp-sheet";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { routing } from "@/i18n/routing";

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as (typeof routing.locales)[number]);
  const t = await getTranslations("Banner");

  return (
    <>
      <SiteHeader />
      <main className="relative flex-1 overflow-clip bg-night bg-[radial-gradient(circle_at_18%_0%,var(--dusk)_0,var(--night)_40%,var(--night-deep)_75%)] text-moon">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[7fr_5fr] lg:gap-16 lg:px-16 lg:py-16">
          {/* Sticks below the fixed header (h-18) while the longer sign-up form scrolls. */}
          <section className="relative order-2 flex flex-col gap-8 self-start lg:sticky lg:top-28 lg:order-1 lg:pt-6">
            <span
              aria-hidden="true"
              className="absolute -top-6 left-[min(460px,70%)] hidden size-44 rounded-full opacity-90 shadow-[inset_-34px_10px_0_0_var(--crescent)] lg:block"
            />
            <div className="relative flex flex-col gap-4">
              <p className="max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
                {t.rich("headline", {
                  em: (chunks) => <span className="text-gold">{chunks}</span>,
                })}
              </p>
              <p className="max-w-lg text-lg leading-relaxed text-night-ink">
                {t("lead")}
              </p>
            </div>
            <div className="max-w-xl">
              <StampSheet />
            </div>
          </section>
          <div className="order-1 w-full max-w-lg justify-self-center lg:order-2 lg:justify-self-end">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
