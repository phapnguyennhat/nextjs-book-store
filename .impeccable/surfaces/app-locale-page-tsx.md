---
version: 1
slug: "app-locale-page-tsx"
primary_target: "app/[locale]/page.tsx"
related_targets: []
---

# Home page (storefront)

Scope: buyer-facing home at `/[locale]`. Mode: Operate (browse and discover; code-led). World: established Thoth "Postmark & Parcel" (DESIGN.md), unchanged.

Audience/job: buyers arriving to browse across stores; pick a category, scan suggestions, open a book. All data is mock and labelled illustrative (no real stores, ratings or sales claims).

Sections (user-confirmed): night hero with search + genre stamp sheet (categories); Suggested for you; New arrivals; Deals; Verified stores strip; Sell-on-Thoth band.

## Direction contract

THESIS: The home page is a stamp album: categories are a perforated sheet of genre stamps, books are mounted specimens labelled with their store. Refuses the category default of a carousel banner over identical white product tiles.

OWN-WORLD: Night-indigo hero and stores band; lavender paper for shelves. Genre stamps in teal/dusk/ember/gold/night faces on moon perforated paper. Book covers are authored typographic jackets in palette cloth colours. Store name on every book in teal; prices in tabular VND. Gold only on the single hero search submit.

STORY: Visitor sees the promise (many verified stores, one cart), picks a genre stamp or searches, scans suggestions knowing which store each book comes from, then sees the verified stores themselves.

FIRST VIEWPORT: Left: display headline (gold second sentence), lead, 48px search with gold submit. Below/right: a sheet of 8 genre stamps, 4 across desktop, horizontally scrollable on mobile. Top of the Suggested shelf peeks above the fold on desktop.

FORM: Stamp album, position 3 on ordered list (dealt lead). seed:53fcafb4e16d54c1

Signature interaction: genre stamps lift and tilt slightly on hover/focus; postmarks land once on verified store stamps (existing motion), reduced-motion respected.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
