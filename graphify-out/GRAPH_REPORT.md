# Graph Report - wt-integration (2026-09-27)

## Corpus Check

- 358 files · ~288,127 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 9, .css 3,
  .example 1)

## Summary

- 2943 nodes · 7826 edges · 177 communities (135 shown, 42 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 329 edges
  (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `46cb9375`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- questions.ts
- card.tsx
- api.ts
- CaseEvent
- package.json
- snapshotFixture.ts
- lucide-react
- react
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
- app.test.ts
- usePersona
- BookingsTable.tsx
- Technical Requirements Document: Mortar
- lib/projectSettings.ts
- SiteShell.tsx
- Markdown Style Guide
- BookingFilters.tsx
- LandingPage.tsx
- docs/README.md
- Booking
- Mortar Product Overview
- persona.tsx
- Product Requirements: Mortar
- FakeDb
- Slide 14: Playbooks: Staff Experience, Reviewed
- Perch Sign-In Teardown
- server/src/index.ts
- assistant.test.ts
- sim.ts
- tools.ts
- stage.test.ts
- core/src/jev.ts
- proxyClient.ts
- jev/package.json
- server/package.json
- dependencies
- Getting Started
- devDependencies
- types.ts
- Canvas UI: 35 WebGL/WebGPU effects over live HTML
- react-router-dom
- readSheetFile.test.ts
- Snapshot
- Security, Secrets And Privacy
- User Stories Per Screen
- Reviews And Merging
- RecordUpdateForm.tsx
- RecordUpdateForm.test.tsx
- speak.py
- Forecast And Backtest Method
- WaitingOn.test.tsx
- cn
- frontend/tsconfig.json
- precompute.ts
- components.json
- compilerOptions
- TrackTimelines.tsx
- Andrej Karpathy Skills
- integration.test.ts
- test_assemble.py
- UI Triage: The Signed-In App
- BookingsPage.test.tsx
- banks.test.ts
- Route /forecast (Projected Signings)
- ManagerCases.tsx
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
- record.mjs
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
- AddMessageForm.tsx
- What Happened
- server/tsconfig.json
- subtitles.py
- AskPanel.tsx
- CaseHeader.test.tsx
- core/src/index.ts
- TourProvider.tsx
- RTK Commands By Workflow
- Colour
- DirectTableImport.tsx
- .prettierrc.json
- BookingDetailPage.test.tsx
- SubtitleLayoutTests
- ImportPage.test.tsx
- ChartTooltipContent.tsx
- core/tsconfig.json
- schedule.py
- Issue 60 Review
- BookingsPage.tsx
- TaskCell.test.tsx
- json
- Assumptions And Constraints
- Tier: Lite
- Deploy Prototype Workflow
- Agent Skills
- Non-Functional Requirements
- assemble.sh
- AppErrorBoundary
- bookingLine
- forecast/forecast.ts
- vite.config.ts
- Who Uses Mortar
- Data Model And Schema
- GitHub Issues And Pull Requests
- Spacing, Radius And Elevation
- Testing Strategy
- Slide 07: Evidence With A Name On It
- Design Specification
- Route /import (Add Bookings)
- Start From Fresh main
- narrate.sh
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

- `Bookings (`/bookings`)` --references--> `CaseQuickView()` [INFERRED]
  docs/PRD.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Demo Script As Acceptance` --references--> `CaseQuickView()` [INFERRED]
  docs/PRD.md → frontend/src/components/bookings/CaseQuickView.tsx
- `FR-17: Waiting On Party, Quick View Side Sheet, And Next Move`
  --references--> `CaseQuickView()` [INFERRED] docs/PRD.md →
  frontend/src/components/bookings/CaseQuickView.tsx
- `FR-19: Record An Update` --references--> `CaseQuickView()` [INFERRED]
  docs/PRD.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Today (`/chase`)` --references--> `CaseQuickView()` [INFERRED] docs/PRD.md →
  frontend/src/components/bookings/CaseQuickView.tsx

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

## Communities (177 total, 42 thin omitted)

### Community 0 - "questions.ts"

Cohesion: 0.10 Nodes (26): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+18 more)

### Community 1 - "card.tsx"

Cohesion: 0.16 Nodes (28): SOURCE_LABELS, TRACK_LABELS,
frontend_src_components_case_index_formatpercent,
frontend_src_components_case_index_formatrmcompact, ChartTooltipContent(),
AssumptionsCard(), formatAssumptionValue(), AppErrorBoundaryProps (+20 more)

### Community 2 - "api.ts"

Cohesion: 0.17 Nodes (20): DemoDataCard(), addDemoData(), ApiError,
askAssistant(), askAssistantStream(), AssistantAnswer, deleteBooking(),
deleteDemoData() (+12 more)

### Community 3 - "CaseEvent"

Cohesion: 0.04 Nodes (15): API Reference, Endpoint Details, Write Rules And
Error Codes, BookingDraft, CaseEvent, EvidenceStatus, IsoDateTime,
LoanApplication (+7 more)

### Community 4 - "package.json"

Cohesion: 0.05 Nodes (45): isOff(), typescriptFiles, warnings(), description,
devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 5 - "snapshotFixture.ts"

Cohesion: 0.13 Nodes (14): RANKING, SNAPSHOT, buildSnapshot(), EXTRACTION_9001,
EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001 (+6 more)

### Community 6 - "lucide-react"

Cohesion: 0.10 Nodes (33): Native Controls, blockerQuery(), FIT_PRESENTATION,
PlaybooksPanel(), Ranked, STATUS_BADGES, JevTag(), pill() (+25 more)

### Community 7 - "react"

Cohesion: 0.12 Nodes (33): Recipe: Add A Route,
frontend_src_components_case_index_formatrm, SeedRun, SeedSpreadCard(),
PageContainer(), PageContainerProps, VARIANTS, PageHeaderCard() (+25 more)

### Community 8 - "MessagesPanel.tsx"

Cohesion: 0.11 Nodes (22): formatDateTime(), certainty(), currentProposal(),
Decision, DECISION_TOASTS, EXTRACTED_EVENT_KIND, MessageItem(), MessagesPanel()
(+14 more)

### Community 9 - "Mortar Brief"

Cohesion: 0.05 Nodes (36): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+28 more)

