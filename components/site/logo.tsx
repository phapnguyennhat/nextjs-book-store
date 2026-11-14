import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Thoth's lunar headdress: a full moon disc cradled between upturned crescent horns.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <path
        d="M6.6 4A13 13 0 1 0 25.4 4A11 11 0 1 1 6.6 4Z"
        fill="var(--gold)"
      />
      <circle cx="16" cy="13" r="5.5" fill="var(--moon)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 rounded-md text-2xl font-extrabold tracking-tight text-crescent outline-none focus-visible:ring-3 focus-visible:ring-gold/60",
        className,
      )}
    >
      <LogoMark />
      Thoth
    </Link>
  );
}
