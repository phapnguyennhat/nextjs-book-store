"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className="flex items-center rounded-md border border-night-line p-0.5 text-xs font-semibold"
    >
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          aria-label={t(locale)}
          aria-current={locale === active ? "true" : undefined}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none",
            locale === active
              ? "bg-night-raised text-crescent"
              : "text-night-ink hover:text-moon",
          )}
        >
          {locale}
        </Link>
      ))}
    </nav>
  );
}