### Community 10 - "import.ts"

Cohesion: 0.13 Nodes (27): FR-22: Add Bookings Intake, ageOn(),
checkBookingDraft(), DateOrder, detectDateOrder(), EXCEL_EPOCH, findHeader(),
HEADER_NAMES (+19 more)

### Community 11 - "app.ts"

Cohesion: 0.07 Nodes (49): notifications,
packages_core_src_index_canaccessbooking,
packages_core_src_index_checkbookingdraft,
packages_core_src_index_default_project_settings,
packages_core_src_index_demo_profiles, packages_core_src_index_language,
packages_core_src_index_normalizeprojectsettings,
packages_core_src_index_profilefor (+41 more)

### Community 12 - "cases.ts"

Cohesion: 0.09 Nodes (30): BallHolder, listOf(), ReadSheetOptions,
ApplicationFacts, appointmentDay(), byOccurred(), CaseDataInput, CaseFacts (+22
more)

### Community 13 - "generate.ts"

Cohesion: 0.09 Nodes (43): WaitingSuggestion, DEFAULT_ASSUMPTIONS, addDays(),
addWorkDays(), diffDays(), fromEpoch(), isWeekend(), stamp() (+35 more)

### Community 14 - "Agent Rules"

Cohesion: 0.20 Nodes (12): Agent Rules, Bun Workspaces, frontend (React 19 +
Vite + Tailwind 4 + shadcn/ui), GitHub Issues And Pull Requests Agent Guide,
Graphify Agent Guide, Andrej Karpathy Skills Agent Guide, Markdown Style Guide,
Mortar (+4 more)

### Community 15 - "db/index.ts"

Cohesion: 0.20 Nodes (22): packages_core_src_index_isodatetime,
packages_core_src_index_loanapplication, packages_core_src_index_playbook,
summarizeCases(), Playbook, SimulationMeta, createDatabase(), isoDate() (+14
more)

### Community 16 - "Design Research: Layerhand Landing Page"

Cohesion: 0.14 Nodes (27): Design the Fallback First, Canvas UI shadcn Registry
Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add),
Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons
Stroke Rounded Free Style, Why Hugeicons Fits (+19 more)

### Community 17 - "assistant/index.ts"

Cohesion: 0.07 Nodes (41): packages_core_src_index_staffprofile,
ASSISTANT_TIMEOUT_MS, callGemini(), GeminiContent, GeminiFunctionCall,
GeminiOptions, GeminiPart, GeminiResponse (+33 more)

