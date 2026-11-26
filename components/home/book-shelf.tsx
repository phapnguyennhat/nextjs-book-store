import { ArrowRightIcon, BadgeCheckIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { type Book, storeName } from "@/lib/mock/catalog";
import { cn } from "@/lib/utils";

export function BookShelf({
  id,
  title,
  books,
  href,
  note,
}: {
  id: string;
  title: string;
  books: Book[];
  href: string;
  note?: string;
}) {
  const t = useTranslations("Home");
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2
          id={id}
          className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]"
        >
          {title}
        </h2>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-md py-1 text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {t("seeAll")}
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {/* Swipeable row on small screens, a full shelf of six from lg. */}
      <ul className="-mx-4 grid snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 auto-cols-[44%] grid-flow-col gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:auto-cols-[29%] sm:px-6 lg:mx-0 lg:grid-flow-row lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {books.map((book) => (
          <li key={book.id} className="snap-start">
            <BookCard book={book} />
          </li>
        ))}
      </ul>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}

function BookCard({ book }: { book: Book }) {
  const t = useTranslations("Home");
  const format = useFormatter();
  const vnd = (n: number) =>
    format.number(n, { style: "currency", currency: "VND" });
  const off = book.listPrice
    ? Math.round((1 - book.price / book.listPrice) * 100)
    : 0;

  return (
    <Link
      href={`/books/${book.id}`}
      className="group relative flex flex-col gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      {/* Album mount: moon card, the jacket held by two photo corners. */}
      <div className="relative rounded-[3px] bg-moon p-[7%] ring-1 ring-border">
        <BookCover book={book} />
        <span className="absolute top-[4%] left-[4%] z-10 size-[16%] bg-night/80 [clip-path:polygon(0_0,100%_0,0_100%)]" />
        <span className="absolute right-[4%] bottom-[4%] z-10 size-[16%] bg-night/80 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold group-hover:underline group-hover:underline-offset-4">
          {book.title}
        </h3>
        <p className="truncate text-xs text-muted-foreground">{book.author}</p>
        <p className="flex items-center gap-1 text-xs font-medium text-teal">
          <BadgeCheckIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{storeName(book.store)}</span>
        </p>
        <p className="mt-1 flex items-baseline gap-2 tabular-nums">
          <span className="text-base font-bold">{vnd(book.price)}</span>
          {book.listPrice && (
            <span className="rounded-sm bg-accent px-1 text-xs font-semibold text-accent-foreground">
              {t("off", { percent: off })}
            </span>
          )}
        </p>
        {book.listPrice && (
          <p className="text-xs text-muted-foreground tabular-nums">
            <span className="sr-only">{t("listPrice")} </span>
            <s>{vnd(book.listPrice)}</s>
          </p>
        )}
      </div>
    </Link>
  );
}

// An authored typographic jacket: cloth colour, ink colour and one of four layouts.
function BookCover({ book }: { book: Book }) {
  const { style, cloth, ink } = book.cover;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "@container relative aspect-[2/3] overflow-hidden rounded-[3px] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none",
        cloth,
        ink,
      )}
    >
      {/* spine crease */}
      <span className="absolute inset-y-0 left-[5%] w-px bg-black/20" />
      <span className="absolute inset-y-0 left-[5%] ml-px w-px bg-white/15" />
      <div className="absolute inset-0 flex flex-col py-[9cqw] pr-[8cqw] pl-[13cqw]">
        {style === "band" && (
          <>
            <p className="text-[6.5cqw] font-semibold tracking-wide uppercase opacity-85">
              {book.author}
            </p>
            <p className="my-auto border-y-[1.5cqw] border-current py-[5cqw] text-[11cqw] leading-[1.05] font-extrabold text-balance">
              {book.title}
            </p>
          </>
        )}
        {style === "frame" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-[5cqw] rounded-[2px] border-[1.2cqw] border-current p-[6cqw] text-center">
            <p className="text-[11cqw] leading-[1.05] font-extrabold text-balance">
              {book.title}
            </p>
            <span className="h-[1.2cqw] w-[20cqw] bg-current" />
            <p className="text-[6.5cqw] font-medium opacity-85">
              {book.author}
            </p>
          </div>
        )}
        {style === "disc" && (
          <>
            <span className="mx-auto mt-[2cqw] aspect-square w-[46cqw] rounded-full border-[1.5cqw] border-current shadow-[inset_-9cqw_3cqw_0_0_currentColor] opacity-90" />
            <p className="mt-auto text-[10.5cqw] leading-[1.05] font-extrabold text-balance">
              {book.title}
            </p>
            <p className="mt-[3cqw] text-[6.5cqw] font-medium opacity-85">
              {book.author}
            </p>
          </>
        )}
        {style === "stack" && (
          <>
            <p className="text-[13cqw] leading-[0.98] font-extrabold tracking-tight break-words hyphens-auto">
              {book.title}
            </p>
            <p className="mt-auto border-t-[1cqw] border-current pt-[3cqw] text-[6.5cqw] font-semibold tracking-wide uppercase opacity-85">
              {book.author}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
