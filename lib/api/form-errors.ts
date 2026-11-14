import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "./client.ts";

/**
 * Routes an API failure to the form: per-field messages onto their fields (the backend already translated
 * them via Accept-Language), and returns the message for a form-level alert, or null when every error
 * landed on a field.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  fallback: { network: string; unexpected: string },
  /** Codes that belong to one field rather than the whole form, e.g. { "auth.email-taken": "email" }. */
  fieldCodes: Record<string, Path<T>> = {},
): string | null {
  if (!(error instanceof ApiError)) return fallback.network;

  const { code, detail, errors } = error.problem;
  if (code && fieldCodes[code]) {
    setError(
      fieldCodes[code],
      { type: "server", message: detail },
      { shouldFocus: true },
    );
    return null;
  }

  if (code === "validation" && errors) {
    let unmatched = false;
    let first = true;
    for (const [field, message] of Object.entries(errors)) {
      if ((fields as readonly string[]).includes(field)) {
        setError(
          field as Path<T>,
          { type: "server", message },
          { shouldFocus: first },
        );
        first = false;
      } else {
        unmatched = true;
      }
    }
    return unmatched ? (detail ?? fallback.unexpected) : null;
  }

  return detail ?? fallback.unexpected;
}