### Community 18 - "app.test.ts"

Cohesion: 0.07 Nodes (14): packages_core_src_index_bookingdraft,
BookingMovedOnError, ImportMovedOnError, OpenApplicationError, UnitHeldError,
APPLICATION, BOOKING, clock (+6 more)

### Community 19 - "usePersona"

Cohesion: 0.14 Nodes (18): File Map, HomeRedirect(), AskTrigger(), mocks,
SwitchProfile(), AppLayout(), AppLayoutProps, AppNav() (+10 more)

### Community 20 - "BookingsTable.tsx"

Cohesion: 0.07 Nodes (54): BookingRow, BookingsTable(), PILL_STAGES, WIDTHS,
CaseHeader(), CaseQuickView(), progressFromKinds(), SEGMENTS (+46 more)

### Community 21 - "Technical Requirements Document: Mortar"

Cohesion: 0.15 Nodes (13): Architecture And Components, Case Derivation Rules,
Fallback And Caching Ladder, Generator Architecture, Industry And Regulatory
Baselines, Jev Integration, Methodology And Technical Foundations, Question
Design Rules (+5 more)

### Community 22 - "lib/projectSettings.ts"

Cohesion: 0.14 Nodes (18): ProjectSettingsCard(), fetchProjectSettings(),
saveProjectSettings(), formatUnitRangeDescription(),
generateProjectInventoryUnits(), getAvailableInventoryUnits(),
MAX_PROJECT_UNITS, projectInventorySize() (+10 more)

### Community 23 - "SiteShell.tsx"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 24 - "Markdown Style Guide"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

### Community 25 - "BookingFilters.tsx"

Cohesion: 0.11 Nodes (25): BookingFilter, BookingFilters(), BookingFiltersProps,
RISKS, View, DateField(), monthOf(), toDate() (+17 more)

### Community 26 - "LandingPage.tsx"

Cohesion: 0.12 Nodes (13): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+5 more)

### Community 27 - "docs/README.md"

Cohesion: 0.09 Nodes (36): Slide 15: How It Is Built, About The Project,
Architecture, How It Works, License, Limitations, Project Structure, Screenshots
(+28 more)

### Community 28 - "Booking"

Cohesion: 0.26 Nodes (13): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, legalQueue(), LegalRow, LegalSortKey, median() (+5 more)

### Community 29 - "Mortar Product Overview"

Cohesion: 0.08 Nodes (24): Beneficiaries Who Do Not Log In Daily, Current
Prototype Versus Production Roadmap, Daily Users, Deliberately Not Users,
Division Of Operational Responsibility, Evidence From Research And Industry, How
It Works In One Flow, Illustrative Impact, Not A Finding (+16 more)

### Community 30 - "persona.tsx"

Cohesion: 0.07 Nodes (32): RISK, AppSidebar(), AppSidebarProps, PAGE_ICONS,
PersonaRoute(), mocks, canPersonaOpen(), DEFAULT_PERSONA (+24 more)

### Community 31 - "Product Requirements: Mortar"

Cohesion: 0.12 Nodes (16): Approved Manager And Copilot Intake (#60), Business
Success Metric, Demo Script As Acceptance, Goals And Non-Goals, Industry And
Statutory Sources, Legal Admin, Loan Admin, Metrics (+8 more)

### Community 34 - "Perch Sign-In Teardown"

Cohesion: 0.16 Nodes (15): Layered Card Surface: hairline ring and stacked
shadow, shadow-border Three-Layer Token, Perch Sign-In Teardown, Authored
Disabled States, Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path
Check, Porting Plan: the persona folds into the guest button, Perch Storage
Keys: perch.trip.v1, perch.theme.v1, perch.voter.v1 (+7 more)

### Community 35 - "server/src/index.ts"

Cohesion: 0.08 Nodes (17): packages_core_src_index_jevmeta,
packages_core_src_index_jevservice, JevMeta, JevService, ref_node_path,
JevAnswerRow, AppOptions, db (+9 more)

### Community 36 - "assistant.test.ts"

Cohesion: 0.09 Nodes (18): CaseData, App, APPLICATIONS, ask(), BOOKING, event(),
EVENTS, fakeJev() (+10 more)

### Community 37 - "sim.ts"

Cohesion: 0.09 Nodes (32): Slide 13: The Financing Risk Flag, Financing-Risk
Method, Risk Calculation Steps, Risk Categorization, FUNNEL_STAGES, groupBy(),
financingRisk(), backtest() (+24 more)

### Community 38 - "tools.ts"

Cohesion: 0.13 Nodes (21): ballInCourt,
packages_core_src_index_default_assumptions, packages_core_src_sim_forecast,
cap(), casesFor(), DESK_OF_OWNER_ROLE, deskOfNextMove(), deskOfOwnerRole() (+13
more)

### Community 39 - "stage.test.ts"

Cohesion: 0.13 Nodes (15): appointment(), assumptionValue(), summarizeCases(),
computeFinancingRisk(), financingRiskFor(), monthlyInstalment(), RiskInputs,
APEX (+7 more)

### Community 40 - "core/src/jev.ts"

Cohesion: 0.16 Nodes (8): EVENT_MAP, JEV_REVIEW_THRESHOLD, searchPlaybooks(),
STATUS_RANK, PLAYBOOKS, PlannedEvent, Track, minisearch

### Community 41 - "proxyClient.ts"

Cohesion: 0.16 Nodes (23): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+15 more)

