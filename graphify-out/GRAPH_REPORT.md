# Graph Report - wt-integration (2026-09-27)

## Corpus Check

- 356 files · ~287,828 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 9, .css 3,
  .example 1)

## Summary

- 2940 nodes · 7816 edges · 174 communities (133 shown, 41 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 329 edges
  (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `1497c57a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- questions.ts
- card.tsx
- api.ts
- CaseEvent
- package.json
- sim.test.ts
- lucide-react
- ImportPage.tsx
- MessagesPanel.tsx
- Mortar Brief
- import.ts
- app.ts
- cases.ts
- generate.ts
- Agent Rules
- db/index.ts
- Design Research: Layerhand Landing Page
- assistant/index.ts
- PersonaProvider
- BookingsPage.tsx
- BookingsTable.tsx
- Technical Requirements Document: Mortar
- DirectTableImport.tsx
- react
- Markdown Style Guide
- formatDate
- LandingPage.tsx
- Industry Practitioner Survey Findings, n = 8
- LegalQueueTable.tsx
- Mortar Product Overview
- persona.tsx
- Product Requirements: Mortar
- FakeDb
- Slide 14: Playbooks: Staff Experience, Reviewed
- Perch Sign-In Teardown
- reset.ts
- assistant.test.ts
- sim.ts
- tools.ts
- risk.ts
- types.ts
- proxyClient.ts
- jev/package.json
- server/package.json
- dependencies
- docs/README.md
- devDependencies
- brain.test.ts
- MotionSites: cinematic landing page prompts
- react-router-dom
- JevService
- Snapshot
- Security, Secrets And Privacy
- CaseQuickView
- Reviews And Merging
- RecordUpdateForm.tsx
- RecordUpdateForm.test.tsx
- speak.py
- Forecast And Backtest Method
- core/src/index.ts
- cn
- frontend/tsconfig.json
- precompute.ts
- components.json
- compilerOptions
- record.mjs
- Andrej Karpathy Skills
- integration.test.ts
- test_assemble.py
- UI Triage: The Signed-In App
- BookingsPage.test.tsx
- banks.test.ts
- Route /forecast (Projected Signings)
- WaitingOn.tsx
- Mortar Demo Recorder
- A Company Brain For Booking-To-SPA Conversion
- closedExport.ts
- AddBookingDialog.test.tsx
- Keep It Current
- BatchSpeechTests
- Mortar Notes For Agents
- core/package.json
- Jakub Krehel's Interface Skills
- Functional Requirements
- notificationStore.ts
- Components
- Bug Report Issue Form
- scripts
- nextStep.ts
- walk.mjs
- Perch Landing Teardown
- What Mortar Does
- ChaseCard.test.tsx
- NarrateTests
- Front-End Simulation
- booking-template.mjs
- Pull Request Template
- jev/tsconfig.json
- Slide 06: Three Desks, One Book
- Do Not
- Design: Mortar
- Checklist
- Ask The Graph First
- Deck Assets Manifest
- dates.ts
- What Happened
- server/tsconfig.json
- subtitles.py
- AskPanel.tsx
- Booking
- PlaybooksPanel.tsx
- TourProvider.tsx
- RTK Commands By Workflow
- Colour
- helpers.ts
- .prettierrc.json
- render.mjs
- SubtitleLayoutTests
- ImportPage.test.tsx
- ChartTooltipContent.tsx
- core/tsconfig.json
- schedule.py
- Issue 60 Review
- BookingPipelineFlow.tsx
- proof.test.mjs
- json
- RiskChip.test.tsx
- Tier: Lite
- Deploy Prototype Workflow
- Agent Skills
- Non-Functional Requirements
- assemble.sh
- AppErrorBoundary
- forecast/forecast.ts
- Who Uses Mortar
- GitHub Issues And Pull Requests
- Spacing, Radius And Elevation
- Slide 07: Evidence With A Name On It
- Design Specification
- Route /import (Add Bookings)
- Start From Fresh main
- narrate.sh
- ref_node_fs
- Slide 04: What Practitioners Told Us
- Slide 10: Where AI Helps, Where People Decide
- Documents Routing Table
- Product Requirements Document
- Product Overview
- Technical Requirements Document
- Slide 17: The One Number We Are Judged By
- Slide 18: A 12-Week Pilot
- frontend/package.json
- ref_vitest
- Slide 19: What Comes After The Prototype
- Draft While Unfinished

## God Nodes (most connected - your core abstractions)

1. `cn()` - 150 edges
2. `react` - 85 edges
3. `lucide-react` - 58 edges
4. `@testing-library/react` - 55 edges
5. `CaseEvent` - 55 edges
6. `usePersona()` - 54 edges
7. `Booking` - 54 edges
8. `react-router-dom` - 53 edges
9. `Button` - 51 edges
10. `CaseSummary` - 46 edges

## Surprising Connections (you probably didn't know these)

- `The Shared Side Sheet` --references--> `CaseQuickView()` [INFERRED]
  docs/PRODUCT.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Field` --references--> `Select()` [INFERRED] docs/DESIGN.md →
  frontend/src/components/ui/select.tsx
- `FR-23: Ask Mortar Grounded Assistant` --references--> `askBrain()` [INFERRED]
  docs/PRD.md → packages/core/src/brain/index.ts
- `Service And Integration Tests` --references--> `askBrain()` [INFERRED]
  docs/TRD.md → packages/core/src/brain/index.ts
- `Generator Architecture` --references--> `generate()` [INFERRED] docs/TRD.md →
  packages/core/src/sim.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Booking-To-SPA Evidence Chain From Interview to Feature Proposal** —
  docs_source_interview, docs_research_practitioner_survey_readme,
  docs_source_problem_statement_booking_to_spa_gap,
  docs_research_feature_ideas_readme_early_financing_eligibility [EXTRACTED
  1.00]
- **The Seven Stages Of The Journey Of A Change** —
  github_contributing_start_with_an_issue, github_contributing_branch_naming,
  github_contributing_commit_message_format,
  github_contributing_fill_in_the_template,
  github_contributing_review_and_merging,
  github_contributing_check_the_live_site [EXTRACTED 1.00]
- **Landing Page Design Synthesis Across Eight Sources** —
  docs_research_design_readme, docs_research_design_hugeicons_stroke_rounded,
  docs_research_design_isocons,
  docs_research_design_motionsites_scroll_scrubbed_video,
  docs_research_design_jakub_antalik_drawer,
  docs_research_design_canvas_ui_peel,
  docs_research_design_jakubkrehel_skills_better_ui [EXTRACTED 1.00]
- **Reduction of Visual Noise Across Product and Marketing Surfaces** —
  docs_research_perch_landing_single_cta,
  docs_research_ui_triage_readme_density_budget,
  docs_research_ui_triage_readme_uniform_volume,
  docs_research_design_jakub_antalik_restraint [INFERRED 0.75]
- **No Staging Step Protects Every Rule** — github_contributing_deploys_to_live,
  github_contributing_never_merge_your_own_pull_request,
  github_contributing_green_checks_only,
  github_contributing_run_the_checks_locally,
  github_contributing_check_the_live_site,
  github_contributing_live_site_incident [INFERRED 0.85]
- **Rules Encoded As Required Form Fields** —
  github_issue_template_bug_duplicate_and_conflict_check,
  github_issue_template_bug_data_check,
  github_issue_template_feature_duplicate_and_conflict_check,
  github_issue_template_feature_done_when,
  github_issue_template_config_blank_issues_disabled,
  github_pull_request_template_checklist [INFERRED 0.85]

## Communities (174 total, 41 thin omitted)

### Community 0 - "questions.ts"

Cohesion: 0.13 Nodes (18): isLive(), isOpen(), sumBy(), tally(),
awaitingDocument(), byValue(), cite(), currentBank() (+10 more)

### Community 1 - "card.tsx"

Cohesion: 0.15 Nodes (31): SOURCE_LABELS, TRACK_LABELS,
frontend_src_components_case_index_formatpercent,
frontend_src_components_case_index_formatrm,
frontend_src_components_case_index_formatrmcompact, ChartTooltipContent(),
AssumptionsCard(), formatAssumptionValue() (+23 more)

### Community 2 - "api.ts"

Cohesion: 0.08 Nodes (31): Architecture And Components, RecordUpdateForm(),
bookingsWord(), ImportedCard(), DemoDataCard(), addDemoData(), ApiError,
askAssistant() (+23 more)

### Community 3 - "CaseEvent"

Cohesion: 0.04 Nodes (12): Endpoint Details, CaseEvent, EvidenceStatus,
IsoDateTime, LoanApplication, Task, Database, EventSettledError (+4 more)

### Community 4 - "package.json"

Cohesion: 0.05 Nodes (45): isOff(), typescriptFiles, warnings(), description,
devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 5 - "sim.test.ts"

Cohesion: 0.10 Nodes (17): Slide 13: The Financing Risk Flag, Financing-Risk
Method, Risk Calculation Steps, Risk Categorization, buildSnapshot(),
canonicalSnapshot(), STORIES, packages_core_src_sim_default_assumptions (+9
more)

### Community 6 - "lucide-react"

Cohesion: 0.15 Nodes (20): UnitAutocompleteInputProps, Crumb, ROUTE_LABELS,
ThemeToggle(), HealthCard(), row(), StatCardProps,
frontend_src_components_ui_dropdownmenu_dropdownmenutrigger (+12 more)

### Community 7 - "ImportPage.tsx"

Cohesion: 0.16 Nodes (20): addDays(), altDataset(), datasetFor(),
PageContainer(), PageContainerProps, VARIANTS, PageHeaderCard(),
PageHeaderCardProps (+12 more)

### Community 8 - "MessagesPanel.tsx"

Cohesion: 0.08 Nodes (31): ApplicationsCard(), STATUS_TONES, EvidenceLog(),
APPLICATION_STATUS_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS,
EXTRACTED_EVENT_LABELS, formatDateTime() (+23 more)

### Community 9 - "Mortar Brief"

Cohesion: 0.05 Nodes (36): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+28 more)

### Community 10 - "import.ts"

Cohesion: 0.07 Nodes (43): FR-22: Add Bookings Intake, DropZone(), accept(),
clear(), readableSize(), readSheetFile(), sheetKind(), SheetReadError (+35 more)

### Community 11 - "app.ts"

Cohesion: 0.07 Nodes (50): notifications,
packages_core_src_index_canaccessbooking,
packages_core_src_index_checkbookingdraft,
packages_core_src_index_demo_profiles, packages_core_src_index_isodate,
packages_core_src_index_language,
packages_core_src_index_normalizeprojectsettings,
packages_core_src_index_profilefor (+42 more)

### Community 12 - "cases.ts"

Cohesion: 0.09 Nodes (27): appointment(), ApplicationFacts, appointmentDay(),
byOccurred(), CaseDataInput, deriveApplication(), deriveCase(), DOCUMENT_LABELS
(+19 more)

### Community 13 - "generate.ts"

Cohesion: 0.11 Nodes (33): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL,
drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+25 more)

