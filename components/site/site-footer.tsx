import { useTranslations } from "next-intl";

import { LogoMark } from "@/components/site/logo";
import { Link } from "@/i18n/navigation";

// Placeholder routes: these pages do not exist yet.
const columns = [
  {
    title: "shop",
    links: [
      { href: "/books", label: "allBooks" },
      { href: "/stores", label: "stores" },
      { href: "/orders", label: "trackOrder" },
    ],
  },
  {
    title: "sellers",
    links: [
      { href: "/sell", label: "openStore" },
      { href: "/sell/verification", label: "verification" },
      { href: "/sell/fees", label: "fees" },
    ],
  },
  {
    title: "support",
    links: [
      { href: "/help", label: "helpCenter" },
      { href: "/help/returns", label: "returns" },
      { href: "/contact", label: "contact" },
    ],
  },
] as const;

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-night-line bg-night-deep text-night-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-16">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-xl font-extrabold text-crescent">
            <LogoMark className="size-7" />
            Thoth
          </div>
          <p className="max-w-xs text-sm leading-relaxed">{t("tagline")}</p>
        </div>
        {columns.map((col) => (
          <nav
            key={col.title}
            aria-label={t(col.title)}
            className="flex flex-col gap-3 text-sm"
          >
            <h2 className="font-semibold text-moon">{t(col.title)}</h2>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit underline-offset-4 transition-colors hover:text-moon hover:underline focus-visible:text-moon focus-visible:underline focus-visible:outline-none"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-night-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:justify-between sm:px-6 lg:px-16">
          <p>{t("copyright", { year: 2026 })}</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-moon">
              {t("terms")}
            </Link>
            <Link href="/privacy" className="hover:text-moon">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