### Community 42 - "jev/package.json"

Cohesion: 0.10 Nodes (20): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+12 more)

### Community 43 - "server/package.json"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 44 - "dependencies"

Cohesion: 0.08 Nodes (25): dependencies, class-variance-authority, clsx,
date-fns, framer-motion, lucide-react, @mortar/core, radix-ui (+17 more)

### Community 45 - "Getting Started"

Cohesion: 0.50 Nodes (4): Ask Mortar (Gemini Assistant), Getting Started, Run
Jev Locally, Test Database

### Community 46 - "devDependencies"

Cohesion: 0.18 Nodes (11): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+3 more)

### Community 47 - "types.ts"

Cohesion: 0.10 Nodes (26): FR-23: Ask Mortar Grounded Assistant,
canonicalSnapshot(), ctx, askBrain(), buildAskContext(), contentWords(),
coverage(), matchQuestion() (+18 more)

### Community 48 - "Canvas UI: 35 WebGL/WebGPU effects over live HTML"

Cohesion: 0.17 Nodes (20): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Glass Object (Three.js effect), html-in-canvas API, Scroll-Driven
Effects: Laser, Particle Scroll, Bend, Bottom Sheet Drawer Recipe, Interruptible
Motion: transitions for toggles, keyframes for entrances (+12 more)

### Community 49 - "react-router-dom"

Cohesion: 0.12 Nodes (16): App(), ScrollToTop(), frontend_src_globals,
getSystemTheme(), resolveTheme(), Theme, ThemeContext, ThemeContextValue (+8
more)

### Community 50 - "readSheetFile.test.ts"

Cohesion: 0.14 Nodes (16): DropZone(), accept(), clear(), readableSize(),
readSheetFile(), sheetKind(), SheetReadError, DEFAULTS (+8 more)

### Community 51 - "Snapshot"

Cohesion: 0.10 Nodes (18): row(), waiting(), SettingsPage(), defaultData(),
mocks, provisionalEvent(), SNAP, CASES (+10 more)

### Community 52 - "Security, Secrets And Privacy"

Cohesion: 0.25 Nodes (8): Open Questions, Data Retention, Profile Sessions And
Shared Configuration, Secret Management, Security, Secrets And Privacy,
Statutory Compliance: PDPA, Cloud Run Rollout (asia-southeast1, min 0 / max 2),
Runtime Secrets (DATABASE_URL, TYPESAFE_API_KEY, GEMINI_API_KEY)

### Community 53 - "User Stories Per Screen"

Cohesion: 0.25 Nodes (8): Add Bookings (`/import`) And Site Shell, Bookings
(`/bookings`), Case Page (`/bookings/:id`), Forecast (`/forecast`), Legal
(`/legal`), Settings And Administration (`/settings`), Today (`/chase`), User
Stories Per Screen

### Community 54 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 55 - "RecordUpdateForm.tsx"

Cohesion: 0.05 Nodes (68): Gotchas, AddBookingDialog(), EMPTY_FORM, FORM_FIELDS,
FormState, localIsoDate(), pad(), ApplicationsCard() (+60 more)

### Community 56 - "RecordUpdateForm.test.tsx"

Cohesion: 0.12 Nodes (6): PopoverState, BOOKING, CREST, MALAYAN, renderForm(),
summary()

### Community 57 - "speak.py"

