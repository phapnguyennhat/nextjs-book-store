import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

// Illustrative stores only (labelled on screen); replace with real verified stores.
const stores = [
  {
    code: "TH-0142",
    name: "Hiệu sách Gác Xép",
    genre: "literature",
    city: "Hà Nội",
    tone: "bg-teal text-white",
    verifiedOn: "03.2026",
  },
  {
    code: "TH-0207",
    name: "Sách Cũ Ngõ 12",
    genre: "secondhand",
    city: "Huế",
    tone: "bg-ember text-night",
    verifiedOn: null,
  },
  {
    code: "TH-0311",
    name: "Kệ Truyện Tranh",
    genre: "manga",
    city: "TP.HCM",
    tone: "bg-dusk text-white",
    verifiedOn: "08.2026",
  },
] as const;

export function StampSheet() {
  const t = useTranslations("Banner");
  return (
    <figure className="flex flex-col gap-4">
      <ul className="grid grid-cols-3 gap-3 sm:gap-5">
        {stores.map((store, i) => (
          <li key={store.code}>
            <StoreStamp
              {...store}
              genre={t(`genre.${store.genre}`)}
              postmark={t("postmark")}
              verifiedLabel={
                store.verifiedOn && t("verifiedOn", { date: store.verifiedOn })
              }
              delayMs={300 + i * 220}
            />
          </li>
        ))}
      </ul>
      <figcaption className="text-xs text-night-ink">{t("caption")}</figcaption>
    </figure>
  );
}

// A store as a perforated stamp; the postmark lands only when the store is verified.
export function StoreStamp({
  code,
  name,
  genre,
  city,
  tone,
  verifiedOn,
  postmark,
  verifiedLabel,
  delayMs,
}: {
  code: string;
  name: string;
  genre: string;
  city: string;
  tone: string;
  verifiedOn: string | null;
  postmark: string;
  verifiedLabel?: string | null;
  delayMs: number;
}) {
  return (
    <div className="relative">
      <div className="stamp-perforated bg-moon p-2">
        <div
          className={cn(
            "flex aspect-[9/10] flex-col justify-between p-3 sm:p-4",
            tone,
          )}
        >
          <span className="text-[11px] font-medium tabular-nums opacity-90 sm:text-xs">
            {code}
          </span>
          <span className="text-sm leading-tight font-bold sm:text-base">
            {name}
          </span>
          <span className="text-[11px] opacity-90 sm:text-xs">
            {genre} · {city}
          </span>
        </div>
      </div>
      {verifiedOn && (
        <>
          <span className="sr-only">{verifiedLabel}</span>
          <Postmark
            id={code}
            label={postmark}
            date={verifiedOn}
            className="postmark pointer-events-none absolute -top-3 -right-3 w-22 sm:-top-5 sm:-right-6 sm:w-40"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        </>
      )}
    </div>
  );
}

// A circular cancel struck in ink: ring lettering, the verification month, wavy bars
// trailing left across the stamp's top margin. On stamps, below sm only the rings and a tick remain.
// ink "crescent" is for dark stamp faces; "teal" (Teal Means Trust) is for light grounds like the card.
export function Postmark({
  id,
  label,
  date,
  ink: inkTone = "crescent",
  responsive = true,
  className,
  style,
}: {
  id: string;
  label: string;
  date: string;
  ink?: "crescent" | "teal";
  /** false: always full detail, for places with room (the verify-email card). */
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ring = `postmark-ring-${id}`;
  const color = inkTone === "teal" ? "var(--teal)" : "var(--crescent)";
  const halo = inkTone === "teal" ? "var(--moon)" : "var(--night-deep)";
  const full = responsive ? "hidden sm:inline" : undefined;
  const tick = responsive ? "sm:hidden" : "hidden";
  // A thin outline in the ground colour under the ink keeps it legible on whatever it lands on.
  const ink = {
    fill: color,
    stroke: halo,
    strokeWidth: 2.4,
    paintOrder: "stroke",
    strokeLinejoin: "round",
  } as const;
  const line = {
    fill: "none",
    stroke: color,
    strokeLinecap: "round",
  } as const;
  return (
    <svg
      viewBox="-64 0 164 100"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <path id={ring} d="M50 50m-33 0a33 33 0 1 1 66 0a33 33 0 1 1-66 0" />
      </defs>
      <g className={full} {...line} strokeWidth="2.2" opacity="0.9">
        <path d="M-60 14q7.5-5 15 0t15 0t15 0t15 0" />
        <path d="M-60 23q7.5-5 15 0t15 0t15 0t15 0" />
        <path d="M-60 32q7.5-5 15 0t15 0t15 0t15 0" />
      </g>
      <circle cx="50" cy="50" r="45" {...line} strokeWidth="3" />
      <circle cx="50" cy="50" r="27" {...line} strokeWidth="1.6" />
      <g className={full}>
        <text {...ink} fontSize="11" fontWeight="800" letterSpacing="1">
          <textPath href={`#${ring}`} textLength="204" lengthAdjust="spacing">
            {label}
          </textPath>
        </text>
        <text
          {...ink}
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="800"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {date}
        </text>
      </g>
      <path
        className={tick}
        d="M38 51l8 8 17-18"
        {...line}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
