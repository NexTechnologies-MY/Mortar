# Perch Landing

A full study of Perch's landing page: the surface, its film, the shell and
footer it sits inside, the tokens and type roles it consumes, and what it takes
to rebuild it in Mortar. All paths are relative to the `v2/` app folder in the
Perch repository unless marked `docs/` (which lives one level up, at the repo
root). Perch was read on 19 September 2026; nothing under it was modified.

The landing is deliberately thin: one screen, no scroll of its own, a video
ground, three facts, and one way in. Perch's `docs/DESIGN.md` puts it in scope
with the note "One screen that folds over the footer like every other surface,
so its only scroll is the footer's height. Premium and quiet", and `docs/PRD.md`
pins two requirements: **R9** "one solid call to action that leads to sign in,
and no second solid button" and **R10** "shows Perch's name and one-line value
proposition; it contains no carousel, no testimonials, no screenshots of the
product".

## Files

| Path                                                                                | Lines | Role                                                                                            |
| ----------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `src/surfaces/Landing.tsx`                                                          | 91    | The page component: film layer, header row, text column, facts, day strip                       |
| `src/surfaces/Landing.css`                                                          | 278   | Every landing rule: layout, veil gradients, CTA, theme button, facts, strip                     |
| `src/surfaces/Landing.test.tsx`                                                     | 55    | Four tests: theme switch label, three surface names, CTA/switch parity, fact anchoring          |
| `src/components/HeroFilm.tsx`                                                       | 81    | Two-element video crossfader; renders an `<img>` under reduced motion                           |
| `src/components/HeroFilm.css`                                                       | 27    | Frame fit and the 800ms opacity dissolve                                                        |
| `src/data/reels.ts`                                                                 | 31    | Exports `base` (the clip bucket URL) read from `reels.json`; also builds the deck's reel map    |
| `src/data/reels.json`                                                               | 229   | `"base": "https://storage.googleapis.com/perch-reels/"` plus the 28-entry reel manifest         |
| `src/data/types.ts`                                                                 | 195   | `Reel` type (lines 17-25) imported by `reels.ts`                                                |
| `src/lib/theme.ts`                                                                  | 35    | `readTheme`/`applyTheme`; localStorage key `perch.theme.v1`, writes `data-theme` on `<html>`    |
| `src/styles/tokens.css`                                                             | 155   | All custom properties: palette, day hues, spacing, radii, motion, dark set                      |
| `src/styles/base.css`                                                               | 221   | `@font-face`, reset, `t-*` type roles, focus ring, selection, reduced-motion collapse           |
| `src/chrome/Shell.tsx`                                                              | 58    | The page-over-footer shell and its `focusin` reveal listener                                    |
| `src/chrome/chrome.css`                                                             | 149   | `.shell`, `.app-foot`, `--foot-h`, and every `foot-*` rule                                      |
| `src/chrome/Footer.tsx`                                                             | 31    | Footer content: brand link, specimen line, four links                                           |
| `src/chrome/TopbarIsland.tsx`                                                       | 118   | The in-app theme control the landing's button duplicates verbatim                               |
| `src/App.tsx`                                                                       | 151   | Routes (`/` and `*` render `Shell` > `Landing`; `/sign-in` is bare), `ScrollToTop`, `ThemeSeed` |
| `src/main.tsx`                                                                      | 19    | Import order (`tokens.css`, `base.css`, then `App`) plus `StrictMode` mount                     |
| `index.html`                                                                        | 49    | Title/meta/OG/Twitter tags, font preload, icons, `viewport-fit=cover`                           |
| `public/assets/mark.svg`                                                            | 7     | The seal mark, ink plate `#2E261F`, drawing in `#FBF8F2` (the file the landing loads)           |
| `public/assets/mark-dark.svg`                                                       | 7     | Inverted variant; not referenced by the landing                                                 |
| `public/assets/og-banner.png`                                                       | —     | 1200×630 social card referenced from `index.html`                                               |
| `public/fonts/quicksand-variable.woff2`                                             | —     | Quicksand variable, weights 300-700; the only preloaded asset                                   |
| `public/fonts/newsreader-regular.woff2`                                             | —     | Newsreader 400 upright (specimen lines)                                                         |
| `public/fonts/newsreader-italic.woff2`                                              | —     | Newsreader 400 italic (specimen lines)                                                          |
| `public/favicon.svg` / `favicon-16.png` / `favicon-32.png` / `apple-touch-icon.png` | —     | Icons; the SVG flips on `prefers-color-scheme`                                                  |
| `docs/DESIGN.md`                                                                    | —     | Scope table, mark spec, type table, "no caption under the hero" rule                            |
| `docs/PRD.md`                                                                       | —     | R9/R10 landing requirements                                                                     |
| `docs/TRD.md`                                                                       | —     | Route table; GCS media bucket note                                                              |
| `docs/ARCHITECTURE.md`                                                              | —     | Hero video provenance (Gemini, 10s aerial, watermark cropped)                                   |
| `docs/PRODUCT.md`                                                                   | —     | Route table and the Desk/Book register split                                                    |

Dead code found while reading: `.land-frame` (`src/surfaces/Landing.css` lines
34-41) matches no element — `HeroFilm` renders `.hero-frame`. Do not port it.

## Page Outline

Rendered structure, top to bottom. The route is `/` (and the `*` catch-all),
wrapped in `<Shell>` **without** islands, so the DOM is:

```html
<div class="shell" data-footer="true" data-islands="false">
  <main class="land">…</main>
</div>
<footer class="app-foot"><div class="foot-inner">…</div></footer>
```