### Community 14 - "Agent Rules"

Cohesion: 0.20 Nodes (12): Agent Rules, Bun Workspaces, frontend (React 19 +
Vite + Tailwind 4 + shadcn/ui), GitHub Issues And Pull Requests Agent Guide,
Graphify Agent Guide, Andrej Karpathy Skills Agent Guide, Markdown Style Guide,
Mortar (+4 more)

### Community 15 - "db/index.ts"

Cohesion: 0.06 Nodes (47): BookingDraft, packages_core_src_index_bookingdraft,
packages_core_src_index_casedata, packages_core_src_index_evidencestatus,
packages_core_src_index_isodatetime, packages_core_src_index_loanapplication,
packages_core_src_index_playbook, packages_core_src_index_simulationmeta (+39
more)

### Community 16 - "Design Research: Layerhand Landing Page"

Cohesion: 0.10 Nodes (36): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Design the Fallback First, html-in-canvas API, Peel Effect, Canvas
UI shadcn Registry Install, Hugeicons by Halal Lab (+28 more)

### Community 17 - "assistant/index.ts"

Cohesion: 0.07 Nodes (42): packages_core_src_index_persona,
packages_core_src_index_staffprofile, Persona, ASSISTANT_TIMEOUT_MS,
callGemini(), GeminiContent, GeminiFunctionCall, GeminiOptions (+34 more)

