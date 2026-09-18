# Perch Footer And Chrome

How Perch builds its footer and mounts it across the whole site, transcribed
from `v2/`. The footer is a reveal: it is fixed to the viewport floor at
`z-index: 0` and the page column is an opaque layer above it that reserves the
footer's height as bottom margin, so the footer only becomes visible when the
reader scrolls past the end of the page. Every route except `/sign-in` mounts
it. Paths below are relative to the `v2` folder; `../docs/` is the Perch repo's
documentation root.

## Files

| Path                           | Lines | Role                                                                                                                                           |
| ------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/chrome/Footer.tsx`        | 31    | Footer markup: brand lockup, specimen tagline, four links                                                                                      |
| `src/chrome/Shell.tsx`         | 58    | Page column + fixed footer mount + `focusin` reveal; also mounts the islands                                                                   |
| `src/chrome/chrome.css`        | 149   | Every shell and footer rule: reveal mechanics, `.foot-inner` grid, link styles, print                                                          |
| `src/chrome/islands.css`       | 543   | Island variables the footer height and shell padding derive from (`--dock-clear`, `--rail-gutter`, `--cluster-clear`), island and scrim layers |
| `src/chrome/TopbarIsland.tsx`  | 118   | Top-right cluster (theme, notifications, account). Shares the wordmark recipe with the footer                                                  |
| `src/chrome/SidebarIsland.tsx` | 173   | Rail plus `BottomDock`. The dock's presence below 900px is what grows the footer                                                               |
| `src/App.tsx`                  | 151   | Routes. Every route but `/sign-in` mounts `Shell`; the Deck toggles `islands` only                                                             |
| `src/main.tsx`                 | 19    | Entry. Imports `tokens.css` then `base.css` before `App`; the order is load-bearing                                                            |
| `src/styles/tokens.css`        | 155   | Palette, spacing, type, motion tokens, including the `[data-theme="dark"]` set                                                                 |
| `src/styles/base.css`          | 221   | Reset, type roles (`.t-label`, `.t-specimen`), the `:focus-visible` ring, reduced-motion                                                       |
| `src/surfaces/Landing.tsx`     | 91    | The one-screen surface the footer reveals under                                                                                                |
| `src/surfaces/Landing.css`     | 278   | `.land { min-height: 100dvh }` — the reservation that makes the reveal the page's only scroll                                                  |
| `src/surfaces/SignIn.tsx`      | 56    | The one surface with no footer; it mounts no `Shell` at all                                                                                    |
| `src/surfaces/SignIn.css`      | 105   | Two-pane auth. Documents the footer omission as a named exception                                                                              |
| `src/lib/theme.ts`             | 35    | `data-theme` attribute on `<html>`, persisted to `localStorage` key `perch.theme.v1`                                                           |
| `src/lib/joiner.ts`            | 11    | Entry-path check. Affects only `islands` on the Deck route, never the footer                                                                   |
| `index.html`                   | 49    | `#root` mount, Quicksand preload, meta                                                                                                         |
| `../docs/DESIGN.md`            | 474   | The spec the code cites: the footer is "a drawer the page folds over"                                                                          |

## Footer Anatomy

Rendered DOM, in order. `Link` is react-router's and renders an `<a>`; the
`<footer>` itself is emitted by `Shell`, not by `Footer` — `Footer` returns only
the `.foot-inner` div.

```html
<footer class="app-foot">
  <div class="foot-inner">
    <a class="foot-brand" href="/" aria-label="Perch home">
      <img src="/assets/mark.svg" alt="" width="28" height="28" />
      <span class="foot-name">Perch</span>
    </a>
    <p class="t-specimen foot-line">
      Everything you didn’t choose is still ranked, and still waiting.
    </p>
    <div class="foot-links">
      <a class="foot-link t-label" href="/">Landing</a>
      <a class="foot-link t-label" href="/trips">Your Trips</a>
      <a class="foot-link t-label" href="/v1/" target="_blank" rel="noreferrer"
        >v1, The Mockup</a
      >
      <a
        class="foot-link t-label"
        href="https://github.com/TolongLabs/Perch"
        target="_blank"
        rel="noreferrer"
        >TolongLabs</a
      >
    </div>
  </div>
</footer>
```