1. **Film ground** — `<div class="land-film" aria-hidden="true">`, absolutely
   positioned `inset: 0` against `.shell` (`.land` is deliberately not a
   containing block), `z-index: -1`, `overflow: hidden`. Contains
   `<HeroFilm still={still} />` then `<div class="land-veil" />`, the gradient
   scrim. No copy.

2. **Header row** — `<header class="land-head">`, a flex row with 12px gaps:
   - `<img src="/assets/mark.svg" alt="" width="36" height="36" />` —
     decorative, empty `alt`.
   - `<span class="land-mark t-label">Perch</span>` — the wordmark, 12px bold
     uppercase tracked +0.06em, ink.
   - `<button type="button" class="land-theme">` — the theme switch,
     `margin-left: auto` pushes it to the far edge. `aria-label` names the theme
     it will set: `"Switch to the dark theme"` in light,
     `"Switch to the light theme"` in dark. Icon is
     `<Moon size={20} strokeWidth={1.75} />` in light, `<Sun … />` in dark
     (lucide-react).
   - `<Link className="land-go t-label" to="/sign-in">Start Planning</Link>` —
     the page's one solid button and only CTA.

3. **Text column** — `<div class="land-body">` (`flex: 1`, vertically centred)
   holding `<div class="land-plate">`:
   - `<p class="t-label land-eyebrow">A Trip Planner The Group Actually Answers</p>`
   - `<h1 class="t-display land-title">Swipe together. Land the trip.</h1>` No
     caption under the hero, per `docs/DESIGN.md`: "the display line carries it,
     or it is not worth saying".

4. **Facts band** — `<dl class="land-facts land-band">`, hidden below 720px,
   three `<div>` children each with a `t-label` `<dt>` and `t-specimen` `<dd>`:
   - "The Deck" / "Reels of real places, one thumb, and a tally the whole group
     can see"
   - "The Desk" / "Three slots a day. Drag what won, and each day gets ordered
     for you"
   - "The Book" / "The settled trip, printed as a field guide you keep"

5. **Day strip** — `<div class="land-strip" aria-hidden="true">`, five
   `<span data-day="1..5" />` bars, 10px tall, each `flex: 1` with
   `border-radius: var(--r-pill)` and `background: var(--day-N)`. The same
   wayfinding tints the product uses everywhere else.

6. **Footer hand-off** — `.app-foot` is `position: fixed`, `inset: auto 0 0 0`,
   `z-index: 0`, `height: var(--foot-h)`, `background: var(--plate)`; `.shell`
   reserves `margin-bottom: var(--foot-h)` and stays opaque above it
   (`z-index: 1`, `background: var(--paper)`), so the footer is only uncovered
   by scrolling. Inside, `.foot-inner` holds:
   - `<Link to="/" className="foot-brand" aria-label="Perch home">` with
     `<img src="/assets/mark.svg" width="28" height="28" />` and
     `<span class="foot-name">Perch</span>` (20px, weight 300, +0.01em).
   - `<p class="t-specimen foot-line">Everything you didn&rsquo;t choose is still ranked, and still waiting.</p>`
     (`max-width: 40ch`).
   - `<div class="foot-links">` with four `t-label` links: "Landing" → `/`,
     "Your Trips" → `/trips`, "v1, The Mockup" → `/v1/` (new tab), "TolongLabs"
     → `https://github.com/TolongLabs/Perch` (new tab).

## Hero Film

**Clip list.** `const CLIPS = ['hero-2', 'hero-birds']`, played in order and
looping back. The doc comment records they are different shapes: `hero-2` is
16:9 (1280×720) and `hero-birds` is 16:7 — the birds clip had a bottom strip
carrying the generator's sparkle and was cropped rather than masked.
`docs/ARCHITECTURE.md` records the hero footage was generated with Google Gemini
Videos on 9 September 2026: a 10-second aerial pan across Tokyo at dawn, with
the lower-right corner cropped to remove the watermark.

**Base URL.** `reels.ts` exports `export const base: string = manifest.base`,
and `reels.json` sets `"base": "https://storage.googleapis.com/perch-reels/"`.
Every asset is `base + name + extension`, e.g.
`https://storage.googleapis.com/perch-reels/hero-2.webm`. The bucket is public;
the same bucket serves the deck's reels. Importing `base` executes the whole
`reels.ts` module (it also builds the 28-reel deck map from the manifest).

**Formats.** Each `<video>` carries two `<source>` children, WebM first then MP4
(`type="video/webm"`, `type="video/mp4"`); the `.webm` is the VP9 encode "for a
browser with no H.264 decoder" per the `Reel` type comment. A `.jpg` poster sits
beside each pair under the same name.

**Poster handling.** Both video elements always get
`poster={`${base}${CLIPS[0]}.jpg`}` — the `hero-2` poster on both, regardless of
which clip the element holds. Under reduced motion the component returns
`<img className="hero-frame" src={`${base}${CLIPS[0]}.jpg`} alt="" />` instead.

**Two elements, one dissolve.** Rather than swapping a `<source>` (which has to
rebuffer, and the buffer is the cut), two absolutely stacked `<video>` elements
each keep one clip. With only two clips the `pair` logic never actually changes
either element's sources — it exists to support N clips. `FADE_S = 0.8`:

```ts
const onTime = (slot: number) => (e: { currentTarget: HTMLVideoElement }) => {
  if (slot !== front) return
  const v = e.currentTarget
  if (!v.duration || v.currentTime < v.duration - FADE_S) return
  const other = players.current[1 - front]
  if (!other?.paused) return
  other.currentTime = 0
  void other.play().catch(() => {})
  setFront(1 - front)
  setAt(next)
}
```