### Community 18 - "PersonaProvider"

Cohesion: 0.11 Nodes (14): AskTrigger(), mocks, SwitchProfile(),
PersonaProvider(), usePersonaSafe(), activeProfile, pending, PROFILE_STORAGE_KEY
(+6 more)

### Community 19 - "BookingsPage.tsx"

Cohesion: 0.10 Nodes (45): File Map, Recipe: Add A Route, HomeRedirect(),
AppLayout(), AppLayoutProps, AppNav(), useBreadcrumbs(), AppShell() (+37 more)

### Community 20 - "BookingsTable.tsx"

Cohesion: 0.08 Nodes (37): BookingFilter, BookingFilters(), BookingFiltersProps,
RISKS, View, BookingsTable(), PILL_STAGES, Sort (+29 more)

### Community 21 - "Technical Requirements Document: Mortar"

Cohesion: 0.10 Nodes (20): Case Derivation Rules, Data Model And Schema, Event
Model And Evidence Lifecycle, Fallback And Caching Ladder, Generator
Architecture, Industry And Regulatory Baselines, Jev Integration, Methodology
And Technical Foundations (+12 more)

### Community 22 - "DirectTableImport.tsx"

Cohesion: 0.12 Nodes (30): DirectTableImport(), Entry, fakeBuyer(), newEntry(),
rowId(), salesProfiles, ProjectSettingsCard(), importBookings() (+22 more)

### Community 23 - "react"

Cohesion: 0.10 Nodes (26): Native Controls, MortarMark(), MortarMarkProps,
FREE_FEATURES, PRO_FEATURES, AppFooter(), FooterLink, LINK_COLUMNS (+18 more)

### Community 24 - "Markdown Style Guide"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

### Community 25 - "formatDate"

Cohesion: 0.11 Nodes (21): DateField(), monthOf(), toDate(), toIso(),
TaskCell(), TasksPanel(), formatDate(),
frontend_src_components_case_index_formatdate (+13 more)

### Community 26 - "LandingPage.tsx"

Cohesion: 0.12 Nodes (14): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+6 more)

