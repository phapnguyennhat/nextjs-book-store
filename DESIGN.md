---
name: Thoth
description: Many verified bookstores, one cart. A night-indigo postal world where every store is a stamp and verification is the postmark.
colors:
  night: "#172340"
  night-deep: "#111a33"
  night-raised: "#1c2950"
  night-line: "#2a3a66"
  night-ink: "#b9c1dd"
  dusk: "#2b3e78"
  moon: "#efedf3"
  crescent: "#f2dfa0"
  gold: "#e3a93c"
  teal: "#1e6e6a"
  ember: "#e46a33"
  background: "#f6f5f9"
  foreground: "#172340"
  popover: "#ffffff"
  secondary: "#e1e4f0"
  muted: "#e4e2ec"
  muted-foreground: "#4a5576"
  accent: "#d6eae6"
  accent-foreground: "#134e4b"
  border: "#c3c7da"
  input: "#a9afc6"
  destructive: "#b42318"
typography:
  display:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  caption:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
    fontFeature: "\"tnum\""
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "11.2px"
  full: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "64px"
  card-pad-mobile: "24px"
  card-pad: "40px"
  column-gap: "64px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "44px"
  button-default:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "40px"
  auth-card:
    backgroundColor: "{colors.moon}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-pad}"
  site-header:
    backgroundColor: "{colors.night-deep}"
    textColor: "{colors.moon}"
    height: "72px"
  header-search:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.moon}"
    rounded: "{rounded.md}"
    height: "40px"
  locale-switch-active:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.crescent}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  store-stamp:
    backgroundColor: "{colors.teal}"
    textColor: "#ffffff"
    padding: "16px"
---

# Design System: Thoth

## Overview

**Creative North Star: "Postmark & Parcel"**

Thoth is a marketplace of many bookstores, so the system is a post office at night. The ground is night indigo lit by a pale gold crescent; content sits on moon-white paper laid over it. Every store is a perforated stamp on one sheet, and the platform's verification is the circular postmark that cancels it. The metaphor is the brand's trust promise made visible: a store wears the postmark only once it has actually been approved.

The palette is fixed by the owner's Thoth illustration (night indigo, ibis teal, gold, ember, moon white) and every role is drawn from it. Density is calm: one dominant headline, one working card, generous gutters. Hierarchy comes from scale and weight within a single family, Be Vietnam Pro, chosen for full Vietnamese diacritic coverage. The world refuses the category default of a white centred login card beside a stock illustration.

Vietnamese is the default locale and English is first class; every string comes from `messages/{vi,en}.json` and every layout must hold both, including longer English labels and stacked Vietnamese diacritics.

**Key Characteristics:**
- Night-indigo chrome (header, hero ground, footer) with moon-white working surfaces.
- Gold marks the one forward action per view; teal carries links, focus and verification.
- Perforated stamps, circular crescent-ink postmarks, store codes `TH-0000` in tabular figures.
- One family, five weights (400 to 800), hierarchy by scale.
- Controls at 40px, primary actions at 44px.

## Colors

A deep, cool night palette with three warm-and-green accents from the Thoth illustration, each held to a narrow job.

### Primary
- **Ibis Gold** (`gold`): the forward action. Fill of the primary button (shadcn `--primary`), the 4px top rule on the auth card, the emphasised second sentence of the hero headline, text selection, the logo's crescent horns, and gold focus rings on night chrome.
- **Pale Crescent** (`crescent`): the moon. The decorative crescent in the hero, the "Thoth" wordmark, postmark ink, and the active locale label. Never a fill for controls.

### Secondary
- **Ibis Teal** (`teal`): links, focus rings on light surfaces (`--ring`), caret colour, native `accent-color`, and a stamp tone. Teal is the colour of trust and navigation.
- **Mint Wash** (`accent`, on `accent-foreground`): hover and selected wash on light surfaces.

### Tertiary
- **Ember** (`ember`): stamp tone only. It prints a store stamp; it never marks UI state or errors.
- **Dusk** (`dusk`): the glow at the top-left of the hero's radial gradient and a stamp tone.

### Neutral
- **Night** (`night`): main hero ground and the foreground text colour on light surfaces.
- **Night Deep** (`night-deep`): header, footer, hero gradient edge, scrollbar track, postmark outline.
- **Night Raised** (`night-raised`): inset fields and active pills on night (header search, active locale).
- **Night Line** (`night-line`): 1px rules and borders on night; scrollbar thumb.
- **Night Ink** (`night-ink`): secondary text on night (lead line, nav links, footer, captions).
- **Moon** (`moon`): auth card and stamp paper (the perforated margin).
- **Lavender Paper** (`background`), **Pale Slate** (`secondary`), **Mist** (`muted`), **Slate Ink** (`muted-foreground`): light-surface neutrals; `muted-foreground` is the description and hint colour inside cards.
- **Rule** (`border`) and **Field Stroke** (`input`): card dividers and the 1px stroke on inputs.
- **Brick** (`destructive`): validation errors only.