`onTimeUpdate` on the front clip fires the swap 0.8s before it ends: the hidden
element starts playing underneath, `front` flips, and the CSS does the crossfade
— `video.hero-frame` sits at `opacity: 0` and `[data-front="true"]` rises to 1
over `800ms var(--ease)`. An effect rewinds and plays the new front element
(`currentTime = 0`, `.play()`), and a refused `.play()` is swallowed: "An
autoplay refusal leaves the poster, which is the same picture."

**Autoplay.** `muted`, `playsInline`, `preload="auto"` on both;
`autoPlay={slot === 0}` on the first element only. No `loop` attribute — the
loop is the two-element hand-off, because a single looping video snaps back to
its first frame and "the cut is the one moment on the page a reader's eye is
drawn to something that is not the argument".

**Reduced motion.** Answered by not fetching the clip at all:

```ts
const still =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

Computed once at module scope ("a 1.4 MB video downloaded and held still is the
cost without the effect"). `HeroFilm` then returns the `hero-2.jpg` `<img>`. A
CSS belt-and-braces rule also kills the transition should a video ever render
under the preference:

```css
@media (prefers-reduced-motion: reduce) {
  video.hero-frame {
    transition: none;
  }
}
```

**Scrim.** `.land-veil` sits over the film inside `.land-film`. Two fades, not a
wash and not a plate — below 720px a bottom-up fade plus a top-down one; at
720px and up a left-to-right fade (the text column's direction) plus a stronger
bottom-up one:

```css
.land-veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to bottom,
      color-mix(in oklab, var(--paper) 92%, transparent) 0%,
      color-mix(in oklab, var(--paper) 82%, transparent) 30%,
      color-mix(in oklab, var(--paper) 58%, transparent) 56%,
      transparent 76%
    ),
    linear-gradient(
      to top,
      color-mix(in oklab, var(--paper) 92%, transparent) 0%,
      transparent 34%
    );
}

