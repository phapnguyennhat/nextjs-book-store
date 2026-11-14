"use client";

import * as React from "react";
import { useLocale } from "next-intl";

import { me, type User } from "@/lib/api/auth";

/** undefined while loading, null when signed out. */
type Session = {
  user: User | null | undefined;
  /** Sign-in, sign-up and sign-out report the new user here so the persistent header updates at once. */
  setUser: (user: User | null) => void;
};

const SessionContext = React.createContext<Session | null>(null);

/**
 * Who is signed in, read once in the browser from /api/auth/me. Not done on the server: the access cookie
 * lives 15 minutes and only the browser can rotate it (the refresh cookie is scoped to /api/auth).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [user, setUser] = React.useState<User | null | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    me(locale).then(
      (u) => !cancelled && setUser(u),
      // 401 means signed out; on a network error a signed-out header is better than a broken one.
      () => !cancelled && setUser(null),
    );
    return () => {
      cancelled = true;
    };
  }, [locale]); // later changes arrive through setUser

  const value = React.useMemo(() => ({ user, setUser }), [user]);
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const session = React.useContext(SessionContext);
  if (!session)
    throw new Error("useSession must be used inside <SessionProvider>");
  return session;
}
