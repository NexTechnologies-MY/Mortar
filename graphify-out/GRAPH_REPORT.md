# Graph Report - wt-integration (2026-09-27)

## Corpus Check

- 343 files · ~281,546 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 9, .css 3,
  .example 1)

## Summary

- 2846 nodes · 7446 edges · 178 communities (138 shown, 40 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 324 edges
  (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `328dc593`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- questions.ts
- ForecastPage.tsx
- api.ts
- app.test.ts
- package.json
- sim.test.ts
- DirectTableImport.tsx
- StagePill.tsx
- MessagesPanel.tsx
- Mortar Brief
- import.ts
- app.ts
- Booking
- generate.ts
- Agent Rules
- db/index.ts
- Hugeicons by Halal Lab
- assistant/index.ts
- Assumptions And Constraints
- BookingsPage.tsx
- BookingsTable.tsx
- Technical Requirements Document: Mortar
- projectSettings.ts
- button.tsx
- Markdown Style Guide
- AddBookingDialog.tsx
- LandingPage.tsx
- Industry Practitioner Survey Findings, n = 8
- EvidencePill.tsx
- Mortar Product Overview
- persona.tsx
- Product Requirements: Mortar
- FakeDb
- Slide 14: Playbooks: Staff Experience, Reviewed
- Perch Landing Teardown
- reset.ts
- assistant.test.ts
- sim.ts
- tools.ts
- forecast/forecast.ts
- types.ts
- proxyClient.ts
- jev/package.json
- server/package.json
- dependencies
- docs/README.md
- devDependencies
- brain.test.ts
- MotionSites: cinematic landing page prompts
- useTheme.tsx
- live-check.ts
- LegalPage.test.tsx
- Security, Secrets And Privacy
- CaseQuickView
- Reviews And Merging
- react
- CaseEvent
- speak.py
- Forecast And Backtest Method
- ChaseCard.tsx
- cn
- frontend/tsconfig.json
- precompute.ts
- components.json
- compilerOptions
- record.mjs
- Andrej Karpathy Skills
- service.ts
- test_assemble.py
- UI Triage: The Signed-In App
- core/src/index.ts
- banks.test.ts
- Route /forecast (Projected Signings)
- WaitingOn.tsx
- Mortar Demo Recorder
- A Company Brain For Booking-To-SPA Conversion
- CaseSummary
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
- Landing Video Pipeline
- What Mortar Does
- Persona
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
- packages_core_src_index_task
- BuyerSignals
- TourProvider.tsx
- RTK Commands By Workflow
- Colour
- case/index.ts
- .prettierrc.json
- render.mjs
- SubtitleLayoutTests
- Financing-Risk Method
- formatters.ts
- core/tsconfig.json
- schedule.py
- Design Research: Layerhand Landing Page
- BookingPipelineFlow.tsx
- proof.test.mjs
- json
- Gotchas
- better-ui Skill: surfaces, icons, motion values
- Deploy Prototype Workflow
- Agent Skills
- main.tsx
- assemble.sh
- AppErrorBoundary
- createAssistant
- LoanApplication
- TourProvider.test.tsx
- Who Uses Mortar
- usePagination
- GitHub Issues And Pull Requests
- Spacing, Radius And Elevation
- Testing Strategy
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

1. `cn()` - 152 edges
2. `react` - 82 edges
3. `lucide-react` - 57 edges
4. `@testing-library/react` - 54 edges
5. `CaseEvent` - 54 edges
6. `Booking` - 52 edges
7. `react-router-dom` - 50 edges
8. `Button` - 48 edges
9. `CaseSummary` - 45 edges
10. `File Map` - 41 edges

## Surprising Connections (you probably didn't know these)

- `Demo Script As Acceptance` --references--> `CaseQuickView()` [INFERRED]
  docs/PRD.md → frontend/src/components/bookings/CaseQuickView.tsx
- `The Shared Side Sheet` --references--> `CaseQuickView()` [INFERRED]
  docs/PRODUCT.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Field` --references--> `Select()` [INFERRED] docs/DESIGN.md →
  frontend/src/components/ui/select.tsx
- `FR-23: Ask Mortar Grounded Assistant` --references--> `askBrain()` [INFERRED]
  docs/PRD.md → packages/core/src/brain/index.ts
- `Service And Integration Tests` --references--> `askBrain()` [INFERRED]
  docs/TRD.md → packages/core/src/brain/index.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **The Seven Stages Of The Journey Of A Change** —
  github_contributing_start_with_an_issue, github_contributing_branch_naming,
  github_contributing_commit_message_format,
  github_contributing_fill_in_the_template,
  github_contributing_review_and_merging,
  github_contributing_check_the_live_site [EXTRACTED 1.00]
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
- **Booking-To-SPA Evidence Chain From Interview to Feature Proposal** —
  docs_source_interview, docs_research_practitioner_survey_readme,
  docs_source_problem_statement_booking_to_spa_gap,
  docs_research_feature_ideas_readme_early_financing_eligibility [EXTRACTED
  1.00]

## Communities (178 total, 40 thin omitted)

### Community 0 - "questions.ts"

Cohesion: 0.13 Nodes (16): count(), days(), joinList(), percent(), ringgit,
rm(), rmCompact(), sumBy() (+8 more)

### Community 1 - "ForecastPage.tsx"

Cohesion: 0.11 Nodes (41): SOURCE_LABELS, TRACK_LABELS, SignalsPanel(),
frontend_src_components_case_index_formatpercent,
frontend_src_components_case_index_formatrm,
frontend_src_components_case_index_formatrmcompact, ChartTooltipContent(),
ChartTooltipContentProps (+33 more)

### Community 2 - "api.ts"

Cohesion: 0.08 Nodes (26): addDemoData(), ApiError, askAssistant(),
askAssistantStream(), AssistantAnswer, deleteBooking(), deleteDemoData(),
fetchHealth() (+18 more)

### Community 3 - "app.test.ts"

Cohesion: 0.04 Nodes (18): BookingDraft, packages_core_src_index_bookingdraft,
Task, BookingMovedOnError, EventSettledError, ImportBatch, ImportMovedOnError,
OpenApplicationError (+10 more)

### Community 4 - "package.json"

Cohesion: 0.05 Nodes (45): isOff(), typescriptFiles, warnings(), description,
devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 5 - "sim.test.ts"

Cohesion: 0.12 Nodes (14): STORIES, DOCUMENT_LABELS, STAGE_RANK, DEFAULT_SEED,
HORIZON_DAYS, REFERENCE_DATE, packages_core_src_sim_default_assumptions, data
(+6 more)

### Community 6 - "DirectTableImport.tsx"

Cohesion: 0.09 Nodes (48): Native Controls, AddMessageForm(), defaultName(),
normalTime(), ROLES, timeNow(), blockerQuery(), FIT_PRESENTATION (+40 more)

### Community 7 - "StagePill.tsx"

Cohesion: 0.18 Nodes (12): BookingFilter, BookingFiltersProps, ACTIVE_STAGES,
CLOSED_STAGES, FILTER, STAGE_LABELS, STAGE_TONES, StagePill() (+4 more)

### Community 8 - "MessagesPanel.tsx"

Cohesion: 0.07 Nodes (36): EvidenceLog(), DOCUMENT_LABELS, EVENT_KIND_LABELS,
EXTRACTED_EVENT_LABELS, formatDateTime(), NEXT_ACTION_LABELS,
SENDER_ROLE_LABELS, certainty() (+28 more)

### Community 9 - "Mortar Brief"

Cohesion: 0.05 Nodes (36): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+28 more)

### Community 10 - "import.ts"

Cohesion: 0.08 Nodes (40): DropZone(), accept(), clear(), readableSize(),
readSheetFile(), sheetKind(), SheetReadError, DEFAULTS (+32 more)

### Community 11 - "app.ts"

Cohesion: 0.09 Nodes (38): Table Definitions, evidence(),
packages_core_src_index_checkbookingdraft, packages_core_src_index_language,
packages_core_src_index_proposalfromextraction, Language, ref_bun_test,
caseRuleProblem() (+30 more)

### Community 12 - "Booking"

Cohesion: 0.13 Nodes (24): ApplicationFacts, appointmentDay(), byOccurred(),
CaseDataInput, CaseFacts, deriveApplication(), deriveCase(), DocumentLedger (+16
more)

### Community 13 - "generate.ts"

Cohesion: 0.11 Nodes (33): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL,
drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+25 more)

### Community 14 - "Agent Rules"

Cohesion: 0.20 Nodes (12): Agent Rules, Bun Workspaces, frontend (React 19 +
Vite + Tailwind 4 + shadcn/ui), GitHub Issues And Pull Requests Agent Guide,
Graphify Agent Guide, Andrej Karpathy Skills Agent Guide, Markdown Style Guide,
Mortar (+4 more)

### Community 15 - "db/index.ts"

Cohesion: 0.22 Nodes (20): unitKey(), packages_core_src_index_isodatetime,
packages_core_src_index_loanapplication, packages_core_src_index_playbook,
Playbook, createDatabase(), isoDate(), isoDateTime() (+12 more)

### Community 16 - "Hugeicons by Halal Lab"

Cohesion: 0.14 Nodes (20): Design the Fallback First, Canvas UI shadcn Registry
Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add),
Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons
Stroke Rounded Free Style, Iconsax, from the Vuesax team (+12 more)

### Community 17 - "assistant/index.ts"

Cohesion: 0.13 Nodes (20): ASSISTANT_TIMEOUT_MS, callGemini(), GeminiContent,
GeminiFunctionCall, GeminiOptions, GeminiPart, GeminiResponse, isAbort() (+12
more)

### Community 18 - "Assumptions And Constraints"

Cohesion: 0.33 Nodes (6): Slide 16: Simulated Data, By Design, Assumptions And
Constraints, Empirical Grounding Table, Operational Constraints, Statutory And
Legal Constraints, Synthetic Data Guarantee

### Community 19 - "BookingsPage.tsx"

Cohesion: 0.11 Nodes (44): File Map, Recipe: Add A Route, HomeRedirect(),
AppLayout(), AppShell(), PageContainer(), PageContainerProps, VARIANTS (+36
more)

### Community 20 - "BookingsTable.tsx"

Cohesion: 0.13 Nodes (26): BookingsTable(), PILL_STAGES, Sort, SortKey, WIDTHS,
CaseHeader(), WaitingOnCell(), formatDays() (+18 more)

### Community 21 - "Technical Requirements Document: Mortar"

Cohesion: 0.13 Nodes (15): Architecture And Components, Case Derivation Rules,
Data Model And Schema, Event Model And Evidence Lifecycle, Fallback And Caching
Ladder, Generator Architecture, Industry And Regulatory Baselines, Jev
Integration (+7 more)

### Community 22 - "projectSettings.ts"

Cohesion: 0.17 Nodes (16): createEmptyRow(), DirectTableImport(),
generateMockIc(), ProjectSettingsCard(), DEFAULT_PROJECT_SETTINGS,
DEFAULT_UNIT_MODELS, formatUnitRangeDescription(),
generateProjectInventoryUnits() (+8 more)

### Community 23 - "button.tsx"

Cohesion: 0.08 Nodes (36): DateField(), monthOf(), toDate(), toIso(),
TasksPanel(), TrackColumn(), formatDate(),
frontend_src_components_case_index_formatdate (+28 more)

### Community 24 - "Markdown Style Guide"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

### Community 25 - "AddBookingDialog.tsx"

Cohesion: 0.09 Nodes (24): AddBookingDialog(), EMPTY_FORM, FORM_FIELDS,
FormState, localIsoDate(), pad(), BookingFilters(), RISKS (+16 more)

### Community 26 - "LandingPage.tsx"

Cohesion: 0.09 Nodes (16): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+8 more)

### Community 27 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.13 Nodes (26): Feature Ideas: written up but not built, 48-Hour
Clean Exit, Advisory-Only Financing Flag That Never Blocks a Booking, Early
Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time
Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages
Ruling (+18 more)

### Community 28 - "EvidencePill.tsx"

Cohesion: 0.32 Nodes (6): EVIDENCE_LABELS, EVIDENCE_TONES, EvidencePill(),
EvidenceState, CASES, packages_core_src_index_evidencestatus

### Community 29 - "Mortar Product Overview"

Cohesion: 0.08 Nodes (24): Beneficiaries Who Do Not Log In Daily, Current
Prototype Versus Production Roadmap, Daily Users, Deliberately Not Users,
Division Of Operational Responsibility, Evidence From Research And Industry, How
It Works In One Flow, Illustrative Impact, Not A Finding (+16 more)

### Community 30 - "persona.tsx"

Cohesion: 0.07 Nodes (26): mocks, MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, AppNav(), useBreadcrumbs() (+18 more)

### Community 31 - "Product Requirements: Mortar"

Cohesion: 0.10 Nodes (21): Accessibility And Design Standards, Business Success
Metric, Data Integrity And Determinism, Demo Script As Acceptance, Goals And
Non-Goals, Industry And Statutory Sources, Legal Admin, Loan Admin (+13 more)

### Community 34 - "Perch Landing Teardown"

Cohesion: 0.11 Nodes (25): better-layout Skill, explain-interface Skill, Figma
Pairing: Newsreader display + Geist UI, Perch Sign-In Teardown, Authored
Disabled States, Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path
Check, Porting Plan: the persona folds into the guest button (+17 more)

### Community 35 - "reset.ts"

Cohesion: 0.13 Nodes (23): proposalFromExtraction(), simNow(), summarizeCases(),
ref_bun, ref_node_path, sql, addDemoData(), applySchema() (+15 more)

### Community 36 - "assistant.test.ts"

Cohesion: 0.09 Nodes (17): CaseData, App, APPLICATIONS, ask(), BOOKING, event(),
EVENTS, fakeJev() (+9 more)

### Community 37 - "sim.ts"

Cohesion: 0.15 Nodes (24): FUNNEL_STAGES, groupBy(), backtest(), bucketOf(),
buildModel(), CALIBRATION_BUCKETS, factsFor(), forecast() (+16 more)

### Community 38 - "tools.ts"

Cohesion: 0.13 Nodes (25): packages_core_src_index_default_assumptions,
searchPlaybooks(), packages_core_src_sim_forecast, bookingLine(), cap(),
caseDetail(), casesFor(), day() (+17 more)

### Community 39 - "forecast/forecast.ts"

Cohesion: 0.08 Nodes (28): addDays(), altDataset(), datasetFor(),
SOURCE_TAG_LABELS, SOURCE_TAG_TONES, ForecastPage(),
packages_core_src_index_assumption, packages_core_src_index_dataset (+20 more)

### Community 40 - "types.ts"

Cohesion: 0.12 Nodes (15): FR-6: TypeSafe Jev Structured Message Extraction,
EVENT_MAP, JEV_REVIEW_THRESHOLD, STATUS_RANK, PLAYBOOKS, PlannedEvent, Backtest,
ChoiceAnswer (+7 more)

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

Cohesion: 0.14 Nodes (16): Slide 15: How It Is Built, About The Project,
Architecture, Ask Mortar (Gemini Assistant), Getting Started, How It Works,
License, Limitations (+8 more)

### Community 46 - "devDependencies"

Cohesion: 0.18 Nodes (11): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+3 more)

### Community 47 - "brain.test.ts"

Cohesion: 0.21 Nodes (13): canonicalSnapshot(), ctx, askBrain(),
buildAskContext(), contentWords(), coverage(), matchQuestion(), questionIndex()
(+5 more)

### Community 48 - "MotionSites: cinematic landing page prompts"

Cohesion: 0.22 Nodes (15): Glass Object (Three.js effect), Scroll-Driven
Effects: Laser, Particle Scroll, Bend, Bottom Sheet Drawer Recipe, Interruptible
Motion: transitions for toggles, keyframes for entrances, Staged Entrances:
100ms block stagger, 80ms per word, MotionSites: cinematic landing page prompts,
MotionSites Academy Lessons, data-enter Entrance State Machine (+7 more)

### Community 49 - "useTheme.tsx"

Cohesion: 0.24 Nodes (8): getSystemTheme(), resolveTheme(), Theme, ThemeContext,
ThemeContextValue, ThemeProvider(), FaqPage(), FAQS

### Community 50 - "live-check.ts"

Cohesion: 0.10 Nodes (14): FR-12: High-Availability Offline Jev Fallback,
packages_core_src_index_casedata, packages_core_src_index_simulationmeta,
JevService, SimulationMeta, StoredMeta, AppOptions, app (+6 more)

### Community 51 - "LegalPage.test.tsx"

Cohesion: 0.09 Nodes (23): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, legalQueue(), LegalRow, LegalSortKey, median() (+15 more)

### Community 52 - "Security, Secrets And Privacy"

Cohesion: 0.29 Nodes (7): Open Questions, Data Retention, Secret Management,
Security, Secrets And Privacy, Statutory Compliance: PDPA, Cloud Run Rollout
(asia-southeast1, min 0 / max 2), Runtime Secrets (DATABASE_URL,
TYPESAFE_API_KEY, GEMINI_API_KEY)

### Community 53 - "CaseQuickView"

Cohesion: 0.18 Nodes (12): Add Bookings (`/import`) And Site Shell, Bookings
(`/bookings`), Case Page (`/bookings/:id`), Forecast (`/forecast`), FR-17:
Waiting On Party, Quick View Side Sheet, And Next Move, FR-19: Record An Update,
FR-5: Today Desk And Task Management, Legal (`/legal`) (+4 more)

### Community 54 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 55 - "react"

Cohesion: 0.08 Nodes (37): ApplicationsCard(), STATUS_TONES,
APPLICATION_STATUS_LABELS, AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED, CONFIRM,
DECIDED (+29 more)

### Community 56 - "CaseEvent"

Cohesion: 0.08 Nodes (7): Endpoint Details, CaseEvent, IsoDateTime, Message,
Database, JevAnswerRow, DbJevCache

### Community 57 - "speak.py"

Cohesion: 0.15 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 58 - "Forecast And Backtest Method"

Cohesion: 0.33 Nodes (6): Slide 11: The Forecast: Signed SPAs, Not Bookings,
Slide 12: The Backtest - And What It Does Not Prove, Backtest Validation,
Forecast And Backtest Method, Parameter Assumptions, Statistical Forecast

### Community 59 - "ChaseCard.tsx"

Cohesion: 0.12 Nodes (17): frontend_src_components_case_index_formatdayslong,
NextStep, OWNER_ROLE_LABELS, actionIcon(), addDays(), blockerIcon(),
DOCUMENT_LABELS, documentStepLabel() (+9 more)

### Community 60 - "cn"

Cohesion: 0.06 Nodes (45): CardFooter, Checkbox(), DrawerContent,
DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle
(+37 more)

### Community 61 - "frontend/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+1 more)

### Community 62 - "precompute.ts"

Cohesion: 0.11 Nodes (16): packages_core_src_index_jevcacheentry,
packages_core_src_index_searchplaybooks, JevCacheEntry, cache, caseData, client,
CollectingCache, generated (+8 more)

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

### Community 67 - "service.ts"

Cohesion: 0.07 Nodes (37): packages_core_src_index_jevcache,
packages_core_src_index_jevkind, packages_core_src_index_jevmeta,
packages_core_src_index_jevservice, packages_core_src_index_scoreanswer,
JevCache, JevKind, ScoreAnswer (+29 more)

### Community 68 - "test_assemble.py"

Cohesion: 0.24 Nodes (10): AssembleMuxTests, AssemblePictureTests,
color_video(), ff(), probe_duration(), CompletedProcess, Path, slide_png() (+2
more)

### Community 69 - "UI Triage: The Signed-In App"

Cohesion: 0.22 Nodes (14): R7, the Dissenting Expert, UI Triage: The Signed-In
App, Copy Rules: the drop and write table, Density Budget, The Desk Lens Becomes
a Preset, Not a Banner, Three Stacked Filter Systems With Disagreeing Numbers,
Four-Phase Implementation Plan, Jargon a Sales Admin Does Not Use (+6 more)

### Community 70 - "core/src/index.ts"

Cohesion: 0.07 Nodes (29): API Reference, RANKING, SNAPSHOT, buildSnapshot(),
EXTRACTION_9001, EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001 (+21 more)

### Community 71 - "banks.test.ts"

Cohesion: 0.19 Nodes (11): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+3 more)

### Community 73 - "WaitingOn.tsx"

Cohesion: 0.16 Nodes (15): progressFromKinds(), SEGMENTS, STAGE_PROGRESS,
StageTracker(), TaskCell(), AWAITING_DOCUMENTS, BOOKING, RISK (+7 more)

### Community 74 - "Mortar Demo Recorder"

Cohesion: 0.23 Nodes (13): 12 Weeks, No New CRM, No Consultant, No Vendor,
Chatterbox Requirements with Pinned Upstream Commits, resemble-perth Pinned
Commit and setuptools<81, Narration Script: beat, offset_ms, text, Beat Offset
Discipline, Mortar Demo Recorder, Beat-Keyed Timing, Clean Seed Verification via
/api/snapshot (+5 more)

### Community 75 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.11 Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+11 more)

### Community 76 - "CaseSummary"

Cohesion: 0.11 Nodes (16): Write Rules And Error Codes, BookingRow,
buildClosedExportRows(), ClosedExportRow, closedOnDate(), CLOSING_KIND,
downloadClosedExport(), exportBank() (+8 more)

### Community 77 - "AddBookingDialog.test.tsx"

Cohesion: 0.08 Nodes (13): choose(), DEFAULTS, fillRequiredFields(), label(),
navigateMock, pickBookingDate(), PROJECTS, PopoverState (+5 more)

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

Cohesion: 0.20 Nodes (14): Jakub Krehel's Interface Skills, better-accessibility
Skill: reduced motion, zoom, autoplay, better-colors Skill, better-interface
Skill: orchestrated review, better-typography Skill, better-writing Skill, break
Skill, interface-review Skill (+6 more)

### Community 83 - "Functional Requirements"

Cohesion: 0.11 Nodes (18): FR-10: Transparent Assumptions And Browser
Re-Simulation, FR-11: Database Persistence And Demo Data Management, FR-13: Add
Bookings Intake And Validation, FR-14: Persona Navigation And Page Routing,
FR-15: SPA Execution Desk, FR-16: Leakage Analysis And Recovery Sizing, FR-1:
Canonical Simulation Dataset Generation, FR-20: Message Timing And Buyer
Response Explanation (+10 more)

### Community 84 - "notificationStore.ts"

Cohesion: 0.25 Nodes (7): Notification, emit(), Listener, listeners,
notifications, saveNotifications(), packages_core_src_index_simnow

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

Cohesion: 0.12 Nodes (22): FR-7: Next Action, Playbook Fit, And Buyer Signals
Scoring, Fan-Out Job Specifications, AskPanel(), CaseNextStep,
CreateTaskPayload, jevStep(), nextStepFor(), stepFor() (+14 more)

### Community 89 - "walk.mjs"

Cohesion: 0.27 Nodes (10): scrollDuration(), scrollTarget(), smoothScrollTo(),
BUYER_REPLY, film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink()
(+2 more)

### Community 90 - "Landing Video Pipeline"

Cohesion: 0.19 Nodes (14): Porting Its Hover Motion without React, LQIP
Placeholder Behind Video Tiles, Each Rule Has One Owner, Reduced Motion Kill
Switch: 0.01ms not none, WCAG 2.2.2 Autoplay Pause Requirement, Landing Video
Pipeline, The Agent's Video Checklist, Gemini Videos Composer at
gemini.google.com/videos (+6 more)

### Community 91 - "What Mortar Does"

Cohesion: 0.25 Nodes (8): Ask Panel, Ask Mortar, Centralized Case Workspace,
Core Operational Capabilities, High-Density Ledger Design, The Shared Side
Sheet, Waiting On, What Mortar Does

### Community 92 - "Persona"

Cohesion: 0.14 Nodes (15): packages_core_src_index_persona, Persona,
AssistantImage, AssistantRequest, HistoryTurn, IMAGE_MIME_TYPES,
MAX_HISTORY_TURNS, MAX_IMAGE_BYTES (+7 more)

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

Cohesion: 0.13 Nodes (12): IMAGE_TYPES, readableSize(), Turn, AssistantImage,
AssistantStreamEvent, packages_core_src_index_askaction,
packages_core_src_index_askbrain, packages_core_src_index_askreply (+4 more)

### Community 109 - "packages_core_src_index_task"

Cohesion: 0.22 Nodes (5): BOOKING, RISK, SUMMARY, TASK,
packages_core_src_index_task

### Community 110 - "BuyerSignals"

Cohesion: 0.22 Nodes (4): SIGNALS, META, packages_core_src_index_buyersignals,
BuyerSignals

### Community 111 - "TourProvider.tsx"

Cohesion: 0.24 Nodes (10): frontend_src_lib_persona_persona, Rect, Spotlight(),
resolveRoute(), TourContext, TourContextValue, TourProvider(), TourStepBar() (+2
more)

### Community 112 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 113 - "Colour"

Cohesion: 0.50 Nodes (5): Colour, Landing Panel Tokens, Primitives Summary,
Semantic Colour, Status Tones

### Community 114 - "case/index.ts"

Cohesion: 0.24 Nodes (9): BALL_HOLDER_ICONS, BALL_HOLDER_LABELS, BALL_HOLDERS,
MOVE_OWNER, OwnerBadge(), RISK_LABELS, BallHolder,
packages_core_src_index_ballholder (+1 more)

### Community 115 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 116 - "render.mjs"

Cohesion: 0.20 Nodes (9): ref_node_module, ref_node_os, ref_node_url, failures,
HERE, page, rawSlides, require (+1 more)

### Community 117 - "SubtitleLayoutTests"

Cohesion: 0.33 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 118 - "Financing-Risk Method"

Cohesion: 0.50 Nodes (4): Slide 13: The Financing Risk Flag, Financing-Risk
Method, Risk Calculation Steps, Risk Categorization

### Community 119 - "formatters.ts"

Cohesion: 0.40 Nodes (4): currencyFormatter, formatCurrency(),
formatTooltipCurrency(), numberFormatter

### Community 120 - "core/tsconfig.json"

Cohesion: 0.50 Nodes (3): extends, include, ../../tsconfig.json

### Community 121 - "schedule.py"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A…, Push starts later
so no line is still speaking when the next begins. Pure so it…

### Community 122 - "Design Research: Layerhand Landing Page"

Cohesion: 0.27 Nodes (12): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, html-in-canvas API, Peel Effect, Jakub Antalik Portfolio Study,
Restraint: one signature interaction, Design Research: Layerhand Landing Page
(+4 more)

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

### Community 126 - "Gotchas"

Cohesion: 0.24 Nodes (10): Gotchas, isLive(), isOpen(), awaitingDocument(),
goneQuiet(), live(), onlyRejected(), openApplications() (+2 more)

### Community 127 - "better-ui Skill: surfaces, icons, motion values"

Cohesion: 0.24 Nodes (10): Why Hugeicons Fits, Its Hover Mixed Fill and Stroke
Conventions, Layered Card Surface: hairline ring and stacked shadow,
transitions.dev: UI transitions for AI agents, better-ui Skill: surfaces, icons,
motion values, Concentric Radius: outer equals inner plus padding, Icon Stroke
Scale by Adjacent Text Weight, shadow-border Three-Layer Token (+2 more)

### Community 128 - "Deploy Prototype Workflow"

Cohesion: 0.20 Nodes (10): Containerization, Continuous Integration (CI), Deploy
And CI, Deployment Workflow, CI Workflow, CI Check Job (Lint, Typecheck, Unit
Tests, Build), TEST_DATABASE_URL Secret In CI, Deploy Prototype Workflow (+2
more)

### Community 129 - "Agent Skills"

Cohesion: 0.22 Nodes (8): Agent Skills, Install And Update,
leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows,
pbakaus/impeccable, Which Skill First

### Community 130 - "main.tsx"

Cohesion: 0.28 Nodes (5): App(), ScrollToTop(), frontend_src_globals, react-dom,
react-hot-toast

### Community 133 - "createAssistant"

Cohesion: 0.33 Nodes (7): modelErrorResponse(), clientIp(), RateLimiter,
readAssistantRequest(), createAssistant(), error(), tooLong()

### Community 134 - "LoanApplication"

Cohesion: 0.33 Nodes (3): at(), ev(), LoanApplication

### Community 135 - "TourProvider.test.tsx"

Cohesion: 0.40 Nodes (3): Harness(), mocks, useTour()

### Community 136 - "Who Uses Mortar"

Cohesion: 0.40 Nodes (5): Legal Operations, Loan Administration, Persona
Comparison, Sales Administration, Who Uses Mortar

### Community 137 - "usePagination"

Cohesion: 0.50 Nodes (3): Pagination(), usePagination(), Harness()

### Community 138 - "GitHub Issues And Pull Requests"

Cohesion: 0.50 Nodes (3): Before Opening A Pull Request, Before Opening An
Issue, GitHub Issues And Pull Requests

### Community 139 - "Spacing, Radius And Elevation"

Cohesion: 0.50 Nodes (4): Elevation And Focus, Radius Tokens, Spacing, Radius
And Elevation, Spacing Scale

### Community 140 - "Testing Strategy"

Cohesion: 0.50 Nodes (4): Service And Integration Tests, Testing Strategy, Unit
And Determinism Tests, User Interface Verification

### Community 147 - "ref_node_fs"

Cohesion: 0.29 Nodes (4): ref_node_assert, ref_node_fs, ref_node_test,
WALK_BEATS

### Community 170 - "frontend/package.json"

Cohesion: 0.08 Nodes (25): @mortar/core, typescript, vitest, license, name,
private, type, clsx (+17 more)

### Community 171 - "ref_vitest"

Cohesion: 0.06 Nodes (12): RISK, LEAKAGE, AppSidebar(), mocks,
pagesForPersona(), PERSONA_PAGES, PERSONA_STORAGE_KEY, PersonaProvider() (+4
more)

## Knowledge Gaps

- **820 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+815 more) These have ≤1 connection - possible missing edges
  or undocumented components. (Counts symbols only; 1172 node(s) total have ≤1
  connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Technical Requirements Document: Mortar` connect
  `Technical Requirements Document: Mortar` to `Deploy Prototype Workflow`,
  `core/src/index.ts`, `Testing Strategy`, `docs/README.md`,
  `Mortar Notes For Agents`, `Security, Secrets And Privacy`,
  `Financing-Risk Method`, `Forecast And Backtest Method`?** _High betweenness
  centrality (0.132) - this node is a cross-community bridge._
- **Why does `API Reference` connect `core/src/index.ts` to `app.test.ts`,
  `CaseSummary`, `BuyerSignals`, `live-check.ts`,
  `Technical Requirements Document: Mortar`, `CaseEvent`, `nextStep.ts`?** _High
  betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `UI Triage: The Signed-In App` connect
  `UI Triage: The Signed-In App` to `Perch Landing Teardown`,
  `Mortar Demo Recorder`, `Jakub Krehel's Interface Skills`,
  `Industry Practitioner Survey Findings, n = 8`,
  `better-ui Skill: surfaces, icons, motion values`?** _High betweenness
  centrality (0.054) - this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _820 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `questions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly
  interconnected._
- **Should `ForecastPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10523532522474881 - nodes in this community are weakly
  interconnected._
- **Should `api.ts` be split into smaller, more focused modules?** _Cohesion
  score 0.08282828282828283 - nodes in this community are weakly
  interconnected._