### Named Rules
**The Gold Is Forward Rule.** Gold fills exactly one control per view: the action that moves the user on (sign in, create account). Secondary actions are outline or ghost; links are teal. If two gold buttons are visible, one is wrong.

**The Teal Means Trust Rule.** Links, focus and verification speak teal. Do not use the shadcn `link` button variant on light surfaces; it inherits `--primary` and would print gold text.

**The Ember Is Ink Rule.** Ember appears only as stamp colour, never as warning, error or emphasis. Errors are `destructive`.

## Typography

**Display Font:** Be Vietnam Pro (with ui-sans-serif, system-ui)
**Body Font:** Be Vietnam Pro
**Label/Mono Font:** Be Vietnam Pro with tabular figures for codes, dates and counts

**Character:** One humanist grotesque, loaded at 400/500/600/700/800 with the Vietnamese subset. Display is heavy and tight; working text is quiet.

### Hierarchy
- **Display** (800, 2.25rem mobile / 3rem sm / 3.5rem lg, line-height 1.05, tight tracking, balanced wrap): the hero headline only; its second sentence is gold.
- **Headline** (800, 1.875rem, tight tracking): the card title (`h1`) of a working surface.
- **Lead** (400, 1.125rem, line-height 1.625, max ~32rem, `night-ink`): one line under the display.
- **Body** (400, 0.875rem in cards; inputs 1rem below md to avoid iOS zoom, 0.875rem from md): descriptions, hints, footer copy.
- **Label** (500, 0.875rem): field labels; links in labels are 600 teal.
- **Caption** (400, 0.75rem, tabular figures where numeric): stamp codes, captions, legal row, locale pill (600, uppercase).

### Named Rules
**The One Family Rule.** Hierarchy is built from Be Vietnam Pro's size and weight alone. No second display face, no system fallback used as a display face.

**The Tabular Ledger Rule.** Store codes (`TH-0142`), verification dates (`03.2026`) and cart counts use `tabular-nums`.

## Layout

Content is held in a centred `max-w-7xl` container with side gutters of 16px (mobile), 24px (sm) and 64px (lg). The header is sticky (`top-0`, `z-40`), 72px tall, solid `night-deep` with a `night-line` bottom rule; anything sticky below it offsets by at least 112px (`top-28`).

The auth layout is a 7fr / 5fr grid from lg with a 64px gap: the story column (display, lead, stamp sheet) left, the working card right and capped at 32rem. The story column is sticky on desktop so the longer sign-up form scrolls past it. Below lg the order flips: form first, stamp sheet beneath.

The footer is a four-column grid from md (1.4fr brand column plus three link columns), with a separate legal row under a `night-line` rule.

Vertical rhythm: 40px top/bottom padding on mobile, 64px on lg; 32px between display block and stamp sheet; 32px under the card description and above the card footer prompt.

## Elevation & Depth

Depth is mostly tonal: the night ramp (`night-deep` < `night` < `night-raised`) separates chrome, ground and inset fields, and 1px `night-line` rules divide bands. One true shadow exists: the working card floats over the night ground on a long, soft, downward shadow. The hero ground is a radial gradient from `dusk` at the top-left through `night` to `night-deep`.

### Shadow Vocabulary
- **Card Float** (`box-shadow: 0 24px 48px -24px rgb(0 0 0 / 0.55)`): the moon-white working card over night. Only one per view.

### Named Rules
**The Night Is Tonal Rule.** On night surfaces, step through the night ramp instead of adding shadows. The card float is the only shadow on the night ground.

## Shapes

Gently rounded: base radius 8px (`--radius: 0.5rem`) on buttons, inputs and input groups; 11.2px (`rounded-xl`) on the working card; 6px on night-chrome pills and the search field; full circles for the postmark and the hero crescent. The card's gold top rule is a flat 4px band clipped by the card's radius.

The signature silhouette is the **perforated stamp edge**: a CSS mask punching 5px-radius holes on a 14px pitch around a solid centre (`.stamp-perforated`), on moon paper with an 8px margin around the coloured stamp face (aspect 9:10).

## Components

