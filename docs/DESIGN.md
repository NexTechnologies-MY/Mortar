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
1.  [Public Pages](#public-pages)
1.  [Acceptance](#acceptance)
1.  [Do And Do Not](#do-and-do-not)
1.  [See Also](#see-also)

## Decisions

Seven core decisions were settled during design system research. All seven are
binding, and nothing below reopens them.

| Question        | Decision                                                                                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Look            | Flat ledger: paper ground, white cards, 1px hairlines, 6px radius. No glass, backdrop blur (the sidebar scrim is the sole exception), gradients (the landing veil is the sole exception), glow blobs or card shadows in the app. |
| Status colour   | Orange is for action and selection only. Six status tones carry every state, each always with a word.                                                                                                                            |
| Type            | Geist for UI, Geist Mono for unit codes and IDs. Nine text styles. No third family.                                                                                                                                              |
| Density         | Controls 36px, table rows 44px, body 14px. Built for a working day in lists.                                                                                                                                                     |
| Native controls | None. Select, date picker, menu, tooltip, file drop, checkbox and scrollbar are Mortar components (Radix/shadcn restyled). No alert/confirm/prompt.                                                                              |
| Modes           | Light and dark from one token set (Color collection has Light and Dark modes).                                                                                                                                                   |
| Icons           | Lucide (lucide-react), 16px, stroke 2, coloured like adjacent text. 20px in empty states.                                                                                                                                        |

Mortar is an internal operations tool for developer staff tracking property unit
bookings from initial deposit through loan submission, loan approval, and final
Sale and Purchase Agreement (SPA) signing. The interface rejects decorative SaaS
styling: there are no frosted glass planes, no gradient card fills, no floating
drop shadows on data tables, and no neon glow blobs. Every screen presents a
crisp, high-density paper ledger where data and actionable blockers stand out
immediately.

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

- **Landing display line exception:** The public landing hero display line
  ("Booked Is Not Sold. Signed Is.") is the single exception to the scale: set
  in Geist SemiBold, `clamp(2.5rem, 6vw, 4.5rem)`, line-height `1.05`, tracking
  `-0.03em`.
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

## Colour

Mortar components consume semantic tokens defined in CSS custom properties and
never write raw hex values. The primitives collection contains 55 calibrated
values across seven color families.

### Primitives Summary

Primitives belong to the collection "Primitives", mapped in CSS as
`var(--color-<family>-<step>)`, hidden from design pickers:

- **`orange`:** 50 `#FFF7ED`, 100 `#FFEDD5`, 200 `#FED7AA`, 300 `#FDBA74`, 400
  `#FB923C`, 500 `#F97316`, 600 `#EA580C`, 700 `#C2410C`, 800 `#9A3412`, 900
  `#7C2D12`, 950 `#431407`, 975 `#2E1A12` (custom deep ground).
- **`ink`:** 50 `#FAF9F7`, 100 `#F2F0ED`, 200 `#E6E2DD`, 300 `#D3CEC7`, 400
  `#A8A29E`, 500 `#6E665F`, 600 `#57534E`, 700 `#44403C`, 800 `#292524`, 900
  `#1C1917`, 950 `#0C0A09`.
- **`paper`:** 0 `#FFFFFF`, 50 `#FDFBF8`, 100 `#F9F6F0`, 200 `#F5F0E8`, 300
  `#EDE6DA`, 400 `#E2D9CB`, 500 `#CEC3B1`.
- **`green`:** 100 `#DCFCE7`, 300 `#86EFAC`, 400 `#4ADE80`, 600 `#16A34A`, 800
  `#166534`, 950 `#052E16`.
- **`yellow`:** 100 `#FEF9C3`, 300 `#FDE047`, 400 `#FACC15`, 600 `#CA8A04`, 800
  `#854D0E`, 950 `#422006`.
- **`rose`:** 100 `#FFE4E6`, 300 `#FDA4AF`, 400 `#FB7185`, 600 `#E11D48`, 700
  `#BE123C`, 950 `#4C0519`.
- **`blue`:** 100 `#DBEAFE`, 300 `#93C5FD`, 400 `#60A5FA`, 600 `#2563EB`, 700
  `#1D4ED8`, 950 `#172554`.
- **Brand mark (Kigumi Joint):** ink `#1C1917` + orange `#C2410C` in light mode;
  paper `#F5F0E8` + orange `#F97316` in dark mode.

### Semantic Colour

The semantic collection "Color" defines functional roles across Light and Dark
modes:

| Token                         | CSS                       | Light                      | Dark                   |
| ----------------------------- | ------------------------- | -------------------------- | ---------------------- |
| `color/bg/page`               | `--background`            | `#F5F0E8` (paper/200)      | `#0C0A09` (ink/950)    |
| `color/bg/card`               | `--card`                  | `#FFFFFF` (paper/0)        | `#1C1917` (ink/900)    |
| `color/bg/popover`            | `--popover`               | `#FFFFFF` (paper/0)        | `#292524` (ink/800)    |
| `color/bg/sidebar`            | `--sidebar`               | `#F9F6F0` (paper/100)      | `#1C1917` (ink/900)    |
| `color/bg/muted`              | `--muted`                 | `#F9F6F0` (paper/100)      | `#292524` (ink/800)    |
| `color/bg/hover`              | `--accent`                | `#EDE6DA` (paper/300)      | `#292524` (ink/800)    |
| `color/bg/selected`           | `--selected`              | `#FFF7ED` (orange/50)      | `#2E1A12` (orange/975) |
| `color/bg/inverse`            | `--inverse`               | `#1C1917` (ink/900)        | `#F5F0E8` (paper/200)  |
| `color/bg/primary`            | `--primary`               | `#C2410C` (orange/700)     | `#F97316` (orange/500) |
| `color/bg/primary-hover`      | `--primary-hover`         | `#9A3412` (orange/800)     | `#FB923C` (orange/400) |
| `color/bg/destructive`        | `--destructive`           | `#BE123C` (rose/700)       | `#E11D48` (rose/600)   |
| `color/bg/disabled`           | `--disabled`              | `#EDE6DA` (paper/300)      | `#292524` (ink/800)    |
| `color/text/primary`          | `--foreground`            | `#1C1917` (ink/900)        | `#F5F0E8` (paper/200)  |
| `color/text/muted`            | `--muted-foreground`      | `#6E665F` (ink/500)        | `#A8A29E` (ink/400)    |
| `color/text/on-primary`       | `--primary-foreground`    | `#FFFFFF` (paper/0)        | `#1C1917` (ink/900)    |
| `color/text/on-inverse`       | `--inverse-foreground`    | `#F5F0E8` (paper/200)      | `#1C1917` (ink/900)    |
| `color/text/disabled`         | `--disabled-foreground`   | `#6E665F` (ink/500)        | `#A8A29E` (ink/400)    |
| `color/text/link`             | `--link`                  | `#C2410C` (orange/700)     | `#FB923C` (orange/400) |
| `color/border/default`        | `--border`                | `#E2D9CB` (paper/400)      | `#292524` (ink/800)    |
| `color/border/strong`         | `--input`                 | `#CEC3B1` (paper/500)      | `#44403C` (ink/700)    |
| `color/border/focus`          | `--ring`                  | `#C2410C` (orange/700)     | `#F97316` (orange/500) |
| `color/scrollbar/thumb`       | `--scrollbar-thumb`       | `#E2D9CB` (paper/400)      | `#292524` (ink/800)    |
| `color/scrollbar/thumb-hover` | `--scrollbar-thumb-hover` | `#CEC3B1` (paper/500)      | `#44403C` (ink/700)    |
| `color/bg/footer`             | `--footer`                | `#EDE6DA` (paper/300)      | `#1C1917` (ink/900)    |
| `color/bg/scrim`              | `--scrim`                 | ink-950 at 14% (color-mix) | black at 45%           |

### Status Tones

Six status tones carry every state. Each tone provides `fg` (text and icon),
`bg` (pill container fill), and `solid` (dot, bar, and chart series):

| Tone       | CSS Variable Prefix | fg (Light / Dark)     | bg (Light / Dark)     | solid (Light / Dark)  | Word       |
| ---------- | ------------------- | --------------------- | --------------------- | --------------------- | ---------- |
| `positive` | `--status-positive` | `#166534` / `#86EFAC` | `#DCFCE7` / `#052E16` | `#16A34A` / `#4ADE80` | On track   |
| `warning`  | `--status-warning`  | `#854D0E` / `#FDE047` | `#FEF9C3` / `#422006` | `#CA8A04` / `#FACC15` | Watch      |
| `danger`   | `--status-danger`   | `#BE123C` / `#FDA4AF` | `#FFE4E6` / `#4C0519` | `#E11D48` / `#FB7185` | At risk    |
| `info`     | `--status-info`     | `#1D4ED8` / `#93C5FD` | `#DBEAFE` / `#172554` | `#2563EB` / `#60A5FA` | With bank  |
| `neutral`  | `--status-neutral`  | `#57534E` / `#D3CEC7` | `#EDE6DA` / `#292524` | `#A8A29E` / `#6E665F` | Booked     |
| `signed`   | `--status-signed`   | `#F5F0E8` / `#1C1917` | `#1C1917` / `#F5F0E8` | `#1C1917` / `#F5F0E8` | SPA signed |

Rules that are not obvious from the table:

- **Orange is for action and selection only:** Orange never conveys status or
  warning. It is reserved for `--primary` actions, `--link` text, `--ring` focus
  borders, and `--selected` row ground.
- **Red is strictly for danger:** Rose / `--status-danger` / `--destructive` is
  restricted to risk conditions and irreversible actions (e.g. cancelling a
  booking).
- **Signed pill inversion:** `signed` is the only solid pill: its background
  uses solid `#1C1917` (light) / `#F5F0E8` (dark), its text uses
  `--status-signed-fg`, and its 6px dot uses the foreground color.
- **Chart series colours:** Data charts bind status solids directly: `signed`
  for actual signed SPAs, `info` for applications with banks, and `positive` /
  `warning` / `danger` for risk distributions.
- **Calibrated contrast:** Muted text `#6E665F` achieves 4.96:1 contrast on
  paper and 5.6:1 on white (surpassing the WCAG AA 4.5:1 floor). Stone `#78716C`
  was rejected because its 4.2:1 contrast failed on paper. White text on light
  primary `#C2410C` achieves 5.2:1. Dark primary `#F97316` binds ink text
  `#1C1917` (5.9:1), never white.
- **Static board chrome:** Fixed interface framing (cover, board title bars)
  binds primitives ink/900 `#1C1917`, paper/200 `#F5F0E8` and orange/500
  `#F97316` so it never flips with theme modes.
- **No row tinting or zebra stripes:** Table rows remain neutral white or paper.
  Never tint an entire row with risk colours.

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
- `radius/full` (9999px): scrollbar thumbs, stage tracker bars, landing strip
  bars.

### Elevation And Focus

- **Overlay elevation (`--shadow-overlay`):**
  `0 1px 2px rgba(28,25,23,.06), 0 8px 24px -4px rgba(28,25,23,.12)`. Restricted
  to floating layers: menus, popovers, date picker calendar, and dialog modals.
  Cards remain completely flat with a 1px `--border` hairline.
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
- `motion/film` (800ms, `ease-out`): Hero film crossfade opacity dissolve
  between stacked video elements.

### Reduced Motion

Under `prefers-reduced-motion: reduce`:

- All translation, expansion, and sliding animations are disabled.
- Transitions collapse to immediate 120ms cross-fades.
- In the hero film, video elements do not play, no video files are fetched, and
  only the still JPEG poster frame is rendered.

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
  - `Primary`: background `--primary` (`#C2410C` light / `#F97316` dark), hover
    `--primary-hover` (`#9A3412` / `#FB923C`), text `--primary-foreground`
    (`#FFFFFF` / `#1C1917`).
  - `Secondary`: background `--card` (`#FFFFFF` / `#1C1917`), border 1px
    `--input` (`#CEC3B1` / `#44403C`), hover `--accent` (`#EDE6DA` / `#292524`),
    text `--foreground` (`#1C1917` / `#F5F0E8`).
  - `Ghost`: background transparent, hover `--accent`, text `--foreground`.
  - `Destructive`: background `--destructive` (`#BE123C` / `#E11D48`), text
    `--primary-foreground`. Always prompts confirmation in a Dialog.
  - `Disabled`: background `--disabled` (`#EDE6DA` / `#292524`), text
    `--disabled-foreground` (`#6E665F` / `#A8A29E`). Never use opacity.
  - `Focus`: 2px `--ring` outline with 2px `--background` offset.
- **Rules:** Primary is the only orange surface on a screen; exactly one Primary
  button per view. No gradients, shadows, or press scale.

### Checkbox

- **Purpose:** Binary selection for batch table actions and form toggles.
- **Anatomy:** 16px × 16px box, corner radius 4px (`--radius-sm`), 1px `--input`
  border on `--card`.
- **States and tokens:**
  - `Unchecked`: 1px `--input` border, `--card` background.
  - `Checked`: fills `--primary` (`#C2410C` / `#F97316`), 12px Check icon in
    `--primary-foreground` (`#FFFFFF` / `#1C1917`).
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
  - `Focus`: 2px `--ring` border (`#C2410C` / `#F97316`).
  - `Error`: 1px `--status-danger` border (`#E11D48` / `#FB7185`), validation
    message below in `--status-danger-fg` (`#BE123C` / `#FDA4AF`), Body/Small.
  - `Disabled`: `--disabled` fill (`#EDE6DA` / `#292524`),
    `--disabled-foreground` text.
- **Rules:** A visible label in Label/Small must sit above every field. No
  native select, date inputs, number spinners, or browser autofill yellow.

### Tooltip

- **Purpose:** Non-critical supplementary notes and exact unrounded values.
- **Anatomy:** Background `--inverse` (`#1C1917` light / `#F5F0E8` dark), text
  `--inverse-foreground` (`#F5F0E8` / `#1C1917`), Body/Small (13/18), corner
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
  - `Neutral`: Booked (fg `#57534E` / `#D3CEC7`, bg `#EDE6DA` / `#292524`, dot
    `#A8A29E` / `#6E665F`).
  - `Info`: With bank (fg `#1D4ED8` / `#93C5FD`, bg `#DBEAFE` / `#172554`, dot
    `#2563EB` / `#60A5FA`).
  - `Positive`: On track (fg `#166534` / `#86EFAC`, bg `#DCFCE7` / `#052E16`,
    dot `#16A34A` / `#4ADE80`).
  - `Warning`: Watch (fg `#854D0E` / `#FDE047`, bg `#FEF9C3` / `#422006`, dot
    `#CA8A04` / `#FACC15`).
  - `Danger`: At risk (fg `#BE123C` / `#FDA4AF`, bg `#FFE4E6` / `#4C0519`, dot
    `#E11D48` / `#FB7185`).
  - `Signed`: SPA signed (fg `#F5F0E8` / `#1C1917`, bg `#1C1917` / `#F5F0E8`,
    dot `#F5F0E8` / `#1C1917`).
- **Rules:** Signed is the only solid pill (dot uses signed fg). Never present
  color alone without text. Never tint an entire table row or card.

### Scrollbar

- **Purpose:** Consistent, unobtrusive scrolling across data tables, menus, and
  drawers.
- **Anatomy:** Transparent track, no arrow buttons, 6px thumb in
  `--scrollbar-thumb` (`#E2D9CB` light / `#292524` dark), corner radius full
  (9999px).
- **States and tokens:**
  - `Rest`: 6px thumb in `--scrollbar-thumb`.
  - `Hover`: 8px thumb in `--scrollbar-thumb-hover` (`#CEC3B1` / `#44403C`),
    150ms color transition ease.
- **Rules:** Defined once globally in `globals.css`
  (`scrollbar-width: thin; ::-webkit-scrollbar`). Never hide scrollbars; never
  leave default OS scrollbars active.

### Menu Item And Menu

- **Purpose:** Option lists for Select dropdowns, table row actions, and the
  persona switcher.
- **Anatomy:**
  - Menu container: background `--popover` (`#FFFFFF` / `#292524`), 1px
    `--border` (`#E2D9CB` / `#292524`), corner radius 6px (`--radius-md`),
    padding 4px, `Elevation/Overlay` shadow, width 240px, maximum height 320px
    (scrolls beyond).
  - Menu item: 32px high, corner radius 4px (`--radius-sm`), padding 8px
    horizontal, text in Body/Default.
- **States and tokens:**
  - `Hover/Focus`: background `--accent` (`#EDE6DA` / `#292524`).
  - `Selected`: displays trailing 16px Check icon in `--link` (`#C2410C` /
    `#FB923C`).
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
  - `Today`: 1px `--input` ring (`#CEC3B1` / `#44403C`), Label/Default weight.
  - `Selected day`: `--primary` fill (`#C2410C` / `#F97316`),
    `--primary-foreground` text (`#FFFFFF` / `#1C1917`).
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
    `#1C1917` / `#F5F0E8`; upcoming use `--input` `#CEC3B1` / `#44403C`). Stage
    name in Label/Small (current in `--foreground`, others muted). Current stage
    appends elapsed time in Body/Small muted (e.g. "21 days").
  - Compact tracker: five 10px × 4px bars, gap 2px, placed beside the stage name
    in table rows.
- **Rules:** No orange in the stage tracker. Lapsed or cancelled bookings freeze
  bars at the last reached stage and display the cancellation status pill.

### Stat Tile

- **Purpose:** Top-of-page KPI summary cards for operations desks.
- **Anatomy:** Width 240px+, padding 16px, gap 4px, background `--card`
  (`#FFFFFF` / `#1C1917`), 1px `--border` (`#E2D9CB` / `#292524`), corner radius
  6px (`--radius-md`), no shadow. Eyebrow label, `Display/Figure` figure
  (30/36), Body/Small caption.
- **States and tokens:**
  - `Default`: figure in `--foreground`.
  - `Alert`: figure in `--status-danger-fg` (`#BE123C` / `#FDA4AF`).
- **Rules:** Maximum four tiles per row. Figures round for rapid reading
  (`RM 7.4m`, `38 SPAs`) with exact unrounded value available via Tooltip.
  Clicking a tile filters the list behind its number.

### Booking Row And Table Header

- **Purpose:** Primary tabular ledger for unit bookings and pipeline tracking.
- **Anatomy:**
  - Table header: 36px high, background `--muted` (`#F9F6F0` / `#292524`), text
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
  - `Hover`: `--muted` background (`#F9F6F0` / `#292524`).
  - `Selected`: `--selected` background (`#FFF7ED` / `#2E1A12`) with a 2px
    `--primary` left border.
- **Rules:** No zebra striping, no row risk tinting. Clicking a row opens the
  unit booking detail drawer; column headers trigger sorting.

### Chase Card

- **Purpose:** Action card in Sales Admin Chase List directing staff to unblock
  stuck bookings.
- **Anatomy:** Width 360px, padding 16px, gap 12px, background `--card`
  (`#FFFFFF` / `#1C1917`), 1px `--border`, corner radius 6px (`--radius-md`).
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
  - `Overdue`: 3px left edge `--status-danger` (`#E11D48` / `#FB7185`), danger
    pill.
  - `Due today`: 3px left edge `--status-warning` (`#CA8A04` / `#FACC15`),
    warning pill.
  - `Upcoming`: 3px left edge `--status-neutral` (`#A8A29E` / `#6E665F`),
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
  - `Dragging`: 2px dashed `--ring` border on `--selected` (`#FFF7ED` /
    `#2E1A12`), `Upload` icon in `--link`, "Release to import" in Label/Default.
  - `Parsed`: 1px solid `--border`, `FileSpreadsheet` icon, file name, "146 rows
    read", Warning pill "3 to review".
- **Rules:** Replaces native file inputs. Entire zone is clickable and keyboard
  focusable.

### Dialog

- **Purpose:** Destructive action confirmations and quick modal task workflows.
- **Anatomy:** Centered modal panel, maximum width 480px, background `--card`
  (`#FFFFFF` / `#1C1917`), 1px `--border`, corner radius 6px (`--radius-md`),
  `Elevation/Overlay` shadow. Backdrop overlay: `rgba(12, 10, 9, 0.4)` (ink/950
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
  the navigation items. Built with a solid `--sidebar` (`#F9F6F0` light /
  `#1C1917` dark) ground and a 1px `--border` hairline; no blur or translucency
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

## Public Pages

The public pages (Landing, Footer, Sign-In) copy an earlier project, Perch: its
structure, DOM organization, timings, and breakpoints (720px and 900px),
re-skinned entirely with Mortar tokens:

- **Mortar geometry:** 6px radius for controls and cards instead of Perch's
  999px pills; 1px hairlines instead of Perch's 3px outlines.
- **Geist typography:** Perch's italic serif specimen lines become 14px Geist
  Regular in `--muted-foreground`. No Newsreader or italic serif is loaded.
- **Gradients:** The landing veil is the single place in Mortar where gradients
  are permitted.
- **Routes:**
  - `/`: Public landing page.
  - `/faq`: Public skeleton page inside the site shell, with the reveal footer,
    whose content is tracked in GitHub issue #1.
  - `/sign-in`: Bare sign-in page (no footer, no sidebar, no top bar).
  - `/app`: Redirects to the active persona's home desk.
  - App routes (`/chase`, `/bookings`, `/forecast`): Mount the sidebar and top
    bar inside the shell.
- **Sitewide reveal footer:** A fixed 196px footer (184px from 720px up) on
  ground `--footer` (`paper-300` `#EDE6DA` light / `ink-900` `#1C1917` dark)
  sits under every page except `/sign-in`. It is revealed by scrolling past the
  page floor and by keyboard focus.
- **Authentication theatre:** There is no real backend authentication. Sign-in
  presents disabled email and password inputs, a permanently dead "Sign In"
  button, a "Signing In As" persona selector (Sales Admin, Loan Admin, Finance),
  and a live "Sign In As Guest" button. Clicking the live button stores the
  persona in `localStorage` key `mortar.persona` and navigates to that role's
  home. A "Sign out" item in the app's persona menu navigates back to `/sign-in`
  and clears nothing from storage.

### Landing

The landing page is exactly one screen tall with no scroll of its own
(`min-height: 100dvh`), so its only scroll is the reveal of the footer
underneath (`margin-bottom: var(--footer-h)`).

The film ground sits absolutely positioned (`inset: 0`, `z-index: -1`,
`overflow: hidden`) containing the hero film and the gradient veil. The veil
provides readable contrast for typography:

- **Below 720px:** Two vertical linear gradients using `color-mix` with
  `--background`: top-down (92% paper at 0%, 82% at 30%, 58% at 56%, transparent
  at 76%) and bottom-up (92% paper at 0%, transparent at 34%).
- **At 720px and above:** Two linear gradients: left-to-right (90% paper at 0%,
  70% at 28%, transparent at 54%) and bottom-up (92% paper at 0%, 78% at 24%,
  transparent at 42%).

Landing content copy binds to the following specification:

| Slot                   | Copy                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow                | Booking To SPA, For Sales, Loan And Finance                                                                                    |
| Display line           | Booked Is Not Sold. Signed Is. (Geist SemiBold, clamp(2.5rem, 6vw, 4.5rem), line-height 1.05, -0.03em)                         |
| Call to action         | Open Mortar (the page's one Primary button, links to `/sign-in`)                                                               |
| Facts: Chase List      | Every Stuck Booking, The Blocker In Plain Words, And Who To Chase Today                                                        |
| Facts: Bookings        | Each Unit From Booking To SPA, With The Days It Has Sat In Every Stage                                                         |
| Facts: Forecast        | The SPAs You Can Bank On, Not The Bookings You Hope Will Convert                                                               |
| Strip                  | Five bars for Booked, Documents, Loan submitted, Loan approved, SPA signed, stepping from `--input` through ink to `--primary` |
| Footer line            | A Booking Is A Promise. The Signed SPA Is The Sale.                                                                            |
| Footer link: FAQ       | FAQ (`/faq`)                                                                                                                   |
| Footer link: Dashboard | Dashboard (`/app`)                                                                                                             |
| Footer link: Design    | Design (https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1, new tab)    |
| Footer link: GitHub    | GitHub (https://github.com/NexTechnologies-MY/mortar, new tab)                                                                 |

The day strip displays five 10px tall bars (`border-radius: 9999px`, gap 8px),
stepping across pipeline progression: Booked (`--input`), Documents (ink/300),
Loan submitted (ink/600), Loan approved (ink/900), and SPA signed (`--primary`).

### Hero Film

The hero background uses a single looped clip:
`frontend/public/media/hero-1.webm`, `hero-1.mp4`, and `hero-1.jpg` poster
frame.

- **Dimensions and duration:** 1280px × 560px (16:7 aspect ratio), 6.8 seconds,
  silent.
- **Dissolve mechanic:** Looped using Perch's two-element crossfade. Two stacked
  `<video>` elements play the clip. An `onTimeUpdate` listener detects when the
  active front clip reaches 800ms before completion, triggers playback on the
  hidden rear clip at `currentTime = 0`, and flips the active slot. A CSS
  transition (`opacity 800ms var(--ease-out)`) crossfades the layers seamlessly
  without buffering cuts.
- **Reduced motion:** Under `prefers-reduced-motion: reduce`, the component
  renders the `hero-1.jpg` poster image directly. No video element is rendered
  and zero video bytes are fetched across the network.
- **Provenance for the record:** Generated in Gemini (Veo, 1280x720, 10 s) from
  the prompt:
  > "Slow, steady aerial drift from left to right over a new residential
  > development in a Malaysian city in soft early-morning light; two finished
  > condominium towers with balconies and a third tower under construction with
  > a tower crane, low-rise terrace houses and palm trees below, light haze over
  > distant green hills. Towers framed on the right so natural sky fills the
  > left side. Warm, muted palette of cream, stone grey and a touch of burnt
  > orange. No people in focus, no text, no logos. 16:9" The first 3.2 seconds
  > (a wipe transition introduced by the model) was trimmed; Gemini's visible
  > watermark in the lower-right corner was removed using
  > `gemini-watermark-remover`; and the bottom 160px was cropped away, yielding
  > the final 1280×560 (16:7) frame. The clip was encoded as H.264 CRF 22
  > faststart and VP9 CRF 34, audio stripped. SynthID remains embedded in the
  > file. The complete generation procedure is documented in
  > [video-pipeline.md](/docs/research/design/video-pipeline.md).

### Footer

The footer is mounted sitewide inside the site shell under every route except
`/sign-in`.

- **Reveal mechanics:** The footer (`<footer class="app-foot">`) is fixed to the
  viewport floor (`position: fixed; inset: auto 0 0 0; z-index: 0`). The page
  container sits above it
  (`position: relative; z-index: 1; background: var(--background); min-height: 100dvh`)
  and reserves bottom margin equal to the footer height
  (`margin-bottom: var(--footer-h)`). The footer is painted behind the page and
  uncovered only as the user scrolls to the document floor.
- **Dimensions and responsive layout:**
  - Height: 196px below 720px; 184px at 720px and above (`--footer-h`).
  - Ground: `--footer` (`paper-300` `#EDE6DA` light / `ink-900` `#1C1917` dark).
  - Alignment: Below 720px, left-aligned with 24px horizontal padding. At 720px
    and above, right-aligned (`justify-items: end; text-align: right`) with 48px
    horizontal padding.
- **Focus reveal (WCAG 2.4.11):** Because the footer is fixed inside the
  viewport floor, default browser scroll-into-view is a no-op when tabbing into
  footer links. The shell binds a native `focusin` listener on the footer
  element: when any footer link receives keyboard focus, the window immediately
  scrolls to `document.documentElement.scrollHeight`, ensuring the focused link
  is never concealed beneath the page shell.
- **Anatomy:**
  - Brand lockup: Link to `/` with `aria-label="Mortar home"`, 28px Mortar
    joinery mark, and "Mortar" wordmark in Geist Light 300 (20px, tracking
    +0.01em).
  - Tagline: "A Booking Is A Promise. The Signed SPA Is The Sale." (14px Geist
    Regular in `--muted-foreground`, maximum width 40ch).
  - Links row: Four links in 12px bold uppercase (`tracking-[0.06em]`) with a
    2px bottom border in
    `color-mix(in oklab, var(--foreground) 18%, transparent)`: "FAQ" (`/faq`),
    "Dashboard" (`/app`), "Design" (Figma, new tab), and "GitHub" (GitHub, new
    tab).
- **Print:** Under `@media print`, the footer is hidden
  (`display: none !important`), and the page container margins are zeroed.

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
  plate featuring Mortar's joinery mark in `--foreground` and `--primary` on a
  warm `--selected` ground.
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
6.  **Single primary action:** Exactly one Primary button exists per view.
7.  **Responsive viewports:** Verified fully functional at 1280px and 1440px
    desktop widths, and cleanly usable down to 1024px.
8.  **Dual-mode verification:** Every view is inspected and verified in both
    light mode and dark mode before completion.
9.  **Single-screen landing:** The landing page occupies exactly one viewport
    height (`100dvh`) with no scroll of its own; its sole scroll is the reveal
    of the footer.
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
    own case.

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
- **Do** render the static JPEG poster and fetch zero video bytes when
  `prefers-reduced-motion: reduce` is active.
- **Do** attach the `focusin` listener to the sitewide footer so keyboard
  navigation brings it immediately into view.

### Do Not

- **Do not** introduce glass fills, backdrop blurs, gradients, glow blobs, or
  card drop shadows in the application (the sidebar scrim is the sole backdrop
  blur exception; the landing veil is the sole gradient exception).
- **Do not** use orange for any status indicator, or red for anything other than
  severe risk and irreversible destructive actions.
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
  landing surface, film ground, and responsive veil.
- [Perch Footer And Chrome Research](/docs/research/perch/footer.md) — mechanics
  of the fixed reveal footer and keyboard focus handling.
- [Perch Sign-In Research](/docs/research/perch/auth.md) — two-pane layout,
  guest sign-in flow, and simulated authentication.
- [Landing Video Pipeline](/docs/research/design/video-pipeline.md) — Gemini
  video generation, watermark removal, and encoding pipeline.
- [House Markdown Style Guide](/docs/markdown-style.md) — rules for ATX
  headings, line limits, and table formatting.
- [Mortar Project Guidelines](/AGENTS.md) — engineering conventions and Bun
  workspace scripts.
- [Mortar Agent Notes](/docs/agents/notes.md) — developer architecture and agent
  implementation notes.
