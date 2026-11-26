import { SearchIcon, ShoppingBagIcon, StoreIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { UserMenu } from "@/components/site/user-menu";
import { Link } from "@/i18n/navigation";

const navLink =
  "flex items-center gap-2 rounded-md px-2 py-2 text-night-ink sm:px-3 transition-colors hover:text-moon focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none";

// search=false on pages that carry their own search (the home hero), so a view has one search.
export function SiteHeader({ search = true }: { search?: boolean }) {
  const t = useTranslations("Header");

  return (
    // Stays fixed to the top while the page scrolls.
    <header className="sticky top-0 z-40 border-b border-night-line bg-night-deep text-moon">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-16">
        <Logo />

        {/* shortcut: plain GET to /search, wire to the catalog service when it exists */}
        {search && (
          <form
            action="/search"
            role="search"
            className="hidden flex-1 md:block md:max-w-lg"
          >
            <label htmlFor="site-search" className="sr-only">
              {t("searchLabel")}
            </label>
            <div className="flex h-10 items-center gap-2 rounded-md border border-night-line bg-night-raised px-3 focus-within:border-gold focus-within:ring-3 focus-within:ring-gold/30">
              <SearchIcon
                aria-hidden="true"
                className="size-4 text-night-ink"
              />
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder={t("searchPlaceholder")}
                className="h-full flex-1 bg-transparent text-sm text-moon caret-gold outline-none placeholder:text-night-ink"
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <nav
            aria-label={t("mainNav")}
            className="flex items-center gap-1 text-sm"
          >
            <Link href="/sell" className={`hidden sm:flex ${navLink}`}>
              <StoreIcon aria-hidden="true" className="size-4" />
              {t("sell")}
            </Link>
            <Link href="/cart" className={navLink}>
              <ShoppingBagIcon aria-hidden="true" className="size-4" />
              {/* Below 400px the header cannot fit the label next to the account avatar; keep it for screen readers. */}
              <span className="whitespace-nowrap tabular-nums max-[399px]:sr-only">
                {t("cart", { count: 0 })}
              </span>
            </Link>
          </nav>
          <LocaleSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
