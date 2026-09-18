# Perch Sign-In

Perch's sign-in is a drawn page, not a gate. It has two disabled text fields, a
permanently disabled "Sign In" button, and one working control — "Sign In As
Guest" — that navigates to `/trips`. There is no session key, no guard, and no
auth logic anywhere in the app. Signing out is a link back to `/sign-in` that
clears nothing.

All paths below are relative to the Perch app root (`v2/`).

## Files

| Path                          | Lines | Role                                                                                                     |
| ----------------------------- | ----- | -------------------------------------------------------------------------------------------------------- |
| `src/surfaces/SignIn.tsx`     | 56    | The page: two panes, two disabled `Field`s, one `Check`, a dead button, a guest button, a drawn SVG hero |
| `src/surfaces/SignIn.css`     | 105   | All page styles: the grid, both panes, both buttons, the hero plate                                      |
| `src/components/Ui.tsx`       | 293   | `Field` (lines 99-143) and `Check` (lines 145-185), the form controls the page draws                     |
| `src/components/Ui.css`       | 365   | `.field`, `.field-input`, `.check-*` styles                                                              |
| `src/styles/tokens.css`       | 155   | Palette, spacing scale, radii, `--outline`, motion tokens                                                |
| `src/styles/base.css`         | 221   | Reset, `@font-face`, type roles (`.t-label`, `.t-plate-title`), `:focus-visible`                         |
| `src/App.tsx`                 | 151   | Routes; `/sign-in` is mounted bare (no `Shell`, no footer); `ThemeSeed`                                  |
| `src/chrome/Shell.tsx`        | 58    | The chrome (footer + islands) that `/sign-in` opts out of                                                |
| `src/chrome/TopbarIsland.tsx` | 118   | The account panel holding the only "Sign Out" control in the app                                         |
| `src/chrome/islands.css`      | 543   | `.top-out` — the sign-out row's styles                                                                   |
| `src/surfaces/Landing.tsx`    | 91    | "Start Planning" links to `/sign-in`                                                                     |
| `src/surfaces/Dashboard.tsx`  | 163   | `/trips`, where guest sign-in lands                                                                      |
| `src/surfaces/Onboarding.tsx` | 228   | `/new`, where the sign-in path continues from the dashboard                                              |
| `src/lib/store.ts`            | 110   | `perch.trip.v1`, the only persisted application state                                                    |
| `src/lib/theme.ts`            | 35    | `perch.theme.v1` read/write                                                                              |
| `src/lib/joiner.ts`           | 11    | States plainly "There is no authentication in the prototype"                                             |
| `src/surfaces/Deck.tsx`       | 289   | `perch.voter.v1` sessionStorage identity pick (lines 211-242)                                            |
| `src/state.tsx`               | 384   | `TripProvider`; holds no auth field of any kind                                                          |
| `src/state.test.ts`           | 308   | Trip-state tests; stubs `localStorage`, asserts nothing about sign-in                                    |

## Page Anatomy

Render tree of `src/surfaces/SignIn.tsx`, in document order.

1. `<main className="auth">` — the two-pane grid root. No `Shell`, so no
   sidebar, top bar, or footer.
2. `<section className="auth-form">` — the left pane, a centered column.
   - `<Link className="auth-back t-label" to="/">` — copy `"← Perch"` (JSX:
     `&larr; Perch`). A react-router link back to the landing page.
   - `<h1 className="t-plate-title auth-title">` — copy `"Sign In"`.
   - `<div className="auth-fields">` — the field stack:
     - `Field` "Email": `<div class="field">` →
       `<label class="t-label field-label">` "Email" +
       `<input class="field-input" type="email" placeholder="you@example.com" autoComplete="off" disabled>`.
       Not `required`, no validation attributes; the label is wired with
       `htmlFor` to a `useId()` id.
     - `Field` "Password": same structure, `type="password"`,
       `placeholder="Your password"`, `autoComplete="off"`, `disabled`.
     - `Check` "Keep me signed in": `<div class="check">` → a visually hidden
       `<input class="check-input" type="checkbox">` (uncontrolled, own
       `useState`) + a `<label class="check-label">` containing
       `<span class="check-box" data-on={on}>` (the drawn box) and
       `<span class="check-text"><span class="check-name">Keep me signed in</span></span>`.
       **Not disabled** — it ticks visually but is read by nothing.
   - `<button type="button" className="auth-dead t-label" disabled>` — copy
     `"Sign In"`. Does nothing; the disabled state is the point of it.
   - `<button type="button" className="auth-go t-label" onClick={() => navigate('/trips')}>`
     — copy `"Sign In As Guest"`. The only working control on the page.