### Community 27 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.13 Nodes (26): Feature Ideas: written up but not built, 48-Hour
Clean Exit, Advisory-Only Financing Flag That Never Blocks a Booking, Early
Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time
Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages
Ruling (+18 more)

### Community 28 - "LegalQueueTable.tsx"

Cohesion: 0.19 Nodes (17): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, LegalSortKey, median(), sortLegalRows(), sortValue() (+9 more)

### Community 29 - "Mortar Product Overview"

Cohesion: 0.08 Nodes (24): Beneficiaries Who Do Not Log In Daily, Current
Prototype Versus Production Roadmap, Daily Users, Deliberately Not Users,
Division Of Operational Responsibility, Evidence From Research And Industry, How
It Works In One Flow, Illustrative Impact, Not A Finding (+16 more)

### Community 30 - "persona.tsx"

Cohesion: 0.10 Nodes (19): AppSidebar(), AppSidebarProps, PAGE_ICONS,
PersonaRoute(), mocks, canPersonaOpen(), DEFAULT_PERSONA, NAV_GROUP_LABELS (+11
more)

### Community 31 - "Product Requirements: Mortar"

Cohesion: 0.13 Nodes (15): Approved Manager And Copilot Intake (#60), Business
Success Metric, Goals And Non-Goals, Industry And Statutory Sources, Legal
Admin, Loan Admin, Metrics, Out Of Scope (+7 more)

### Community 34 - "Perch Sign-In Teardown"

Cohesion: 0.16 Nodes (15): Layered Card Surface: hairline ring and stacked
shadow, shadow-border Three-Layer Token, Perch Sign-In Teardown, Authored
Disabled States, Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path
Check, Porting Plan: the persona folds into the guest button, Perch Storage
Keys: perch.trip.v1, perch.theme.v1, perch.voter.v1 (+7 more)

### Community 35 - "reset.ts"

Cohesion: 0.13 Nodes (23): packages_core_src_index_proposalfromextraction,
packages_core_src_index_simnow, proposalFromExtraction(), simNow(),
summarizeCases(), ref_bun, sql, addDemoData() (+15 more)

### Community 36 - "assistant.test.ts"

Cohesion: 0.11 Nodes (17): App, APPLICATIONS, ask(), BOOKING, event(), EVENTS,
fakeJev(), makeApp() (+9 more)

### Community 37 - "sim.ts"

Cohesion: 0.12 Nodes (31): SeedRun, ReadSheetOptions, FUNNEL_STAGES, groupBy(),
OpenRequest, DEFAULT_SEED, HORIZON_DAYS, backtest() (+23 more)

### Community 38 - "tools.ts"

Cohesion: 0.13 Nodes (24): packages_core_src_index_default_assumptions,
bookingLine(), cap(), caseDetail(), casesFor(), day(), DESK_OF_OWNER_ROLE,
deskOfNextMove() (+16 more)

### Community 39 - "risk.ts"

Cohesion: 0.20 Nodes (13): managerSuggestions(), assumptions, booking, event(),
snapshot(), WaitingSuggestion, assumptionValue(), DEFAULT_ASSUMPTIONS (+5 more)

### Community 40 - "types.ts"

Cohesion: 0.07 Nodes (23): EXTRACTION, MESSAGE, PROPOSAL, EXTRACTION, MESSAGE,
PROPOSAL, PLAYBOOKS, packages_core_src_index_caseevent (+15 more)

### Community 41 - "proxyClient.ts"

Cohesion: 0.15 Nodes (24): FR-18: Jev Through A Local Model Proxy,
AnthropicContentBlock, AnthropicMessageResponse, argmax(), assertNever(),
buildAnswer(), buildAnswers(), buildChoiceAnswer() (+16 more)

### Community 42 - "jev/package.json"

Cohesion: 0.10 Nodes (20): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+12 more)

### Community 43 - "server/package.json"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 44 - "dependencies"

Cohesion: 0.08 Nodes (25): dependencies, class-variance-authority, clsx,
date-fns, framer-motion, lucide-react, @mortar/core, radix-ui (+17 more)

### Community 45 - "docs/README.md"

Cohesion: 0.13 Nodes (16): Slide 15: How It Is Built, About The Project,
Architecture, Ask Mortar (Gemini Assistant), Getting Started, How It Works,
License, Limitations (+8 more)

### Community 46 - "devDependencies"

Cohesion: 0.18 Nodes (11): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+3 more)

### Community 47 - "brain.test.ts"

Cohesion: 0.21 Nodes (13): Gotchas, ctx, askBrain(), contentWords(), coverage(),
matchQuestion(), questionIndex(), STOPWORDS (+5 more)

### Community 48 - "MotionSites: cinematic landing page prompts"