@media (min-width: 720px) {
  .land-veil {
    background:
      linear-gradient(
        to right,
        color-mix(in oklab, var(--paper) 90%, transparent) 0%,
        color-mix(in oklab, var(--paper) 70%, transparent) 28%,
        transparent 54%
      ),
      linear-gradient(
        to top,
        color-mix(in oklab, var(--paper) 92%, transparent) 0%,
        color-mix(in oklab, var(--paper) 78%, transparent) 24%,
        transparent 42%
      );
  }
}
```

## Layout And Type Values

Every rule in `Landing.css` and `HeroFilm.css`, then the globals they read.
Mortar Token gives the closest token from the Mortar set (per the brief's table)
or a Tailwind utility where no named token exists; "no match" entries propose a
name. Perch spacing is a 4px base scale identical to Tailwind's, so spacing maps
to utilities (`--s5` 24px → `p-6`, etc.).

### `src/surfaces/Landing.css`

| Selector                                                   | Property                              | Value                                                                                                        | Mortar Token                                                                 |
| ---------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `.land`                                                    | `display`                             | `flex`                                                                                                       | `flex`                                                                       |
| `.land`                                                    | `min-height`                          | `100dvh`                                                                                                     | `min-h-dvh`                                                                  |
| `.land`                                                    | `flex-direction`                      | `column`                                                                                                     | `flex-col`                                                                   |
| `.land`                                                    | `gap`                                 | `var(--s4)` = 16px                                                                                           | `gap-4`                                                                      |
| `.land`                                                    | `max-width`                           | `1040px`                                                                                                     | `max-w-[1040px]` (no named token)                                            |
| `.land`                                                    | `width`                               | `100%`                                                                                                       | `w-full`                                                                     |
| `.land`                                                    | `margin`                              | `0 auto`                                                                                                     | `mx-auto`                                                                    |
| `.land`                                                    | `padding`                             | `var(--s5) var(--s5)` = 24px                                                                                 | `p-6`                                                                        |
| `.land` ≥1024px                                            | `padding`                             | `var(--s6) var(--s7)` = 32px 48px                                                                            | `lg:py-8 lg:px-12`                                                           |
| `.land-film`                                               | `position`                            | `absolute`                                                                                                   | `absolute`                                                                   |
| `.land-film`                                               | `inset`                               | `0`                                                                                                          | `inset-0`                                                                    |
| `.land-film`                                               | `z-index`                             | `-1`                                                                                                         | `-z-10`                                                                      |
| `.land-film`                                               | `overflow`                            | `hidden`                                                                                                     | `overflow-hidden`                                                            |
| `.land-frame`                                              | all                                   | dead rule, no element matches                                                                                | drop                                                                         |
| `.land-veil`                                               | `position` / `inset`                  | `absolute` / `0`                                                                                             | `absolute inset-0`                                                           |
| `.land-veil`                                               | `background`                          | two `linear-gradient`s, `--paper` at 92/82/58%, `--paper` 92%                                                | `--background` in `color-mix`                                                |
| `.land-veil` ≥720px                                        | `background`                          | `to right` 90/70%, `to top` 92/78%                                                                           | `--background` in `color-mix`                                                |
| `.land-plate`                                              | `display` / `flex-direction`          | `flex` / `column`                                                                                            | `flex flex-col`                                                              |
| `.land-plate`                                              | `gap`                                 | `var(--s4)` = 16px                                                                                           | `gap-4`                                                                      |
| `.land-plate`                                              | `align-self`                          | `flex-start`                                                                                                 | `self-start`                                                                 |
| `.land-plate`                                              | `max-width`                           | `100%`                                                                                                       | `max-w-full`                                                                 |
| `.land-plate` ≥720px                                       | `gap` / `max-width`                   | `var(--s5)` = 24px / `32rem`                                                                                 | `md:gap-6 md:max-w-lg`                                                       |
| `.land-band`                                               | `align-self` / `max-width`            | `stretch` / `100%`                                                                                           | `self-stretch max-w-full`                                                    |
| `.land-head`                                               | `display` / `align-items`             | `flex` / `center`                                                                                            | `flex items-center`                                                          |
| `.land-head`                                               | `gap`                                 | `var(--s3)` = 12px                                                                                           | `gap-3`                                                                      |
| `.land-mark`                                               | `color`                               | `var(--ink)`                                                                                                 | `--foreground` (`text-foreground`)                                           |
| `.land-body`                                               | `display` / `flex` / `flex-direction` | `flex` / `1` / `column`                                                                                      | `flex flex-1 flex-col`                                                       |
| `.land-body`                                               | `justify-content`                     | `center`                                                                                                     | `justify-center`                                                             |
| `.land-body`                                               | `gap`                                 | `var(--s4)` = 16px                                                                                           | `gap-4`                                                                      |
| `.land-body` ≥720px                                        | `gap`                                 | `var(--s5)` = 24px                                                                                           | `md:gap-6`                                                                   |
| `.land-eyebrow`                                            | `color`                               | `var(--ink)`                                                                                                 | `--foreground`                                                               |
| `.land-title`                                              | `max-width`                           | `20ch`                                                                                                       | `max-w-[20ch]`                                                               |
| `.land-title`                                              | `font-size`                           | `clamp(40px, 10.5vw, 58px)`                                                                                  | `text-[clamp(40px,10.5vw,58px)]`                                             |
| `.land-title` ≥1024px                                      | `max-width`                           | `26ch`                                                                                                       | `lg:max-w-[26ch]`                                                            |
| `.land-go`                                                 | `display` / `align-items`             | `inline-flex` / `center`                                                                                     | `inline-flex items-center`                                                   |
| `.land-go`                                                 | `min-height`                          | `44px`                                                                                                       | `min-h-11`                                                                   |
| `.land-go`                                                 | `padding`                             | `var(--s3) var(--s5)` = 12px 24px                                                                            | `px-6 py-3`                                                                  |
| `.land-go`                                                 | `border-radius`                       | `var(--r-pill)` = 999px                                                                                      | no match — Mortar pills are 4px; `rounded-full` proposed, see Open Questions |
| `.land-go`                                                 | `background` / `color`                | `var(--ink)` / `var(--paper)`                                                                                | `--foreground` / `--background`                                              |
| `.land-go`                                                 | `text-decoration`                     | `none`                                                                                                       | `no-underline`                                                               |
| `.land-go`                                                 | `transition`                          | `background-color var(--motion-fade) var(--ease)` = 120ms `cubic-bezier(0.2,0.7,0.3,1)`                      | 120ms matches Mortar "fast"; ease has no token — propose `--ease-out`        |
| `.land-theme`                                              | `display` / `place-items`             | `grid` / `center`                                                                                            | `grid place-items-center`                                                    |
| `.land-theme`                                              | `width` / `height`                    | `44px` / `44px`                                                                                              | `h-11 w-11`                                                                  |
| `.land-theme`                                              | `margin-left`                         | `auto`                                                                                                       | `ml-auto`                                                                    |
| `.land-theme`                                              | `padding` / `border-radius`           | `0` / `var(--r-pill)`                                                                                        | `p-0`, `rounded-full` (see `.land-go`)                                       |
| `.land-theme`                                              | `background` / `color`                | `var(--ink)` / `var(--paper)`                                                                                | `--foreground` / `--background`                                              |
| `.land-theme`                                              | `cursor`                              | `pointer`                                                                                                    | `cursor-pointer`                                                             |
| `.land-theme`                                              | `transition`                          | `background`, `color` at `var(--motion-fade) var(--ease)`                                                    | 120ms + `--ease-out` (proposed)                                              |
| `.land-theme:hover`, `.land-go:hover` (+ `:focus-visible`) | `background`                          | `color-mix(in oklab, var(--open) 34%, var(--ink))`                                                           | `color-mix(in oklab, var(--primary) 34%, var(--foreground))`                 |
| `.land-facts`                                              | `display` / `margin`                  | `none` / `0`                                                                                                 | `hidden m-0`                                                                 |
| `.land-facts` ≥720px                                       | `display`                             | `grid`                                                                                                       | `md:grid`                                                                    |
| `.land-facts` ≥720px                                       | `grid-template-columns`               | `repeat(3, 1fr)`                                                                                             | `md:grid-cols-3`                                                             |
| `.land-facts` ≥720px                                       | `gap` / `margin-top`                  | `var(--s6)` = 32px / `auto`                                                                                  | `md:gap-8 md:mt-auto`                                                        |
| `.land-facts dt`                                           | `color` / `margin-bottom`             | `var(--ink)` / `var(--s2)` = 8px                                                                             | `--foreground`, `mb-2`                                                       |
| `.land-facts dd`                                           | `margin` / `max-width` / `color`      | `0` / `34ch` / `var(--ink)`                                                                                  | `m-0 max-w-[34ch]`, `--foreground`                                           |
| `.land-facts > div:nth-child(1/2/3)`                       | `justify-self`                        | `start` / `center` / `end`                                                                                   | `justify-self-start/-center/-end`                                            |
| `.land-strip`                                              | `display` / `gap` / `height`          | `flex` / `var(--s2)` = 8px / `10px`                                                                          | `flex gap-2 h-2.5`                                                           |
| `.land-strip span`                                         | `flex` / `border-radius`              | `1` / `var(--r-pill)`                                                                                        | `flex-1`, `rounded-full`                                                     |
| `.land-strip span[data-day="N"]`                           | `background`                          | `var(--day-1)` `#c2622f`, `--day-2` `#2a4c9b`, `--day-3` `#e0a32c`, `--day-4` `#6e4a8e`, `--day-5` `#b0567e` | no match — propose `--stage-1`…`--stage-5` (see Open Questions)              |

