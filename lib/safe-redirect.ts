/**
 * Where to go after sign-in, from an untrusted ?next= value. Only same-site paths are allowed, so a crafted
 * link like /sign-in?next=https://evil.example cannot bounce a freshly signed-in user to another site.
 */
export function safeNext(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/")) return fallback;
  // "//host" and "/\host" are protocol-relative: browsers treat them as another origin.
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