3. `<aside className="auth-hero" aria-hidden="true">` — the right pane, hidden
   below 900px. Contains one decorative SVG, also `aria-hidden`:

   ```tsx
   <svg
     className="auth-plate"
     viewBox="0 0 640 900"
     preserveAspectRatio="xMidYMid slice"
     aria-hidden="true"
   >
     <rect width="640" height="900" fill="var(--ground-day-3)" />
     <circle cx="440" cy="250" r="82" fill="var(--paper)" />

     <path
       d="M0 900 L150 420 L268 620 L360 470 L640 900 Z"
       fill="var(--day-3)"
       opacity="0.26"
     />
     <path
       d="M0 900 L80 560 L232 720 L420 500 L640 900 Z"
       fill="var(--day-1)"
       opacity="0.42"
     />
     <path
       d="M0 900 L120 700 L300 820 L470 690 L640 860 L640 900 Z"
       fill="var(--day-1)"
     />

     <g>
       <rect x="88" y="690" width="464" height="6" rx="3" fill="var(--ink)" />
       <circle cx="160" cy="658" r="30" fill="var(--open)" />
       <circle cx="244" cy="666" r="22" fill="var(--open)" opacity="0.5" />
       <circle cx="312" cy="672" r="16" fill="var(--open)" opacity="0.3" />
       <circle cx="366" cy="676" r="12" fill="var(--open)" opacity="0.18" />
     </g>
   </svg>
   ```

   A drawn field-guide plate: sun disc, three overlapping mountain silhouettes,
   and a bird (four fading teal circles) perched on an ink bar.

The component's own doc comment is the spec for why it looks this way:

```tsx
/**
 * Two panes, and only one control on it does anything. The fields are drawn rather than wired, which the disabled
 * state says on its own; the page fits the viewport at both demo sizes and carries no explanatory prose.
 */
```

## The Fake Auth Flow

There is nothing behind the door — the whole flow is one navigation and zero
writes.

1. **Arrive.** `/sign-in` is a plain route mounted without `Shell`, so it is the
   one surface with no footer:

   ```tsx
   {
     /* Auth is the one surface with no footer. There is nowhere to go from here but in. */
   }
   ;<Route path="/sign-in" element={<SignIn />} />
   ```

2. **"Submit."** There is no `<form>` and no submit handler. Both buttons are
   `type="button"`. The dead button is `disabled` and can never fire. The live
   button does exactly this:

   ```tsx
   <button
     type="button"
     className="auth-go t-label"
     onClick={() => navigate('/trips')}
   >
     Sign In As Guest
   </button>
   ```

3. **What is stored.** Nothing, on sign-in or sign-out. The app has exactly
   three storage keys, none of them an auth or session flag:

   | Key              | Store          | Written By                                                                             | Holds                              |
   | ---------------- | -------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
   | `perch.trip.v1`  | localStorage   | `save()` in `src/lib/store.ts`, called by a `TripProvider` effect on every trip change | The entire `Trip` object as JSON   |
   | `perch.theme.v1` | localStorage   | `applyTheme()` in `src/lib/theme.ts`                                                   | `'light'` or `'dark'`              |
   | `perch.voter.v1` | sessionStorage | `Deck`'s `pick()` in `src/surfaces/Deck.tsx`                                           | A party member id, e.g. `'aisyah'` |

   `src/lib/joiner.ts` states the design position:

   ```ts
   /**
    * There is no authentication in the prototype, so "am I the owner or a joiner?" has no field in the model to
    * answer it. The invite link is the swipe link, per `TRD.md`, so the honest signal is where this tab booted:
    * a tab that opened straight onto a deck came in through the invite, and must never be shown onboarding.
    * ...
    */
   const ENTRY = typeof window === 'undefined' ? '' : window.location.pathname

   export const isJoiner = (): boolean => /^\/t\/[^/]+\/swipe\/?$/.test(ENTRY)
   ```