### `src/components/HeroFilm.css`

| Selector                                                   | Property                         | Value                       | Mortar Token                                                                   |
| ---------------------------------------------------------- | -------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| `.hero-frame`                                              | `position` / `inset`             | `absolute` / `0`            | `absolute inset-0`                                                             |
| `.hero-frame`                                              | `width` / `height`               | `100%` / `100%`             | `h-full w-full`                                                                |
| `.hero-frame`                                              | `object-fit` / `object-position` | `cover` / `center`          | `object-cover object-center`                                                   |
| `video.hero-frame`                                         | `opacity`                        | `0`                         | `opacity-0`                                                                    |
| `video.hero-frame`                                         | `transition`                     | `opacity 800ms var(--ease)` | no match — Mortar tops at 250ms; propose `--motion-film: 800ms` + `--ease-out` |
| `video.hero-frame[data-front="true"]`                      | `opacity`                        | `1`                         | `opacity-100`                                                                  |
| `@media (prefers-reduced-motion: reduce) video.hero-frame` | `transition`                     | `none`                      | `motion-reduce:transition-none`                                                |

### Globals The Landing Reads

| Perch Token / Rule                | Value                                                                                                                                                                                                                         | Mortar Token                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `--ink`                           | `#2e261f` light / `#f4efe6` dark                                                                                                                                                                                              | `--foreground`                                                                                                                            |
| `--paper`                         | `#fbf8f2` light / `#1b1714` dark                                                                                                                                                                                              | `--background`                                                                                                                            |
| `--plate`                         | `#f2ede0` light / `#26201b` dark                                                                                                                                                                                              | `--muted` (footer ground; `--sidebar` is the same value, but `--muted` is the nearer role)                                                |
| `--page`                          | `#ffffff` both                                                                                                                                                                                                                | `--card` (unused on the landing)                                                                                                          |
| `--open`                          | `#0b777e` light / `#38949b` dark                                                                                                                                                                                              | `--primary` (hover mix) and `--ring` (focus)                                                                                              |
| `--ink-muted`                     | `#6a5f53` light / `#918679` dark                                                                                                                                                                                              | `--muted-foreground`                                                                                                                      |
| `--day-1`…`--day-7`               | `#c2622f`, `#2a4c9b`, `#e0a32c`, `#6e4a8e`, `#b0567e`, `#2d7f6e`, `#8c4a2d`                                                                                                                                                   | no match — propose `--stage-*`                                                                                                            |
| `--s1`…`--s8`                     | 4, 8, 12, 16, 24, 32, 48, 64px                                                                                                                                                                                                | Tailwind `1`, `2`, `3`, `4`, `6`, `8`, `12`, `16`                                                                                         |
| `--r-pill`                        | `999px`                                                                                                                                                                                                                       | `rounded-full` (Mortar pill radius is 4px — decision needed)                                                                              |
| `--r-desk` / `--r-plate`          | `24px` / `0`                                                                                                                                                                                                                  | unused on the landing                                                                                                                     |
| `--outline`                       | `3px`                                                                                                                                                                                                                         | Mortar focus is 2px `--ring` + 4px glow (already in `globals.css`)                                                                        |
| `--motion-fade`                   | `120ms`                                                                                                                                                                                                                       | Mortar fast = 120ms                                                                                                                       |
| `--motion-step`                   | `320ms`                                                                                                                                                                                                                       | unused on the landing                                                                                                                     |
| `--ease`                          | `cubic-bezier(0.2, 0.7, 0.3, 1)`                                                                                                                                                                                              | no exact token — propose `--ease-out` with this curve                                                                                     |
| `--face-sans`                     | `"Quicksand", "Helvetica Neue", Arial, sans-serif`                                                                                                                                                                            | `--font-body`/`--font-heading` = Geist                                                                                                    |
| `--face-serif`                    | `"Newsreader", Georgia, "Times New Roman", serif`                                                                                                                                                                             | no match — no serif in Mortar (see Open Questions)                                                                                        |
| `body`                            | `background: var(--paper)`, `color: var(--ink)`, `font-family: var(--face-sans)`, `font-size: 15px`, `font-weight: 400`, `line-height: 1.5`, `font-variant-numeric: tabular-nums`, antialiased                                | `globals.css` already sets equivalents (Geist, `--background`, `--foreground`); size/weight differs — Mortar inherits Tailwind's 16px/400 |
| `.t-display`                      | `font-size: clamp(40px, 10.5vw, 56px)`, `font-weight: 300`, `letter-spacing: 0.01em`, `line-height: 1.04`                                                                                                                     | Geist 300 (not in the current Google Fonts link — see Open Questions)                                                                     |
| `.t-label`                        | `font-size: 12px`, `font-weight: 700`, `letter-spacing: 0.06em`, `text-transform: uppercase`                                                                                                                                  | `text-xs font-bold tracking-[0.06em] uppercase`                                                                                           |
| `.t-specimen`                     | `font-family: var(--face-serif)`, `font-size: 13px`, `font-weight: 400`, `font-style: italic`, `color: var(--ink-muted)`                                                                                                      | no match — serif italic; `--muted-foreground` for the colour                                                                              |
| `:focus-visible`                  | `outline: var(--outline) solid var(--open)` (3px), `outline-offset: 2px`                                                                                                                                                      | Mortar's dual-stop ring (2px `--ring` + 4px glow)                                                                                         |
| `::selection`                     | `color-mix(in oklab, var(--open) 24%, transparent)`, `color: var(--ink)`                                                                                                                                                      | `--primary` mix (unset in Mortar today)                                                                                                   |
| `:root` `--foot-h`                | `calc(196px + var(--foot-extra, 0px))`; ≥720px `calc(184px + …)`                                                                                                                                                              | literal — port as-is                                                                                                                      |
| `.shell`                          | `position: relative`, `z-index: 1`, `min-height: 100dvh`, `background: var(--paper)`; `[data-footer="true"]` → `margin-bottom: var(--foot-h)`                                                                                 | `--background`                                                                                                                            |
| `.app-foot`                       | `position: fixed`, `inset: auto 0 0 0`, `z-index: 0`, `height: var(--foot-h)`, `background: var(--plate)`                                                                                                                     | `--muted`                                                                                                                                 |
| `.foot-inner`                     | `display: grid`, `gap: var(--s3)`, `align-content: center`, `height: 100%`, `max-width: 1040px`, `margin-inline: auto`, `padding: 0 var(--s5)`; ≥720px `justify-items: end`, `text-align: right`, `padding-inline: var(--s7)` | spacing → `gap-3`, `px-6`, `md:px-12`                                                                                                     |
| `.foot-name`                      | `font-size: 20px`, `font-weight: 300`, `letter-spacing: 0.01em`                                                                                                                                                               | Geist 300                                                                                                                                 |
| `.foot-link`                      | `color: var(--ink-muted)`, `padding-top: 2px`, `padding-bottom: 4px`, `border-bottom: 2px solid color-mix(in oklab, var(--ink) 18%, transparent)`, 120ms transitions                                                          | `--muted-foreground`, `--foreground` mix                                                                                                  |
| `.foot-link:hover/:focus-visible` | `color: var(--ink)`, `border-bottom-color: var(--ink)`                                                                                                                                                                        | `--foreground`                                                                                                                            |
| `@media print`                    | `.shell` cleared, `.app-foot` hidden                                                                                                                                                                                          | port as-is                                                                                                                                |
| reduced-motion collapse           | `animation-duration: 0.01ms !important`, `transition-duration: 0.01ms !important` on `*`                                                                                                                                      | no equivalent in `globals.css` — Tailwind `motion-reduce` variants or a global rule                                                       |