Cohesion: 0.22 Nodes (15): Glass Object (Three.js effect), Scroll-Driven
Effects: Laser, Particle Scroll, Bend, Bottom Sheet Drawer Recipe, Interruptible
Motion: transitions for toggles, keyframes for entrances, Staged Entrances:
100ms block stagger, 80ms per word, MotionSites: cinematic landing page prompts,
MotionSites Academy Lessons, data-enter Entrance State Machine (+7 more)

### Community 49 - "react-router-dom"

Cohesion: 0.13 Nodes (15): App(), ScrollToTop(), frontend_src_globals,
getSystemTheme(), resolveTheme(), Theme, ThemeContext, ThemeContextValue (+7
more)

### Community 50 - "JevService"

Cohesion: 0.29 Nodes (3): FR-12: High-Availability Offline Jev Fallback,
JevService, AppOptions

### Community 51 - "Snapshot"

Cohesion: 0.10 Nodes (17): row(), waiting(), defaultData(), mocks,
provisionalEvent(), SNAP, CASES, SNAP (+9 more)

### Community 52 - "Security, Secrets And Privacy"

Cohesion: 0.14 Nodes (14): Slide 16: Simulated Data, By Design, Assumptions And
Constraints, Empirical Grounding Table, Open Questions, Operational Constraints,
Statutory And Legal Constraints, Data Retention, Profile Sessions And Shared
Configuration (+6 more)

### Community 53 - "CaseQuickView"

Cohesion: 0.17 Nodes (13): Add Bookings (`/import`) And Site Shell, Bookings
(`/bookings`), Case Page (`/bookings/:id`), Demo Script As Acceptance, Forecast
(`/forecast`), FR-17: Waiting On Party, Quick View Side Sheet, And Next Move,
FR-19: Record An Update, FR-5: Today Desk And Task Management (+5 more)

### Community 54 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 55 - "RecordUpdateForm.tsx"

Cohesion: 0.07 Nodes (54): AddBookingDialog(), EMPTY_FORM, FORM_FIELDS,
FormState, localIsoDate(), pad(), AddMessageForm(), defaultName() (+46 more)

### Community 56 - "RecordUpdateForm.test.tsx"

Cohesion: 0.20 Nodes (5): BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 57 - "speak.py"

Cohesion: 0.15 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 58 - "Forecast And Backtest Method"

Cohesion: 0.33 Nodes (6): Slide 11: The Forecast: Signed SPAs, Not Bookings,
Slide 12: The Backtest - And What It Does Not Prove, Backtest Validation,
Forecast And Backtest Method, Parameter Assumptions, Statistical Forecast

### Community 59 - "core/src/index.ts"

Cohesion: 0.16 Nodes (16): frontend_src_components_case_index_formatdayslong,
OWNER_ROLE_LABELS, actionIcon(), addDays(), blockerIcon(), DOCUMENT_LABELS,
documentStepLabel(), dueOnForUrgency() (+8 more)

### Community 60 - "cn"

Cohesion: 0.08 Nodes (35): progressFromKinds(), StageTracker(), CaseJourney(),
UnitAutocompleteInput(), CardFooter, DrawerContent, DrawerDescription,
DrawerFooter() (+27 more)

### Community 61 - "frontend/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+1 more)

### Community 62 - "precompute.ts"

Cohesion: 0.06 Nodes (33): API Reference, Write Rules And Error Codes, RANKING,
SNAPSHOT, EXTRACTION_9001, EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001
(+25 more)

### Community 63 - "components.json"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 64 - "compilerOptions"

Cohesion: 0.14 Nodes (13): compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module,
moduleResolution, noEmit (+5 more)

### Community 65 - "record.mjs"

Cohesion: 0.22 Nodes (7): auditCapture(), REQUIRED_BEATS, beats, errors, filmed,
OUT, require

### Community 66 - "Andrej Karpathy Skills"

Cohesion: 0.33 Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3.
Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 67 - "integration.test.ts"

Cohesion: 0.07 Nodes (38): packages_core_src_index_jevcache,
packages_core_src_index_jevkind, packages_core_src_index_jevmeta,
packages_core_src_index_jevservice, packages_core_src_index_message,
packages_core_src_index_scoreanswer, JevCache, JevKind (+30 more)

### Community 68 - "test_assemble.py"

Cohesion: 0.24 Nodes (10): AssembleMuxTests, AssemblePictureTests,
color_video(), ff(), probe_duration(), CompletedProcess, Path, slide_png() (+2
more)

### Community 69 - "UI Triage: The Signed-In App"

Cohesion: 0.18 Nodes (17): transitions.dev: UI transitions for AI agents,
better-writing Skill, MotionSites Prompt Format: exact tokens and acceptance
views, UI Triage: The Signed-In App, Copy Rules: the drop and write table,
Density Budget, The Desk Lens Becomes a Preset, Not a Banner, Three Stacked
Filter Systems With Disagreeing Numbers (+9 more)

### Community 70 - "BookingsPage.test.tsx"