| #   | Element                     | Classes                | Copy                                                                                               | Target                                                                     |
| --- | --------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `footer`                    | `app-foot`             | —                                                                                                  | —                                                                          |
| 2   | `div`                       | `foot-inner`           | —                                                                                                  | —                                                                          |
| 3   | `a` (router `Link`)         | `foot-brand`           | `aria-label="Perch home"`                                                                          | `/` (internal)                                                             |
| 3a  | `img` inside `.foot-brand`  | —                      | `alt=""`, `width="28"`, `height="28"`                                                              | `/assets/mark.svg`                                                         |
| 3b  | `span` inside `.foot-brand` | `foot-name`            | "Perch"                                                                                            | —                                                                          |
| 4   | `p`                         | `t-specimen foot-line` | "Everything you didn’t choose is still ranked, and still waiting." (67 chars; `&rsquo;` in source) | —                                                                          |
| 5   | `div`                       | `foot-links`           | —                                                                                                  | —                                                                          |
| 5a  | `a` (router `Link`)         | `foot-link t-label`    | "Landing"                                                                                          | `/` (internal)                                                             |
| 5b  | `a` (router `Link`)         | `foot-link t-label`    | "Your Trips"                                                                                       | `/trips` (internal)                                                        |
| 5c  | `a`                         | `foot-link t-label`    | "v1, The Mockup"                                                                                   | `/v1/` (same origin, `target="_blank" rel="noreferrer"`)                   |
| 5d  | `a`                         | `foot-link t-label`    | "TolongLabs"                                                                                       | `https://github.com/TolongLabs/Perch` (`target="_blank" rel="noreferrer"`) |

Notes on the anatomy:

- The mark is `/assets/mark.svg`, a 168×168 rounded square (`rx=28`) in
  `#2E261F` carrying a cream branch line and three circles. It is rendered at
  28px here, 24px in the rail, 36px on the landing.
- The footer always uses `mark.svg`; the dark variant `mark-dark.svg` is only
  swapped in on the rail (`.rail-mark[data-theme]`). On the dark theme's
  `#26201b` plate the dark square all but disappears and only the cream glyphs
  carry.
- `.foot-name` and the rail's `.rail-name` are the same wordmark recipe stated
  twice: `font-size: 20px; font-weight: 300; letter-spacing: 0.01em`.
- There is no year line, no top border, and no `nav` landmark — the links row is
  a plain `div`.

## Where It Renders

Every route except `/sign-in` mounts `Shell`, and `footer` defaults to `true`,
so the footer is sitewide. `footer={false}` is never passed anywhere in
`src/App.tsx`; the prop exists only so the effect below knows whether it has an
element to bind to.

| Route                 | Surface      | Shell Props                           | Footer | Islands    |
| --------------------- | ------------ | ------------------------------------- | ------ | ---------- |
| `/`                   | `Landing`    | none (`footer` true, `islands` false) | yes    | no         |
| `/sign-in`            | `SignIn`     | no `Shell` mounted                    | **no** | no         |
| `/trips`              | `Dashboard`  | `islands`                             | yes    | yes        |
| `/new`                | `Onboarding` | `islands`                             | yes    | yes        |
| `/desk`               | `Desk`       | `islands`                             | yes    | yes        |
| `/desk/before-we-go`  | `BeforeWeGo` | `islands`                             | yes    | yes        |
| `/t/:tripId/swipe`    | `Deck`       | `islands={!isJoiner()}`               | yes    | owner only |
| `/t/:tripId/votes`    | `Tally`      | `islands`                             | yes    | yes        |
| `/t/:tripId/handbook` | `Handbook`   | `islands`                             | yes    | yes        |
| `/t/:tripId`          | `Book`       | `islands`                             | yes    | yes        |
| `*`                   | `Landing`    | none                                  | yes    | no         |