### Buttons
Confident and plain; height carries the weight.
- **Shape:** gently rounded (8px).
- **Primary (`size="lg"`):** gold fill, night text, 44px tall, 16px horizontal padding, 1rem text, full width in forms. Hover drops to 80% gold. Shows a spinner at inline-start while submitting and disables.
- **Default size:** 40px tall, 12px padding, 0.875rem medium. Icon buttons 40px square.
- **Outline:** `background` fill with `border` stroke, hover `muted`. Used as the date-of-birth trigger (transparent fill, normal weight, value left, calendar icon right).
- **Focus:** teal border and a 3px teal ring at 50%. Active presses down 1px.
- **Invalid:** `destructive` border and 3px ring at 20%.

### Inputs / Fields
- **Style:** 40px tall, transparent fill on the moon card, 1px `input` stroke, 8px radius, 10px horizontal padding. Placeholder in `muted-foreground`. Caret is teal.
- **Password:** an input group of the same height with a 24px ghost icon toggle at inline-end (eye / eye-off), carrying `aria-pressed` and a localised `aria-label`.
- **Focus:** teal border plus 3px teal ring at 50%.
- **Error:** `destructive` border and ring; the message renders below via the field error slot; hints (`FieldDescription`) are linked with `aria-describedby` and replaced by the error when invalid.
- **Choice controls:** checkbox and radio use native-feel Base UI controls; radio options for sex sit in a three-column grid.

### Cards / Containers
- **Auth Card:** moon fill, 11.2px radius, 4px gold top rule, Card Float shadow, 24px padding (40px from sm). Title (Headline), one muted description line, form, then a centred muted prompt with a teal link to the other auth page.

### Navigation
- **Site Header:** sticky night-deep bar: logo (crescent mark plus 1.5rem 800 crescent wordmark), a search field on `night-raised` with `night-line` stroke (gold border and 30% gold ring on focus, gold caret; hidden below md), then nav links in `night-ink` turning moon on hover with a 3px gold focus ring at 60%. The sell link hides below sm; the cart always shows with a tabular count.
- **Locale Switcher:** a bordered `night-line` pill holding VI / EN links (uppercase, 0.75rem semibold). Active: `night-raised` fill, crescent text, `aria-current`. Each link carries its own `lang` and a full-language `aria-label`.
- **Footer:** night-deep, `night-ink` text, moon column headings, links underline and lighten on hover and focus.

### Store Stamp (signature)
A perforated moon-paper stamp around a coloured face: white text on teal and dusk, night text on ember (white on ember fails AA at ~3.2:1): code in tabular caption at top, store name bold in the middle, genre and city at the bottom. Stamps sit three across on one sheet with a caption that labels them as illustrative.

### Postmark (signature)
An inline SVG circular cancel: outer ring (r45, 3px) and inner ring (r27, 1.6px) in crescent, ring lettering from the localised `Banner.postmark` message and the verification month in 800-weight crescent ink with a `night-deep` paint-order outline for legibility over any stamp colour, plus three wavy cancel bars trailing left. Below sm it reduces to the rings and a check. It overhangs the stamp's top-right corner, rotated -14deg, and is `aria-hidden` with an `sr-only` "Verified {date}" sibling.

**Motion:** the postmark lands once on load: from -32deg, scale 1.6, 2px blur and zero opacity to -14deg, scale 1, over 520ms on `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 300ms + 220ms per stamp. Disabled under `prefers-reduced-motion`.

### Browser Surfaces
The browser chrome speaks the palette: text selection is gold on night, input carets are teal (gold in the night header search), native `accent-color` is teal, and the scrollbar is `night-line` on `night-deep`. The global outline colour is the ring at 50%.

## Do's and Don'ts

### Do:
- **Do** give each view exactly one gold control, the forward action, at 44px (`size="lg"`) and full width in forms.
- **Do** keep every interactive control at least 40px tall; icon-only toggles inside a 40px field may be 24px.
- **Do** use teal for links (600 weight, underline on hover and focus) and teal focus rings on light surfaces; use 3px gold rings at 60% on night chrome.
- **Do** show the postmark only on stores that are actually verified, with an `sr-only` text equivalent, and label placeholder stores as illustrative.
- **Do** set store codes, dates and counts in tabular figures.
- **Do** route every string through next-intl and check both VI and EN at mobile and desktop widths.
- **Do** honour `prefers-reduced-motion` for every entrance animation.

### Don't:
- **Don't** fill more than one control with gold, or use gold for links or secondary buttons.
- **Don't** use ember for errors, warnings or emphasis; it is stamp colour only.
- **Don't** add shadows on night surfaces beyond the single card float; step the night ramp instead.
- **Don't** introduce a second typeface or set display text in a system font.
- **Don't** place a white centred card beside a stock illustration; the story column is the stamp sheet.
- **Don't** hard-code copy in components; Vietnamese and English must both fit.
