"use client";

import * as React from "react";

import { useSession } from "@/components/session-provider";
import { useRouter } from "@/i18n/navigation";
import { safeNext } from "@/lib/safe-redirect";

/**
 * Client half of "signed-in users can't use sign-in/sign-up" (proxy.ts is the server half). Needed when the
 * access cookie expired but the refresh cookie still holds the session: only the browser can see that.
 * Returns true once the visitor is known to be signed in, so the page can stop rendering its form.
 */
export function useGuestOnly() {
  const { user } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) return;
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(safeNext(next));
  }, [user, router]);

  return !!user;
}
