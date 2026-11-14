"use client";

import { LogOutIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useSession } from "@/components/session-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/api/auth";
import { initials } from "@/lib/initials";

const navLink =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-night-ink transition-colors hover:text-moon focus-visible:ring-3 focus-visible:ring-gold/60 focus-visible:outline-none";

/** Header account slot: avatar + full name when signed in, a sign-in link when not. */
export function UserMenu() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const { user, setUser } = useSession();

  // Loading: hold the slot's size so the header doesn't jump when the user arrives.
  if (user === undefined) {
    return (
      <span
        aria-hidden="true"
        className="size-8 rounded-full bg-night-raised"
      />
    );
  }

  if (user === null) {
    return (
      <Link href="/sign-in" className={navLink}>
        {t("signIn")}
      </Link>
    );
  }

  async function signOut() {
    await logout(locale).catch(() => {}); // best effort: the backend clears cookies even for dead tokens
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        // Name included: the accessible name must contain the visible text (WCAG 2.5.3).
        aria-label={`${t("account")}: ${user.fullName}`}
        className="flex max-w-56 items-center gap-2.5 rounded-full py-1 pr-1 pl-1 text-sm text-moon outline-none hover:bg-night-raised focus-visible:ring-3 focus-visible:ring-gold/60 data-[popup-open]:bg-night-raised sm:pr-3"
      >
        <Avatar>
          <AvatarFallback className="bg-dusk text-xs font-bold text-crescent">
            {initials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden truncate font-semibold sm:inline">
          {user.fullName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.fullName}
            </span>
            <span className="truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="py-2" onClick={() => void signOut()}>
            <LogOutIcon />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