Dark theme is one attribute — `[data-theme="dark"]` on `<html>` flips every
token above; Mortar uses the `.dark` class instead, which its `ThemeProvider`
already manages.

## Behaviour

1. **Mount and theme.** `useState<Theme>(readTheme)` reads `perch.theme.v1` from
   localStorage; anything but `'light'`/`'dark'` falls back to
   `prefers-color-scheme`. `applyTheme` writes `data-theme` on `<html>` and
   re-persists. `App.tsx`'s `ThemeSeed` does the same once per full load so a
   stored choice survives landing on a route with no toggle.
2. **Theme switch.** Click flips light↔dark. The `aria-label` names the theme it
   will set, and the icon is the destination's (`Moon` in light, `Sun` in dark),
   both lucide at `size={20} strokeWidth={1.75}` — byte-for-byte the same
   control as `TopbarIsland.tsx`'s, so the toggle reads identically here and
   inside the app.
3. **Start Planning.** `<Link to="/sign-in">` — the page's only solid button and
   only route out (PRD R9). `/sign-in` is the one route with no `Shell` and no
   footer.
4. **Film autoplay.** Slot 0 gets the `autoPlay` attribute; both are `muted`,
   `playsInline`, `preload="auto"`. A refused `play()` leaves the poster.
5. **Crossfade loop.** At `duration - 0.8s` on the front clip's `timeupdate`,
   the hidden element starts under it, `data-front` flips, and both opacity
   transitions run at `800ms cubic-bezier(0.2,0.7,0.3,1)`. Loops hero-2 →
   hero-birds → hero-2 forever.
6. **Reduced motion.** `prefers-reduced-motion` renders `hero-2.jpg` as an
   `<img>` — the video is never fetched; the CSS transition is additionally
   forced to `none`, and `base.css` collapses all other durations to `0.01ms`.
7. **Scroll.** `.land` is exactly `100dvh`; the shell reserves
   `margin-bottom: var(--foot-h)` (196px under 720px, 184px at and above), so
   the only scroll is the footer's height and the fixed `.app-foot` is revealed
   from behind the page. `ScrollToTop` resets scroll on every route change.
8. **Footer focus.** `Shell` binds `focusin` on the footer and calls
   `window.scrollTo({ top: document.documentElement.scrollHeight })`, because a
   fixed element is always "in view" to the browser and would otherwise paint
   its focus ring under the page (WCAG 2.4.11).
9. **Hover and focus.** `.land-go` and `.land-theme` share one hover recipe —
   `color-mix(in oklab, var(--open) 34%, var(--ink))` over `background-color` at
   120ms — on both `:hover` and `:focus-visible`. The global focus ring is
   `outline: 3px solid var(--open); outline-offset: 2px`.
10. **Breakpoints.** Under 720px `.land-facts` is `display: none` — the page
    must not scroll, so the supporting facts come off a phone rather than grow a
    scrollbar. At 720px: facts grid appears (3×`1fr`, gap 32px,
    `margin-top: auto`), `.land-plate` caps at `32rem`, the veil switches to the
    horizontal recipe, `.land-body` gap goes 24px, `.foot-inner` goes
    right-aligned. At 1024px: `.land` padding becomes 32px/48px and
    `.land-title` widens to `26ch`.
11. **Fact anchoring.** Inside the facts grid the three blocks are
    `justify-self: start / center / end` — the last held to the right content
    edge rather than the viewport, because each `dd` caps at `34ch` inside its
    `1fr` track.
