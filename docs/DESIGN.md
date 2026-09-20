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
1.  [Plain Language](#plain-language)
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

| Question        | Decision                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Look            | Flat ledger: white ground, white cards lifted off it by `Elevation/Card`, 6px radius. No glass and no backdrop blur (the sidebar scrim is the sole exception). No gradient or glow blob in the application; the landing's chromatic panel is the one sanctioned gradient. A card is separated from the page by its shadow, never by a coloured edge strip and never by a grey page band. |
| Status colour   | Ink is the action colour everywhere, the landing included; the application carries no chromatic accent. The landing panel is the one chromatic surface, scoped to public pages. Six status tones carry every state, each always with a word.                                                                                                                                             |
| Type            | Geist for UI, Geist Mono for unit codes and IDs. Nine text styles. No third family.                                                                                                                                                                                                                                                                                                      |
| Density         | Controls 36px, table rows 44px, body 14px. Built for a working day in lists.                                                                                                                                                                                                                                                                                                             |
| Native controls | None. Select, date picker, menu, tooltip, file drop, checkbox and scrollbar are Mortar components (Radix/shadcn restyled). No alert/confirm/prompt.                                                                                                                                                                                                                                      |
| Modes           | Light and dark from one token set (Color collection has Light and Dark modes).                                                                                                                                                                                                                                                                                                           |
| Icons           | Lucide (lucide-react), 16px, stroke 2, coloured like adjacent text. 20px in empty states.                                                                                                                                                                                                                                                                                                |

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
| `color/border/card`           | `--card-border`            | ink-950 at 6% (color-mix)  | ink-50 at 8%        |
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
  Cards do not use it; they carry `--shadow-card` below.
- **Card elevation (`--shadow-card`):**
  `0 1px 2px color-mix(in oklab, var(--color-ink-950) 5%, transparent), 0 6px 16px -4px color-mix(in oklab, var(--color-ink-950) 8%, transparent)`,
  over a 1px border in `--card-border`
  (`color-mix(in oklab, var(--color-ink-950) 6%, transparent)`). Carried by
  every card surface in the application: chase cards, stat tiles, panel cards
  and the bookings table panel. The page ground stays white, so the shadow is
  the only thing separating card from page. The hairline softens from `--border`
  to `--card-border` because a full `#D8D8D8` line underneath a shadow reads as
  a doubled edge.
- **Card hover elevation (`--shadow-card-hover`):**
  `0 1px 2px color-mix(in oklab, var(--color-ink-950) 6%, transparent), 0 10px 24px -6px color-mix(in oklab, var(--color-ink-950) 12%, transparent)`
  plus a 1px upward translate, on interactive cards only, over 160ms
  `--ease-out`. Suppressed under `prefers-reduced-motion: reduce`, where the
  shadow still changes but the translate does not.
- **Landing card elevation:** The landing's three feature cards use the same
  two-layer shadow as `--shadow-card`, declared in `LandingPage.css` against the
  public-page tokens. It predates the app token and the two are kept in step by
  hand.
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
- **Approved components:** Lucide is the only source and every glyph in the
  interface is listed here. Controls and chrome:
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
  11. `SlidersHorizontal`: Filter select prefix.
  12. `Users`: Owner select prefix and persona switch.
  13. `Plus`: Create Task and other create actions.
  14. `RefreshCw`: Re-Run Jev and other re-run actions.
- **Stat tile glyphs:** One per tile, set in `--muted-foreground` beside the
  eyebrow, never beside the figure. `AlertTriangle` (stalled), `Flame` (high
  risk), `ListChecks` (tasks), `Banknote` (money).
- **Blocker and action glyphs:** One per chase card blocker line and one per
  suggested action, chosen by kind, never by severity: `FileWarning` (missing or
  outstanding document), `Landmark` (bank or financing stall), `Clock` (time or
  evidence stall); `FileText` (request document), `Phone` (call buyer), `Eye`
  (review), `CalendarCheck` (schedule).
- **Rules:** Icons never carry meaning or status alone, and never carry a status
  tone as their colour: they render in `currentColor` at the weight of the text
  beside them. An icon supplements a word, it never replaces one. Every
  icon-only button must provide an explicit `aria-label` and an interactive
  Tooltip. No emoji, and no second icon library. Adding a glyph means adding it
  to this list in the same change.

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

## Plain Language

Mortar is read by sales, loan and legal staff at a property developer. It is not
read by engineers. Every visible string is written in the words those teams
already use in the office, and the vocabulary of the system that produces the
string never reaches the screen.

Industry terms stay, because the audience uses them daily: SPA, LO, RM, booking,
unit, stage, panel bank, disbursement, developer, solicitor. Terms from
software, statistics or the data pipeline do not.

Jev also stays. Jev is Mortar's assistant and staff refer to it by name, so it
is a subject in a sentence, not a status code: "Jev checked 2 h ago", "Ask Jev
again", "Jev suggests". What goes is the machine state attached to it.

| Do not write        | Write instead                                     |
| ------------------- | ------------------------------------------------- |
| Jev · Cached        | Jev checked 2 h ago                               |
| Jev · Live 420 ms   | Jev checked just now                              |
| Jev · Stale         | Jev's answer may be out of date                   |
| Jev · Unavailable   | Jev could not check                               |
| Re-Run Jev          | Ask Jev again                                     |
| Jev Proposal        | Jev suggests                                      |
| Not Analysed By Jev | Jev has not looked at this yet                    |
| Snapshot            | (drop it) "Could not load bookings"               |
| Evidence            | Update, or the document's own name                |
| No evidence for 8 d | No update for 8 days                              |
| Fresh               | Up to date                                        |
| Unknown             | No recent update                                  |
| Provisional         | Unconfirmed                                       |
| Superseded          | Replaced                                          |
| Signals             | Buyer response                                    |
| Playbooks           | What to do                                        |
| Confidence 0.84     | How sure: high / medium / low                     |
| Probability         | Chance                                            |
| Backtest            | Accuracy check                                    |
| Brier score         | (drop it) state accuracy in a sentence            |
| 95% interval        | Likely range                                      |
| Conversion rate     | How often this stage reaches signing              |
| Seed / canonical    | (drop it) simulation plumbing, not a desk concern |

Rules that are not obvious from the table:

- **Name the thing, not the mechanism.** "Ask buyer for payslip" beats "Request
  document · Payslip". The user acts on the thing; the record type is ours.
- **Say when, not what state.** Freshness reads as a time ("Jev checked 2 h
  ago"), never as a cache state. A person can act on a time.
- **Jev acts, it does not report status.** Jev is named because attribution
  builds trust: someone reading a suggested action should know who suggested it.
  So Jev takes a verb a person understands ("checked", "suggests", "could not
  check"), never a system state ("cached", "stale", "unavailable"), and never a
  latency figure. `Jev · Live 420 ms` tells a sales officer nothing.
- **Errors say what to do.** "Could not load bookings. Try again." Never a raw
  error string, a status code, or the word snapshot.
- **No abbreviations we invented.** Industry abbreviations are fine; ours are
  not.
- **Internal names stay internal.** Component names, token names, table names,
  model names and pipeline stages never appear in a visible string, a tooltip, a
  toast or an `aria-label`. Jev is the one exception, because it is a product
  name the staff already use.

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
| `<input type="file">`                                   | OS file button, no drag-and-drop feedback, bad layout fit          | Drop zone          | Custom dashed drop container with drag cues (see note)    |
| `<input type="checkbox">`                               | OS-rendered tickbox, inconsistent sizing and focus ring            | Checkbox           | Radix / shadcn `Checkbox` (16px, 4px radius)              |
| Default scrollbar                                       | Clashing OS scrollbars, layout reflow, inconsistent track sizing   | Scrollbar          | Global CSS (`scrollbar-width: thin; ::-webkit-scrollbar`) |
| `window.alert()`, `window.confirm()`, `window.prompt()` | Blocks browser thread, unstyleable dialog, breaks single-page flow | Dialog             | Radix / shadcn `Dialog` with focus trap                   |

The one qualification to the table: a browser cannot open a file picker without
an `<input type="file">`. The Drop Zone therefore keeps one, rendered `sr-only`
with `tabIndex={-1}` and `aria-hidden`, purely as the mechanism the custom
control triggers. What is banned is the OS-rendered file button as a visible
control, and none appears. Do not "fix" this by removing the input.

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
- **Rules:** Primary is the only ink-filled surface on a screen. A view offers
  **one Primary action**, not one Primary button. When a list repeats that same
  action on every row or card, it renders Primary on every one of them: a queue
  of "Create Task" buttons is one action offered many times, not many competing
  calls to action. Two _different_ Primary actions never appear on one view.
  Filling the first item only is forbidden outright, because it singles out a
  row that is merely top of the sort and reads as a rendering fault. No
  gradients, shadows, or press scale.

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
  (`#FFFFFF` / `#141414`), 1px `--card-border`, corner radius 6px
  (`--radius-md`), `Elevation/Card`. No coloured strip, bar or rule runs down
  any edge of the card. Urgency is carried by the pill and its word alone
  (Overdue 3 d / Due today / In 2 days).
  - Stack order:
    1. Header: Unit code (Mono/Data) + Buyer name (muted) + Urgency pill.
    2. Blocker sentence: Heading/Section (Geist SemiBold 16/24).
    3. Meta line: elapsed time in stage, last chase date, Body/Small muted.
    4. Contact line: 16px `MessageCircle` icon + contact note ("Chase Ahmad
       Faizal, panel banker").
    5. Action footer: Primary button "Log follow-up" + Ghost button "Snooze".
       Primary on every card in the queue, identically: it is one action offered
       many times. Never filled on the first card only.
- **States and tokens:**
  - `Overdue`: danger pill reading "Overdue N d". No edge treatment.
  - `Due today`: warning pill reading "Due today". No edge treatment.
  - `Upcoming`: neutral pill reading "In N days". No edge treatment.
  - `Hover`: the card raises to `Elevation/Card-Hover`. Nothing else changes.
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

### Ask Panel

- **Purpose:** Answering a set list of questions about the current bookings,
  from any app screen.
- **Anatomy:** The Dialog above at maximum width 672px, opened from a Sparkles
  button in the top bar's right cluster or `Cmd/Ctrl-K`. Header: the mascot at
  40px on a white rounded square, title, and one lead line. Body: a scrolling
  transcript capped at 50vh. Footer: a text field and the Ask button.
- **Answer:** the question in `--foreground`, then the mascot at 28px beside the
  answer in `--muted-foreground`. Below it, one bordered chip per booking named,
  in Geist Mono, linking to that case; then a neutral Status Pill reading
  "Counted From Your Bookings"; then the action button, if the answer offers
  one, which becomes a positive Status Pill once it has been used.
- **Rules:** Answers are sentences, so they take sentence case and a full stop;
  the suggested questions and every label stay Title Case. An answer never
  changes once given. When nothing matches, the panel says so and re-offers the
  suggestions rather than guessing. The panel carries Jev's name because Jev is
  the assistant staff ask by name, but it never implies the model wrote the
  answer: the Status Pill says the answer was counted, and the lead line says
  plainly that it does not write new ones — see Plain Language.

## App Shell

The application shell organizes the internal operations dashboard across three
staff roles:

- **Persona routing:** The home route `/app` evaluates the stored persona and
  redirects to that role's primary desk:
  - Sales Admin: `/chase` (stuck bookings and daily follow-up targets).
  - Loan Admin: `/bookings` (unit pipeline and bank submission tracker).
  - Legal Admin: `/legal` (approved loans with no signed SPA, longest wait
    first). `/forecast` is the shared projection and is homed to no desk.
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
  range and the live count, then where bookings died ranked by what they cost,
  then the stage rates and the backtest.
- **Progressive disclosure:** Nothing is deleted, but long reference material
  waits behind one control that names what it hides — the assumptions table
  folds behind "Show 51 Assumptions". The control is a real button with
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
re-skinned entirely with Mortar tokens. The footer's inheritance is now
typographic and dimensional only — its reveal mechanics were dropped for a
static block, as [Footer](#footer) sets out.

- **Mortar geometry:** 6px radius for controls and cards instead of Perch's
  999px pills; 1px hairlines instead of Perch's 3px outlines.
- **Geist typography:** Perch's italic serif specimen lines become 14px Geist
  Regular in `--muted-foreground`. No Newsreader or italic serif is loaded.
- **Gradients:** One, and only here. The landing's chromatic panel is the single
  sanctioned gradient in the product. The app shell never uses one, and `/faq`
  and `/sign-in` do not either.
- **Routes:**
  - `/`: Public landing page.
  - `/faq`: Public FAQ page inside the public shell, with the site footer.
  - `/sign-in`: Bare sign-in page (no footer, no sidebar, no top bar).
  - `/app`: Redirects to the active persona's home desk.
  - App routes (`/chase`, `/bookings`, `/forecast`): Mount the sidebar and top
    bar inside the shell.
- **Public footer:** A static footer closes `/` and `/faq`, on ground `--footer`
  with a 1px `--border` top hairline. It is mounted nowhere else — not on the
  desks, not on `/app`, not on the 404, not on `/sign-in` — and no layout
  reserves height for it.
- **Authentication theatre:** There is no real backend authentication. Sign-in
  presents disabled email and password inputs, a permanently dead "Sign In"
  button, a "Signing In As" persona selector (Sales Admin, Loan Admin, Legal
  Admin), and a live "Sign In As Guest" button. Clicking the live button stores
  the persona in `localStorage` key `mortar.persona` and navigates to that
  role's home. A "Sign out" item in the app's persona menu navigates back to
  `/sign-in` and clears nothing from storage.

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
(76px above 720px), after which the footer's top hairline closes the document.

Landing content copy binds to the following specification:

| Slot              | Copy                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Header wordmark   | Mortar (beside the 26px joinery mark; the header carries no call to action)                                                 |
| Display line      | Booked Is Not Sold. `<br />` Signed Is. (the break is explicit, not a width cap)                                            |
| Lead line         | The AI operations layer that names the blocker on every stuck booking. (a full sentence, so sentence case with a full stop) |
| Call to action    | Open Mortar (the page's one Primary button and its only link, to `/sign-in`)                                                |
| Ledger caption    | Bookings — 148 live · 19 stalled · 5 signed this month                                                                      |
| Ledger figcaption | An example of the Bookings desk. These figures are illustrative. (`sr-only`)                                                |
| Desk: Chase List  | Every stuck booking, the blocker in plain words, and who to chase today.                                                    |
| Desk: Bookings    | Each unit from booking to SPA, with the days it has sat in every stage.                                                     |
| Desk: Forecast    | The SPAs you can bank on, not the bookings you hope will convert.                                                           |

Footer copy is specified in [Footer](#footer) rather than here, so the two
cannot drift.

The three desk blurbs are body copy written as complete sentences, so they take
sentence case under the carve-out in [Text Case](#text-case); their card titles
stay Title Case.

### Footer

The footer closes the two public pages, `/` and `/faq`, and nothing else. It is
a plain block at the end of the document: no fixed positioning, no layering, no
reserved height, and no scroll or focus handling. The app desks, `/app`, the 404
and `/sign-in` render without it. `PublicShell` is the layout route that mounts
it, and the footer emits its own `<footer>` element, so it is the page's
`contentinfo` landmark.

- **Ground and seam:** `--footer` is `paper/0` `#FFFFFF` in light, the same
  white as the page, and `ink/900` `#141414` in dark, a step up from the
  `#0A0A0A` page so the closing block still reads as its own surface. In light
  the seam is carried entirely by a 1px `--border` top hairline on the footer
  element (`border-t border-border`); in dark the hairline and the lift carry it
  together.
- **Gutter:** Full width on the landing's gutter — 24px of horizontal padding
  below 720px, 48px at 720px and above — so the footer's brand lockup sits on
  the same vertical line as the wordmark in the header above it. No centred
  column, and nothing is pinned to the viewport edge.
- **Layout:** One column below 720px, stacked in source order on a 40px gap,
  with 48px of block padding. At 720px and above, four columns — the brand
  column at `1.5fr`, the three link columns at `1fr` each — on a 32px gap with
  64px of block padding.
- **Brand column:** A link to `/` with `aria-label="Mortar home"` holding the
  28px Mortar joinery mark and the "Mortar" wordmark in 16px Geist SemiBold,
  then the line "A Booking Is A Promise. The Signed SPA Is The Sale." in
  `Body/Default` `--muted-foreground`, capped at 40ch.
- **Link columns:** Three groups, each a `<nav>` labelled by its title. The
  title is 14px Geist SemiBold in `--foreground`, Title Case — not an `Eyebrow`,
  because uppercase is reserved for that one style, and not a heading element,
  because an `<h2>` here would inject "Product", "Company" and "Code" into the
  FAQ's question outline. Links are `Body/Default` `--muted-foreground` on a
  24px row, which is also the WCAG 2.5.8 target height, going `--foreground` on
  hover across `--motion-fast`; keyboard focus is carried by the standard ring.
  Every destination is real — there is no Changelog and no Status.
  - Product: "Chase List" (`/chase`), "Bookings" (`/bookings`), "Forecast"
    (`/forecast`).
  - Company: "FAQ" (`/faq`), "Dashboard" (`/app`), "Design" (Figma, new tab).
  - Code: "GitHub" (GitHub, new tab).
- **Bottom bar:** 48px below the columns, a second 1px `--border` hairline, then
  a 24px-padded row in `Body/Small` `--muted-foreground`: "© <year> Mortar" on
  the left and "Internal Tool · Simulated Data" on the right, the year taken
  from the system clock. The two stack to the left below 720px.

### Sign-In

`/sign-in` is mounted completely bare without the public shell, top bar,
sidebar, or footer.

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
    Admin, and Legal Admin.
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

A screen or component ships when all fourteen criteria hold across both light
and dark modes:

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
6.  **Single primary action:** A view offers one Primary action, not one Primary
    button. On the landing this is the hero's "Open Mortar"; the header row
    carries no call to action, which is what keeps the count at one. Where a
    list repeats that same action per row or card, every item renders it
    Primary; what never appears is a second, different Primary action on the
    same view, or a list that fills the first item and leaves the rest outlined.
7.  **Responsive viewports:** Verified fully functional at 1280px and 1440px
    desktop widths, and cleanly usable down to 1024px.
8.  **Dual-mode verification:** Every view is inspected and verified in both
    light mode and dark mode before completion.
9.  **Landing leads with a viewport:** The landing's claim fills the first
    viewport, and the page continues below it — the chromatic panel, the three
    feature cards, then the footer at the document floor. The page is expected
    to scroll. The old rule that it occupy exactly one viewport existed only
    because a looping video held the page up; there is no video now, and the
    rule went with it.
10. **Footer scope:** The footer appears on `/` and `/faq` only, as a static
    block at the end of the document. No desk, redirect, 404 or sign-in route
    renders it, and no layout reserves height for it.
11. **Bare sign-in:** The sign-in route renders bare within the viewport,
    displaying no footer, no sidebar, and no top bar chrome.
12. **Title Case:** Headings, subheadings, eyebrows, lead lines under titles,
    empty-state text, card titles, button labels, form labels, menu items and
    footer text are Title Case, capitalising every word including short ones (A,
    And, To, The); acronyms (SPA, RM, FAQ) stay in capitals; data values,
    placeholders, aria-labels and full-sentence toasts or tooltips keep their
    own case. A lead line written as a complete sentence is the carve-out: it
    takes sentence case and a full stop, as [Text Case](#text-case) sets out.
13. **Clean card edges:** Every card, stat tile and panel sits on the white page
    ground carrying `--shadow-card` and a `--card-border` hairline, and nothing
    else. No coloured strip, bar, rule or accent runs along any edge on any
    side, and no grey band sits behind a card to separate it from the page.
14. **Plain language:** Every visible string, tooltip, toast and `aria-label`
    reads in the words a sales, loan or legal officer uses. No cache state,
    snapshot, seed, score, interval, model name or component name appears
    anywhere on screen, per [Plain Language](#plain-language).

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

### Do Not

- **Do not** introduce glass fills, backdrop blurs, gradients or glow blobs
  anywhere in the application (the sidebar scrim is the sole backdrop blur
  exception). The landing's chromatic panel is the one sanctioned gradient and
  no desk may reference it. Card shadows are not on this list: cards carry
  `--shadow-card`, and nothing invents a shadow of its own outside that token
  and `--shadow-overlay`.
- **Do not** run a coloured strip, bar, rule or accent edge along any border of
  a card, stat tile or panel, in any tone, at any width, on any side. Urgency,
  risk and status are carried by the pill and its word. The only edges a card
  has are its `--card-border` hairline and its shadow. The one bar that remains
  anywhere is the table row's 2px `--primary` selection inset, which marks
  selection rather than status and is ink, not a tone.
- **Do not** put software, statistics or data-pipeline vocabulary in a visible
  string, tooltip, toast or `aria-label`: cache states, snapshots, seeds,
  probabilities, scores, intervals, model names or component names. Write what a
  sales, loan or legal officer would say, per [Plain Language](#plain-language).
  Industry terms (SPA, LO, RM, panel bank) stay, and so does Jev, which is a
  named assistant the staff refer to; what goes is the machine state bolted to
  it.
- **Do not** put a grey band or tinted ground behind cards to separate them from
  the page. The page ground is `--background` and the shadow does the
  separating.
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
  `<input type="file">` elements as visible controls. The Drop Zone's hidden
  input is the documented exception; see [Native Controls](#native-controls).
- **Do not** place more than one Primary button on any screen.
- **Do not** apply 999px pill radii to buttons or form inputs; controls use 6px
  radius.
- **Do not** mount the footer outside `/` and `/faq`, or make any layout reserve
  height for it.

## See Also

- [Mortar Design System In Figma](https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1)
  — the public Figma file. Source of truth for token names, component variants,
  and layout specifications.
- [Design Research Index](/docs/research/design/README.md) — index of design
  sources and foundational studies.
- [Perch Landing Research](/docs/research/perch/landing.md) — study of Perch's
  landing surface and its responsive breakpoints. Mortar's landing no longer
  copies Perch's background layer.
- [Perch Footer And Chrome Research](/docs/research/perch/footer.md) —
  historical record only. It documents the fixed reveal footer and its keyboard
  focus handling, both of which Mortar has since dropped for a static footer.
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