4. **Next route.** `/trips`, the Dashboard. From there "Finish Setup" / "New
   Trip" navigate to `/new` (Onboarding). A comment in `Onboarding.tsx` says
   "`/new` on its own is the new plan, which is what the landing and the sign-in
   path reach" — loosely true: the sign-in path reaches it via the dashboard,
   not directly.
5. **Guards.** None exist. No route checks any flag; every route in `App.tsx` is
   directly reachable, and `/` renders `Landing`, not a redirect. `/sign-in` is
   reachable whether or not anyone has "signed in", and `/trips` is reachable
   whether or not anyone pressed the guest button.
6. **Sign-out.** One control, in the top bar's account panel
   (`src/chrome/TopbarIsland.tsx`):

   ```tsx
   <button
     type="button"
     className="top-out t-label"
     onClick={() => navigate('/sign-in')}
   >
     <LogOut
       className="top-out-icon"
       size={20}
       strokeWidth={1.75}
       aria-hidden="true"
     />
     Sign Out
   </button>
   ```

   It removes nothing from storage. The trip persists, so "signing back in"
   returns to the same data.

7. **Reload.** Indistinguishable from a first visit — there is no session to
   lose. `TripProvider` rehydrates from `perch.trip.v1`
   (`useState<Trip>(() => finalizeVotingIfDue(load()))`), and `ThemeSeed`
   re-applies the stored theme on mount — its comment calls out `/sign-in`
   specifically:

   ```tsx
   /**
    * Seeds the stored theme on the document element once after mount. The toggle-bearing surfaces (the landing
    * and the top bar) each apply their own state, but a full load that lands on a route with neither -
    * `/sign-in` is the one - would otherwise never set the attribute and fall back to the CSS default, dropping
    * a stored dark choice.
    */
   ```

## Layout And Type Values

Every value transcribed from `src/surfaces/SignIn.css`, `src/components/Ui.css`,
`src/styles/base.css`, and `src/styles/tokens.css`. "Mortar Token" is the
closest token from the Mortar spec, or "no match" with a proposal.