12. **Accessibility details.** `.land-film` and `.land-strip` are `aria-hidden`;
    the mark `<img>` has empty `alt`; the facts are a real `dl`/`dt`/`dd`; the
    theme button is a `<button>` with a dynamic `aria-label`; the CTA is a real
    link, so tab order is theme button → Start Planning → (after scroll) the
    four footer links.
13. **Catch-all.** `path="*"` also renders `<Shell><Landing /></Shell>` — Perch
    has no 404 screen, "no bounce to an onboarding wall" (TRD).
14. **Selection.** `::selection` is `--open` at 24% over `--ink` text.
15. **No other motion.** Nothing on the page animates except the film, the two
    hover transitions, and the footer reveal. No scroll effects, no parallax, no
    entrance animation.

## Tests

`src/surfaces/Landing.test.tsx` renders with `renderToStaticMarkup` inside a
`MemoryRouter` (entry `/`) and also reads `Landing.css` as text via
`Bun.file(...)`. Four tests:

1. `offers the theme switch on the landing page, named for the theme it will set`
   — asserts the markup contains `aria-label="Switch to the dark theme"` (the
   store is empty in test, so the OS answer, light here, applies).
2. `names the three surfaces as the three features` — asserts the markup
   contains `The Deck`, `The Desk`, `The Book`.
3. `keeps the theme switch the same solid button as Start Planning` — slices the
   `.land-go` and `.land-theme` blocks out of the CSS file and asserts both
   carry `background: var(--ink)` and `color: var(--paper)`, that the switch is
   `width: 44px` / `height: 44px`, and that the shared hover rule
   `.land-theme:hover,\n.land-theme:focus-visible` and
   `color-mix(in oklab, var(--open) 34%, var(--ink))` exist. The comment says
   this guards against a revert splitting them into "a paper chip next to an ink
   CTA".
4. `anchors the three facts one per track on the content column, prose left-aligned`
   — asserts the CSS contains `.land-facts > div:nth-child(1)` with
   `justify-self: start`, `(2)` `center`, `(3)` `end`.

The CSS-as-text pattern is how Perch regression-tests authored styling; the
equivalent Mortar test can do the same against the ported CSS file or assert
Tailwind classes in markup.

## Porting Plan For Mortar

Mortar conventions: one file per route under `frontend/src/pages/`, Tailwind 4
for styling, `lucide-react` already installed (Moon/Sun exist), `useTheme()` in
`frontend/src/hooks/useTheme.tsx` already toggles `resolved` and persists to
`localStorage` under `theme` with a `.dark` class, and `MortarMark` in
`frontend/src/components/brand/MortarMark.tsx` replaces `mark.svg`. Perch's
landing is outside the app chrome; the Mortar equivalent is a route outside
`<Route element={<AppShell />}>` in `App.tsx`.

**Files to create:**