Cohesion: 0.15 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 58 - "Forecast And Backtest Method"

Cohesion: 0.33 Nodes (6): Slide 11: The Forecast: Signed SPAs, Not Bookings,
Slide 12: The Backtest - And What It Does Not Prove, Backtest Validation,
Forecast And Backtest Method, Parameter Assumptions, Statistical Forecast

### Community 59 - "WaitingOn.test.tsx"

Cohesion: 0.25 Nodes (5): AWAITING_DOCUMENTS, BOOKING, RISK, WITH_BANK,
NextActionSuggestion

### Community 60 - "cn"

Cohesion: 0.11 Nodes (25): UnitAutocompleteInput(), CardFooter, DrawerContent,
DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle
(+17 more)

### Community 61 - "frontend/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+1 more)

### Community 62 - "precompute.ts"

Cohesion: 0.05 Nodes (46): PLAYBOOKS, STORIES, packages_core_src_index_casedata,
packages_core_src_index_jevcacheentry,
packages_core_src_index_proposalfromextraction,
packages_core_src_index_reference_date, packages_core_src_index_searchplaybooks,
packages_core_src_index_simnow (+38 more)

### Community 63 - "components.json"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 64 - "compilerOptions"

Cohesion: 0.14 Nodes (13): compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module,
moduleResolution, noEmit (+5 more)

### Community 65 - "TrackTimelines.tsx"

Cohesion: 0.16 Nodes (13): EvidenceLog(), EVENT_KIND_LABELS, displayNote(),
DOTS, TrackColumn(), TrackTimelines(), EVIDENCE_LABELS, EVIDENCE_TONES (+5 more)

### Community 66 - "Andrej Karpathy Skills"

Cohesion: 0.33 Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3.
Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 67 - "integration.test.ts"

Cohesion: 0.08 Nodes (34): packages_core_src_index_jevcache,
packages_core_src_index_jevkind, packages_core_src_index_message,
packages_core_src_index_scoreanswer, JevCache, JevKind, jevInputHash(),
sortKeys() (+26 more)

### Community 68 - "test_assemble.py"

Cohesion: 0.24 Nodes (10): AssembleMuxTests, AssemblePictureTests,
color_video(), ff(), probe_duration(), CompletedProcess, Path, slide_png() (+2
more)

### Community 69 - "UI Triage: The Signed-In App"

Cohesion: 0.16 Nodes (18): transitions.dev: UI transitions for AI agents,
better-writing Skill, MotionSites Prompt Format: exact tokens and acceptance
views, R7, the Dissenting Expert, UI Triage: The Signed-In App, Copy Rules: the
drop and write table, Density Budget, The Desk Lens Becomes a Preset, Not a
Banner (+10 more)

### Community 70 - "BookingsPage.test.tsx"

Cohesion: 0.11 Nodes (8): generated, mocks, SNAP, StubReader,
buildFreshDisbursedSnapshot(), buildLargeSnapshot(), exportMocks,
packages_core_src_index_default_seed

### Community 71 - "banks.test.ts"

Cohesion: 0.19 Nodes (11): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+3 more)

### Community 73 - "ManagerCases.tsx"

Cohesion: 0.21 Nodes (20): Repository Layout, TaskCell(), WaitingOnPanel(),
waitingOnTask(), nextStepFor(), stepToTask(), ManagerCase(), ManagerCases() (+12
more)

### Community 74 - "Mortar Demo Recorder"

Cohesion: 0.19 Nodes (16): AI Boundary: Suggests, Checks, Summarises; People
Decide, Survey Limitations, 12 Weeks, No New CRM, No Consultant, No Vendor, One
Number Readable Within One Quarter, Chatterbox Requirements with Pinned Upstream
Commits, resemble-perth Pinned Commit and setuptools<81, Narration Script: beat,
offset_ms, text, Beat Offset Discipline (+8 more)

### Community 75 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.11 Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+11 more)

### Community 76 - "CaseSummary"

Cohesion: 0.14 Nodes (15): FR-15: SPA Execution Desk, buildClosedExportRows(),
ClosedExportRow, closedOnDate(), CLOSING_KIND, downloadClosedExport(),
exportBank(), header() (+7 more)

### Community 77 - "AddBookingDialog.test.tsx"

Cohesion: 0.16 Nodes (9): choose(), DEFAULTS, fillRequiredFields(), label(),
navigateMock, pickBookingDate(), PROJECTS, SheetDefaults (+1 more)