| Selector                                               | Property                                          | Perch Value                                                                                                                                                               | Mortar Token                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.auth`                                                | display / min-height                              | `grid` / `100dvh`                                                                                                                                                         | — (layout: `grid min-h-dvh`)                                                                                                                                   |
| `.auth`                                                | grid-template-columns                             | `1fr`; `minmax(420px, 1fr) 1fr` at `min-width: 900px`                                                                                                                     | — (layout; no 900px Tailwind step — `lg` is 1024px)                                                                                                            |
| `.auth-form`                                           | display / direction / justify                     | `flex` / `column` / `center`                                                                                                                                              | — (layout)                                                                                                                                                     |
| `.auth-form`                                           | gap                                               | `var(--s5)` = 24px                                                                                                                                                        | — (`gap-6`)                                                                                                                                                    |
| `.auth-form`                                           | padding                                           | `var(--s7) var(--s5) var(--s8)` = `48px 24px 64px`; `padding-inline: var(--s8)` = 64px at 900px                                                                           | — (`pt-12 px-6 pb-16`, `lg:px-16`)                                                                                                                             |
| `.auth-form`                                           | max-width / margin                                | `520px` / `margin-inline: auto`                                                                                                                                           | — (`max-w-[520px] mx-auto`)                                                                                                                                    |
| `.auth-back`                                           | color                                             | `var(--ink-muted)` = `#6a5f53`                                                                                                                                            | `--muted-foreground`                                                                                                                                           |
| `.auth-back:hover`                                     | color                                             | `var(--ink)` = `#2e261f`                                                                                                                                                  | `--foreground`                                                                                                                                                 |
| `.auth-title` (`t-plate-title`)                        | font-size / weight / letter-spacing / line-height | `clamp(28px, 7.5vw, 44px)` / `300` / `0.01em` / `1.08`                                                                                                                    | no match — propose `text-4xl font-light tracking-tight` (Geist)                                                                                                |
| `.auth-fields`                                         | gap                                               | `var(--s4)` = 16px                                                                                                                                                        | — (`gap-4`)                                                                                                                                                    |
| `.auth-dead`, `.auth-go`                               | width / border-radius / padding                   | `100%` / `var(--r-pill)` = 999px / `var(--s4) var(--s5)` = `16px 24px`                                                                                                    | `var(--r-pill)` → no match — Mortar radius is 6px controls / 4px pills; propose `rounded-md` (6px) or keep `rounded-full`                                      |
| `.auth-dead`                                           | border                                            | `var(--outline)` = 3px `solid color-mix(in oklab, var(--ink) 22%, transparent)`                                                                                           | no match — Mortar hairlines are 1px; propose `1px solid var(--border)` at low opacity                                                                          |
| `.auth-dead`                                           | background / color / cursor                       | `transparent` / `color-mix(in oklab, var(--ink) 46%, transparent)` / `not-allowed`                                                                                        | `--muted-foreground` at ~50% opacity                                                                                                                           |
| `.auth-go`                                             | border / background / color                       | 3px `solid var(--ink)` / `var(--ink)` / `var(--paper)`                                                                                                                    | `--primary` bg + `--primary-foreground` text; border 1px `--primary`                                                                                           |
| `.auth-go`                                             | transition                                        | `background var(--motion-fade) var(--ease)` = `120ms cubic-bezier(0.2, 0.7, 0.3, 1)`                                                                                      | 120ms fast, ease-out (Mortar's closest; Perch's curve is custom)                                                                                               |
| `.auth-go:hover`                                       | background                                        | `color-mix(in oklab, var(--ink) 88%, var(--paper))`                                                                                                                       | `--primary` at ~90% (e.g. `bg-primary/90`)                                                                                                                     |
| `.auth-hero`                                           | display / overflow / background                   | `none` → `block` at 900px / `hidden` / `var(--ground-day-3)` = `color-mix(day-3 #e0a32c 26%, paper)`                                                                      | `--accent` or `--selected` (warm tint grounds)                                                                                                                 |
| `.auth-plate`                                          | position / inset / size                           | `absolute` / `0` / `100% × 100%`                                                                                                                                          | — (`absolute inset-0 h-full w-full`)                                                                                                                           |
| `.field`                                               | display / gap                                     | `flex column` / `var(--s2)` = 8px                                                                                                                                         | — (`flex flex-col gap-2`)                                                                                                                                      |
| `.field-label`                                         | color                                             | `var(--ink-muted)`                                                                                                                                                        | `--muted-foreground`                                                                                                                                           |
| `.field-input`                                         | padding / border / radius / background / color    | `var(--s3) var(--s4)` = `12px 16px` / 3px `solid color-mix(ink 14%)` / 999px / `var(--paper)` / `var(--ink)`                                                              | `--input` border at 1px; `--card` bg; `--foreground` text; 6px radius                                                                                          |
| `.field-input::placeholder`                            | color                                             | `color-mix(in oklab, var(--ink) 38%, transparent)`                                                                                                                        | `--muted-foreground`                                                                                                                                           |
| `.field-input:focus`                                   | outline / border-color                            | `none` / `var(--open)` = `#0b777e`                                                                                                                                        | `--ring`                                                                                                                                                       |
| `.field-input:disabled`                                | background / cursor                               | `var(--plate)` = `#f2ede0` / `not-allowed`                                                                                                                                | `--muted`                                                                                                                                                      |
| `.check`                                               | display / gap                                     | `inline-flex` / `var(--s3)` = 12px                                                                                                                                        | — (`inline-flex items-center gap-3`)                                                                                                                           |
| `.check-box`                                           | size / border / radius                            | `20px × 20px` / 3px `solid color-mix(ink 30%)` / 999px                                                                                                                    | `--input` 1px border; 4px pill radius (or 6px)                                                                                                                 |
| `.check-box[data-on="true"]`                           | border-color / background                         | `var(--decided)` = `#3e7a3a` / `var(--decided)`                                                                                                                           | `--status-positive-fg` (or `--primary` if ticks should be orange)                                                                                              |
| `.check-box[data-on="true"]::after`                    | tick mark                                         | `inset: 3px 5px 6px`; `border-right` + `border-bottom` 2px `var(--paper)`; `rotate(42deg)`                                                                                | `border-primary-foreground` or white                                                                                                                           |
| `.check-input`                                         | hiding recipe                                     | `absolute`, `1px × 1px`, `margin: -1px`, `clip-path: inset(50%)`, `overflow: hidden`                                                                                      | — (sr-only equivalent)                                                                                                                                         |
| `.check-input:focus-visible + .check-label .check-box` | outline                                           | `var(--outline)` solid `var(--open)`, offset 2px                                                                                                                          | Mortar's existing dual-stop focus ring (2px `--ring` + 4px glow)                                                                                               |
| `:focus-visible` (global)                              | outline                                           | `var(--outline)` = 3px `solid var(--open)`, `outline-offset: 2px`                                                                                                         | Mortar: 2px `var(--ring)` + `0 0 0 4px ring/18%`                                                                                                               |
| `.t-label`                                             | font-size / weight / letter-spacing / transform   | `12px` / `700` / `0.06em` / `uppercase`                                                                                                                                   | no match — propose `text-xs font-bold uppercase tracking-[0.06em]`                                                                                             |
| `body`                                                 | font-family / size / line-height                  | `var(--face-sans)` = Quicksand / `15px` / `1.5`                                                                                                                           | Geist (`--font-body`); size 15px vs Tailwind's 16px default                                                                                                    |
| `.t-specimen` (unused on this page)                    | font-family                                       | `var(--face-serif)` = Newsreader italic `13px`                                                                                                                            | no match — Geist has no serif partner; only needed if detail copy is added                                                                                     |
| tokens                                                 | spacing scale                                     | `--s1`…`--s8` = 4, 8, 12, 16, 24, 32, 48, 64px                                                                                                                            | Tailwind 1, 2, 3, 4, 6, 8, 12, 16                                                                                                                              |
| tokens                                                 | radii                                             | `--r-desk` 24px, `--r-pill` 999px, `--r-plate` 0                                                                                                                          | 6px controls/cards, 4px pills — no match for either Perch value                                                                                                |
| tokens                                                 | outline                                           | `--outline` = 3px                                                                                                                                                         | no match — Mortar draws 1px hairlines                                                                                                                          |
| tokens                                                 | motion                                            | `--motion-fade` 120ms, `--ease` `cubic-bezier(0.2, 0.7, 0.3, 1)`                                                                                                          | 120ms fast, ease-out                                                                                                                                           |
| tokens                                                 | palette used here                                 | `--ink` `#2e261f`, `--paper` `#fbf8f2`, `--plate` `#f2ede0`, `--ink-muted` `#6a5f53`, `--open` `#0b777e`, `--decided` `#3e7a3a`, `--day-1` `#c2622f`, `--day-3` `#e0a32c` | `--foreground`, `--background`, `--muted`, `--muted-foreground`, `--ring` (teal→orange re-skin), `--status-positive-fg`, `--primary`, `--primary`/accent tints |
| SVG hero internals                                     | fills                                             | `--ground-day-3` ground, `--paper` sun, `--day-3` + `--day-1` mountains (opacities 0.26 / 0.42 / 1), `--ink` perch bar, `--open` bird at opacities 1 / 0.5 / 0.3 / 0.18   | `--accent`/`--selected` ground, `--card` sun, `--primary` mountains, `--foreground` bar, `--primary` bird                                                      |