| File                                                                          | Contents                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/pages/LandingPage.tsx`                                          | Port of `Landing.tsx`: `.land` layout, header row, plate, facts `dl`, strip. Same DOM, same class names (or Tailwind equivalents), `useTheme().resolved`/`toggle` for the switch with the same aria-label pattern.                                                                 |
| `frontend/src/components/HeroFilm.tsx`                                        | Copy `HeroFilm.tsx` **verbatim** except the `base` import — the two-element dissolve logic, `FADE_S = 0.8`, `data-front`, poster handling and the `still` early return all transfer unchanged.                                                                                     |
| `frontend/src/components/HeroFilm.css` (or colocated `landing.css`)           | Copy `HeroFilm.css` verbatim.                                                                                                                                                                                                                                                      |
| `frontend/src/pages/LandingPage.css`                                          | Copy `Landing.css` with tokens swapped (see table above). A plain CSS file is the honest port: the two `color-mix` veil gradients and the `nth-child` anchoring are worse as arbitrary Tailwind values. Keep `var(--s*)`-style names or literal px — Mortar has no spacing tokens. |
| `frontend/src/lib/heroClips.ts`                                               | `export const base = '…'` plus the `CLIPS` list — replaces the `reels.ts`/`reels.json` dependency, which is 90% deck machinery Mortar does not need. Decide whether clips ship in `frontend/public/` (self-hosted) or a bucket (see Open Questions).                               |
| `frontend/src/pages/LandingPage.test.tsx`                                     | Port all four tests; Vitest + jsdom rather than `bun:test`/`renderToStaticMarkup` (Mortar's convention is `@testing-library/react`).                                                                                                                                               |
| `frontend/src/components/layout/AppFooter.tsx` (edit, separate surface study) | The fold-over footer — `.app-foot` fixed at `z-index: 0`, the shell's `margin-bottom: var(--foot-h)`, `.foot-inner` grid, `focusin` reveal — belongs to the footer port and changes `AppLayout`, but the landing's "only scroll" depends on it.                                    |

**Copy verbatim:** `HeroFilm.tsx`, `HeroFilm.css`, the `.land-veil` gradient
blocks, the `onTime`/`FADE_S` logic, the theme button JSX (swapping the store
call), the `dl`/`dt`/`dd` facts structure, the `data-day` strip markup, the
reduced-motion `matchMedia` line, and the `index.html` pattern of preloading the
display font.

**Re-token:** `--ink`→`--foreground`, `--paper`→`--background`,
`--plate`→`--muted`, `--ink-muted`→`--muted-foreground`, `--open`→`--primary`
(hover mix, selection) and `--ring` (focus), `--r-pill`→`rounded-full` pending
the radius decision, `--motion-fade`→120ms (Mortar fast), `--ease`→a new
`--ease-out: cubic-bezier(0.2,0.7,0.3,1)`, the 800ms crossfade→a new
`--motion-film: 800ms`, spacing→Tailwind utilities or literal px, day
hues→proposed `--stage-*` tokens, `data-theme`→Mortar's `.dark` class (already
handled by `useTheme`), `perch.theme.v1`→Mortar's `theme` key.

**Replace (Perch-only content):**

- `mark.svg` → `<MortarMark size={36} />`; wordmark text "Perch" → "Mortar".
- Eyebrow "A Trip Planner The Group Actually Answers" and title "Swipe together.
  Land the trip." → Mortar copy (e.g. eyebrow about the bookings-to- SPA
  pipeline; title TBD — see Open Questions).
- Facts "The Deck/The Desk/The Book" + specimen lines → three Mortar facts; the
  natural triple is the persona surfaces: Bookings (Loan Admin), Chase (Sales
  Admin), Forecast (Finance) — or the pipeline stages.
- "Start Planning" → Mortar's way in (the sign-in surface is a sibling study;
  target route TBD, likely `/sign-in` or the persona redirect).
- Day tints → Mortar stage tints if the strip survives, else drop it.
- Footer links → Mortar routes (`/bookings`, `/chase`, `/forecast`, `/import`);
  the "v1, The Mockup" and "TolongLabs" links are Perch-only.
- `index.html`: title/description/OG/Twitter/`theme-color` → Mortar's existing
  head already covers most of this; add an `og-banner` and the font preload.
- `reels.json`/reels.ts/`types.ts` → not ported; only `base` is needed.
- `TripProvider`, `ScrollToTop`, `ThemeSeed` → Mortar already has
  `PersonaProvider`, and `useTheme` seeds the class itself; a `ScrollToTop`
  equivalent is optional.

**Asset list the landing needs:**

| Asset                                                  | Status                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2 hero clips, each as `.webm` + `.mp4` + `.jpg` poster | Must be made. `docs/research/design/video-pipeline.md` is the team's pipeline: Gemini (1280×720, ~10s), watermark removal via `gemini-watermark-remover`, encode with `ffmpeg -an -c:v libx264 -crf 22 -movflags +faststart` plus a VP9/WebM pass and `-frames:v 1` poster. Prompt should name Mortar's paper `#F5F0E8`. Perch's Tokyo clips are the wrong subject. |
| Brand mark                                             | Have it: `MortarMark` inline SVG (the two interlocking Ls), themeable via `currentColor` + `fill-primary`.                                                                                                                                                                                                                                                          |
| Fonts                                                  | Geist already loads via Google Fonts, but only 400-700 — add weight **300** for the display/plate-title/wordmark roles. Newsreader has no Mortar equivalent (see Open Questions).                                                                                                                                                                                   |
| Favicon / touch icon                                   | `frontend/public/favicon.svg` exists; PNG fallbacks and `apple-touch-icon.png` would need making.                                                                                                                                                                                                                                                                   |
| `og-banner.png`                                        | Needs making (1200×630).                                                                                                                                                                                                                                                                                                                                            |
| lucide `Moon`/`Sun`                                    | Already in `lucide-react` (Mortar pins `^0.487.0`; Perch `^1.43.0` — same icon names).                                                                                                                                                                                                                                                                              |

## Open Questions

1. **Where does the landing live?** Perch mounts it at `/` (and `*`). Mortar's
   `/` is `HomeRedirect` to the persona home. Options: landing at `/` with the
   redirect moving behind the CTA, or a separate route like `/welcome`. The
   sign-in study should settle the CTA target too.
2. **Shell or no shell?** Perch's landing has no nav chrome — no sidebar, no top
   bar. Should Mortar's landing sit outside `AppShell` entirely (the Perch
   model) or inside a `minimalNav` `AppLayout`?
3. **Footer scope.** The fold-over is sitewide in Perch. Does Mortar port it
   globally (changing `AppLayout` for every page, and its
   `min-h-screen`/`flex-col` wrapper) or only around the landing? Probably owned
   by the footer study, but the landing's scroll behaviour depends on the
   answer.
4. **Radius.** Perch's CTA, theme button and strip are `999px`; Mortar pills are
   4px per the token table. Full-round on the landing, or adopt the 4px recipe?
5. **Specimen italic.** `t-specimen` is Newsreader italic and there is no serif
   in Mortar's stack (Geist + Geist Mono; Geist ships no italic either, so a
   fake oblique is the bad outcome). Load Newsreader for three lines, set them
   in Geist non-italic muted, or use Geist Mono?
6. **Geist 300.** The display role, plate title and footer wordmark are all
   weight 300; Mortar's Google Fonts link loads only 400-700. Add 300 to the
   link (and confirm Geist's variable axis covers it)?
7. **The strip.** Five `data-day` tints are a Perch wayfinding device. Map to
   Mortar's pipeline stages (booking → loan → SPA signed, five new `--stage-*`
   hues), reuse the six `--status-*` tones, or cut the strip?
8. **Footage.** New clips via the Gemini pipeline in
   `docs/research/design/video-pipeline.md` — subject, count (Perch uses two;
   one is enough for the same effect), and hosting (commit to `frontend/public/`
   vs a bucket; Perch's bucket URL is hardcoded in a JSON manifest).
9. **Theme model.** Perch is strictly light/dark; Mortar adds `system`. The
   landing should reuse `useTheme().toggle` (resolved light↔dark) and keep
   Perch's aria-label wording — confirm that is acceptable rather than
   replicating Perch's two-value store.
10. **Catch-all.** Perch routes `*` to the landing; Mortar has `NotFoundPage`.
    Keep `NotFoundPage` or mirror Perch?
11. **Dead rule.** `.land-frame` is unused in Perch — confirmed by repo-wide
    search. Dropped from the port unless someone knows it is load-bearing.
