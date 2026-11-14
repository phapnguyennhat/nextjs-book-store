---
version: 1
slug: "app-auth-sign-in-page-tsx"
primary_target: "app/(auth)/sign-in/page.tsx"
related_targets: ["app/(auth)/sign-up/page.tsx"]
---

# Auth surfaces: sign in and sign up

Mode: Operate. Audience: buyers (and future sellers) creating or opening a Thoth account. Task: sign in with email + password; sign up with full name, email, password, confirm password, date of birth, sex. Constraints: Vietnamese default copy, zod + react-hook-form + shadcn/ui, Thoth palette pinned by the user (night indigo, ibis teal, gold, ember, moon white). Unresolved: real auth backend, EN translation, OAuth providers, terms/privacy pages.

## Direction contract

THESIS: Every store on Thoth is a stamp on one sheet, and verification is the postmark that cancels it. Refuses the category default of a white centered card beside a stock illustration.

OWN-WORLD: Night-indigo ground (#172340 to #111A33) with a pale gold crescent; moon-white form card (#EFEDF3) with a 4px gold top rule; gold (#E3A93C) reserved for the single forward action; teal (#1E6E6A) for links and verification; ember (#E46A33) as a stamp ink only. Perforated stamp edges, circular gold postmarks, store codes TH-0000 in tabular figures. Be Vietnam Pro throughout, hierarchy by scale.

STORY: The visitor sees that Thoth gathers many verified bookstores into one cart, then signs in or creates an account without friction.

FIRST VIEWPORT: Indigo header (crescent logo, search, sell link, cart). Left 7 columns: 56px headline "Nhiều hiệu sách. Một giỏ hàng." with the second sentence in gold, one lead line, a sheet of three perforated store stamps, two postmarked ĐÃ XÁC MINH. Right 5 columns: the form card, gold primary button full width. Mobile: form first, stamp sheet below.

FORM: Postmark & Parcel, candidate 4 of 7 on my ordered list, seed:7a4be695c7215010. Signature move: the postmark stamps down onto a store stamp once on load (scale and rotate in, reduced-motion respected).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
