import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  // Vietnamese keeps clean URLs (/sign-in); English is prefixed (/en/sign-in).
  localePrefix: "as-needed",
});