## Behaviour

1. **No validation, ever.** The page has no `<form>`, both inputs are
   `disabled`, and neither is `required`. The "Sign In" button is permanently
   `disabled`. There are no error messages, no submit path, and no code path
   that could produce one.
2. **Disabled states are authored, not defaulted.** `.auth-dead` gets its own
   recipe — 3px border at `color-mix(in oklab, var(--ink) 22%, transparent)`,
   text at 46% ink, `cursor: not-allowed` — because the stock disabled look
   "read as a void rather than as a control that is deliberately off" (CSS
   comment). Disabled `.field-input`s take `background: var(--plate)` and
   `cursor: not-allowed`.
3. **The one live button is solid ink.** `.auth-go` is a full-width pill: 3px
   ink border, ink background, paper text, and a 120ms background transition to
   `color-mix(in oklab, var(--ink) 88%, var(--paper))` on hover. The CSS comment
   notes the border exists so it measures the same 56px height as the dead
   button.
4. **"Keep me signed in" ticks but means nothing.** `Check` is not disabled; its
   hidden input toggles the drawn box between ink-bordered-empty and
   `--decided`-green-with-tick. Nothing reads the state — it is not controlled,
   not persisted, and not part of any form.
5. **Keyboard and focus.** The disabled controls are unreachable by Tab; the
   reachable set is the back link, the checkbox input, and the guest button.
   `:focus-visible` draws a 3px `--open` outline with a 2px offset globally; on
   the checkbox the ring is redirected onto `.check-box` via
   `.check-input:focus-visible + .check-label .check-box`. The checkbox keeps
   its native input (hidden) so Space toggles it and its label semantics
   survive.
