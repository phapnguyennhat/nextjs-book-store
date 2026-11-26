import { SearchIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StoreStamp } from "@/components/auth/stamp-sheet";
import { BookShelf } from "@/components/home/book-shelf";
import { GenreStamps } from "@/components/home/genre-stamps";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { routing } from "@/i18n/routing";
import { deals, newArrivals, stores, suggested } from "@/lib/mock/catalog";
import { cn } from "@/lib/utils";

type Locale = (typeof routing.locales)[number];

const gutter = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-16";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("Home");
  const banner = await getTranslations("Banner");

  return (
    <>
      <SiteHeader search={false} />
      <main className="flex-1">
        {/* Hero: the promise, a search, and the genre sheet. */}
        <section className="relative overflow-clip bg-night bg-[radial-gradient(circle_at_18%_0%,var(--dusk)_0,var(--night)_40%,var(--night-deep)_75%)] text-moon">
          <div
            className={cn(
              gutter,
              "relative grid gap-10 py-10 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-16",
            )}
          >
            <div className="flex min-w-0 flex-col gap-6">
              <h1 className="max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
                {banner.rich("headline", {
                  em: (chunks) => <span className="text-gold">{chunks}</span>,
                })}
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-night-ink">
                {t("lead")}
              </p>
              {/* shortcut: plain GET to /search, same as the header search */}
              <form action="/search" role="search" className="max-w-lg">
                <label htmlFor="hero-search" className="sr-only">
                  {t("searchLabel")}
                </label>
                <div className="flex h-12 items-center gap-2 rounded-lg border border-night-line bg-night-raised pr-1 pl-3 focus-within:border-gold focus-within:ring-3 focus-within:ring-gold/30">
                  <SearchIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-night-ink"
                  />
                  <input
                    id="hero-search"
                    name="q"
                    type="search"
                    placeholder={t("searchPlaceholder")}
                    className="h-full min-w-0 flex-1 bg-transparent text-base text-moon caret-gold outline-none placeholder:text-night-ink"
                  />
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants(),
                      "focus-visible:border-gold focus-visible:ring-gold/60",
                    )}
                  >
                    {t("search")}
                  </button>
                </div>
              </form>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <h2 id="genres" className="text-sm font-semibold text-night-ink">
                {t("browseGenres")}
              </h2>
              <GenreStamps labelledBy="genres" />
            </div>
          </div>
        </section>

        {/* Shelves on paper. */}
        <div
          className={cn(
            gutter,
            "flex flex-col gap-14 py-12 lg:gap-20 lg:py-16",
          )}
        >
          <BookShelf
            id="suggested"
            title={t("suggested")}
            books={suggested}
            href="/books?sort=suggested"
            note={t("sampleNote")}
          />
          <BookShelf
            id="new"
            title={t("newArrivals")}
            books={newArrivals}
            href="/books?sort=new"
          />
        </div>
        <div className="border-t border-border bg-muted">
          <div className={cn(gutter, "py-12 lg:py-16")}>
            <BookShelf
              id="deals"
              title={t("deals")}
              books={deals}
              href="/books?sort=deals"
            />
          </div>
        </div>

        {/* The stores themselves, each wearing its postmark. */}
        <section
          aria-labelledby="stores"
          className="overflow-clip border-y border-night-line bg-night text-moon"
        >
          <div
            className={cn(
              gutter,
              "grid gap-10 py-12 lg:grid-cols-[4fr_8fr] lg:gap-16 lg:py-16",
            )}
          >
            <div className="flex flex-col gap-4">
              <h2
                id="stores"
                className="text-3xl font-extrabold tracking-tight text-balance"
              >
                {t("storesTitle")}
              </h2>
              <p className="max-w-sm leading-relaxed text-night-ink">
                {t("storesLead")}
              </p>
              <Link
                href="/stores"
                className="w-fit rounded-md py-1 text-sm font-semibold text-crescent underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none"
              >
                {t("allStores")}
              </Link>
            </div>
            <figure className="flex flex-col gap-4">
              <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 sm:gap-5">
                {stores.map((store, i) => (
                  <li key={store.code}>
                    <Link
                      href={`/stores/${store.code}`}
                      className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-gold/60"
                    >
                      <StoreStamp
                        {...store}
                        genre={t(`category.${store.genre}`)}
                        postmark={banner("postmark")}
                        verifiedLabel={banner("verifiedOn", {
                          date: store.verifiedOn,
                        })}
                        delayMs={300 + i * 220}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <figcaption className="text-xs text-night-ink">
                {banner("caption")}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Seller invitation: a blank stamp waiting for its postmark. */}
        <section
          aria-labelledby="sell"
          className={cn(gutter, "py-12 lg:py-16")}
        >
          <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,13rem)_1fr] lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-16">
            {/* hairline outline (applied after the mask) so the perforated moon edge reads on light paper */}
            <div className="w-40 -rotate-3 [filter:drop-shadow(0_0_0.6px_var(--input))_drop-shadow(0_0_0.6px_var(--input))] sm:w-full">
              <StoreStamp
                code="TH-????"
                name={t("sellStampName")}
                genre={t("sellStampGenre")}
                city={t("sellStampCity")}
                tone="bg-night text-crescent"
                verifiedOn={null}
                postmark=""
                delayMs={0}
              />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2
                  id="sell"
                  className="text-3xl font-extrabold tracking-tight text-balance"
                >
                  {t("sellTitle")}
                </h2>
                <p className="max-w-xl leading-relaxed text-muted-foreground">
                  {t("sellLead")}
                </p>
              </div>
              <ol className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                {(["register", "kyc", "review"] as const).map((step) => (
                  <li key={step} className="flex flex-col gap-1">
                    <span className="font-semibold">
                      {t(`sellSteps.${step}.title`)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t(`sellSteps.${step}.body`)}
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href="/sell"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-fit",
                )}
              >
                {t("sellCta")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
