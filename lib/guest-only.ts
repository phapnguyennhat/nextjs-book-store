import { safeNext } from "./safe-redirect.ts";

/** Pages for signed-out visitors only, with an optional locale prefix (vi is unprefixed, en is /en). */
const GUEST_ONLY = /^\/(?:(vi|en)\/)?(?:sign-in|sign-up)\/?$/;

/**
 * Where to send a signed-in visitor who opened a guest-only page, or null to let the request through.
 * Keeps the visitor's ?next= (same-site only) and their locale prefix.
 */
export function guestOnlyRedirect(pathname: string, search: string, signedIn: boolean) {
  const match = GUEST_ONLY.exec(pathname);
  if (!match || !signedIn) return null;
  // Keep an explicit prefix, /vi included: unprefixed paths follow the locale cookie, which may say otherwise.
  const prefix = match[1] ? `/${match[1]}` : "";
  const next = safeNext(new URLSearchParams(search).get("next"));
  return prefix && next === "/" ? prefix : `${prefix}${next}`;
}