6. **Responsive.** Below 900px the page is one column and `.auth-hero` is
   `display: none`. At 900px and up it becomes `minmax(420px, 1fr) 1fr` — the
   form pane never narrower than 420px, the hero taking the rest — and
   `.auth-form` padding grows from `padding-inline: 24px` to `64px`.
   `min-height: 100dvh` and no footer keep the page exactly viewport-fitted at
   both demo sizes.
7. **Animation.** None on this page — no keyframes, only the 120ms `var(--ease)`
   color/background transitions on hover. The global `prefers-reduced-motion`
   rule in `base.css` would collapse them anyway.
8. **No loading state.** The guest button navigates synchronously; there is no
   pending, spinner, or busy state anywhere.

## Tests

There is no `SignIn.test.tsx`, and nothing in the suite asserts anything about
the sign-in surface.

- `src/state.test.ts` stubs `localStorage` with an in-memory object in
  `beforeEach` (lines 38-63) and calls `reset()` in `afterEach`, then tests only
  trip logic: slot limits, party add/remove/rename, date changes, day starts,
  and the scheduler. The sign-in-relevant fact is what it does _not_ cover — no
  test exercises a sign-in flag, guard, or redirect, because none exist.
- `src/surfaces/Onboarding.test.tsx` mounts the surface at `/new` inside a
  `MemoryRouter`; it tests the onboarding form, not how anyone arrived there.
- Several surface tests (`Desk.test.tsx`, `Deck.test.tsx`, `Book.test.tsx`,
  `Tally.test.tsx`) stub `localStorage` the same way — the storage boundary is
  tested, the auth theatre is not.

## Porting Plan For Mortar

Perch's model maps cleanly onto Mortar because Mortar's docs already say "There
Is No Backend Or Auth." The port is a page plus one navigation; the only
Mortar-specific decision is folding the persona choice into it.

**Files To Create Or Touch**

