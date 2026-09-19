# Graph Report - mortar (2026-09-20)

## Corpus Check

- 102 files · ~61,374 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 688 nodes · 893 edges · 48 communities (40 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges
  (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `f5e80c88`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- A Company Brain For Booking-To-SPA Conversion
- Hugeicons
- Jakub Krehel's interface skills
- Questions And Answers
- AppSidebar.tsx
- RTK Commands By Workflow
- Mortar Notes For Agents
- Agent Skills
- Andrej Karpathy Skills

## God Nodes (most connected - your core abstractions)

1. `cn()` - 66 edges
2. `Markdown Style Guide` - 16 edges
3. `A Company Brain For Booking-To-SPA Conversion` - 14 edges
4. `usePersona()` - 13 edges
5. `compilerOptions` - 12 edges
6. `Front-End Simulation` - 12 edges
7. `Jakub Krehel's interface skills` - 12 edges
8. `RTK Commands By Workflow` - 11 edges
9. `Button` - 10 edges
10. `scripts` - 10 edges

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

## Communities (48 total, 8 thin omitted)

### Community 0 - "Frontend Dependencies"

Cohesion: 0.04 Nodes (45): class-variance-authority, clsx, date-fns,
framer-motion, dependencies, class-variance-authority, clsx, date-fns (+37 more)

### Community 1 - "Page Layout Components"

Cohesion: 0.19 Nodes (14): PageContainer(), PageContainerProps, VARIANTS,
PageHeaderCard(), PageHeaderCardProps, EmptyState(), EmptyStateProps,
BookingDetailPage() (+6 more)

### Community 2 - "App Shell & Navigation"

Cohesion: 0.07 Nodes (36): HomeRedirect(), AppLayout(), AppLayoutProps,
AppNav(), Crumb, ROUTE_LABELS, useBreadcrumbs(), AppShell() (+28 more)

### Community 3 - "Frontend Dev Tooling"

Cohesion: 0.06 Nodes (31): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+23 more)

### Community 4 - "Persona & Form Controls"

Cohesion: 0.05 Nodes (41): Browser support, Canvas UI, Components, Cursor and
click effects, How an effect is built, How it works, Installing, Peel (+33 more)

### Community 5 - "Theme & Landing UI"

Cohesion: 0.10 Nodes (19): App(), CLIPS, HeroFilm(), ScrollToTop(),
ThemeToggle(), Button, ButtonProps, buttonVariants (+11 more)

### Community 6 - "Error Boundary & Routing"

Cohesion: 0.16 Nodes (10): AppErrorBoundary, AppErrorBoundaryProps,
AppErrorBoundaryState, isChunkLoadError(), Card, CardContent, CardDescription,
CardFooter (+2 more)

### Community 7 - "Root Package Scripts"

Cohesion: 0.05 Nodes (40): eslint, eslint-config-prettier, @eslint/js,
eslint-plugin-react-hooks, globals, husky, lint-staged, description (+32 more)

### Community 8 - "Lint & Format Tooling"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

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

Cohesion: 0.25 Nodes (11): Checkbox(), Skeleton(), Table(), TableBody(),
TableCaption(), TableCell(), TableFooter(), TableHead() (+3 more)

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

### Community 37 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.05 Nodes (36): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+28 more)

### Community 38 - "Hugeicons"

Cohesion: 0.08 Nodes (23): An icon's page, Browsing and search, For agents,
Getting icons without an account, Hugeicons, See also, The free style, Why it
fits (+15 more)

### Community 39 - "Jakub Krehel's interface skills"

Cohesion: 0.10 Nodes (19): Examples, How an icon is built, Its Hover, See also,
The library, Using it without React, What it covers, Colour (+11 more)

### Community 40 - "Questions And Answers"

Cohesion: 0.12 Nodes (15): Findings, Follow-Ups, Ground Rules, Implications For
Mortar, Key Numbers, Leakage Causes, Ranked, Practitioner Interview, Q1.
Conversion And Timing (+7 more)

### Community 41 - "AppSidebar.tsx"

Cohesion: 0.16 Nodes (8): MortarMark(), MortarMarkProps, AppFooter(),
FOOTER_LINKS, AppSidebarProps, NAV_ITEMS, NavItem, SiteShell()

### Community 42 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 43 - "Mortar Notes For Agents"

Cohesion: 0.25 Nodes (7): Conventions, Docs, File Map, Gotchas, Mortar Notes For
Agents, Recipe: Add A Route, Recipe: Add Shared Domain Types Or Logic

### Community 44 - "Agent Skills"

Cohesion: 0.25 Nodes (7): Agent Skills, Install And Update,
leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows, Which
Skill First

### Community 45 - "Andrej Karpathy Skills"

Cohesion: 0.33 Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3.
Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

## Knowledge Gaps

- **362 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+357 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Table & Skeleton UI` to `Page Layout Components`,
  `App Shell & Navigation`, `Theme & Landing UI`, `Error Boundary & Routing`,
  `AppSidebar.tsx`, `Stats & Tooltip UI`, `Select Component`,
  `Drawer Component`, `Popover Component`, `Dialog Component`, `Tabs Component`,
  `Status Pill Component`, `Badge Component`?** _High betweenness centrality
  (0.113) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend Dependencies` to
  `Frontend Dev Tooling`?** _High betweenness centrality (0.083) - this node is
  a cross-community bridge._
- **Why does `CalendarDayButton()` connect `Theme & Landing UI` to
  `Frontend Dependencies`, `Table & Skeleton UI`?** _High betweenness centrality
  (0.076) - this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _362 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `Frontend Dependencies` be split into smaller, more focused
  modules?** _Cohesion score 0.044444444444444446 - nodes in this community are
  weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused
  modules?** _Cohesion score 0.06561085972850679 - nodes in this community are
  weakly interconnected._
- **Should `Frontend Dev Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
