import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { guestOnlyRedirect } from "./lib/guest-only";

const intl = createMiddleware(routing);

// Set by the Spring Boot backend (httpOnly, path "/", expires with the 15-minute token). Its presence is an
// optimistic "signed in": good enough to skip the sign-in form. Real authorization stays on the backend,
// and the client re-checks via SessionProvider (which also covers a session kept alive only by the refresh cookie).
const ACCESS_COOKIE = "access_token";

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const target = guestOnlyRedirect(pathname, search, request.cookies.has(ACCESS_COOKIE));
  if (target) return NextResponse.redirect(new URL(target, request.url));
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