| File                                                               | Change                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/pages/SignInPage.tsx`                                | New. The two-pane page: `← Mortar` back link, "Sign In" title, disabled Email + Password fields, "Keep me signed in" check, dead "Sign In" button, persona picker, live "Sign In" button |
| `frontend/src/App.tsx`                                             | Add `<Route path="/sign-in" element={<SignInPage />} />` **outside** `<Route element={<AppShell />}>` — Perch mounts auth bare: no sidebar, nav, or footer                               |
| `frontend/src/components/ui/checkbox.tsx`                          | New via `bunx shadcn add checkbox` (Mortar gets primitives from shadcn, not hand-written) — or keep Perch's hidden-input pattern locally                                                 |
| `frontend/src/components/layout/AppNav.tsx` or `PersonaSwitch.tsx` | Add a "Sign out" action that `navigate('/sign-in')` — the analogue of Perch's `.top-out` row in the account panel                                                                        |

**How The Persona Folds In**

Perch's guest button is where Mortar's persona belongs: signing in _is_ choosing
who you are. Concretely:

- Render the three personas (`PERSONAS` from `frontend/src/lib/persona.tsx` —
  Sales Admin, Loan Admin, Finance) as a selectable group on the sign-in pane,
  seeded from the stored `mortar.persona` value.
- The live button calls `setPersona(chosen)` then `navigate(meta.home)` —
  `/chase`, `/bookings`, or `/forecast`. This writes `mortar.persona` through
  the existing provider, which already wraps storage in try/catch.
- This keeps the Perch structure verbatim — dead fields, dead button, one live
  button — and makes the one real action do Mortar's one real job. Net storage
  written by signing in: `mortar.persona` only. No new key is needed to
  reproduce Perch's behaviour.
- Keep `PersonaSwitch` in the nav as-is; it remains the in-app way to change
  role. "Sign out" navigates to `/sign-in` and clears nothing, matching Perch —
  the persona persists, so signing back in lands where you were.

**Routing And Guards**

- Perch has no guards; port none. `/sign-in` is directly reachable and every app
  route stays directly reachable. `HomeRedirect` keeps working unchanged.
- Open question below: whether `/` should send a never-signed-in browser to
  `/sign-in` first. Perch's `/` is the landing page, not a gate — if Mortar's
  landing port takes `/`, sign-in sits at `/sign-in` exactly as Perch's does,
  and the landing CTA links to it.
- `main.tsx` needs no change: `PersonaProvider` already wraps `App` inside
  `BrowserRouter`, so `usePersona` and `useNavigate` both work on the new route.

**Styling Translation**

- Rebuild with Tailwind utilities and shadcn
  `Input`/`Label`/`Button`/`Checkbox`, using the "Layout And Type Values"
  mapping: Geist for Quicksand, `--primary`/`--ring` for `--ink`/`--open`,
  `--muted-foreground` for `--ink-muted`, `--muted` for `--plate` disabled
  fills, 120ms ease-out transitions.
- Two deliberate divergences to decide, not defaults: Perch's 999px pills and
  3px outlines against Mortar's 6px/4px radii and 1px hairlines (see Open
  Questions).
- The hero pane keeps Perch's mechanics — `hidden lg:block` (or a custom 900px
  breakpoint), `absolute inset-0` SVG with
  `preserveAspectRatio="xMidYMid slice"` — with the artwork re-drawn for Mortar:
  the joinery mark in `--foreground`/`--primary` on a `--accent`/`--selected`
  ground, or a simplified composition echoing Perch's layered silhouettes in
  Mortar's single orange.
- Tests: `frontend/src/pages/__tests__/SignInPage.test.tsx` asserting the live
  button writes `mortar.persona` and navigates to the right home — following
  `frontend/src/lib/__tests__/persona.test.tsx`'s jsdom pattern.

## Open Questions

- **Does `/` change?** Today `/` redirects to the persona home. If Mortar ports
  Perch's landing page to `/`, the sign-in CTA flows match Perch exactly; if
  not, decide what links to `/sign-in`.
- **Pill or not?** Perch draws every control on this page at 999px radius with a
  3px outline. Mortar's spec is 6px controls, 4px pills, 1px hairlines.
  Reskinning strictly produces a noticeably squarer page than Perch's; keeping
  `rounded-full` preserves the silhouette but bends Mortar's radius rule.
- **Persona control shape.** Three radio-style options, a segmented row, or
  three separate "Sign in as X" buttons? The brief suggests choosing on the
  page; the exact control is undecided. A fourth option: keep Perch's single
  "Sign In As Guest" and let the existing `PersonaSwitch` handle role after
  entry.
- **Tick colour.** Perch ticks the box green (`--decided`). Mortar could use
  `--status-positive-fg` or make it `--primary` orange.
- **Hero artwork.** Re-draw Perch's composition (sun, mountains, perched bird)
  in Mortar tokens, or replace with a Mortar-brand plate built on the
  interlocking-L mark?
- **Any persisted "signed in" flag at all?** Perch has none and the port needs
  none. If a future landing page wants "already signed in → go to app" logic, a
  `mortar.signedin` key would be the place — but it is not required to reproduce
  Perch.
- **Breakpoint.** Perch's two-pane switch is at exactly 900px; Tailwind's
  nearest steps are `md` 768px and `lg` 1024px. `lg` is the safer pick for the
  420px-minimum form column, or use an arbitrary `min-[900px]`.