Cohesion: 0.11 Nodes (8): generated, mocks, SNAP, StubReader,
buildFreshDisbursedSnapshot(), buildLargeSnapshot(), exportMocks,
packages_core_src_index_default_seed

### Community 71 - "banks.test.ts"

Cohesion: 0.19 Nodes (11): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+3 more)

### Community 73 - "WaitingOn.tsx"

Cohesion: 0.17 Nodes (16): SEGMENTS, STAGE_PROGRESS, AWAITING_DOCUMENTS,
BOOKING, RISK, WITH_BANK, WaitingOnCell(), WaitingOnPanel() (+8 more)

### Community 74 - "Mortar Demo Recorder"

Cohesion: 0.22 Nodes (14): 12 Weeks, No New CRM, No Consultant, No Vendor, One
Number Readable Within One Quarter, Chatterbox Requirements with Pinned Upstream
Commits, resemble-perth Pinned Commit and setuptools<81, Narration Script: beat,
offset_ms, text, Beat Offset Discipline, Mortar Demo Recorder, Beat-Keyed Timing
(+6 more)

### Community 75 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.11 Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+11 more)

### Community 76 - "closedExport.ts"

Cohesion: 0.20 Nodes (10): buildClosedExportRows(), ClosedExportRow,
closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header(),
isoToDate() (+2 more)

### Community 77 - "AddBookingDialog.test.tsx"

Cohesion: 0.11 Nodes (10): choose(), DEFAULTS, fillRequiredFields(), label(),
navigateMock, pickBookingDate(), PROJECTS, PopoverState (+2 more)

### Community 78 - "Keep It Current"

Cohesion: 0.26 Nodes (13): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+5 more)

### Community 80 - "Mortar Notes For Agents"

Cohesion: 0.29 Nodes (6): Conventions, Docs, Mortar Notes For Agents, Recipe:
Add Shared Domain Types Or Logic, Project Structure, Repository Layout

### Community 81 - "core/package.json"

Cohesion: 0.12 Nodes (16): dependencies, minisearch, devDependencies,
typescript, vitest, exports, typescript, vitest (+8 more)

### Community 82 - "Jakub Krehel's Interface Skills"

Cohesion: 0.16 Nodes (18): Porting Its Hover Motion without React, Jakub
Krehel's Interface Skills, better-accessibility Skill: reduced motion, zoom,
autoplay, better-colors Skill, better-interface Skill: orchestrated review,
better-typography Skill, better-ui Skill: surfaces, icons, motion values, break
Skill (+10 more)

### Community 83 - "Functional Requirements"

Cohesion: 0.12 Nodes (17): FR-10: Transparent Assumptions And Browser
Re-Simulation, FR-11: Database Persistence And Demo Data Management, FR-13: Add
Bookings Intake And Validation, FR-14: Persona Navigation And Page Routing,
FR-15: SPA Execution Desk, FR-16: Leakage Analysis And Recovery Sizing, FR-1:
Canonical Simulation Dataset Generation, FR-20: Message Timing And Buyer
Response Explanation (+9 more)

### Community 84 - "notificationStore.ts"

Cohesion: 0.17 Nodes (14): Notification, NotificationPopover(),
useNotifications(), emit(), Listener, listeners, loadNotifications(),
notifications (+6 more)

### Community 85 - "Components"

Cohesion: 0.14 Nodes (14): Booking Row And Table Header, Button, Checkbox,
Components, Day Cell And Date Picker, Dialog, Drop Zone, Field (+6 more)

### Community 86 - "Bug Report Issue Form"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 87 - "scripts"

Cohesion: 0.29 Nodes (7): scripts, build, dev, preview, template:bookings, test,
typecheck

### Community 88 - "nextStep.ts"

Cohesion: 0.10 Nodes (24): FR-6: TypeSafe Jev Structured Message Extraction,
FR-7: Next Action, Playbook Fit, And Buyer Signals Scoring, Fan-Out Job
Specifications, BALL_HOLDER_ICONS, BALL_HOLDER_LABELS, MOVE_OWNER, CaseNextStep,
CreateTaskPayload (+16 more)

### Community 89 - "walk.mjs"

Cohesion: 0.27 Nodes (10): scrollDuration(), scrollTarget(), smoothScrollTo(),
BUYER_REPLY, film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink()
(+2 more)

### Community 90 - "Perch Landing Teardown"

Cohesion: 0.13 Nodes (22): LQIP Placeholder Behind Video Tiles, better-layout
Skill, WCAG 2.2.2 Autoplay Pause Requirement, Figma Pairing: Newsreader
display + Geist UI, Landing Video Pipeline, The Agent's Video Checklist, Gemini
Videos Composer at gemini.google.com/videos, Clip Prompt Shape: no text in
frame, one camera move (+14 more)

### Community 91 - "What Mortar Does"

Cohesion: 0.25 Nodes (8): Ask Panel, Ask Mortar, Centralized Case Workspace,
Core Operational Capabilities, High-Density Ledger Design, The Shared Side
Sheet, Waiting On, What Mortar Does

