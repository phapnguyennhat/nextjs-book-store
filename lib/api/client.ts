/**
 * Browser-side client for the Spring Boot API, reached through the Next.js /api rewrite (same origin).
 * Auth is cookie-based: the backend sets httpOnly access/refresh cookies, so this code never sees a token.
 */

/** RFC 9457 problem detail, as returned by the backend's ApiExceptionHandler. */
export type ProblemDetail = {
  status: number;
  title?: string;
  /** Translated for people, in the request's Accept-Language. */
  detail?: string;
  /** Stable code to branch on, e.g. "validation", "auth.invalid-credentials". */
  code?: string;
  /** Per-field messages when code === "validation". */
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  readonly problem: ProblemDetail;
  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `HTTP ${problem.status}`);
    this.problem = problem;
  }
  get status() {
    return this.problem.status;
  }
  get code() {
    return this.problem.code;
  }
}

/** The request never got an HTTP response (offline, backend down, proxy error page). */
export class NetworkError extends Error {}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Locale for the backend's translated error messages. */
  locale: string;
  /** Internal: set on the retry after a token refresh, so it happens at most once. */
  retried?: boolean;
};

// These endpoints answer 401 for bad credentials, not an expired session, so never refresh-and-retry them.
const NO_REFRESH = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/verify-email",
];

export async function api<T>(
  path: string,
  { method = "GET", body, locale, retried }: ApiOptions,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  }

  // Access cookie lives 15 minutes: on 401, rotate it with the refresh cookie once and replay the request.
  if (res.status === 401 && !retried && !NO_REFRESH.includes(path)) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => null);
    if (refreshed?.ok)
      return api<T>(path, { method, body, locale, retried: true });
  }

  if (res.ok) {
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const problem = (await res.json().catch(() => null)) as ProblemDetail | null;
  if (!problem || typeof problem.status !== "number") {
    // 5xx without a problem body: the proxy's error page while the backend is down, so we never reached the API.
    if (res.status >= 500) throw new NetworkError();
    // 4xx without a body is still a real answer, e.g. Spring Security's bare 401 for a signed-out caller.
    throw new ApiError({ status: res.status });
  }
  throw new ApiError(problem);
}