Landing. The page is exactly one viewport tall, so its only scroll is the
footer's reveal:

```tsx
{
  /* The landing folds over the footer like every other surface, so nothing of it
    shows until the reader scrolls to the end. */
}
;<Route
  path="/"
  element={
    <Shell>
      <Landing />
    </Shell>
  }
/>
```

Sign-in. The single bare route — no `Shell`, no footer, no islands:

```tsx
{
  /* Auth is the one surface with no footer. There is nowhere to go from here but in. */
}
;<Route path="/sign-in" element={<SignIn />} />
```

Signed-in surfaces. All identical in shape; the Deck is the only one whose
`islands` prop is conditional (footer unaffected):

```tsx
<Route
  path="/trips"
  element={
    <Shell islands>
      <Dashboard />
    </Shell>
  }
/>

<Route
  path="/t/:tripId/swipe"
  element={
    <Shell islands={!isJoiner()}>
      <Deck />
    </Shell>
  }
/>
```

Catch-all. Unmatched routes render the landing inside the same chrome:

```tsx
<Route
  path="*"
  element={
    <Shell>
      <Landing />
    </Shell>
  }
/>
```

The `Shell` render block, verbatim from `src/chrome/Shell.tsx`:

```tsx
return (
  <>
    {islands && <SidebarIsland expandedChanged={setRailOpen} />}
    {islands && <BottomDock />}
    {islands && <TopbarIsland />}
    {/* Outside the page layer on purpose. A filter or opacity on the content tree would make it a containing
        block for every fixed child inside it, which would drag the islands down the page with it. */}
    {islands && (
      <div className="island-scrim" data-on={railOpen} aria-hidden="true" />
    )}

    <div className="shell" data-footer={footer} data-islands={islands}>
      {children}
    </div>
    {footer && (
      <footer className="app-foot" ref={foot}>
        <Footer />
      </footer>
    )}
  </>
)
```

DOM order is therefore: rail, dock, topbar, scrim, page, footer. The footer is
last, so tab order runs through the page and lands on the footer links at the
end — which is why the reveal effect below exists.

## Layout And Type Values

Every footer and shell rule from `src/chrome/chrome.css`, plus the island
variables in `src/chrome/islands.css` that the footer's height and the page's
padding resolve from, plus the two type roles and the focus ring the footer
inherits from `src/styles/base.css`.

Custom properties:

| Selector                         | Property           | Value                                                             | Mortar Token                                         |
| -------------------------------- | ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `:root`                          | `--foot-h`         | `calc(196px + var(--foot-extra, 0px))`                            | no match — propose `--footer-h`                      |
| `:root` ≥720px                   | `--foot-h`         | `calc(184px + var(--foot-extra, 0px))`                            | no match — propose `--footer-h`                      |
| `:root:has(.island-dock)` <900px | `--foot-extra`     | `var(--dock-clear)` (resolves to 140px)                           | no match — only needed if Mortar grows a bottom dock |
| `:root` (islands.css)            | `--rail-inset`     | `16px`                                                            | no match — layout constant                           |
| `:root`                          | `--rail-collapsed` | `64px`                                                            | `--sidebar-collapsed` (64px — exact match)           |
| `:root`                          | `--rail-expanded`  | `176px`                                                           | `--sidebar-width` is 200px — no match                |
| `:root`                          | `--rail-gutter`    | `calc(var(--rail-inset) * 2 + var(--rail-collapsed))` = 96px      | no match — page reserves `lg:ml-16` (64px) today     |
| `:root`                          | `--island-row`     | `44px`                                                            | no match — WCAG touch target                         |
| `:root`                          | `--dock-h`         | `calc(var(--s2) * 2 + var(--island-row) * 2 + var(--s1))` = 108px | no match                                             |
| `:root`                          | `--dock-clear`     | `calc(var(--rail-inset) * 2 + var(--dock-h))` = 140px             | no match                                             |
| `:root`                          | `--cluster-h`      | `calc(var(--s2) * 2 + var(--island-row))` = 60px                  | no match                                             |
| `:root`                          | `--cluster-clear`  | `calc(var(--rail-inset) + var(--cluster-h) + var(--s3))` = 88px   | no match — closest is `--topbar-height` (52px)       |