### Community 92 - "ChaseCard.test.tsx"

Cohesion: 0.24 Nodes (4): NextStep, booking(), jevMove(), renderCard()

### Community 93 - "NarrateTests"

Cohesion: 0.27 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 94 - "Front-End Simulation"

Cohesion: 0.12 Nodes (17): First Build, Forecast And Backtest, Front-End
Simulation, Generator, How The Simulation Works, Legal And Domain Notes,
Messages And Proposed Updates, Open Questions (+9 more)

### Community 95 - "booking-template.mjs"

Cohesion: 0.18 Nodes (6): bookings, COLUMNS, howTo, merged(), OUT, SAMPLES

### Community 96 - "Pull Request Template"

Cohesion: 0.38 Nodes (7): Fill In The Pull Request Template, Show UI Changes
With Screenshots, Screenshots Or Recording, Pull Request Template, Screenshots,
What Changed, Why

### Community 97 - "jev/tsconfig.json"

Cohesion: 0.33 Nodes (5): compilerOptions, types, extends, include,
../../tsconfig.json

### Community 98 - "Slide 06: Three Desks, One Book"

Cohesion: 0.20 Nodes (11): Legal Admin Persona, Loan Admin Persona, Persona
Persistence (mortar.persona localStorage Key), Route /bookings (List), Route
/chase (Today), Route /legal (SPA Execution Queue), Sales Admin Persona, Slide
05: One Shared Case Record (+3 more)

### Community 99 - "Do Not"

Cohesion: 0.33 Nodes (7): Do, Do And Do Not, Do Not, Footer, Landing, Public
Pages, Sign-In

### Community 100 - "Design: Mortar"

Cohesion: 0.14 Nodes (18): Acceptance, App Shell, Data Formats, Decisions,
Design: Mortar, Guided Tour Chrome, Icons, Layout (+10 more)

### Community 101 - "Checklist"

Cohesion: 0.15 Nodes (15): Follow The Design Guide And Shared UI Components,
Keep AI Agents On Task, Never Do These, Never Force-Push A Shared Branch, No
Pushes Straight To main, Never Commit Real Buyer Data, Never Commit Secrets, One
Problem Per Issue (+7 more)

### Community 102 - "Ask The Graph First"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 103 - "Deck Assets Manifest"

Cohesion: 0.50 Nodes (3): Deck Assets Manifest, Generated Art, Product
Screenshots

### Community 104 - "dates.ts"

Cohesion: 0.50 Nodes (8): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), toEpoch(), workDaysBetween(), workDayOffset()

### Community 105 - "What Happened"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 106 - "server/tsconfig.json"

Cohesion: 0.33 Nodes (5): compilerOptions, types, extends, include,
../tsconfig.json

### Community 107 - "subtitles.py"

Cohesion: 0.25 Nodes (10): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration…, Split into lines of similar length,
never mid-word. Two things depend on this…, Group wrapped lines into cards of at
most MAX_LINES., ts(), wav_ms(), wrap() (+2 more)

### Community 108 - "AskPanel.tsx"

Cohesion: 0.13 Nodes (15): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
ownerName(), taskTitle(), AssistantImage, AssistantStreamEvent (+7 more)

### Community 109 - "Booking"

Cohesion: 0.12 Nodes (13): BookingRow, CaseHeader(), booking, BOOKING, RISK,
SUMMARY, TASK, LegalRow (+5 more)

### Community 110 - "PlaybooksPanel.tsx"

Cohesion: 0.09 Nodes (26): blockerQuery(), FIT_PRESENTATION, PlaybooksPanel(),
Ranked, STATUS_BADGES, SignalsPanel(), SIGNALS, EVIDENCE_LABELS (+18 more)

### Community 111 - "TourProvider.tsx"

Cohesion: 0.16 Nodes (13): frontend_src_lib_persona_persona, PERSONAS, Rect,
Spotlight(), resolveRoute(), Harness(), mocks, TourContext (+5 more)

### Community 112 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 113 - "Colour"

Cohesion: 0.50 Nodes (5): Colour, Landing Panel Tokens, Primitives Summary,
Semantic Colour, Status Tones

### Community 114 - "helpers.ts"

Cohesion: 0.25 Nodes (8): count(), days(), joinList(), percent(), ringgit, rm(),
rmCompact(), STAGE_RANK

### Community 115 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 116 - "render.mjs"

Cohesion: 0.15 Nodes (11): ref_node_module, ref_node_os, ref_node_path,
ref_node_url, failures, HERE, page, rawSlides (+3 more)

### Community 117 - "SubtitleLayoutTests"

Cohesion: 0.33 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 119 - "ChartTooltipContent.tsx"

Cohesion: 0.28 Nodes (6): ChartTooltipContentProps, TooltipEntry,
currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 120 - "core/tsconfig.json"