### Community 78 - "Keep It Current"

Cohesion: 0.26 Nodes (13): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+5 more)

### Community 80 - "Mortar Notes For Agents"

Cohesion: 0.40 Nodes (4): Conventions, Docs, Mortar Notes For Agents, Recipe:
Add Shared Domain Types Or Logic

### Community 81 - "core/package.json"

Cohesion: 0.12 Nodes (15): dependencies, minisearch, devDependencies,
typescript, vitest, exports, typescript, vitest (+7 more)

### Community 82 - "Jakub Krehel's Interface Skills"

Cohesion: 0.18 Nodes (17): Jakub Krehel's Interface Skills, better-accessibility
Skill: reduced motion, zoom, autoplay, better-colors Skill, better-interface
Skill: orchestrated review, better-typography Skill, better-ui Skill: surfaces,
icons, motion values, break Skill, Concentric Radius: outer equals inner plus
padding (+9 more)

### Community 83 - "Functional Requirements"

Cohesion: 0.10 Nodes (20): FR-10: Transparent Assumptions And Browser
Re-Simulation, FR-11: Database Persistence And Demo Data Management, FR-12:
High-Availability Offline Jev Fallback, FR-13: Add Bookings Intake And
Validation, FR-14: Persona Navigation And Page Routing, FR-16: Leakage Analysis
And Recovery Sizing, FR-17: Waiting On Party, Quick View Side Sheet, And Next
Move, FR-18: Jev Through A Local Model Proxy (+12 more)

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

Cohesion: 0.13 Nodes (20): FR-6: TypeSafe Jev Structured Message Extraction,
FR-7: Next Action, Playbook Fit, And Buyer Signals Scoring, Fan-Out Job
Specifications, BALL_HOLDERS, MOVE_OWNER, CaseNextStep, CreateTaskPayload,
jevStep() (+12 more)

### Community 89 - "record.mjs"

Cohesion: 0.05 Nodes (35): ref_node_assert, ref_node_fs, ref_node_module,
ref_node_os, ref_node_test, ref_node_url, auditCapture(), REQUIRED_BEATS (+27
more)

### Community 90 - "Perch Landing Teardown"

Cohesion: 0.11 Nodes (27): Peel Effect, Jakub Antalik Portfolio Study,
libraries.dev: UI libraries for AI agents, LQIP Placeholder Behind Video Tiles,
Restraint: one signature interaction, Thinking Orbs, better-layout Skill, WCAG
2.2.2 Autoplay Pause Requirement (+19 more)

### Community 91 - "What Mortar Does"

Cohesion: 0.25 Nodes (8): Ask Panel, Ask Mortar, Centralized Case Workspace,
Core Operational Capabilities, High-Density Ledger Design, The Shared Side
Sheet, Waiting On, What Mortar Does

### Community 92 - "ChaseCard.test.tsx"

Cohesion: 0.28 Nodes (3): booking(), jevMove(), renderCard()

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

### Community 104 - "AddMessageForm.tsx"

Cohesion: 0.22 Nodes (13): AddMessageForm(), defaultName(), normalTime(), ROLES,
timeNow(), DOCUMENT_LABELS, EXTRACTED_EVENT_LABELS, NEXT_ACTION_LABELS (+5 more)

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

Cohesion: 0.09 Nodes (25): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
addDays(), DOCUMENT_LABELS, documentStepLabel(), dueOnForUrgency() (+17 more)

### Community 110 - "core/src/index.ts"

Cohesion: 0.11 Nodes (16): SignalsPanel(), TasksPanel(), SIGNALS, OwnerBadge(),
band(), SignalChips(), META, ChaseTasks() (+8 more)

### Community 111 - "TourProvider.tsx"

Cohesion: 0.14 Nodes (16): frontend_src_lib_persona_persona, PERSONAS, Rect,
Spotlight(), resolveRoute(), Harness(), mocks, TourContext (+8 more)

### Community 112 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 113 - "Colour"

Cohesion: 0.50 Nodes (5): Colour, Landing Panel Tokens, Primitives Summary,
Semantic Colour, Status Tones

### Community 114 - "DirectTableImport.tsx"

Cohesion: 0.23 Nodes (10): DirectTableImport(), Entry, fakeBuyer(), newEntry(),
rowId(), salesProfiles, importBookings(), isUnitInRange() (+2 more)

### Community 115 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 116 - "BookingDetailPage.test.tsx"