Shell and footer rules:

| Selector                                       | Property                                 | Value                                                                                                 | Mortar Token                                                                                             |
| ---------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.shell`                                       | `position`                               | `relative`                                                                                            | `relative`                                                                                               |
| `.shell`                                       | `z-index`                                | `1`                                                                                                   | no match — Mortar nav is `z-50`; page sits at `z-[1]`                                                    |
| `.shell`                                       | `min-height`                             | `100dvh`                                                                                              | `min-h-dvh` (Mortar uses `min-h-screen` = 100vh today)                                                   |
| `.shell`                                       | `background`                             | `var(--paper)` (#fbf8f2 / #1b1714 dark)                                                               | `--background`                                                                                           |
| `.shell[data-islands="true"]` ≥900px           | `padding-left`                           | `var(--rail-gutter)` = 96px                                                                           | equivalent of `lg:ml-16`                                                                                 |
| `.shell[data-islands="true"]`                  | `padding-top`                            | `var(--cluster-clear)` = 88px                                                                         | equivalent of `pt-14` (56px)                                                                             |
| `.shell[data-islands="true"]` <900px           | `padding-bottom`                         | `var(--dock-clear)` = 140px                                                                           | no match — Mortar has no bottom dock                                                                     |
| `.shell[data-footer="true"]`                   | `margin-bottom`                          | `var(--foot-h)`                                                                                       | `--footer-h` (proposed)                                                                                  |
| `.shell:has(.book)`, `.shell:has(.handbook)`   | `background`                             | `var(--plate)`                                                                                        | per-surface ground; see `--footer` below                                                                 |
| `.app-foot`                                    | `position`                               | `fixed`                                                                                               | `fixed`                                                                                                  |
| `.app-foot`                                    | `inset`                                  | `auto 0 0 0`                                                                                          | `inset-x-0 bottom-0`                                                                                     |
| `.app-foot`                                    | `z-index`                                | `0`                                                                                                   | `z-0`                                                                                                    |
| `.app-foot`                                    | `height`                                 | `var(--foot-h)`                                                                                       | `--footer-h` (proposed)                                                                                  |
| `.app-foot`                                    | `background`                             | `var(--plate)` (#f2ede0 / #26201b dark)                                                               | closest `--accent` (#EDE6DA / #292524); propose `--footer` — `--accent` is a hover tint, not a ground    |
| print `.shell`                                 | padding, margin, min-height, background  | `0 !important`, `0 !important`, `0 !important`, `transparent !important`                              | —                                                                                                        |
| print `.app-foot`                              | `display`                                | `none !important`                                                                                     | —                                                                                                        |
| `.foot-inner`                                  | `display`                                | `grid`                                                                                                | `grid`                                                                                                   |
| `.foot-inner`                                  | `gap`                                    | `var(--s3)` = 12px                                                                                    | `gap-3`                                                                                                  |
| `.foot-inner`                                  | `align-content`                          | `center`                                                                                              | `content-center`                                                                                         |
| `.foot-inner`                                  | `height`                                 | `100%`                                                                                                | `h-full`                                                                                                 |
| `.foot-inner`                                  | `max-width`                              | `1040px`                                                                                              | `max-w-[1040px]` (Mortar's `PageContainer` is 1600px — mismatch)                                         |
| `.foot-inner`                                  | `margin-inline`                          | `auto`                                                                                                | `mx-auto`                                                                                                |
| `.foot-inner`                                  | `padding`                                | `0 var(--s5)` = 0 24px                                                                                | `px-6`                                                                                                   |
| `.foot-inner` ≥720px                           | `justify-items`, `text-align`            | `end`, `right`                                                                                        | `justify-items-end`, `text-right`                                                                        |
| `.foot-inner` ≥720px                           | `padding-inline`                         | `var(--s7)` = 48px                                                                                    | `px-12`                                                                                                  |
| `.foot-inner` <900px with `.island-dock`       | `padding-bottom`                         | `var(--dock-clear)` = 140px                                                                           | n/a unless a dock exists                                                                                 |
| `.foot-brand`                                  | `display`                                | `inline-flex`                                                                                         | `inline-flex`                                                                                            |
| `.foot-brand`                                  | `align-items`, `gap`                     | `center`, `var(--s2)` = 8px                                                                           | `items-center gap-2`                                                                                     |
| `.foot-brand`                                  | `color`                                  | `var(--ink)` (#2e261f / #f4efe6 dark)                                                                 | `--foreground`                                                                                           |
| `.foot-brand`                                  | `text-decoration`                        | `none`                                                                                                | `no-underline`                                                                                           |
| `.foot-name`                                   | `font-size`                              | `20px`                                                                                                | `text-[20px]`                                                                                            |
| `.foot-name`                                   | `font-weight`                            | `300`                                                                                                 | `font-light` (Geist 300)                                                                                 |
| `.foot-name`                                   | `letter-spacing`                         | `0.01em`                                                                                              | `tracking-[0.01em]`                                                                                      |
| `.foot-line`                                   | `max-width`                              | `40ch`                                                                                                | `max-w-[40ch]`                                                                                           |
| `.t-specimen` (on `.foot-line`)                | `font-family`                            | `var(--face-serif)` = Newsreader                                                                      | no match — Mortar ships Geist + Geist Mono only; propose `italic` Geist or a new `--font-serif`          |
| `.t-specimen`                                  | `font-size`, `font-weight`, `font-style` | `13px`, `400`, `italic`                                                                               | `text-[13px] italic`                                                                                     |
| `.t-specimen`                                  | `color`                                  | `var(--ink-muted)` (#6a5f53 / #918679 dark)                                                           | `--muted-foreground`                                                                                     |
| `.foot-links`                                  | `display`, `flex-wrap`                   | `flex`, `wrap`                                                                                        | `flex flex-wrap`                                                                                         |
| `.foot-links`                                  | `gap`                                    | `var(--s2) var(--s5)` = 8px 24px                                                                      | `gap-y-2 gap-x-6`                                                                                        |
| `.foot-links` ≥720px                           | `justify-content`                        | `flex-end`                                                                                            | `justify-end`                                                                                            |
| `.t-label` (on `.foot-link`)                   | `font-size`                              | `12px`                                                                                                | `text-xs`                                                                                                |
| `.t-label`                                     | `font-weight`                            | `700`                                                                                                 | `font-bold`                                                                                              |
| `.t-label`                                     | `letter-spacing`, `text-transform`       | `0.06em`, `uppercase`                                                                                 | `tracking-[0.06em] uppercase`                                                                            |
| `.foot-link`                                   | `color`                                  | `var(--ink-muted)`                                                                                    | `--muted-foreground`                                                                                     |
| `.foot-link`                                   | `padding-top`, `padding-bottom`          | `2px`, `4px` (the 2px lifts the 22px row to the 24px WCAG 2.5.8 target)                               | `pt-0.5 pb-1`                                                                                            |
| `.foot-link`                                   | `border-bottom`                          | `2px solid color-mix(in oklab, var(--ink) 18%, transparent)`                                          | closest `--border` (#E2D9CB); faithful port is `color-mix(in oklab, var(--foreground) 18%, transparent)` |
| `.foot-link`                                   | `transition`                             | `color`, `border-color` `var(--motion-fade)` = 120ms `var(--ease)` = `cubic-bezier(0.2, 0.7, 0.3, 1)` | 120ms = Mortar "fast"; ease is close to `ease-out` — propose `--ease`                                    |
| `.foot-link:hover`, `.foot-link:focus-visible` | `color`, `border-bottom-color`           | `var(--ink)`                                                                                          | `--foreground`                                                                                           |
| `:focus-visible` (base.css)                    | `outline`                                | `var(--outline)` = 3px `solid var(--open)` (#0b777e), `outline-offset: 2px`                           | mismatch — Mortar uses 2px `--ring` + a 4px 18% `--ring` glow; `--ring` is the colour equivalent         |

Type roles used elsewhere in the footer: none beyond the two above. Body base is
`font-size: 15px; line-height: 1.5; font-variant-numeric: tabular-nums` in
Quicksand — Mortar's Geist base is 16px.

## Behaviour

1. **The reveal.** `.app-foot` is `position: fixed` at the viewport floor,
   `z-index: 0`. `.shell` is `position: relative`, `z-index: 1`, opaque
   (`background: var(--paper)`), `min-height: 100dvh`, and carries
   `margin-bottom: var(--foot-h)`. The footer is therefore painted behind the
   page and uncovered only by scrolling to the document's end. Nothing animates;
   the page simply slides off it.
2. **Landing reservation.** `.land { min-height: 100dvh }` inside
   `.shell { min-height: 100dvh }` means the document is exactly
   `100dvh + foot-h` tall on `/` — the footer's reveal is the landing's only
   scroll. Other surfaces scroll normally and the reveal happens at their end.
3. **Focus reveal (WCAG 2.4.11).** The footer is last in DOM order but always
   inside the viewport, so the browser's scroll-into-view is a no-op on it and a
   focused footer link would ring under the page. `Shell` binds a native
   `focusin` listener on the footer element that scrolls to the document floor.
   Verbatim:

   ```ts
   useEffect(() => {
     const el = foot.current
     if (!el) return
     const reveal = () =>
       window.scrollTo({ top: document.documentElement.scrollHeight })
     el.addEventListener('focusin', reveal)
     return () => el.removeEventListener('focusin', reveal)
   }, [footer])
   ```

   The effect re-runs when `footer` flips because the ref has no element to bind
   to when it is false. Perch sets no `scroll-behavior`, so the jump is instant.

4. **Focus order.** DOM order: rail rows (island pages), topbar cluster, page
   content, then the four footer links, last. On the landing the order is theme
   toggle → "Start Planning" → the four links.
5. **Scroll padding.** `:root:has(.island-top)` sets
   `scroll-padding-top: var(--cluster-clear)` and below 900px
   `:root:has(.island-dock)` sets `scroll-padding-bottom: var(--dock-clear)`, so
   a keyboard-scrolled target never lands under fixed chrome.
6. **Responsive.** Below 720px the footer is left-aligned and 196px tall; at
   720px and up it flips to right-aligned
   (`justify-items: end; text-align: right; justify-content: flex-end`) and
   shrinks to 184px, and `.foot-inner` padding grows 24px → 48px. Below 900px on
   island pages the dock occupies the floor the footer is fixed to, so
   `:root:has(.island-dock)` adds `--foot-extra: var(--dock-clear)` (140px) to
   the footer's height and `.foot-inner` gets
   `padding-bottom: var(--dock-clear)` — the links ride up clear of the dock
   instead of hiding under it.
7. **No stickiness, no back-to-top.** The footer never moves and there is no
   scroll affordance. `App.tsx` mounts a `ScrollToTop` that calls
   `window.scrollTo(0, 0)` on every `pathname` change, so each route starts with
   the footer fully covered.
8. **Print.** `@media print` hides `.app-foot` and zeroes `.shell`'s padding,
   margin and min-height (`!important`), `background: transparent`. `Book.css`
   repeats the same exclusions so the Book prints as spreads alone.
9. **Theme.** No footer code touches the theme. `lib/theme.ts` writes
   `data-theme` on `<html>` and persists to `perch.theme.v1`; all footer colours
   are tokens and re-derive automatically. Quirk: the footer's mark is always
   `mark.svg` — unlike the rail it has no dark-variant swap.
10. **Link motion.** Hover and `:focus-visible` swap `--ink-muted` → `--ink` on
    colour and underline, at 120ms on `cubic-bezier(0.2, 0.7, 0.3, 1)`.
    `prefers-reduced-motion` collapses all transitions to 0.01ms except
    `.island` elements (the rail's width change is a recorded exception, not
    footer-related).

## Porting Plan For Mortar

What Mortar has today (`frontend/src/`): `AppLayout.tsx` renders the footer
in-flow after `<main>` (`<div className="lg:ml-16"><AppFooter /></div>`), so it
is a normal element at the bottom of the column, not a reveal. `App.tsx` uses
one layout route (`<Route element={<AppShell />}>`) for all pages; `/` is a
persona redirect and there is no landing or sign-in page. `AppFooter.tsx` is a
`border-t bg-muted/30` bar with nav links, a `MortarMark`, and a year line.

To match Perch:

1. **Tokens (`frontend/src/globals.css`).** Add
   `--footer-h: calc(196px + var(--footer-extra, 0px))` with a
   `@media (min-width: 720px)` override to
   `calc(184px + var(--footer-extra, 0px))`, and a footer ground. Closest
   existing token is `--accent` (#EDE6DA light / #292524 dark vs Perch's #f2ede0
   / #26201b); it is semantically a hover tint, so a dedicated `--footer` is
   cleaner. Perch's `--open` maps to `--ring`/`--primary`, `--ink` to
   `--foreground`, `--ink-muted` to `--muted-foreground`, `--paper` to
   `--background`. Keep Perch's 120ms and `cubic-bezier(0.2, 0.7, 0.3, 1)` as
   literals or a `--ease` custom property.
2. **`AppFooter.tsx` — rebuild to Perch's anatomy.** The `<footer>` becomes
   `fixed inset-x-0 bottom-0 z-0 h-[var(--footer-h)]` on the new ground, no
   `border-t` (Perch has no hairline there). Inner:
   `grid h-full max-w-[1040px] mx-auto content-center gap-3 px-6`, and
   `min-[720px]:justify-items-end min-[720px]:text-right min-[720px]:px-12`.
   Brand: `Link to="/"` with `aria-label="Mortar home"`,
   `<MortarMark size={28} className="text-foreground" />`, and a
   `text-[20px] font-light tracking-[0.01em]` wordmark. Tagline:
   `text-[13px] italic text-muted-foreground max-w-[40ch]` with Mortar copy.
   Links:
   `text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground no-underline border-b-2 pt-0.5 pb-1 transition-colors duration-[120ms]`,
   with the underline colour
   `color-mix(in oklab, var(--foreground) 18%, transparent)` and
   `hover:text-foreground hover:border-foreground` (the border colour needs an
   arbitrary value like `border-b-[color-mix(...)]` or a small CSS rule —
   Tailwind has no utility for a partial-alpha border).
3. **`AppLayout.tsx` — turn the page into the opaque cover.** The outer
   `div.relative.flex.min-h-screen.flex-col` becomes
   `relative z-[1] min-h-dvh flex flex-col bg-background mb-[var(--footer-h)]`.
   Delete the decorative blob layer (`fixed inset-0 -z-10` gradient blurs):
   under an opaque page it is invisible anyway, and at negative z-index it would
   also sit behind the fixed footer. Move `<AppFooter />` out of the `lg:ml-16`
   flow wrapper and render it as the last sibling, fixed, full viewport width —
   Perch does not offset the footer for the rail; the centred 1040px column
   keeps its content clear. Keep `lg:ml-16` on the page content only.
4. **Focus reveal.** Copy `Shell`'s `focusin` effect onto the footer's own ref
   inside `AppFooter` (or a tiny `useFooterReveal` hook), so it binds wherever
   the footer mounts. Note Mortar's `html { scroll-behavior: smooth }` — the
   reveal scroll will animate where Perch jumps instantly; pass
   `behavior: 'instant'` to `scrollTo` to match, or keep smooth deliberately.
5. **Routing (`frontend/src/App.tsx`) — one shell, sign-in bare.** Perch wraps
   each route element in `<Shell>`; Mortar already has layout routes, so the
   equivalent is a footer-owning layout route around everything except sign-in:

   ```tsx
   <Route element={<SiteShell />}>            {/* opaque page column + fixed footer */}
     <Route path="/" element={<LandingPage />} />
     <Route element={<AppShell />}>           {/* sidebar + topnav, no footer of its own */}
       <Route path="/bookings" element={<BookingsPage />} />
       {/* …existing routes… */}
     </Route>
     <Route path="*" element={<NotFoundPage />} />
   </Route>
   <Route path="/sign-in" element={<SignInPage />} />
   ```

   `AppLayout`/`AppShell` then stop rendering `AppFooter` themselves — the
   footer lives in `SiteShell`, which is the port of Perch's `Shell` with
   `islands` hard-coded off for public pages. The landing must be exactly
   `min-h-dvh` with an opaque `--background` so its only scroll is the reveal,
   matching `.land`. Any full-bleed landing media positions
   `absolute inset-0 z-[-1]` against the page column, exactly like `.land-film`
   against `.shell`.

6. **`/` decision.** Perch's `/` is the landing and the footer's "Landing" link
   points there. Mortar's `/` is `HomeRedirect` to the persona home. Two
   options: put the landing at `/` and move the persona entry elsewhere (e.g.
   `/app`, with the footer's brand link going home), or keep the redirect and
   put the landing at `/landing`. See Open Questions.
7. **Sign-in.** New route rendered with no shell, matching Perch's named
   exception. If Mortar's sign-in later needs the footer, wrap it in `SiteShell`
   instead — but Perch deliberately omits it.
8. **Print (optional).** Add the two `@media print` rules (hide `.app-foot`,
   flatten the page column) if Mortar prints anything.
9. **Breakpoints.** Perch uses 720px and 899/900px; Tailwind's nearest are `sm`
   640 and `lg` 1024 — different numbers. For fidelity use arbitrary variants
   (`min-[720px]:`, `max-[899px]:`) rather than remapping.
10. **What not to port.** The `--foot-extra`/`--dock-clear` growth rule only
    exists because Perch's mobile dock is fixed to the same floor. Mortar's
    mobile sidebar is a drawer, not a floor dock — skip the rule unless a bottom
    dock is added. Perch's `scroll-padding` rules exist for the same fixed
    islands; Mortar's fixed topbar (56px) argues for `scroll-padding-top` if
    in-page anchors are ever used.

## Open Questions

1. **Footer copy.** Perch's specimen line ("Everything you didn’t choose is
   still ranked, and still waiting.") is trip-planner copy. What is Mortar's
   line, and does it keep the italic-serif register in Geist italic, or is a
   serif face being added?
2. **Link set.** Perch carries "Landing", "Your Trips" and two external links
   (the v1 mockup, the team's GitHub). Mortar's current four are its app routes.
   Which set ships — app routes, or landing + app routes + external?
3. **`/` ownership.** Does the landing take `/` (breaking the persona redirect)
   or does it live on its own path? Perch's footer brand and "Landing" link both
   go to `/`.
4. **Footer ground.** New `--footer` token, or reuse `--accent`/`--muted`?
   Perch's plate is darker than its paper and is a ground, not a hover tint.
5. **Sign-in footer.** Perch omits it as a named exception for exact viewport
   fit. Does Mortar's sign-in keep the omission, or does the brief's "renders
   sitewide (landing, sign-in and app)" override it?
6. **Full-width vs offset footer.** Perch spans the viewport behind its rail;
   Mortar's collapsed sidebar is 64px and opaque. Span full width
   (Perch-faithful) or offset by `lg:ml-16` to match today's visual?
7. **Year line.** Mortar's footer has `· {year}`; Perch has none. Keep or drop?
8. **Mark in dark.** Perch ships the light mark in the footer on both themes
   (the square nearly vanishes on the dark plate). MortarMark follows
   `currentColor` — same quirk, or wrap it differently?
9. **Print.** Does Mortar need the `@media print` exclusions now, or is print
   out of scope?