Cohesion: 0.50 Nodes (3): extends, include, ../../tsconfig.json

### Community 121 - "schedule.py"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A…, Push starts later
so no line is still speaking when the next begins. Pure so it…

### Community 122 - "Issue 60 Review"

Cohesion: 0.29 Nodes (6): Access Model, Automated Verification, Browser Review,
Issue 60 Review, Screenshots, Waiting Rule

### Community 123 - "BookingPipelineFlow.tsx"

Cohesion: 0.22 Nodes (9): BookingPipelineFlow(), BookingPipelineFlowProps,
PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId,
StepConfig, STEPS (+1 more)

### Community 124 - "proof.test.mjs"

Cohesion: 0.22 Nodes (4): BK_MESSAGES, verifyCleanSeed(), cleanEvents,
SEEDED_MESSAGES

### Community 125 - "json"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 126 - "RiskChip.test.tsx"

Cohesion: 0.29 Nodes (3): RISK, packages_core_src_index_financingrisk,
FinancingRisk

### Community 127 - "Tier: Lite"

Cohesion: 0.29 Nodes (6): Acceptance Criteria, Goal, Tier: Lite, Tracking,
Verification, Work

### Community 128 - "Deploy Prototype Workflow"

Cohesion: 0.20 Nodes (10): Containerization, Continuous Integration (CI), Deploy
And CI, Deployment Workflow, CI Workflow, CI Check Job (Lint, Typecheck, Unit
Tests, Build), TEST_DATABASE_URL Secret In CI, Deploy Prototype Workflow (+2
more)

### Community 129 - "Agent Skills"

Cohesion: 0.22 Nodes (8): Agent Skills, Install And Update,
leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows,
pbakaus/impeccable, Which Skill First

### Community 130 - "Non-Functional Requirements"

Cohesion: 0.33 Nodes (6): Accessibility And Design Standards, Data Integrity And
Determinism, Non-Functional Requirements, Performance, Reliability And
Resilience, Security, Secrets, And Privacy

### Community 134 - "forecast/forecast.ts"

Cohesion: 0.15 Nodes (9): SOURCE_TAG_LABELS, SOURCE_TAG_TONES,
packages_core_src_index_assumption, packages_core_src_index_dataset,
packages_core_src_index_sourcetag, at(), ev(), Dataset (+1 more)

### Community 136 - "Who Uses Mortar"

Cohesion: 0.40 Nodes (5): Legal Operations, Loan Administration, Persona
Comparison, Sales Administration, Who Uses Mortar

### Community 138 - "GitHub Issues And Pull Requests"

Cohesion: 0.50 Nodes (3): Before Opening A Pull Request, Before Opening An
Issue, GitHub Issues And Pull Requests

### Community 139 - "Spacing, Radius And Elevation"

Cohesion: 0.50 Nodes (4): Elevation And Focus, Radius Tokens, Spacing, Radius
And Elevation, Spacing Scale

### Community 147 - "ref_node_fs"

Cohesion: 0.29 Nodes (4): ref_node_assert, ref_node_fs, ref_node_test,
WALK_BEATS

### Community 170 - "frontend/package.json"

Cohesion: 0.08 Nodes (24): @mortar/core, typescript, vitest, license, name,
private, type, clsx (+16 more)

### Community 171 - "ref_vitest"

Cohesion: 0.11 Nodes (4): SiteShell(), SNAP, @testing-library/react, ref_vitest

## Knowledge Gaps

- **844 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+839 more) These have ≤1 connection - possible missing edges
  or undocumented components. (Counts symbols only; 1208 node(s) total have ≤1
  connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Technical Requirements Document: Mortar` connect
  `Technical Requirements Document: Mortar` to `Deploy Prototype Workflow`,
  `api.ts`, `sim.test.ts`, `Mortar Notes For Agents`,
  `Security, Secrets And Privacy`, `Forecast And Backtest Method`,
  `Industry Practitioner Survey Findings, n = 8`, `precompute.ts`?** _High
  betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `API Reference` connect `precompute.ts` to `CaseEvent`,
  `PlaybooksPanel.tsx`, `db/index.ts`, `Snapshot`,
  `Technical Requirements Document: Mortar`, `core/src/index.ts`?** _High
  betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `UI Triage: The Signed-In App` connect
  `UI Triage: The Signed-In App` to `Jakub Krehel's Interface Skills`,
  `Industry Practitioner Survey Findings, n = 8`, `Perch Sign-In Teardown`,
  `Mortar Demo Recorder`?** _High betweenness centrality (0.070) - this node is
  a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _844 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `questions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12615384615384614 - nodes in this community are weakly
  interconnected._
- **Should `card.tsx` be split into smaller, more focused modules?** _Cohesion
  score 0.1461609620721554 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?** _Cohesion
  score 0.08048103607770583 - nodes in this community are weakly
  interconnected._