Cohesion: 0.18 Nodes (5): RecordUpdateForm(), fetchSnapshot(),
postApplication(), postEvent(), SnapshotProvider()

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

### Community 123 - "BookingsPage.tsx"

Cohesion: 0.11 Nodes (20): BookingPipelineFlow(), BookingPipelineFlowProps,
PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId,
StepConfig, STEPS (+12 more)

### Community 124 - "TaskCell.test.tsx"

Cohesion: 0.25 Nodes (4): BOOKING, RISK, SUMMARY, TASK

### Community 125 - "json"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 126 - "Assumptions And Constraints"

Cohesion: 0.33 Nodes (6): Slide 16: Simulated Data, By Design, Assumptions And
Constraints, Empirical Grounding Table, Operational Constraints, Statutory And
Legal Constraints, Synthetic Data Guarantee

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

### Community 133 - "bookingLine"

Cohesion: 0.47 Nodes (6): bookingLine(), caseDetail(), day(), eventLine(),
messageBlock(), rm()

### Community 134 - "forecast/forecast.ts"

Cohesion: 0.17 Nodes (12): addDays(), datasetFor(), SOURCE_TAG_LABELS,
SOURCE_TAG_TONES, ForecastPage(), packages_core_src_index_assumption,
packages_core_src_index_dataset, packages_core_src_index_generate (+4 more)

### Community 135 - "vite.config.ts"

Cohesion: 0.40 Nodes (4): ref_path, @tailwindcss/vite, vite,
@vitejs/plugin-react

### Community 136 - "Who Uses Mortar"

Cohesion: 0.40 Nodes (5): Legal Operations, Loan Administration, Persona
Comparison, Sales Administration, Who Uses Mortar

### Community 137 - "Data Model And Schema"

Cohesion: 0.50 Nodes (4): Data Model And Schema, Event Model And Evidence
Lifecycle, Table Definitions, evidence()

### Community 138 - "GitHub Issues And Pull Requests"

Cohesion: 0.50 Nodes (3): Before Opening A Pull Request, Before Opening An
Issue, GitHub Issues And Pull Requests

### Community 139 - "Spacing, Radius And Elevation"

Cohesion: 0.50 Nodes (4): Elevation And Focus, Radius Tokens, Spacing, Radius
And Elevation, Spacing Scale

### Community 140 - "Testing Strategy"

Cohesion: 0.50 Nodes (4): Service And Integration Tests, Testing Strategy, Unit
And Determinism Tests, User Interface Verification

### Community 170 - "frontend/package.json"

Cohesion: 0.09 Nodes (21): @mortar/core, typescript, vitest, license, name,
private, type, clsx (+13 more)

### Community 171 - "ref_vitest"

Cohesion: 0.08 Nodes (5): LEAKAGE, LandingPage(), SNAP, @testing-library/react,
ref_vitest

## Knowledge Gaps

- **844 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+839 more) These have ≤1 connection - possible missing edges
  or undocumented components. (Counts symbols only; 1208 node(s) total have ≤1
  connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Technical Requirements Document: Mortar` connect
  `Technical Requirements Document: Mortar` to `Deploy Prototype Workflow`,
  `CaseEvent`, `sim.ts`, `Data Model And Schema`, `ManagerCases.tsx`,
  `Testing Strategy`, `Security, Secrets And Privacy`,
  `Forecast And Backtest Method`, `docs/README.md`?** _High betweenness
  centrality (0.125) - this node is a cross-community bridge._
- **Why does `API Reference` connect `CaseEvent` to `core/src/index.ts`,
  `db/index.ts`, `Snapshot`, `Technical Requirements Document: Mortar`,
  `WaitingOn.test.tsx`?** _High betweenness centrality (0.094) - this node is a
  cross-community bridge._
- **Why does `Problem Statement: Chin Hin Group, YEI 3.0 Kabel DXP` connect
  `docs/README.md` to `Perch Sign-In Teardown`, `Mortar Demo Recorder`,
  `UI Triage: The Signed-In App`?** _High betweenness centrality (0.067) - this
  node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _844 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `questions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10252100840336134 - nodes in this community are weakly
  interconnected._
- **Should `CaseEvent` be split into smaller, more focused modules?** _Cohesion
  score 0.04472049689440994 - nodes in this community are weakly
  interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04717853839037928 - nodes in this community are weakly
  interconnected._
