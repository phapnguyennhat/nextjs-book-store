import {
  FeatherIcon,
  LandmarkIcon,
  LibraryIcon,
  RabbitIcon,
  SproutIcon,
  TelescopeIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/mock/catalog";
import { cn } from "@/lib/utils";

const icons = {
  feather: FeatherIcon,
  zap: ZapIcon,
  rabbit: RabbitIcon,
  landmark: LandmarkIcon,
  telescope: TelescopeIcon,
  trending: TrendingUpIcon,
  sprout: SproutIcon,
  library: LibraryIcon,
};

// Categories as a sheet of genre stamps: a swipeable strip on phones, a 4 × 2 sheet from sm.
export function GenreStamps({ labelledBy }: { labelledBy: string }) {
  const t = useTranslations("Home");
  return (
    <nav aria-labelledby={labelledBy}>
      <ul className="-mx-4 grid snap-x scroll-px-4 auto-cols-[38%] grid-flow-col gap-3 overflow-x-auto px-4 pt-2 pb-3 sm:mx-0 sm:grid-flow-row sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:p-0">
        {categories.map((c, i) => {
          const Icon = icons[c.icon];
          return (
            <li key={c.slug} className="snap-start">
              <Link
                href={`/categories/${c.slug}`}
                className={cn(
                  "group block rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:ring-3 focus-visible:ring-gold/60 motion-reduce:transition-none",
                  i % 2
                    ? "hover:rotate-2 focus-visible:rotate-2"
                    : "hover:-rotate-2 focus-visible:-rotate-2",
                )}
              >
                <span className="stamp-perforated block bg-moon p-2">
                  <span
                    className={cn(
                      "flex aspect-[4/5] flex-col justify-between p-3",
                      c.tone,
                    )}
                  >
                    <span className="flex items-start justify-between">
                      <span className="text-xs font-semibold tracking-[0.12em] uppercase opacity-80">
                        Thoth
                      </span>
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.75}
                        className="size-7 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none sm:size-8"
                      />
                    </span>
                    <span className="text-base leading-tight font-bold text-balance">
                      {t(`category.${c.slug}`)}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
