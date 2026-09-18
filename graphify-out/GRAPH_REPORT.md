# Graph Report - . (2026-09-19)

## Corpus Check

- 103 files · ~57,132 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 462 nodes · 677 edges · 37 communities (29 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges
  (avg confidence: 0.6)
- Token cost: 99,469 input · 2,671 output

## Community Hubs (Navigation)

- Frontend Dependencies
- Page Layout Components
- App Shell & Navigation
- Frontend Dev Tooling
- Persona & Form Controls
- Theme & Landing UI
- Error Boundary & Routing
- Root Package Scripts
- Lint & Format Tooling
- Frontend TS Config
- shadcn Component Config
- Root TS Config
- Notifications System
- Core Package Config
- Table & Skeleton UI
- Stats & Tooltip UI
- Select Component
- Charts & Formatters
- Drawer Component
- Popover Component
- Dialog Component
- Prettier Config
- Tabs Component
- Core TS Config
- Status Pill Component
- Project Docs
- ESLint Config
- Badge Component
- CI/CD Workflows
- Loading Overlay
- Problem Statement & Entry
- Perch Auth Research
- Perch Footer Research
- Perch Landing Research
- Core Package

## God Nodes (most connected - your core abstractions)

1. `cn()` - 66 edges
2. `usePersona()` - 13 edges
3. `compilerOptions` - 12 edges
4. `Button` - 10 edges
5. `scripts` - 10 edges
6. `AppErrorBoundary` - 7 edges
7. `PageContainer()` - 7 edges
8. `PageHeaderCard()` - 7 edges
9. `EmptyState()` - 7 edges
10. `tailwind` - 6 edges

## Surprising Connections (you probably didn't know these)

- `Mortar Problem Statement` --conceptually_related_to--> `Mortar Entry Point`
  [INFERRED] docs/source/problem-statement.md → frontend/index.html
- `StatCard()` --calls--> `cn()` [EXTRACTED]
  frontend/src/components/StatCard.tsx → frontend/src/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()` [EXTRACTED]
  frontend/src/components/ui/DropdownMenu.tsx → frontend/src/lib/utils.ts
- `InfoTooltip()` --calls--> `cn()` [EXTRACTED]
  frontend/src/components/ui/InfoTooltip.tsx → frontend/src/lib/utils.ts
- `DialogHeader()` --calls--> `cn()` [EXTRACTED]
  frontend/src/components/ui/dialog.tsx → frontend/src/lib/utils.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **CI/CD Pipeline** — github_workflows_ci, github_workflows_deploy [EXTRACTED
  1.00]
- **Design System Documentation** — docs_design, research_design_readme
  [INFERRED 0.90]

## Communities (37 total, 8 thin omitted)

### Community 0 - "Frontend Dependencies"

Cohesion: 0.04 Nodes (45): class-variance-authority, clsx, date-fns,
framer-motion, dependencies, class-variance-authority, clsx, date-fns (+37 more)

### Community 1 - "Page Layout Components"

Cohesion: 0.12 Nodes (19): MortarMark(), MortarMarkProps, AppFooter(),
FOOTER_LINKS, PageContainer(), PageContainerProps, VARIANTS, PageHeaderCard()
(+11 more)

### Community 2 - "App Shell & Navigation"

Cohesion: 0.09 Nodes (25): HomeRedirect(), AppLayout(), AppLayoutProps,
AppNav(), Crumb, ROUTE_LABELS, useBreadcrumbs(), AppShell() (+17 more)

### Community 3 - "Frontend Dev Tooling"

Cohesion: 0.06 Nodes (31): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+23 more)

### Community 4 - "Persona & Form Controls"

Cohesion: 0.13 Nodes (15): Checkbox(), Input, Label, labelVariants,
RadioGroup(), RadioGroupItem(), isPersona(), PersonaContext (+7 more)

### Community 5 - "Theme & Landing UI"

Cohesion: 0.13 Nodes (17): CLIPS, HeroFilm(), ThemeToggle(), Button,
ButtonProps, buttonVariants, Calendar(), CalendarDayButton() (+9 more)

### Community 6 - "Error Boundary & Routing"

Cohesion: 0.12 Nodes (12): App(), AppErrorBoundary, AppErrorBoundaryProps,
AppErrorBoundaryState, isChunkLoadError(), ScrollToTop(), Card, CardContent (+4
more)

### Community 7 - "Root Package Scripts"

Cohesion: 0.09 Nodes (21): description, license, lint-staged,
*.{ts,tsx,mjs,mts}, name, packageManager, private, scripts (+13 more)

### Community 8 - "Lint & Format Tooling"

Cohesion: 0.11 Nodes (19): eslint, eslint-config-prettier, @eslint/js,
eslint-plugin-react-hooks, globals, husky, lint-staged, devDependencies (+11
more)

### Community 9 - "Frontend TS Config"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 10 - "shadcn Component Config"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 11 - "Root TS Config"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 12 - "Notifications System"

Cohesion: 0.17 Nodes (12): Notification, NotificationPopover(),
useNotifications(), BASE_STYLE, baseOptions, notify, emit(), Listener (+4 more)

### Community 13 - "Core Package Config"

Cohesion: 0.14 Nodes (13): devDependencies, typescript, vitest, exports,
typescript, vitest, name, private (+5 more)

### Community 14 - "Table & Skeleton UI"

Cohesion: 0.30 Nodes (10): Skeleton(), Table(), TableBody(), TableCaption(),
TableCell(), TableFooter(), TableHead(), TableHeader() (+2 more)

### Community 15 - "Stats & Tooltip UI"

Cohesion: 0.29 Nodes (6): StatCard(), StatCardProps, InfoTooltip(), Separator,
Tooltip(), TooltipContent

### Community 16 - "Select Component"

Cohesion: 0.18 Nodes (7): SelectContent(), SelectItem(), SelectLabel(),
SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(),
SelectTrigger()

### Community 17 - "Charts & Formatters"

Cohesion: 0.24 Nodes (6): ChartTooltipContentProps, TooltipEntry,
currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 18 - "Drawer Component"

Cohesion: 0.25 Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(),
DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 19 - "Popover Component"

Cohesion: 0.25 Nodes (4): PopoverContent(), PopoverDescription(),
PopoverHeader(), PopoverTitle()

### Community 20 - "Dialog Component"

Cohesion: 0.29 Nodes (6): DialogContent, DialogDescription, DialogFooter(),
DialogHeader(), DialogOverlay, DialogTitle

### Community 21 - "Prettier Config"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 22 - "Tabs Component"

Cohesion: 0.40 Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants,
TabsTrigger()

### Community 23 - "Core TS Config"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 24 - "Status Pill Component"

Cohesion: 0.40 Nodes (4): StatusPill(), StatusPillProps, StatusPillTone,
TONE_STYLES

### Community 26 - "ESLint Config"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

### Community 27 - "Badge Component"

Cohesion: 0.67 Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps

- **190 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+185 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Table & Skeleton UI` to `Page Layout Components`,
  `App Shell & Navigation`, `Persona & Form Controls`, `Theme & Landing UI`,
  `Error Boundary & Routing`, `Stats & Tooltip UI`, `Select Component`,
  `Drawer Component`, `Popover Component`, `Dialog Component`, `Tabs Component`,
  `Status Pill Component`, `Badge Component`?** _High betweenness centrality
  (0.251) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend Dependencies` to
  `Frontend Dev Tooling`?** _High betweenness centrality (0.185) - this node is
  a cross-community bridge._
- **Why does `CalendarDayButton()` connect `Theme & Landing UI` to
  `Frontend Dependencies`, `Table & Skeleton UI`?** _High betweenness centrality
  (0.168) - this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _190 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `Frontend Dependencies` be split into smaller, more focused
  modules?** _Cohesion score 0.044444444444444446 - nodes in this community are
  weakly interconnected._
- **Should `Page Layout Components` be split into smaller, more focused
  modules?** _Cohesion score 0.12380952380952381 - nodes in this community are
  weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused
  modules?** _Cohesion score 0.08712121212121213 - nodes in this community are
  weakly interconnected._
