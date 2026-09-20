# Design: Mortar

The visual specification for Mortar, an internal operations tool for a Malaysian
property developer. It turns the
[design research](/docs/research/design/README.md) into binding values: how the
application looks and moves, with exact tokens for typeface, colour, layout,
motion, and every component across the system. Where this document and a
research page disagree, this one wins. Conventions for code live in
[AGENTS.md](/AGENTS.md) and [docs/agents/notes.md](/docs/agents/notes.md). This
document covers only how the application looks and moves.

The
[Mortar Design System](https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1)
in Figma (public, view only) and this document use the same token and style
names, so a design and its build compare line by line.

Contents:

1.  [Decisions](#decisions)
1.  [Typeface](#typeface)
1.  [Colour](#colour)
1.  [Spacing, Radius And Elevation](#spacing-radius-and-elevation)
1.  [Icons](#icons)
1.  [Motion](#motion)
1.  [Status Language](#status-language)
1.  [Data Formats](#data-formats)
1.  [Native Controls](#native-controls)
1.  [Components](#components)
1.  [App Shell](#app-shell)
1.  [Screen Density](#screen-density)
1.  [Public Pages](#public-pages)
1.  [Acceptance](#acceptance)
1.  [Do And Do Not](#do-and-do-not)
1.  [See Also](#see-also)

## Decisions

Seven core decisions were settled during design system research. All seven are
binding, and nothing below reopens them.

| Question        | Decision                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Look            | Flat ledger: white ground, white cards, 1px hairlines doing the separating, 6px radius. No glass and no backdrop blur (the sidebar scrim is the sole exception). No gradient, glow blob or card shadow in the application; the landing's chromatic panel is the one sanctioned gradient and the landing's three feature cards the one sanctioned card shadow. |
| Status colour   | Ink is the action colour everywhere, the landing included; the application carries no chromatic accent. The landing panel is the one chromatic surface, scoped to public pages. Six status tones carry every state, each always with a word.                                                                                                                  |
| Type            | Geist for UI, Geist Mono for unit codes and IDs. Nine text styles. No third family.                                                                                                                                                                                                                                                                           |
| Density         | Controls 36px, table rows 44px, body 14px. Built for a working day in lists.                                                                                                                                                                                                                                                                                  |
| Native controls | None. Select, date picker, menu, tooltip, file drop, checkbox and scrollbar are Mortar components (Radix/shadcn restyled). No alert/confirm/prompt.                                                                                                                                                                                                           |
| Modes           | Light and dark from one token set (Color collection has Light and Dark modes).                                                                                                                                                                                                                                                                                |
| Icons           | Lucide (lucide-react), 16px, stroke 2, coloured like adjacent text. 20px in empty states.                                                                                                                                                                                                                                                                     |

Mortar is an internal operations tool for developer staff tracking property unit
bookings from initial deposit through loan submission, loan approval, and final
Sale and Purchase Agreement (SPA) signing. The interface rejects decorative SaaS
styling: there are no frosted glass planes, no gradient card fills, no floating
drop shadows on data tables, and no neon glow blobs. Every screen presents a
crisp, high-density ledger on a white ground where data and actionable blockers
stand out immediately.

The application shell never uses a gradient. The single sanctioned gradient in
the product is the chromatic panel on the public landing, described in
[Landing](#landing); nothing inside `/chase`, `/bookings`, `/forecast` or
`/import` may reference its tokens.

## Typeface

Two families only, loaded as webfonts: Geist for UI prose and controls, and
Geist Mono for unit codes, booking reference numbers, and tabular data.

| Style           | Family And Weight | Size / Line | Tracking | Case   | Use                                        |
| --------------- | ----------------- | ----------- | -------- | ------ | ------------------------------------------ |
| Display/Page    | Geist SemiBold    | 24 / 32     | -2%      | Normal | Page titles                                |
| Display/Figure  | Geist SemiBold    | 30 / 36     | -3%      | Normal | KPI figures; tabular numerals in code      |
| Heading/Section | Geist SemiBold    | 16 / 24     | -1%      | Normal | Card and section titles                    |
| Body/Default    | Geist Regular     | 14 / 20     | 0        | Normal | Default UI and table text                  |
| Body/Small      | Geist Regular     | 13 / 18     | 0        | Normal | Secondary text, captions, helper text      |
| Label/Default   | Geist Medium      | 14 / 20     | 0        | Normal | Buttons, nav items, tabs                   |
| Label/Small     | Geist Medium      | 12 / 16     | 0        | Normal | Status pills, field labels                 |
| Eyebrow         | Geist SemiBold    | 11 / 14     | +8%      | UPPER  | Table column headers, section eyebrows     |
| Mono/Data       | Geist Mono Medium | 13 / 18     | 0        | Normal | Unit codes, booking IDs, reference numbers |

Rules that are not obvious from the table:

- **Landing type exceptions:** Three steps on the public landing sit outside the
  scale, and nowhere else may use them. The hero display line ("Booked Is Not
  Sold. Signed Is.") is Geist SemiBold `clamp(2.25rem, 5.4vw, 3.75rem)`,
  line-height `1.04`, tracking `-0.035em`. It takes no width cap because the
  break is set by hand: an explicit `<br />` after "Booked Is Not Sold." holds
  the two sentences on two lines at every width. The lead line under it is 17 /
  27 in `--muted-foreground`, capped at 52ch. The header wordmark is 15px Geist
  SemiBold at `-0.01em`.
- **Perch specimen conversion:** Perch's italic serif specimen lines become 14px
  Geist Regular in `--muted-foreground`. Do not load Newsreader or Georgia.
- **Tabular figures:** Numerical values in `Display/Figure`, money amounts, and
  booking age counters must use tabular numerals
  (`font-variant-numeric: tabular-nums`).
- **No third typeface:** Never load or declare a third typeface family.
- **Loading:** Fonts load with `font-display: swap` to prevent blocked renders.

### Text Case

Headings, subheadings, eyebrows, lead lines under titles, empty-state text, card
titles, button labels, form labels, menu items and footer text are Title Case,
capitalising every word including short ones (A, And, To, The); acronyms (SPA,
RM, FAQ) stay in capitals; data values, placeholders, aria-labels and
full-sentence toasts or tooltips keep their own case.

One carve-out applies to lead lines. A lead line written as a complete sentence
is set in sentence case and ends with a full stop; Title Case still applies to a
lead line that is a phrase. The landing's lead line is the example: "The AI
operations layer that names the blocker on every stuck booking." The same
reading governs card body copy, which is prose rather than a label — the card
title above it stays Title Case.

## Colour

Mortar components consume semantic tokens defined in CSS custom properties and
never write raw hex values. The primitives collection contains 18 calibrated
values across two neutral families, `ink` and `paper`. There is no chromatic
family: every colour in the application lives in the six status tones. The one
chromatic surface in the product is the landing panel, whose hues are
public-page tokens listed in [Landing Panel Tokens](#landing-panel-tokens).

### Primitives Summary

Primitives belong to the collection "Primitives", mapped in CSS as
`var(--color-<family>-<step>)`, hidden from design pickers:

- **`ink`:** 50 `#FAFAFA`, 100 `#F5F5F5`, 200 `#E5E5E5`, 300 `#D4D4D4`, 400
  `#A3A3A3`, 500 `#737373`, 600 `#525252`, 700 `#3A3A3A`, 800 `#262626`, 900
  `#141414`, 950 `#0A0A0A`. A neutral grey ramp, with none of the warm cast the
  earlier ink carried.
- **`paper`:** 0 `#FFFFFF`, 50 `#FCFCFC`, 100 `#FAFAFA`, 200 `#F5F5F5`, 300
  `#EFEFEF`, 400 `#E5E5E5`, 500 `#D4D4D4`.
- **Status Tones Are Not A Primitive Family:** No chromatic ramp exists. The six
  status tones are six bespoke desaturated pairs, tuned per mode for their own
  fill and text roles rather than drawn from a Tailwind family. Their values
  live in [Status Tones](#status-tones) and nowhere else.
- **Landing Hues Are Not A Primitive Family Either:** The four landing panel
  hues are not a ramp and are not primitives. They are semantic public-page
  tokens, defined once in `:root` and `.dark` and read only by
  `LandingPage.css`. Their values live in
  [Landing Panel Tokens](#landing-panel-tokens) and nowhere else.
- **Brand Mark (Kigumi Joint):** ink `#0A0A0A` + grey `#6B6B6B` in light mode;
  `#FAFAFA` + `#A1A1A1` in dark mode.

### Semantic Colour

The semantic collection "Color" defines functional roles across Light and Dark
modes:

| Token                         | CSS                        | Light                      | Dark                |
| ----------------------------- | -------------------------- | -------------------------- | ------------------- |
| `color/bg/page`               | `--background`             | `#FFFFFF` (paper/0)        | `#0A0A0A` (ink/950) |
| `color/bg/card`               | `--card`                   | `#FFFFFF` (paper/0)        | `#141414` (ink/900) |
| `color/bg/popover`            | `--popover`                | `#FFFFFF` (paper/0)        | `#1C1C1C`           |
| `color/bg/sidebar`            | `--sidebar`                | `#FFFFFF` (paper/0)        | `#0F0F0F`           |
| `color/bg/muted`              | `--muted`                  | `#F5F5F5` (paper/200)      | `#1C1C1C`           |
| `color/bg/hover`              | `--accent`                 | `#F0F0F0`                  | `#242424`           |
| `color/bg/selected`           | `--selected`               | `#F5F5F5` (paper/200)      | `#1F1F1F`           |
| `color/bg/inverse`            | `--inverse`                | `#0A0A0A` (ink/950)        | `#FAFAFA` (ink/50)  |
| `color/bg/primary`            | `--primary`                | `#0A0A0A` (ink/950)        | `#FAFAFA` (ink/50)  |
| `color/bg/primary-hover`      | `--primary-hover`          | `#262626` (ink/800)        | `#E5E5E5` (ink/200) |
| `color/bg/destructive`        | `--destructive`            | `#B3261E`                  | `#E05260`           |
| `color/bg/disabled`           | `--disabled`               | `#F5F5F5` (paper/200)      | `#1C1C1C`           |
| `color/text/primary`          | `--foreground`             | `#0A0A0A` (ink/950)        | `#FAFAFA` (ink/50)  |
| `color/text/muted`            | `--muted-foreground`       | `#6B6B6B`                  | `#A1A1A1`           |
| `color/text/on-primary`       | `--primary-foreground`     | `#FFFFFF` (paper/0)        | `#0A0A0A` (ink/950) |
| `color/text/on-inverse`       | `--inverse-foreground`     | `#FFFFFF` (paper/0)        | `#0A0A0A` (ink/950) |
| `color/text/on-destructive`   | `--destructive-foreground` | `#FFFFFF` (paper/0)        | `#0A0A0A` (ink/950) |
| `color/text/disabled`         | `--disabled-foreground`    | `#8A8A8A`                  | `#A3A3A3` (ink/400) |
| `color/text/link`             | `--link`                   | `#0A0A0A` (ink/950)        | `#FAFAFA` (ink/50)  |
| `color/border/default`        | `--border`                 | `#D8D8D8`                  | `#262626` (ink/800) |
| `color/border/strong`         | `--input`                  | `#C9C9C9`                  | `#3A3A3A` (ink/700) |
| `color/border/focus`          | `--ring`                   | `#0A0A0A` (ink/950)        | `#FAFAFA` (ink/50)  |
| `color/scrollbar/thumb`       | `--scrollbar-thumb`        | `#D8D8D8`                  | `#262626` (ink/800) |
| `color/scrollbar/thumb-hover` | `--scrollbar-thumb-hover`  | `#C9C9C9`                  | `#3A3A3A` (ink/700) |
| `color/bg/footer`             | `--footer`                 | `#FFFFFF` (paper/0)        | `#141414` (ink/900) |
| `color/bg/scrim`              | `--scrim`                  | ink-950 at 14% (color-mix) | black at 45%        |

### Status Tones

Six status tones carry every state. Each tone provides `fg` (text and icon),
`bg` (pill container fill), and `solid` (dot, bar, and chart series):

| Tone       | CSS Variable Prefix | fg (Light / Dark)     | bg (Light / Dark)     | solid (Light / Dark)  | Word       |
| ---------- | ------------------- | --------------------- | --------------------- | --------------------- | ---------- |
| `positive` | `--status-positive` | `#1F4D35` / `#A7D8BC` | `#EEF4F0` / `#12251B` | `#3E7D5A` / `#5FA57E` | On track   |
| `warning`  | `--status-warning`  | `#6B4E16` / `#E8CE8A` | `#F8F4E9` / `#2A2113` | `#A9852F` / `#C9A34A` | Watch      |
| `danger`   | `--status-danger`   | `#7A2230` / `#E9A8B0` | `#FAEEF0` / `#2B141A` | `#A53D4C` / `#C76A76` | At risk    |
| `info`     | `--status-info`     | `#1E3A5F` / `#AEC8E8` | `#EEF2F8` / `#141E2B` | `#3B6395` / `#6E9BD1` | With bank  |
| `neutral`  | `--status-neutral`  | `#525252` / `#D4D4D4` | `#F5F5F5` / `#1C1C1C` | `#A3A3A3` / `#6B6B6B` | Booked     |
| `signed`   | `--status-signed`   | `#FFFFFF` / `#0A0A0A` | `#0A0A0A` / `#FAFAFA` | `#0A0A0A` / `#FAFAFA` | SPA signed |

Rules that are not obvious from the table:

- **Ink Is The Action Colour:** Ink — `#0A0A0A` in light mode, `#FAFAFA` in dark
  — carries `--primary`, `--link` and `--ring`, and a grey step of the same ramp
  carries the `--selected` row ground. There is no chromatic accent anywhere in
  the application: colour appears only in the six status tones. The landing
  panel is the single chromatic surface and it is scoped to the public pages;
  ink still carries the button, the link and the focus ring on the landing
  itself.
- **Red is strictly for danger:** `--status-danger` and `--destructive` are
  restricted to risk conditions and irreversible actions (e.g. cancelling a
  booking).
- **Signed pill inversion:** `signed` is the only solid pill: its background
  uses solid `#0A0A0A` (light) / `#FAFAFA` (dark), its text uses
  `--status-signed-fg`, and its 6px dot uses the foreground color.
- **Chart series colours:** Data charts bind status solids directly: `signed`
  for actual signed SPAs, `info` for applications with banks, and `positive` /
  `warning` / `danger` for risk distributions.
- **Calibrated Contrast:** Muted text `#6B6B6B` reads 5.33:1 on white, above the
  WCAG AA 4.5:1 floor. The `#D8D8D8` hairline reads 1.43:1 against white — a
  deliberate step darker than `#E5E5E5`, whose 1.26:1 fell below the 1.40:1 the
  earlier hairline carried and lost the ledger structure on a white ground.
  White on primary `#0A0A0A` reads 19.8:1. In dark mode, ink on `#FAFAFA` reads
  18.97:1, and ink on destructive `#E05260` reads 5.23:1 where white would have
  read 3.79:1.
- **Static Board Chrome:** Fixed interface framing (cover, board title bars)
  binds primitives ink/900 `#141414` and paper/200 `#F5F5F5` so it never flips
  with theme modes.
- **No row tinting or zebra stripes:** Table rows remain neutral white or paper.
  Never tint an entire row with risk colours.

### Landing Panel Tokens

Six tokens exist solely to paint `.land-panel`, the chromatic gradient panel on
the public landing. They are defined in `:root` and `.dark` beside the semantic
colours and are read by `LandingPage.css` only:

| Token               | Light         | Dark         | Role                                  |
| ------------------- | ------------- | ------------ | ------------------------------------- |
| `--land-hue-a`      | `118 106 246` | `96 86 200`  | Top-left wash, drawn at 0.62 alpha    |
| `--land-hue-b`      | `52 184 243`  | `42 148 196` | Top-right wash, drawn at 0.55 alpha   |
| `--land-hue-c`      | `48 208 168`  | `38 166 134` | Bottom-right wash, drawn at 0.5 alpha |
| `--land-hue-d`      | `252 182 88`  | `200 146 70` | Bottom-left wash, drawn at 0.42 alpha |
| `--land-hue-veil`   | `236 232 255` | `40 44 60`   | Centre veil, drawn at 0.45 alpha      |
| `--land-panel-base` | `#E4E9F4`     | `#12161F`    | Flat base the five washes sit on      |

Rules that are not obvious from the table:

- **Channels, Not Colours:** The five hue tokens hold space-separated RGB
  channels rather than a hex value, so the panel can vary the alpha per wash
  with `rgb(var(--land-hue-a) / 0.62)`. `--land-panel-base` is a flat hex
  because nothing varies its alpha.
- **Public Pages Only:** No app-shell component may reference these tokens. They
  are the product's one chromatic surface and its one gradient; the desks stay
  monochrome.
- **Dimmed On Dark:** The dark values are not the light values inverted. They
  are pulled down so the panel reads as a lit surface on the ink ground rather
  than as glare.

## Spacing, Radius And Elevation

### Spacing Scale

Spacing uses Tailwind's 4px base scale, resolving to `calc(var(--spacing) * n)`:

- `space/1`: 4px (`p-1`, `gap-1`)
- `space/2`: 8px (`p-2`, `gap-2`)
- `space/3`: 12px (`p-3`, `gap-3`)
- `space/4`: 16px (`p-4`, `gap-4`)
- `space/5`: 20px (`p-5`, `gap-5`)
- `space/6`: 24px (`p-6`, `gap-6`)
- `space/8`: 32px (`p-8`, `gap-8`)
- `space/10`: 40px (`p-10`, `gap-10`)
- `space/12`: 48px (`p-12`, `gap-12`)

### Radius Tokens

Corner rounding is strictly restrained. There are no pill-shaped buttons:

- `radius/sm` (4px, `--radius-sm`): status pills, checkboxes, dropdown menu
  items, calendar day cells, tooltips.
- `radius/md` (6px, `--radius-md`): buttons, input fields, select triggers,
  cards, menus, popovers, drop zones, dialog panels.
- `radius/full` (9999px): scrollbar thumbs, stage tracker bars.

Two larger steps exist for the public pages alone. The application shell is
still restricted to 4px and 6px, and `--radius-lg` and `--radius-xl` resolve to
6px so a stray utility class cannot smuggle a larger corner into a desk:

- `radius/2xl` (11.2px, `--radius-2xl`): the landing's sample ledger card and
  its three feature cards. Public pages only.
- `radius/3xl` (22.4px, `--radius-3xl`): the landing's chromatic panel, the
  outer surface the ledger is inset on. Public pages only.

### Elevation And Focus

- **Overlay elevation (`--shadow-overlay`):**
  `0 1px 2px rgba(10,10,10,.06), 0 8px 24px -4px rgba(10,10,10,.12)`. Restricted
  to floating layers: menus, popovers, date picker calendar, and dialog modals.
  Cards in the application remain completely flat with a 1px `--border`
  hairline.
- **Landing card elevation:** The landing's three feature cards are the one
  exception. They carry a two-layer shadow with a real offset,
  `0 1px 2px color-mix(in oklab, var(--color-ink-950) 5%, transparent), 0 6px 16px -4px color-mix(in oklab, var(--color-ink-950) 8%, transparent)`,
  over a 1px border in
  `color-mix(in oklab, var(--color-ink-950) 5%, transparent)`. They sit on a
  white ground with no grey band behind them and no rule above them, so the
  shadow is what separates card from page. It is declared in `LandingPage.css`,
  not as a token, so nothing in the app shell can reach it.
- **Focus ring:** 2px solid ring in `--ring` with a 2px offset in `--background`
  (`outline: 2px solid var(--ring); outline-offset: 2px`). Active on keyboard
  navigation (`:focus-visible`) only; suppressed on pointer click.
- **Scrim blur (`--scrim-blur`):** 3px (`backdrop-filter: blur(3px)`). Applied
  to the scrim overlay when the sidebar expands on hover and to the mobile
  drawer backdrop. This is the one place in the app a backdrop blur is allowed.

## Icons

Iconography is provided exclusively by Lucide (`lucide-react`).

- **Size and stroke:** 16px × 16px with stroke width 2 by default. Sized to
  match adjacent text height, rendered with `currentColor`.
- **Exceptions:** 20px in empty state displays and the drop zone upload target.
- **Approved components:** Ten Lucide glyphs comprise the entire interface:
  1.  `ChevronDown`: Select triggers and expandable section headers.
  2.  `ChevronLeft`: Calendar month navigation.
  3.  `ChevronRight`: Calendar month navigation and table pagination.
  4.  `Calendar`: Date input trigger glyph.
  5.  `Search`: Table and filter search input prefix.
  6.  `Check`: Checkbox checked state and active menu item indicator.
  7.  `Upload`: Drop zone idle state illustration.
  8.  `FileSpreadsheet`: Drop zone parsed file indicator.
  9.  `MessageCircle`: Chase card panel banker contact action.
  10. `Clock`: Elapsed duration and stage timing indicators.
- **Rules:** Icons never carry meaning or status alone. Every icon-only button
  must provide an explicit `aria-label` and an interactive Tooltip. No emoji,
  and no second icon library.

## Motion

Motion is rapid, functional, and purely informative. There are no decorative
entrance flourishes.

### Motion Tokens

- `motion/fast` (120ms, `ease-out`): Color, background-color, and border-color
  transitions on button hover, row hover, and scrollbar thumb expansion.
- `motion/base` (200ms, `ease-out`): Overlay entrances (dropdown menus,
  popovers, date picker) combining fade with a 4px vertical translate; sidebar
  width expansion (64px to 200px).
- `motion/slow` (250ms, `ease-in-out`): Mobile drawer slide and dialog modal
  fade-in.

### Reduced Motion

Under `prefers-reduced-motion: reduce`:

- All translation, expansion, and sliding animations are disabled.
- Transitions collapse to immediate 120ms cross-fades.
- The public pages need no handling. There is no video, no autoplay and no
  looping animation anywhere in the product, so the landing has nothing to
  reduce.

## Status Language

Status in Mortar is conveyed through explicit written language paired with
calibrated tones. A color indicator never appears without its associated word.

- **`Booked` (neutral):** Unit has an active booking deposit paid; document
  collection is pending.
- **`With bank` (info):** Loan application submitted to panel bank; awaiting
  credit evaluation.
- **`On track` (positive):** Progression is advancing within SLA benchmarks.
- **`Watch` (warning):** Progression is nearing the maximum stage SLA or has
  encountered a minor procedural delay.
- **`At risk` (danger):** Progression has exceeded the SLA limit or the buyer's
  loan application has been rejected.
- **`SPA signed` (signed):** Sale and Purchase Agreement executed; unit counts
  as legally sold.

Chase card urgency states repeat this linguistic rigor:

- **`Overdue`:** "Overdue 3 d" in danger tone.
- **`Due today`:** "Due today" in warning tone.
- **`Upcoming`:** "In 2 days" in neutral tone.

## Data Formats

Data formats enforce precision across Malaysian property operations:

- **Money in lists:** Currency prefix `RM`, space, thousands separators, no sen
  (cents), right-aligned, tabular numerals: `RM 612,800`.
- **Money in stat tiles:** Abbreviated to one decimal place with lowercase `k`
  or `m`, exact unrounded value available in a Tooltip: `RM 7.4m`.
- **Dates:** Day number, three-letter month abbreviation, four-digit year:
  `19 Sep 2026` (never `09/19/2026` or `19/09/26`).
- **Durations:** Short format in tables (`21 d`); conversational format in chase
  cards and sentences (`21 days`, `4 days ago`).
- **Unit codes:** Geist Mono Medium, uppercase, exactly as entered by the
  developer: `B-12-03`.
- **Empty values:** Em dash (`—`), never `0`, `N/A`, `None`, or an empty space.
- **Percentages:** Whole numbers with percent sign: `73%`.

## Native Controls

Standard HTML browser controls are banned from the codebase due to OS
inconsistencies, lack of styling hooks, and accessibility deficiencies. Every
browser control maps to a restyled Mortar component:

| Native Browser Control                                  | Banned Reason                                                      | Mortar Replacement | Implementation                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------ | --------------------------------------------------------- |
| `<select>`                                              | OS popup variation, unstyleable options, bad keyboard behavior     | Select and Menu    | Radix / shadcn `Select` + `Menu`                          |
| `<input type="date">`                                   | OS date picker wheels, uncontrollable date formatting              | Date picker        | Calendar (`react-day-picker`) in Popover                  |
| `title` attribute                                       | Delayed display, unstyled browser tooltip, screen reader traps     | Tooltip            | Radix / shadcn `Tooltip` (`--inverse` fill)               |
| `<input type="file">`                                   | OS file button, no drag-and-drop feedback, bad layout fit          | Drop zone          | Custom dashed drop container with drag cues               |
| `<input type="checkbox">`                               | OS-rendered tickbox, inconsistent sizing and focus ring            | Checkbox           | Radix / shadcn `Checkbox` (16px, 4px radius)              |
| Default scrollbar                                       | Clashing OS scrollbars, layout reflow, inconsistent track sizing   | Scrollbar          | Global CSS (`scrollbar-width: thin; ::-webkit-scrollbar`) |
| `window.alert()`, `window.confirm()`, `window.prompt()` | Blocks browser thread, unstyleable dialog, breaks single-page flow | Dialog             | Radix / shadcn `Dialog` with focus trap                   |

## Components

### Button

- **Purpose:** Triggers actions, form submissions, and navigations.
- **Anatomy:** Container height 36px, horizontal padding 16px, corner radius 6px
  (`--radius-md`), content gap 8px. Optional 16px Lucide leading icon. Text set
  in Label/Default (Geist Medium 14/20).
- **States and tokens:**
  - `Primary`: background `--primary` (`#0A0A0A` light / `#FAFAFA` dark), hover
    `--primary-hover` (`#262626` / `#E5E5E5`), text `--primary-foreground`
    (`#FFFFFF` / `#0A0A0A`).
  - `Secondary`: background `--card` (`#FFFFFF` / `#141414`), border 1px
    `--input` (`#C9C9C9` / `#3A3A3A`), hover `--accent` (`#F0F0F0` / `#242424`),
    text `--foreground` (`#0A0A0A` / `#FAFAFA`).
  - `Ghost`: background transparent, hover `--accent`, text `--foreground`.
  - `Destructive`: background `--destructive` (`#B3261E` / `#E05260`), text
    `--destructive-foreground` (`#FFFFFF` / `#0A0A0A`). Always prompts
    confirmation in a Dialog.
  - `Disabled`: background `--disabled` (`#F5F5F5` / `#1C1C1C`), text
    `--disabled-foreground` (`#8A8A8A` / `#A3A3A3`). Never use opacity.
  - `Focus`: 2px `--ring` outline with 2px `--background` offset.
- **Rules:** Primary is the only ink-filled surface on a screen; exactly one
  Primary button per view. No gradients, shadows, or press scale.

### Checkbox

- **Purpose:** Binary selection for batch table actions and form toggles.
- **Anatomy:** 16px × 16px box, corner radius 4px (`--radius-sm`), 1px `--input`
  border on `--card`.
- **States and tokens:**
  - `Unchecked`: 1px `--input` border, `--card` background.
  - `Checked`: fills `--primary` (`#0A0A0A` / `#FAFAFA`), 12px Check icon in
    `--primary-foreground` (`#FFFFFF` / `#0A0A0A`).
  - `Disabled`: `--disabled` fill, `--disabled-foreground` border and check
    icon.
  - `Focus`: 2px `--ring` outline with 2px offset.
- **Rules:** Label is part of the clickable hit area. Spacebar toggles state.
  Never use native `<input type="checkbox">`.

### Field

- **Purpose:** Single-line text input, select trigger, and date selection
  trigger.
- **Anatomy:** 36px tall container, corner radius 6px (`--radius-md`), 1px
  `--input` border on `--card`, padding 12px horizontal, content gap 8px.
- **Variants:**
  - `Input`: leading 16px Search icon in `--muted-foreground`, placeholder in
    `--muted-foreground`.
  - `Select`: trailing 16px ChevronDown icon in `--muted-foreground`, opens
    Menu.
  - `Date`: trailing 16px Calendar icon in `--muted-foreground`, opens Date
    picker.
- **States and tokens:**
  - `Default`: 1px `--input` border on `--card`.
  - `Focus`: 2px `--ring` border (`#0A0A0A` / `#FAFAFA`).
  - `Error`: 1px `--status-danger` border (`#A53D4C` / `#C76A76`), validation
    message below in `--status-danger-fg` (`#7A2230` / `#E9A8B0`), Body/Small.
  - `Disabled`: `--disabled` fill (`#F5F5F5` / `#1C1C1C`),
    `--disabled-foreground` text.
- **Rules:** A visible label in Label/Small must sit above every field. No
  native select, date inputs, number spinners, or browser autofill yellow.

### Tooltip

- **Purpose:** Non-critical supplementary notes and exact unrounded values.
- **Anatomy:** Background `--inverse` (`#0A0A0A` light / `#FAFAFA` dark), text
  `--inverse-foreground` (`#FFFFFF` / `#0A0A0A`), Body/Small (13/18), corner
  radius 4px (`--radius-sm`), padding 4px vertical by 8px horizontal, maximum
  width 240px.
- **States and tokens:**
  - Opens after a 300ms hover delay. Esc key dismisses immediately.
  - Renders without an arrow caret.
- **Rules:** Replaces HTML `title` attributes. Never holds interactive buttons,
  links, or essential workflow status.

### Status Pill

- **Purpose:** Displays booking pipeline stage and risk level with text and
  color.
- **Anatomy:** Height 22px, corner radius 4px (`--radius-sm`), horizontal
  padding 8px, content gap 6px. Contains a 6px solid dot in tone solid, fill in
  tone bg, text in Label/Small (Geist Medium 12/16) in tone fg.
- **Variants:**
  - `Neutral`: Booked (fg `#525252` / `#D4D4D4`, bg `#F5F5F5` / `#1C1C1C`, dot
    `#A3A3A3` / `#6B6B6B`).
  - `Info`: With bank (fg `#1E3A5F` / `#AEC8E8`, bg `#EEF2F8` / `#141E2B`, dot
    `#3B6395` / `#6E9BD1`).
  - `Positive`: On track (fg `#1F4D35` / `#A7D8BC`, bg `#EEF4F0` / `#12251B`,
    dot `#3E7D5A` / `#5FA57E`).
  - `Warning`: Watch (fg `#6B4E16` / `#E8CE8A`, bg `#F8F4E9` / `#2A2113`, dot
    `#A9852F` / `#C9A34A`).
  - `Danger`: At risk (fg `#7A2230` / `#E9A8B0`, bg `#FAEEF0` / `#2B141A`, dot
    `#A53D4C` / `#C76A76`).
  - `Signed`: SPA signed (fg `#FFFFFF` / `#0A0A0A`, bg `#0A0A0A` / `#FAFAFA`,
    dot `#FFFFFF` / `#0A0A0A`).
- **Rules:** Signed is the only solid pill (dot uses signed fg). Never present
  color alone without text. Never tint an entire table row or card.

### Scrollbar

- **Purpose:** Consistent, unobtrusive scrolling across data tables, menus, and
  drawers.
- **Anatomy:** Transparent track, no arrow buttons, 6px thumb in
  `--scrollbar-thumb` (`#D8D8D8` light / `#262626` dark), corner radius full
  (9999px).
- **States and tokens:**
  - `Rest`: 6px thumb in `--scrollbar-thumb`.
  - `Hover`: 8px thumb in `--scrollbar-thumb-hover` (`#C9C9C9` / `#3A3A3A`),
    150ms color transition ease.
- **Rules:** Defined once globally in `globals.css`
  (`scrollbar-width: thin; ::-webkit-scrollbar`). Never hide scrollbars; never
  leave default OS scrollbars active.

### Menu Item And Menu

- **Purpose:** Option lists for Select dropdowns, table row actions, and the
  persona switcher.
- **Anatomy:**
  - Menu container: background `--popover` (`#FFFFFF` / `#1C1C1C`), 1px
    `--border` (`#D8D8D8` / `#262626`), corner radius 6px (`--radius-md`),
    padding 4px, `Elevation/Overlay` shadow, width 240px, maximum height 320px
    (scrolls beyond).
  - Menu item: 32px high, corner radius 4px (`--radius-sm`), padding 8px
    horizontal, text in Body/Default.
- **States and tokens:**
  - `Hover/Focus`: background `--accent` (`#F0F0F0` / `#242424`).
  - `Selected`: displays trailing 16px Check icon in `--link` (`#0A0A0A` /
    `#FAFAFA`).
- **Rules:** Full keyboard navigation: ArrowUp/ArrowDown to traverse, type-ahead
  to jump by initial character, Enter to pick, Esc to close and return focus to
  trigger.

### Day Cell And Date Picker

- **Purpose:** Calendar date selection for booking and signing dates.
- **Anatomy:**
  - Day cell: 36px wide × 32px high, corner radius 4px (`--radius-sm`).
  - Date picker popup: 276px wide, padding 12px, gap 8px, background
    `--popover`, 1px `--border`, corner radius 6px (`--radius-md`),
    `Elevation/Overlay` shadow.
  - Header: 28px navigation buttons (`ChevronLeft` / `ChevronRight`), Month Year
    in Label/Default (e.g. "September 2026").
  - Weekday row: Eyebrow in `--muted-foreground`. Weeks start on Monday
    (Malaysian business convention).
- **States and tokens:**
  - `Default day`: Body/Default text, transparent background.
  - `Today`: 1px `--input` ring (`#C9C9C9` / `#3A3A3A`), Label/Default weight.
  - `Selected day`: `--primary` fill (`#0A0A0A` / `#FAFAFA`),
    `--primary-foreground` text (`#FFFFFF` / `#0A0A0A`).
  - `Outside month`: `--muted-foreground` text.
  - `Disabled`: strikethrough, `--disabled-foreground` text, unclickable.
- **Rules:** Built on shadcn Calendar (`react-day-picker`) restyled. Arrow keys
  move day, PageUp/PageDown moves month, Enter picks, Esc closes. Dates format
  as `19 Sep 2026`.

### Stage Tracker

- **Purpose:** Visual progress indicator for a unit booking across five pipeline
  milestones.
- **Anatomy:** Five equal segments: Booked, Documents, Loan submitted, Loan
  approved, SPA signed.
  - Full tracker: 4px bar per segment (completed and current use `--inverse`
    `#0A0A0A` / `#FAFAFA`; upcoming use `--input` `#C9C9C9` / `#3A3A3A`). Stage
    name in Label/Small (current in `--foreground`, others muted). Current stage
    appends elapsed time in Body/Small muted (e.g. "21 days").
  - Compact tracker: five 10px × 4px bars, gap 2px, placed beside the stage name
    in table rows.
- **Rules:** No status tone colours a stage bar; the tracker is ink and hairline
  only. Lapsed or cancelled bookings freeze bars at the last reached stage and
  display the cancellation status pill.

### Stat Tile

- **Purpose:** Top-of-page KPI summary cards for operations desks.
- **Anatomy:** Width 240px+, padding 16px, gap 4px, background `--card`
  (`#FFFFFF` / `#141414`), 1px `--border` (`#D8D8D8` / `#262626`), corner radius
  6px (`--radius-md`), no shadow. Eyebrow label, `Display/Figure` figure
  (30/36), Body/Small caption.
- **States and tokens:**
  - `Default`: figure in `--foreground`.
  - `Alert`: figure in `--status-danger-fg` (`#7A2230` / `#E9A8B0`).
- **Rules:** Maximum four tiles per row. Figures round for rapid reading
  (`RM 7.4m`, `38 SPAs`) with exact unrounded value available via Tooltip.
  Clicking a tile filters the list behind its number.

### Booking Row And Table Header

- **Purpose:** Primary tabular ledger for unit bookings and pipeline tracking.
- **Anatomy:**
  - Table header: 36px high, background `--muted` (`#F5F5F5` / `#1C1C1C`), text
    in Eyebrow muted (`--muted-foreground`).
  - Booking row: 44px high, 1040px wide in Figma, horizontal padding 16px, gap
    16px, 1px bottom border in `--border`.
  - Columns:
    1. Unit: 88px, Mono/Data (`B-12-03`).
    2. Buyer: fill width, Body/Default.
    3. Stage: 200px, compact tracker + Body/Small stage name.
    4. Days: 56px, right-aligned tabular numerals. Turns `--status-danger-fg`
       when exceeding stage SLA limit.
    5. Bank: 104px, Body/Small in `--muted-foreground`.
    6. Risk: 96px, Status pill.
    7. Value: 104px, right-aligned tabular numerals (`RM 612,800`).
- **States and tokens:**
  - `Rest`: transparent background on `--card` or `--background`.
  - `Hover`: `--muted` background (`#F5F5F5` / `#1C1C1C`).
  - `Selected`: `--selected` background (`#F5F5F5` / `#1F1F1F`) with a 2px
    `--primary` left border.
- **Rules:** No zebra striping, no row risk tinting. Clicking a row opens the
  unit booking detail drawer; column headers trigger sorting.

### Chase Card

- **Purpose:** Action card in Sales Admin Chase List directing staff to unblock
  stuck bookings.
- **Anatomy:** Width 360px, padding 16px, gap 12px, background `--card`
  (`#FFFFFF` / `#141414`), 1px `--border`, corner radius 6px (`--radius-md`).
  Left edge features a 3px solid bar in urgency tone solid. Urgency pill repeats
  status in words (Overdue 3 d / Due today / In 2 days).
  - Stack order:
    1. Header: Unit code (Mono/Data) + Buyer name (muted) + Urgency pill.
    2. Blocker sentence: Heading/Section (Geist SemiBold 16/24).
    3. Meta line: elapsed time in stage, last chase date, Body/Small muted.
    4. Contact line: 16px `MessageCircle` icon + contact note ("Chase Ahmad
       Faizal, panel banker").
    5. Action footer: Primary button "Log follow-up" + Ghost button "Snooze".
- **States and tokens:**
  - `Overdue`: 3px left edge `--status-danger` (`#A53D4C` / `#C76A76`), danger
    pill.
  - `Due today`: 3px left edge `--status-warning` (`#A9852F` / `#C9A34A`),
    warning pill.
  - `Upcoming`: 3px left edge `--status-neutral` (`#A3A3A3` / `#6B6B6B`),
    neutral pill.
- **Rules:** "Log follow-up" opens an inline modal dialog, not a new page. Cards
  sort by days overdue descending, then value at risk. Snoozed cards disappear
  until their snooze date arrives.

### Drop Zone

- **Purpose:** File upload target for importing booking sheets.
- **Anatomy:** 360px wide × 160px high, corner radius 6px (`--radius-md`),
  centered vertical stack with 8px gap.
- **States and tokens:**
  - `Idle`: 1px dashed (6px dash / 4px gap) `--input` border on `--card`,
    `Upload` icon 20px in `--muted-foreground`, "Drop the booking sheet" in
    Label/Default, "XLSX or CSV, up to 10 MB" in Eyebrow muted.
  - `Dragging`: 2px dashed `--ring` border on `--selected` (`#F5F5F5` /
    `#1F1F1F`), `Upload` icon in `--link`, "Release to import" in Label/Default.
  - `Parsed`: 1px solid `--border`, `FileSpreadsheet` icon, file name, "146 rows
    read", Warning pill "3 to review".
- **Rules:** Replaces native file inputs. Entire zone is clickable and keyboard
  focusable.

### Dialog

- **Purpose:** Destructive action confirmations and quick modal task workflows.
- **Anatomy:** Centered modal panel, maximum width 480px, background `--card`
  (`#FFFFFF` / `#141414`), 1px `--border`, corner radius 6px (`--radius-md`),
  `Elevation/Overlay` shadow. Backdrop overlay: `rgba(10, 10, 10, 0.4)` (ink/950
  at 40%), without backdrop blur.
- **Rules:** Traps keyboard focus, Esc dismisses, autofocuses the secondary
  cancel button on destructive dialogs. Replaces all native browser `alert()`,
  `confirm()`, and `prompt()` calls.

## App Shell

The application shell organizes the internal operations dashboard across three
staff roles:

- **Persona routing:** The home route `/app` evaluates the stored persona and
  redirects to that role's primary desk:
  - Sales Admin: `/chase` (stuck bookings and daily follow-up targets).
  - Loan Admin: `/bookings` (unit pipeline and bank submission tracker).
  - Finance: `/forecast` (cashflow projections and signed SPA conversions).
- **Navigation sidebar:** Fixed 64px width collapsed, expanding to 200px on
  hover over content. The active persona's primary home view sits at the top of
  the navigation items. Built with a solid `--sidebar` (`#FFFFFF` light /
  `#0F0F0F` dark) ground and a 1px `--border` hairline; no blur or translucency
  even when content scrolls beneath. When the sidebar expands over the content
  on hover, a scrim dims and blurs every layer beneath it (top bar, page,
  footer): background `--scrim` (light: ink-950 at 14% through `color-mix`;
  dark: black at 45%), backdrop blur `--scrim-blur` (3px), fading in and out on
  `--motion-base`. The mobile drawer's backdrop uses the same scrim and closes
  the drawer when tapped. This is the one place in the app a backdrop blur is
  allowed.
- **Top bar:** Fixed 56px height, containing breadcrumbs, with a right-hand
  cluster running, left to right, notification bell, theme switch, then the
  persona switch at the far right. Solid `--sidebar` ground with a 1px bottom
  border in `--border`.
- **Content canvas:** Centered layout capped at a maximum width of 1280px with
  32px horizontal gutters (24px below 1280px). Pages open with a page header
  (Display/Page title + one descriptive line), followed by up to four stat
  tiles, followed by the active working list or table.

### Navigation

Every route change, back and forward included, lands at the top of the page (a
`ScrollToTop` component, `history.scrollRestoration` set to `manual`, an instant
jump rather than smooth).

## Screen Density

An operations screen is a working surface, not a report. Four rules keep the
ledger readable at a glance:

- **One focus per screen:** A page opens on the answer — the figure, queue or
  card a person acts on now — and everything else ranks behind it. Supporting
  detail follows in reading order: `/forecast` leads with expected signings, its
  range and the live count, then the stage rates and the backtest.
- **Progressive disclosure:** Nothing is deleted, but long reference material
  waits behind one control that names what it hides — the assumptions table
  folds behind "Show 49 Assumptions". The control is a real button with
  `aria-expanded`; the revealed content renders in full, identical to what it
  replaces.
- **Chip economy:** A chip earns its place only when it discriminates between
  rows or marks a state worth noticing. A fact true of the whole dataset —
  simulated data, its seed and as-of date — is stated once on `/settings`, never
  repeated as chrome on every screen or a badge on every row.
- **Tooltip rule:** An explanatory sub-caption under a heading or the second
  line of a metric tile moves into an `InfoTooltip` beside its label: one short
  sentence, never a paragraph, opened on hover or keyboard focus. The heading
  and the figure stay on the surface. Captions that carry required context — "A
  Backtest On Simulated Data Proves The Method, Not The Business", the
  placeholder marking on Assumptions — remain visible text; tooltips hold
  explanation, not obligations.

## Public Pages

The public pages (Landing, Footer, Sign-In) copy an earlier project, Perch: its
structure, DOM organization, timings, and breakpoints (720px and 900px),
re-skinned entirely with Mortar tokens:

- **Mortar geometry:** 6px radius for controls and cards instead of Perch's
  999px pills; 1px hairlines instead of Perch's 3px outlines.
- **Geist typography:** Perch's italic serif specimen lines become 14px Geist
  Regular in `--muted-foreground`. No Newsreader or italic serif is loaded.
- **Gradients:** One, and only here. The landing's chromatic panel is the single
  sanctioned gradient in the product. The app shell never uses one, and `/faq`
  and `/sign-in` do not either.
- **Routes:**
  - `/`: Public landing page.
  - `/faq`: Public skeleton page inside the site shell, with the reveal footer,
    whose content is tracked in GitHub issue #1.
  - `/sign-in`: Bare sign-in page (no footer, no sidebar, no top bar).
  - `/app`: Redirects to the active persona's home desk.
  - App routes (`/chase`, `/bookings`, `/forecast`): Mount the sidebar and top
    bar inside the shell.
- **Sitewide reveal footer:** A fixed 196px footer (184px from 720px up) on
  ground `--footer` (`paper/0` `#FFFFFF` light / `ink/900` `#141414` dark), with
  a 1px `--border` top hairline, sits under every page except `/sign-in`. It is
  revealed by scrolling past the page floor and by keyboard focus.
- **Authentication theatre:** There is no real backend authentication. Sign-in
  presents disabled email and password inputs, a permanently dead "Sign In"
  button, a "Signing In As" persona selector (Sales Admin, Loan Admin, Finance),
  and a live "Sign In As Guest" button. Clicking the live button stores the
  persona in `localStorage` key `mortar.persona` and navigates to that role's
  home. A "Sign out" item in the app's persona menu navigates back to `/sign-in`
  and clears nothing from storage.

### Landing

The landing runs full width in four stacked blocks — header row, centred claim,
chromatic panel, three feature cards — on the `--background` ground, sharing one
gutter: 24px below 720px, 48px at 720px and above. There is no centred fixed
column, no background layer behind the page, and no video anywhere.

**Header Row:** 64px tall, a 1px `--border` bottom hairline, holding the 26px
Mortar joinery mark, the "Mortar" wordmark (15px Geist SemiBold, `-0.01em`), and
the theme switch pushed to the right edge by `margin-left: auto`. The theme
switch is a `Secondary` icon button and the only control in the row. The header
carries no call to action, which is what leaves the hero button as the page's
single Primary.

**Claim:** Centred, 72px of top padding below 720px and 96px above. The `h1`
display line, then the lead line 20px under it, then the Primary button 28px
under that. The button is the page's one Primary and its only link, and it goes
to `/sign-in`. There is no eyebrow above the `h1`. Type steps for all three are
in [Typeface](#typeface).

**Chromatic Panel:** `.land-panel`, inset in the page gutter 56px under the
claim (64px above 720px), with 28px of padding (68px above 720px) and a
`--radius-3xl` 22.4px corner. Its ground is four radial hue washes plus a centre
veil over `--land-panel-base`, drawn from the tokens in
[Landing Panel Tokens](#landing-panel-tokens). This is the only gradient and the
only chromatic surface in the product, and its padding is what makes the card
inside read as inset rather than stacked.

**Sample Ledger:** A `<figure>` on the panel, `--card` ground, `--radius-2xl`
11.2px, clipped with `overflow: hidden`, edged with a 1px border in
`color-mix(in oklab, var(--color-ink-950) 6%, transparent)` because a `--border`
hairline would be lost against the colour under it. A caption row carries
"Bookings" in 13px SemiBold with the counts beside it in `--muted-foreground`;
the table beneath uses the standard ledger metrics — `Eyebrow` column headers,
44px rows, `Body/Default` cells, `Mono/Data` for booking and unit codes, and
StatusPills for stage, evidence and risk. A stalled row's age is set in
`--status-danger-fg` at weight 500, because on that row the age is the warning.
Below 900px the ledger scrolls horizontally rather than crushing its columns
(table `min-width: 860px`); the panel keeps its padding throughout.

**The Ledger Is Illustrative:** Its five rows are fixed copy in the component,
never fetched, and they are not a reading of the real book. A `sr-only`
`<figcaption>` says so — "An example of the Bookings desk. These figures are
illustrative." — so assistive technology hears the disclaimer that the sighted
reader infers from the marketing context. Do not wire this table to live data,
and do not drop the figcaption.

**Feature Cards:** `.land-desk`, appended directly under the panel with no rule
between them, sharing the panel's gutter and the panel's rhythm: a 16px gap and
16px of separation below 720px, 24px above. One column below 720px, three above.
Each card is a white `--card` surface with a `--radius-2xl` corner, a 1px border
in `color-mix(in oklab, var(--color-ink-950) 5%, transparent)`, and the
two-layer shadow in [Elevation And Focus](#elevation-and-focus). They carry a
`Heading/Section` title and body copy in `--muted-foreground`, and no colour at
all — the panel above them is where the colour is spent.

**Scroll:** The landing leads with a full viewport and continues below it. It is
no longer a single screen; the claim fills the first viewport, and the panel and
the cards are scrolled to. The page column ends with 72px of bottom padding
(76px above 720px), after which the site shell's reveal footer is uncovered at
the document floor.

Landing content copy binds to the following specification:

| Slot                   | Copy                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Header wordmark        | Mortar (beside the 26px joinery mark; the header carries no call to action)                                                 |
| Display line           | Booked Is Not Sold. `<br />` Signed Is. (the break is explicit, not a width cap)                                            |
| Lead line              | The AI operations layer that names the blocker on every stuck booking. (a full sentence, so sentence case with a full stop) |
| Call to action         | Open Mortar (the page's one Primary button and its only link, to `/sign-in`)                                                |
| Ledger caption         | Bookings — 148 live · 19 stalled · 5 signed this month                                                                      |
| Ledger figcaption      | An example of the Bookings desk. These figures are illustrative. (`sr-only`)                                                |
| Desk: Chase List       | Every stuck booking, the blocker in plain words, and who to chase today.                                                    |
| Desk: Bookings         | Each unit from booking to SPA, with the days it has sat in every stage.                                                     |
| Desk: Forecast         | The SPAs you can bank on, not the bookings you hope will convert.                                                           |
| Footer line            | A Booking Is A Promise. The Signed SPA Is The Sale.                                                                         |
| Footer link: FAQ       | FAQ (`/faq`)                                                                                                                |
| Footer link: Dashboard | Dashboard (`/app`)                                                                                                          |
| Footer link: Design    | Design (https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1, new tab) |
| Footer link: GitHub    | GitHub (https://github.com/NexTechnologies-MY/mortar, new tab)                                                              |

The three desk blurbs are body copy written as complete sentences, so they take
sentence case under the carve-out in [Text Case](#text-case); their card titles
stay Title Case.

### Footer

The footer is mounted sitewide inside the site shell under every route except
`/sign-in`.

- **Reveal mechanics:** The footer element is fixed to the viewport floor
  (`fixed inset-x-0 bottom-0 z-0`, height `--footer-h`). The page column sits
  above it (`relative z-[1] bg-background`, minimum height
  `calc(100dvh - var(--footer-h))`) and reserves bottom margin equal to the
  footer height (`mb-[var(--footer-h)]`). The footer is painted behind the page
  and uncovered only as the user scrolls to the document floor.
- **Ground and seam:** `--footer` is `paper/0` `#FFFFFF` in light and `ink/900`
  `#141414` in dark, so the footer is the same white as the page above it. The
  seam is marked by a 1px `--border` top hairline on the footer element
  (`border-t border-border`), not by a change of ground. A grey band read as an
  empty tray under the content and was dropped with the rest of the grey page.
- **Dimensions and responsive layout:**
  - Height: 196px below 720px; 184px at 720px and above (`--footer-h`).
  - Alignment: The footer content is left-aligned to the page gutter, not
    right-aligned: 24px of horizontal padding below 720px, 48px at 720px and
    above, matching the landing's gutter exactly. The brand lockup, the tagline
    and the links row all start at that gutter in both ranges. Nothing in the
    footer is pinned to the opposite edge.
- **Focus reveal (WCAG 2.4.11):** Because the footer is fixed inside the
  viewport floor, default browser scroll-into-view is a no-op when tabbing into
  footer links. The shell binds a native `focusin` listener on the footer
  element: when any footer link receives keyboard focus, the window immediately
  scrolls to `document.documentElement.scrollHeight`, ensuring the focused link
  is never concealed beneath the page shell.
- **Anatomy:** Three rows on a 12px gap, vertically centred in the footer's
  height.
  - Brand lockup: Link to `/` with `aria-label="Mortar home"`, 28px Mortar
    joinery mark, and "Mortar" wordmark in 16px Geist SemiBold.
  - Tagline: "A Booking Is A Promise. The Signed SPA Is The Sale." (14px Geist
    Regular in `--muted-foreground`, maximum width 40ch).
  - Links row: Four links in `Eyebrow` metrics — 11px SemiBold uppercase,
    `tracking-[0.08em]`, in `--muted-foreground` — each with a 1px bottom border
    in `color-mix(in oklab, var(--foreground) 18%, transparent)` that goes full
    `--foreground` on hover and `:focus-visible`: "FAQ" (`/faq`), "Dashboard"
    (`/app`), "Design" (Figma, new tab), and "GitHub" (GitHub, new tab).

### Sign-In

`/sign-in` is mounted completely bare without the site shell, top bar, sidebar,
or reveal footer.

- **Responsive grid:** Below 900px, a single centered column
  (`max-width: 520px`). At 900px and above, a two-pane grid
  (`minmax(420px, 1fr) 1fr`): left form pane and right hero illustration pane.
- **Left pane (form):**
  - Back link: `← Mortar` linking to `/` in Label/Small `--muted-foreground`.
  - Heading: "Sign In" in `Display/Page` (Geist SemiBold 24/32).
  - Email field: Disabled text input (`type="email"`, placeholder
    `you@example.com`, background `--disabled`, cursor `not-allowed`).
  - Password field: Disabled password input (placeholder `Your password`,
    background `--disabled`, cursor `not-allowed`).
  - "Keep Me Signed In" checkbox: Checkbox component with 4px corner radius.
    Ticks visually on click, but persists no state.
  - Dead button: "Sign In" (permanently disabled, 1px `--input` border,
    background transparent, text `--disabled-foreground`, cursor `not-allowed`).
  - Persona picker: "Signing In As" selection group offering Sales Admin, Loan
    Admin, and Finance.
  - Live button: "Sign In As Guest" (full width, 36px high, corner radius 6px,
    background `--primary`, text `--primary-foreground`). On click, writes the
    selected role to `localStorage` key `mortar.persona` and navigates
    immediately to that persona's home route (`/chase`, `/bookings`, or
    `/forecast`).
- **Right pane (hero plate):** Hidden below 900px. Displays a decorative SVG
  plate featuring Mortar's joinery mark in `--foreground` and
  `--muted-foreground` on a `--selected` ground.
- **Sign out flow:** A "Sign out" item in the top bar's persona menu navigates
  to `/sign-in` and clears nothing from `localStorage`. The persona persists so
  signing back in returns to the previous working desk.

## Acceptance

A screen or component ships when all twelve criteria hold across both light and
dark modes:

1.  **No raw hex values:** No hex color value exists outside `globals.css`;
    components read semantic CSS tokens exclusively.
2.  **Zero native controls:** No native `<select>`, `<input type="date">`,
    `<input type="file">`, `title` tooltips, browser dialogs, or default OS
    scrollbars appear anywhere.
3.  **Explicit status wording:** Every status indication displays an explicit
    text label; no state relies on color alone.
4.  **Accessible contrast and focus:** All text meets or exceeds WCAG AA 4.5:1
    contrast in both light and dark modes. Every interactive control displays
    the 2px focus ring with 2px offset on keyboard navigation.
5.  **Tabular numerals:** All monetary figures and elapsed day counters are
    right-aligned and rendered with tabular numerals.
6.  **Single primary action:** Exactly one Primary button exists per view. On
    the landing this is the hero's "Open Mortar"; the header row carries no call
    to action, which is what keeps the count at one.
7.  **Responsive viewports:** Verified fully functional at 1280px and 1440px
    desktop widths, and cleanly usable down to 1024px.
8.  **Dual-mode verification:** Every view is inspected and verified in both
    light mode and dark mode before completion.
9.  **Landing leads with a viewport:** The landing's claim fills the first
    viewport, and the page continues below it — the chromatic panel, the three
    feature cards, then the reveal footer at the document floor. The page is
    expected to scroll. The old rule that it occupy exactly one viewport existed
    only because a looping video held the page up; there is no video now, and
    the rule went with it.
10. **Unobscured footer:** The fixed reveal footer never conceals page content,
    uncovering cleanly on scroll and jumping fully into view whenever a footer
    link receives keyboard focus.
11. **Bare sign-in:** The sign-in route renders bare within the viewport,
    displaying no footer, no sidebar, and no top bar chrome.
12. **Title Case:** Headings, subheadings, eyebrows, lead lines under titles,
    empty-state text, card titles, button labels, form labels, menu items and
    footer text are Title Case, capitalising every word including short ones (A,
    And, To, The); acronyms (SPA, RM, FAQ) stay in capitals; data values,
    placeholders, aria-labels and full-sentence toasts or tooltips keep their
    own case. A lead line written as a complete sentence is the carve-out: it
    takes sentence case and a full stop, as [Text Case](#text-case) sets out.

## Do And Do Not

### Do

- **Do** read all colors, radii, spacing, and durations directly from CSS custom
  properties.
- **Do** pair every status color dot or bar with an explicit, visible status
  word.
- **Do** maintain strict 44px table row heights and 36px control heights.
- **Do** format all currency with tabular numerals, right alignment, thousands
  separators, and `RM` prefix without sen.
- **Do** verify contrast ratios against the 4.5:1 WCAG AA floor in both light
  and dark modes before committing.
- **Do** route all user confirmation flows through restyled Dialog components.
- **Do** keep the landing's sample ledger fixed, illustrative copy with its
  `sr-only` figcaption saying so; it is never wired to live data.
- **Do** attach the `focusin` listener to the sitewide footer so keyboard
  navigation brings it immediately into view.

### Do Not

- **Do not** introduce glass fills, backdrop blurs, gradients, glow blobs, or
  card drop shadows anywhere in the application (the sidebar scrim is the sole
  backdrop blur exception). Two narrowly scoped exceptions exist and neither is
  a licence to add a third: the landing's chromatic panel is the one sanctioned
  gradient, and the landing's three feature cards carry the one sanctioned card
  shadow. The app shell never uses either.
- **Do not** introduce a chromatic accent of any kind outside the six status
  tones — ink and grey carry every action, link, focus ring and selection — or
  use red for anything other than severe risk and irreversible destructive
  actions. The landing panel is the single chromatic surface, scoped to public
  pages; its hue tokens may not be referenced from a desk.
- **Do not** add a call to action to the landing header, or any second link to
  the landing page. The hero's "Open Mortar" is the page's only Primary and its
  only link.
- **Do not** reintroduce video, autoplay or a looping background to any surface
  in the product.
- **Do not** apply colored background washes or zebra striping to table rows.
- **Do not** use emoji as icons, or import a secondary icon set beyond Lucide.
- **Do not** load a third typeface family, or style text outside the nine
  approved styles.
- **Do not** invoke native `window.alert()`, `window.confirm()`, or
  `window.prompt()`.
- **Do not** render native `<select>`, `<input type="date">`, or
  `<input type="file">` elements.
- **Do not** place more than one Primary button on any screen.
- **Do not** apply 999px pill radii to buttons or form inputs; controls use 6px
  radius.
- **Do not** render the app shell or reveal footer on `/sign-in`.

## See Also

- [Mortar Design System In Figma](https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1)
  — the public Figma file. Source of truth for token names, component variants,
  and layout specifications.
- [Design Research Index](/docs/research/design/README.md) — index of design
  sources and foundational studies.
- [Perch Landing Research](/docs/research/perch/landing.md) — study of Perch's
  landing surface and its responsive breakpoints. Mortar's landing no longer
  copies Perch's background layer.
- [Perch Footer And Chrome Research](/docs/research/perch/footer.md) — mechanics
  of the fixed reveal footer and keyboard focus handling.
- [Perch Sign-In Research](/docs/research/perch/auth.md) — two-pane layout,
  guest sign-in flow, and simulated authentication.
- [Landing Video Pipeline](/docs/research/design/video-pipeline.md) — historical
  record only. The landing no longer ships a hero film; this page keeps the
  Gemini generation, watermark removal and encoding procedure for the superseded
  clip.
- [House Markdown Style Guide](/docs/markdown-style.md) — rules for ATX
  headings, line limits, and table formatting.
- [Mortar Project Guidelines](/AGENTS.md) — engineering conventions and Bun
  workspace scripts.
- [Mortar Agent Notes](/docs/agents/notes.md) — developer architecture and agent
  implementation notes.
