# Graph Report - . (2026-09-27)

## Corpus Check

- 343 files · ~273,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 2662 nodes · 6248 edges · 175 communities (143 shown, 32 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 226 edges
  (avg confidence: 0.78)
- Token cost: 48,330 input · 5,370 output

## Community Hubs (Navigation)

- Search And Core Dependencies
- Evidence And Chart UI
- Booking Risk And Import Tests
- Core Domain Types
- Root Lint Dependencies
- Forecast And Dataset Selection
- Loan Application Cards
- Sheet Import And Page Shell
- Document And Event Labels
- Product Overview And Brief
- Booking Sheet Reader
- Booking Validation And App Options
- Case Facts And Stage Rules
- Synthetic Data Generator
- Agent Rules And Workflows
- Database Schema And Playbooks
- Canvas UI And Icon Research
- Gemini Client And Guardrails
- Pitch Deck And Requirements Gotchas
- Booking Pipeline Table
- Stage Tracker And Chase Card
- Ask Mortar Gotchas
- Direct Table Import
- Legal Queue And Sorting
- Persona Routing
- Message Entry And Filters
- Landing Page Moments
- Feature Ideas
- Evidence Pills And Risk Chips
- Ask Mortar Panel
- Sidebar Navigation
- Jev Proxy Client Errors
- Assistant Tool Tests
- Case Workspace Concepts
- Perch Teardown
- Simulation CLI And Reset
- Assistant Service Tests
- Forecast Leakage Model
- Ask Mortar Tools
- Add Booking Dialog
- Messages Panel And Jev Proposals
- Anthropic Proxy Responses
- Jev Package Manifest
- Server Package Manifest
- Frontend UI Dependencies
- Markdown Style And Agent Notes
- Frontend Dev Dependencies
- App Layout And Ask Trigger
- Motion And Video Recipes
- Theme And Scroll Restoration
- Footer And Brand Mark
- Chase Page Fixtures
- Company Brain Research
- Pitch Deck Slides
- Date Field And Calendar
- Record Update Form
- Jev Service Interface
- Chatterbox TTS Renderer
- Routing And Forecast Gotchas
- Chase Next Step Rules
- Persona Switcher
- Frontend TS Config
- Jev Precompute Script
- shadcn Components Config
- Root TS Config
- Demo Proof Harness
- Agent Skills Rules
- Jev Jobs And Scoring
- Assemble Mux Tests
- UI Triage And Antalik
- Playbooks Panel Tests
- Bank Stall Tests
- Route Inventory
- Functional Requirements
- Pilot And Problem Statement
- Booking Filters
- Closed Deals Export
- Add Booking Tests
- Jev Input Hashing
- Batch Speech Tests
- File Map And Structure
- Next Step And Build Notes
- Krehel Interface Skills
- Waiting On Rules
- Notifications Store
- Design Specification
- Execution Rules And Test Gotchas
- Frontend Package Manifest
- Ball Holders And Next Step
- Motion Helpers
- Motion Porting And LQIP
- Messages Panel Tests
- Record Update Tests
- Narration Tests
- Database Schema SQL
- Booking Template Generator
- Jev Caches
- Jev TS Config
- Persona Persistence
- Radix Popover Gotchas
- Acceptance Criteria
- Chase Card Tests
- Error Boundary
- Legal Page Tests
- Date Utilities
- Proxy Client Tests
- Server TS Config
- Subtitle Builder
- Icon And Card Surface Recipes
- Task Cell Tests
- Chase Task Grouping
- Drawer Component
- Forecast Page Tests
- Colour System
- Leakage Tests
- Prettier Config
- Slide Renderer
- Subtitle Layout Tests
- Financing Risk And Brief Fit
- Number Formatters
- Core TS Config
- Narration Scheduler
- Chase Route And Card
- Inline Popover
- Proof Tests
- Schedule Tests
- Case Summarization Requirements
- ESLint Config
- Narration Manifest Tests
- App Shell And Density
- Loading Overlay
- Assemble Script
- Manifest Builder
- Dependency: date-fns
- Dependency: framer-motion
- Dependency: @mortar/core
- Dependency: radix-ui
- Dependency: @radix-ui/react-dialog
- Dependency: @radix-ui/react-separator
- Dependency: @radix-ui/react-slot
- Dependency: react-day-picker
- Dependency: react-router-dom
- Dependency: recharts
- Dependency: tailwind-merge
- Dependency: tailwindcss-animate
- Dependency: vaul
- Narrate Script
- Walk Contract Tests
- Documents Routing Table
- Product Requirements Document Link
- Product Overview Link
- Technical Requirements Document Link
- Responsive Grid Gotcha
- Technical Risks
- Draft PR Rule

## God Nodes (most connected - your core abstractions)

1. `cn()` - 124 edges
2. `Booking` - 53 edges
3. `CaseEvent` - 52 edges
4. `createApp()` - 46 edges
5. `Button` - 43 edges
6. `CaseSummary` - 43 edges
7. `Database` - 37 edges
8. `usePersona()` - 35 edges
9. `formatDate()` - 33 edges
10. `FakeDb` - 33 edges

## Surprising Connections (you probably didn't know these)

- `Secret Management` --semantically_similar_to-->
  `Runtime Secrets (DATABASE_URL, TYPESAFE_API_KEY, GEMINI_API_KEY)` [INFERRED]
  [semantically similar] docs/TRD.md → .github/workflows/deploy.yml
- `failingClient()` --indirect_call--> `request()` [INFERRED]
  packages/jev/src/service.test.ts → frontend/src/lib/api.ts
- `fakeClient()` --indirect_call--> `request()` [INFERRED]
  packages/jev/src/service.test.ts → frontend/src/lib/api.ts
- `warmProduction()` --indirect_call--> `error()` [INFERRED]
  scripts/demo/warmup.mjs → server/src/util.ts
- `GEMINI.md Includes AGENTS.md` --semantically_similar_to-->
  `CLAUDE.md Includes AGENTS.md` [INFERRED] [semantically similar] GEMINI.md →
  CLAUDE.md

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
- **Three Personas, One Shared Case Record** — agents_sales_admin,
  agents_loan_admin, agents_legal_admin, docs_product_case_workspace,
  docs_trd_table_events, docs_product_parallel_tracks [EXTRACTED 1.00]
- **The AI / Human Decision Boundary** — docs_product_jev,
  docs_product_ask_mortar, docs_product_ai_human_boundary,
  docs_prd_human_in_the_loop, docs_trd_event_model, docs_cb_ai_people_decide,
  docs_trd_financing_risk_method [EXTRACTED 1.00]
- **Agent Operating Rules (Graph First, RTK Prefix, Test Before Done)** —
  agents_agent_rules, docs_agents_rtk_golden_rule,
  docs_agents_think_before_coding, docs_agents_goal_driven_execution,
  docs_agents_read_before_writing [EXTRACTED 1.00]
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

## Communities (175 total, 32 thin omitted)

### Community 0 - "Search And Core Dependencies"

Cohesion: 0.11 Nodes (25): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+17 more)

### Community 1 - "Evidence And Chart UI"

Cohesion: 0.11 Nodes (34): SOURCE_LABELS, TRACK_LABELS, formatPercent(),
formatRmCompact(), ChartTooltipContent(), ChartTooltipContentProps,
TooltipEntry, AssumptionsCard() (+26 more)

### Community 2 - "Booking Risk And Import Tests"

Cohesion: 0.17 Nodes (17): ApiError, askAssistant(), AssistantAnswer,
AssistantImage, extractMessage(), fetchHealth(), fetchNextAction(),
fetchPlaybooks() (+9 more)

### Community 3 - "Core Domain Types"

Cohesion: 0.05 Nodes (6): CaseEvent, EvidenceStatus, IsoDateTime, Message,
Database, FakeDb

### Community 4 - "Root Lint Dependencies"

Cohesion: 0.04 Nodes (45): concurrently, eslint, eslint-config-prettier,
@eslint/js, eslint-plugin-react-hooks, globals, husky, lint-staged (+37 more)

### Community 5 - "Forecast And Dataset Selection"

Cohesion: 0.12 Nodes (14): BallHolder, listOf(), canonicalSnapshot(), STORIES,
backtest(), DOCUMENT_LABELS, STAGE_RANK, data (+6 more)

### Community 6 - "Loan Application Cards"

Cohesion: 0.08 Nodes (33): blockerQuery(), FIT_PRESENTATION, PlaybooksPanel(),
Ranked, STATUS_BADGES, JevTag(), pill(), OwnerBadge() (+25 more)

### Community 7 - "Sheet Import And Page Shell"

Cohesion: 0.16 Nodes (15): BookingFilter, BookingFilters(), BookingFiltersProps,
RISKS, View, ACTIVE_STAGES, CLOSED_STAGES, FILTER (+7 more)

### Community 8 - "Document And Event Labels"

Cohesion: 0.13 Nodes (20): APPLICATION_STATUS_LABELS, DOCUMENT_LABELS,
EVENT_KIND_LABELS, EXTRACTED_EVENT_LABELS, formatDateTime(), NEXT_ACTION_LABELS,
SENDER_ROLE_LABELS, certainty() (+12 more)

### Community 9 - "Product Overview And Brief"

Cohesion: 0.07 Nodes (41): Property Booking Conversion Intelligence (Challenge
Title), YEI 3.0 Competition And Rounds, Constraints (12 Weeks, No New CRM, No
Authority), The Brief's Deliverables, Mapped, Your Mission (Seven Deliverables),
Mortar Brief, The Challenge In Plain Terms, The Practitioner Interview Template
(+33 more)

### Community 10 - "Booking Sheet Reader"

Cohesion: 0.14 Nodes (27): ageOn(), checkBookingDraft(), DateOrder,
detectDateOrder(), EXCEL_EPOCH, findHeader(), HEADER_NAMES, headerCandidates()
(+19 more)

### Community 11 - "Booking Validation And App Options"

Cohesion: 0.13 Nodes (34): Language, AppOptions, caseRuleProblem(),
cleanDraft(), confirmProblem(), createApp(), DOCUMENT_KINDS, EVENT_KINDS (+26
more)

### Community 12 - "Case Facts And Stage Rules"

Cohesion: 0.11 Nodes (25): EvidenceLog(), EVENTS, a(), ApplicationFacts,
appointmentDay(), byOccurred(), CaseDataInput, CaseFacts (+17 more)

### Community 13 - "Synthetic Data Generator"

Cohesion: 0.10 Nodes (32): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL,
drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+24 more)

### Community 14 - "Agent Rules And Workflows"

Cohesion: 0.06 Nodes (36): Agent Rules, Bun Workspaces, frontend (React 19 +
Vite + Tailwind 4 + shadcn/ui), GitHub Issues And Pull Requests Agent Guide,
Graphify Agent Guide, Andrej Karpathy Skills Agent Guide, Markdown Style Guide,
Mortar (+28 more)

### Community 15 - "Database Schema And Playbooks"

Cohesion: 0.15 Nodes (25): Playbook, SimulationMeta, createDatabase(),
isoDate(), isoDateTime(), jsonb(), maskDigits(), Row (+17 more)

### Community 16 - "Canvas UI And Icon Research"

Cohesion: 0.11 Nodes (32): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Design the Fallback First, html-in-canvas API, Peel Effect, Canvas
UI shadcn Registry Install, Hugeicons by Halal Lab (+24 more)

### Community 17 - "Gemini Client And Guardrails"

Cohesion: 0.09 Nodes (25): Persona, callGemini(), GeminiContent,
GeminiFunctionCall, GeminiOptions, GeminiPart, GeminiResponse, isAbort() (+17
more)

### Community 18 - "Pitch Deck And Requirements Gotchas"

Cohesion: 0.09 Nodes (30): Gotcha: No Data Masking, Gotcha: Persona Pages Drive
The Sidebar And Route Guard, Slide 07: Evidence With A Name On It, Slide 09: Jev
Reads The Message. A Person Confirms It., Slide 16: Simulated Data, By Design,
Open Questions, Operational Constraints, Statutory And Legal Constraints (+22
more)

### Community 19 - "Booking Pipeline Table"

Cohesion: 0.08 Nodes (37): BookingPipelineFlow(), BookingPipelineFlowProps,
PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId,
StepConfig, STEPS (+29 more)

### Community 20 - "Stage Tracker And Chase Card"

Cohesion: 0.09 Nodes (38): BookingsTable(), PILL_STAGES, Sort, SortKey, WIDTHS,
CaseHeader(), CaseQuickView(), progressFromKinds() (+30 more)

### Community 21 - "Ask Mortar Gotchas"

Cohesion: 0.12 Nodes (19): Gotcha: JEV_PROXY_MODEL Falls Back On ||, Not ??,
FR-12 High-Availability Offline Jev Fallback, FR-18 Jev Through A Local Model
Proxy, FR-6 TypeSafe Jev Structured Message Extraction, FR-7 Next Action,
Playbook Fit And Buyer Signals Scoring, Non-Functional Requirements:
Performance, Non-Functional Requirements: Reliability And Resilience, Automated
Action Preference Finding (+11 more)

### Community 22 - "Direct Table Import"

Cohesion: 0.14 Nodes (17): createEmptyRow(), DirectTableImport(),
generateMockIc(), ProjectSettingsCard(), DEFAULT_PROJECT_SETTINGS,
DEFAULT_UNIT_MODELS, formatUnitRangeDescription(),
generateProjectInventoryUnits() (+9 more)

### Community 23 - "Legal Queue And Sorting"

Cohesion: 0.12 Nodes (25): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, legalQueue(), LegalSortKey, median(), sortLegalRows() (+17
more)

### Community 24 - "Persona Routing"

Cohesion: 0.23 Nodes (8): readSheetFile(), sheetKind(), SheetReadError,
DEFAULTS, FIXTURE, TEMPLATE, ImportPage(), parseCsv()

### Community 25 - "Message Entry And Filters"

Cohesion: 0.07 Nodes (54): react, EMPTY_FORM, FORM_FIELDS, FormState,
AddMessageForm(), defaultName(), normalTime(), ROLES (+46 more)

### Community 26 - "Landing Page Moments"

Cohesion: 0.11 Nodes (14): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+6 more)

### Community 27 - "Feature Ideas"

Cohesion: 0.14 Nodes (24): Feature Ideas: written up but not built, 48-Hour
Clean Exit, Advisory-Only Financing Flag That Never Blocks a Booking, Early
Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time
Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages
Ruling (+16 more)

### Community 28 - "Evidence Pills And Risk Chips"

Cohesion: 0.38 Nodes (5): EVIDENCE_LABELS, EVIDENCE_TONES, EvidencePill(),
EvidenceState, CASES

### Community 29 - "Ask Mortar Panel"

Cohesion: 0.18 Nodes (4): generated, mocks, SNAP, StubReader

### Community 30 - "Sidebar Navigation"

Cohesion: 0.05 Nodes (36): HomeRedirect(), AskTrigger(), mocks, RISK,
AppLayout(), AppLayoutProps, AppNav(), Crumb (+28 more)

### Community 31 - "Jev Proxy Client Errors"

Cohesion: 0.09 Nodes (15): BookingDraft, EventSettledError, ImportBatch,
ImportMovedOnError, OpenApplicationError, UnitHeldError, APPLICATION, BOOKING
(+7 more)

### Community 33 - "Case Workspace Concepts"

Cohesion: 0.15 Nodes (16): Gotcha: Keyword Score Alone Does Not Gate A Question,
Gotcha: One Next Step Per Case (nextStep.ts), Booking-To-SPA Workspace Platform
Concept, Recommendation (Case Record, Staff Knowledge, Owned Actions), Turning
Staff Experience Into Reusable Knowledge, Slide 14: Playbooks: Staff Experience,
Reviewed, FR-20 Message Timing And Buyer Response Explanation, Staff Playbooks
(+8 more)

### Community 34 - "Perch Teardown"

Cohesion: 0.12 Nodes (24): explain-interface Skill, Figma Pairing: Newsreader
display + Geist UI, Perch Sign-In Teardown, Authored Disabled States, Perch Fake
Auth Flow: no session, no guard, isJoiner Entry-Path Check, Porting Plan: the
persona folds into the guest button, Perch Storage Keys: perch.trip.v1,
perch.theme.v1, perch.voter.v1 (+16 more)

### Community 35 - "Simulation CLI And Reset"

Cohesion: 0.10 Nodes (20): proposalFromExtraction(), simNow(), JevService, sql,
applySchema(), JEV_CACHE_PATH, readJevCacheEntries(), resetDatabase() (+12 more)

### Community 36 - "Assistant Service Tests"

Cohesion: 0.09 Nodes (16): CaseData, App, APPLICATIONS, ask(), BOOKING, EVENTS,
fakeJev(), makeApp() (+8 more)

### Community 37 - "Forecast Leakage Model"

Cohesion: 0.10 Nodes (31): groupBy(), backtest(), bucketOf(), buildModel(),
CALIBRATION_BUCKETS, factsFor(), forecast(), leftAge() (+23 more)

### Community 38 - "Ask Mortar Tools"

Cohesion: 0.10 Nodes (28): EVENT_MAP, searchPlaybooks(), STATUS_RANK, PLAYBOOKS,
PlannedEvent, Track, bookingLine(), cap() (+20 more)

### Community 39 - "Add Booking Dialog"

Cohesion: 0.15 Nodes (18): assumptionValue(), DEFAULT_ASSUMPTIONS,
INCOME_DOCUMENTS, summarizeCases(), financingRisk(), computeFinancingRisk(),
financingRiskFor(), monthlyInstalment() (+10 more)

### Community 40 - "Messages Panel And Jev Proposals"

Cohesion: 0.15 Nodes (10): currentProposal(), MessagesPanel(), EXTRACTION,
MESSAGE, PROPOSAL, EXTRACTION, MESSAGE, PROPOSAL (+2 more)

### Community 41 - "Anthropic Proxy Responses"

Cohesion: 0.14 Nodes (16): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+8 more)

### Community 42 - "Jev Package Manifest"

Cohesion: 0.09 Nodes (21): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+13 more)

### Community 43 - "Server Package Manifest"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 44 - "Frontend UI Dependencies"

Cohesion: 0.10 Nodes (21): class-variance-authority, clsx, dependencies,
class-variance-authority, clsx, lucide-react, @radix-ui/react-dropdown-menu,
@radix-ui/react-label (+13 more)

### Community 45 - "Markdown Style And Agent Notes"

Cohesion: 0.09 Nodes (26): Mortar Notes For Agents, Slide 15: How It Is Built,
Markdown Style Guide, ATX-Style Headings And Unique Complete Names, Character
Line Limit, Code Spans And Codeblocks, Link Rules (Explicit Paths, Informative
Titles), Minimum Viable Documentation (+18 more)

### Community 46 - "Frontend Dev Dependencies"

Cohesion: 0.10 Nodes (21): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+13 more)

### Community 47 - "App Layout And Ask Trigger"

Cohesion: 0.18 Nodes (17): ctx, satisfying(), askBrain(), buildAskContext(),
contentWords(), coverage(), matchQuestion(), questionIndex() (+9 more)

### Community 48 - "Motion And Video Recipes"

Cohesion: 0.22 Nodes (15): Glass Object (Three.js effect), Scroll-Driven
Effects: Laser, Particle Scroll, Bend, Bottom Sheet Drawer Recipe, Interruptible
Motion: transitions for toggles, keyframes for entrances, Staged Entrances:
100ms block stagger, 80ms per word, MotionSites: cinematic landing page prompts,
MotionSites Academy Lessons, data-enter Entrance State Machine (+7 more)

### Community 49 - "Theme And Scroll Restoration"

Cohesion: 0.09 Nodes (14): App(), AppErrorBoundary, isChunkLoadError(),
ScrollToTop(), ThemeToggle(), getSystemTheme(), resolveTheme(), Theme (+6 more)

### Community 50 - "Footer And Brand Mark"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 51 - "Chase Page Fixtures"

Cohesion: 0.09 Nodes (17): LegalRow, appointment(), row(), waiting(),
defaultData(), mocks, provisionalEvent(), SNAP (+9 more)

### Community 52 - "Company Brain Research"

Cohesion: 0.11 Nodes (26): Where AI Helps, And Where People Decide, What Central
Means Here, Cognee (Apache-2.0), A Company Brain For Booking-To-SPA Conversion,
Dify (source-available, modified Apache), Docling (MIT code), Five Layers Of
Information, The Four Practical Questions (+18 more)

### Community 53 - "Pitch Deck Slides"

Cohesion: 0.10 Nodes (21): Slide 01 Cover: Booked Is Not Sold. Signed Is., Slide
20: Thank You (Booked Is Not Sold. Signed Is.), Core Objective (Single Source Of
Truth), Demo Script As Acceptance, FR-8 Statistical Conversion Forecasting,
Goals And Non-Goals, Honest Accounting Rule, Human In The Loop (+13 more)

### Community 54 - "Date Field And Calendar"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 55 - "Record Update Form"

Cohesion: 0.12 Nodes (27): AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED, CONFIRM,
DECIDED, DECISIONS, DOCUMENTS, GROUPS (+19 more)

### Community 56 - "Jev Service Interface"

Cohesion: 0.08 Nodes (15): JevCache, JevKind, JevMeta, createProxySystemOne(),
client(), colorQuestions, fakeFetch(), FakeResponse (+7 more)

### Community 57 - "Chatterbox TTS Renderer"

Cohesion: 0.21 Nodes (13): chatterbox_cache_path(), chatterbox_runtime(),
ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer, main(), Path,
Synthesize Mortar's demo narration with Kokoro or a cloned Chatterbox voice. Th
(+5 more)

### Community 58 - "Routing And Forecast Gotchas"

Cohesion: 0.14 Nodes (18): Gotcha: Both Halves Of /forecast Read One Log,
Gotchas, Gotcha: / Is The Landing, /app Is Persona-Relative, Gotcha: open Is Not
live, Slide 11: The Forecast: Signed SPAs, Not Bookings, Slide 12: The
Backtest - And What It Does Not Prove, FR-10 Transparent Assumptions And Browser
Re-Simulation, FR-9 Historical Forecast Backtesting (+10 more)

### Community 59 - "Chase Next Step Rules"

Cohesion: 0.14 Nodes (18): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
stepToTask(), actionIcon(), addDays(), blockerIcon() (+10 more)

### Community 60 - "Persona Switcher"

Cohesion: 0.21 Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem,
DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem,
DropdownMenuSeparator, DropdownMenuShortcut() (+3 more)

### Community 61 - "Frontend TS Config"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 62 - "Jev Precompute Script"

Cohesion: 0.12 Nodes (14): JevCacheEntry, cache, caseData, client,
CollectingCache, generated, jev, metered (+6 more)

### Community 63 - "shadcn Components Config"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 64 - "Root TS Config"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 65 - "Demo Proof Harness"

Cohesion: 0.15 Nodes (11): auditCapture(), REQUIRED_BEATS, BK_MESSAGES,
verifyCleanSeed(), beats, errors, filmed, OUT (+3 more)

### Community 66 - "Agent Skills Rules"

Cohesion: 0.13 Nodes (16): Andrej Karpathy Skills, pbakaus/impeccable, Karpathy
Guidelines Tradeoff, mattpocock/skills Collection, Agent Conventions, Gotcha:
bun run --filter '*' <script> Is How Root Scripts Fan Out, Gotcha: mock.module
Leaks Across The Rest Of A Bun Test Process, Rule: Simplicity First (+8 more)

### Community 67 - "Jev Jobs And Scoring"

Cohesion: 0.13 Nodes (21): ScoreAnswer, jevInputHash(), sortKeys(),
stableJson(), caseState(), defaultPlaybookQuery(), extractJob(), messageState()
(+13 more)

### Community 68 - "Assemble Mux Tests"

Cohesion: 0.27 Nodes (9): AssembleMuxTests, AssemblePictureTests, color_video(),
ff(), probe_duration(), CompletedProcess, Path, slide_png() (+1 more)

### Community 69 - "UI Triage And Antalik"

Cohesion: 0.19 Nodes (16): transitions.dev: UI transitions for AI agents, R7,
the Dissenting Expert, UI Triage: The Signed-In App, Copy Rules: the drop and
write table, Density Budget, The Desk Lens Becomes a Preset, Not a Banner, Three
Stacked Filter Systems With Disagreeing Numbers, Four-Phase Implementation Plan
(+8 more)

### Community 70 - "Playbooks Panel Tests"

Cohesion: 0.15 Nodes (11): RANKING, SNAPSHOT, buildSnapshot(), EXTRACTION_9001,
EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001 (+3 more)

### Community 71 - "Bank Stall Tests"

Cohesion: 0.18 Nodes (12): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+4 more)

### Community 72 - "Route Inventory"

Cohesion: 0.18 Nodes (14): Route /bookings (List), Route /forecast (Projected
Signings), Route /import (Add Bookings), Route /legal (SPA Execution Queue),
Gotcha: Imported Bookings Are Born booked, Dated To The Desks' Today, A Day In
Mortar (Persona Routing Table), Component: Booking Row And Table Header, FR-13
Add Bookings Intake And Validation (+6 more)

### Community 73 - "Functional Requirements"

Cohesion: 0.10 Nodes (22): The Case Page, FR-19 Record An Update, FR-1 Canonical
Simulation Dataset Generation, FR-4 Evidence Log And Multi-Party Event
Verification, Non-Functional Requirements: Data Integrity And Determinism,
Centralized Case Workspace (/bookings/:id), Loan And Legal Parallel Tracks,
Unknown Is Visible (10+ Days No Event) (+14 more)

### Community 74 - "Pilot And Problem Statement"

Cohesion: 0.21 Nodes (15): AI Boundary: Suggests, Checks, Summarises; People
Decide, 12 Weeks, No New CRM, No Consultant, No Vendor, One Number Readable
Within One Quarter, Chatterbox Requirements with Pinned Upstream Commits,
resemble-perth Pinned Commit and setuptools<81, Narration Script: beat,
offset_ms, text, Beat Offset Discipline, Mortar Demo Recorder (+7 more)

### Community 75 - "Booking Filters"

Cohesion: 0.29 Nodes (3): booking, riskLabel(), RiskLevel

### Community 76 - "Closed Deals Export"

Cohesion: 0.20 Nodes (9): buildClosedExportRows(), ClosedExportRow,
closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header(),
isoToDate() (+1 more)

### Community 77 - "Add Booking Tests"

Cohesion: 0.19 Nodes (7): choose(), DEFAULTS, fillRequiredFields(), label(),
navigateMock, pickBookingDate(), PROJECTS

### Community 78 - "Jev Input Hashing"

Cohesion: 0.18 Nodes (17): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+9 more)

### Community 80 - "File Map And Structure"

Cohesion: 0.19 Nodes (13): Recipe: Add Shared Domain Types Or Logic, Recipe: Add
A Route, Agent File Map, Project Structure, server/src/assistant/tools.ts
(Read-Only Tools), frontend/src/components/case/CaseQuickView.tsx,
frontend/src/lib/data.tsx (useSnapshot / useCases), packages/core/src/fixtures
(stories.ts, playbooks.ts) (+5 more)

### Community 81 - "Next Step And Build Notes"

Cohesion: 0.12 Nodes (16): minisearch, dependencies, minisearch,
devDependencies, typescript, vitest, exports, typescript (+8 more)

### Community 82 - "Krehel Interface Skills"

Cohesion: 0.12 Nodes (23): Why Hugeicons Fits, Its Hover Mixed Fill and Stroke
Conventions, Layered Card Surface: hairline ring and stacked shadow, Jakub
Krehel's Interface Skills, better-accessibility Skill: reduced motion, zoom,
autoplay, better-colors Skill, better-interface Skill: orchestrated review,
better-layout Skill (+15 more)

### Community 83 - "Waiting On Rules"

Cohesion: 0.15 Nodes (4): fetchSnapshot(), SnapshotProvider(),
buildFreshDisbursedSnapshot(), buildLargeSnapshot()

### Community 84 - "Notifications Store"

Cohesion: 0.19 Nodes (11): Notification, NotificationPopover(),
useNotifications(), BASE_STYLE, baseOptions, emit(), Listener, listeners (+3
more)

### Community 85 - "Design Specification"

Cohesion: 0.17 Nodes (12): Design Specification, Component: Button, Clean Card
Edges, Do List, Design: Mortar, Radius Tokens (6px Controls, No 999px Pills),
Sign-In Route (Bare), Spacing Scale (+4 more)

### Community 86 - "Execution Rules And Test Gotchas"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 87 - "Frontend Package Manifest"

Cohesion: 0.17 Nodes (11): license, name, private, scripts, build, dev, preview,
template:bookings (+3 more)

### Community 88 - "Ball Holders And Next Step"

Cohesion: 0.11 Nodes (18): BALL_HOLDER_ICONS, BALL_HOLDER_LABELS, BALL_HOLDERS,
MOVE_OWNER, CaseNextStep, CreateTaskPayload, jevStep(), nextStepFor() (+10 more)

### Community 89 - "Motion Helpers"

Cohesion: 0.30 Nodes (9): scrollDuration(), scrollTarget(), smoothScrollTo(),
film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink(), visible() (+1
more)

### Community 90 - "Motion Porting And LQIP"

Cohesion: 0.19 Nodes (14): Porting Its Hover Motion without React, LQIP
Placeholder Behind Video Tiles, Each Rule Has One Owner, Reduced Motion Kill
Switch: 0.01ms not none, WCAG 2.2.2 Autoplay Pause Requirement, Landing Video
Pipeline, The Agent's Video Checklist, Gemini Videos Composer at
gemini.google.com/videos (+6 more)

### Community 91 - "Messages Panel Tests"

Cohesion: 0.24 Nodes (10): Gotcha: Ask Mortar Calls Gemini With Five Read-Only
Tools, Gotcha: Focus The Sheet, Not Its First Control, Slide 19: What Comes
After The Prototype, Component: Ask Panel, FR-23 Ask Mortar Grounded Assistant,
Ask Mortar, Ask Mortar Five Read-Only Tools, Prototype Versus Production Roadmap
(+2 more)

### Community 92 - "Record Update Tests"

Cohesion: 0.20 Nodes (5): BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 93 - "Narration Tests"

Cohesion: 0.27 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 94 - "Database Schema SQL"

Cohesion: 0.29 Nodes (10): bookings, event_reviews, events, imports,
jev_answers, loan_applications, messages, meta (+2 more)

### Community 95 - "Booking Template Generator"

Cohesion: 0.13 Nodes (10): bookings, COLUMNS, date(), howTo, OUT, SAMPLES,
AddBookingDialog(), localIsoDate() (+2 more)

### Community 96 - "Jev Caches"

Cohesion: 0.28 Nodes (9): Fill In The Pull Request Template, Never Commit Real
Buyer Data, Show UI Changes With Screenshots, Data Check, Screenshots Or
Recording, Pull Request Template, Screenshots, What Changed (+1 more)

### Community 97 - "Jev TS Config"

Cohesion: 0.20 Nodes (9): compilerOptions, types, extends, include, src/**/*.ts,
../../tsconfig.json, vitest.config.ts, node (+1 more)

### Community 98 - "Persona Persistence"

Cohesion: 0.28 Nodes (9): Legal Admin Persona, Loan Admin Persona, Persona
Persistence (mortar.persona localStorage Key), Sales Admin Persona, Gotcha:
localStorage Access Is Always Wrapped In try/catch, Team Contribution And
Receipt Table, Slide 05: One Shared Case Record, Slide 06: Three Desks, One Book
(+1 more)

### Community 99 - "Radix Popover Gotchas"

Cohesion: 0.25 Nodes (9): Gotcha: Radix Popovers Need z-[80] To Clear A Dialog,
Gotcha: Radix Popover Stalls jsdom, Do Not List, Component: Drop Zone, Mortar
Design System In Figma, Icons (Lucide, 16px, Stroke 2), Motion Tokens And
Reduced Motion, Native Controls Ban (+1 more)

### Community 100 - "Acceptance Criteria"

Cohesion: 0.25 Nodes (9): Acceptance: Fourteen Criteria, Data Formats (RM,
Tabular Numerals), Elevation And Focus (2px Ring, 2px Offset), Footer (Only /
And /faq), Landing Page, Single Primary Action Rule, Text Case (Title Case With
Sentence-Case Carve-Out), Typeface (Geist And Geist Mono) (+1 more)

### Community 101 - "Chase Card Tests"

Cohesion: 0.25 Nodes (9): Follow The Design Guide And Shared UI Components, Keep
AI Agents On Task, One Problem Per Issue, One Thing Per Pull Request, Point
Agents At The Rules, Read The Diff Before Committing, Update The Docs In The
Same Pull Request, Working With AI Coding Agents (+1 more)

### Community 102 - "Error Boundary"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 103 - "Legal Page Tests"

Cohesion: 0.40 Nodes (6): Slide 02: The Launch That Looked Like A Win, Generated
Art (art-_.webp), Art Prompt Convention, Deck Assets Manifest, Product
Screenshots (shot-_.webp), Mortar Pitch Deck

### Community 104 - "Date Utilities"

Cohesion: 0.50 Nodes (8): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), toEpoch(), workDaysBetween(), workDayOffset()

### Community 105 - "Proxy Client Tests"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 106 - "Server TS Config"

Cohesion: 0.22 Nodes (8): bun-types, db/**/\*.ts, compilerOptions, types,
extends, include, src/**/*.ts, ../tsconfig.json

### Community 107 - "Subtitle Builder"

Cohesion: 0.33 Nodes (8): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration uses,, Split into lines of similar
length, never mid-word. Two things depend on th, Group wrapped lines into cards
of at most MAX_LINES., ts(), wav_ms(), wrap()

### Community 109 - "Task Cell Tests"

Cohesion: 0.10 Nodes (17): BookingRow, BOOKING, RISK, SUMMARY, TASK, NextStep,
OWNER_ROLE_LABELS, Glyph() (+9 more)

### Community 110 - "Chase Task Grouping"

Cohesion: 0.13 Nodes (16): ApplicationsCard(), STATUS_TONES, SignalsPanel(),
TasksPanel(), SIGNALS, groupTasks(), ROLE_ORDER, AppErrorBoundaryProps (+8 more)

### Community 111 - "Drawer Component"

Cohesion: 0.25 Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(),
DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 112 - "Forecast Page Tests"

Cohesion: 0.67 Nodes (3): RTK Golden Rule (Always Prefix Commands), RTK (Rust
Token Killer) Guide, Token Savings By Workflow Category

### Community 113 - "Colour System"

Cohesion: 0.29 Nodes (7): Colour System, Landing Panel Tokens (Single Sanctioned
Gradient), Plain Language Rule, Colour Primitives, Semantic Colour Tokens,
Status Language (Booked / With Bank / On Track / Watch / At Risk / SPA Signed),
Six Status Tones

### Community 115 - "Prettier Config"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 116 - "Slide Renderer"

Cohesion: 0.29 Nodes (6): failures, HERE, page, rawSlides, require, SLIDES

### Community 117 - "Subtitle Layout Tests"

Cohesion: 0.38 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 118 - "Financing Risk And Brief Fit"

Cohesion: 0.33 Nodes (6): How Mortar Answers The Brief (Not A Screening Tool),
Slide 13: The Financing Risk Flag, FR-3 Deterministic Financing Risk
Calculation, Debt Service Ratio Formula, Financing-Risk Method (financingRisk),
Risk Categorization (DSR 40% / 35% Thresholds)

### Community 119 - "Number Formatters"

Cohesion: 0.40 Nodes (4): currencyFormatter, formatCurrency(),
formatTooltipCurrency(), numberFormatter

### Community 120 - "Core TS Config"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 121 - "Narration Scheduler"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A be, Push starts later
so no line is still speaking when the next begins. Pure s

### Community 122 - "Chase Route And Card"

Cohesion: 0.50 Nodes (5): Route /chase (Today), Slide 08: The Chase List: What
To Do Today, Component: Chase Card, FR-5 Today Desk And Task Management, Nurul
Aina (Sales Admin Representative)

### Community 125 - "Schedule Tests"

Cohesion: 0.60 Nodes (3): NarrationScheduleTests, Path, write_silence()

### Community 126 - "Case Summarization Requirements"

Cohesion: 0.67 Nodes (4): FR-17 Waiting On Party, Quick View Side Sheet And Next
Move, FR-2 Case Summarization And Stall Detection, CaseQuickView Side Sheet,
Waiting On

### Community 127 - "ESLint Config"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

### Community 129 - "App Shell And Density"

Cohesion: 0.67 Nodes (3): App Shell, Navigation, Screen Density

## Knowledge Gaps

- **638 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+633 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Message Entry And Filters` to
  `Evidence And Chart UI`, `Loan Application Cards`,
  `Sheet Import And Page Shell`, `Document And Event Labels`, `Task Cell Tests`,
  `Chase Task Grouping`, `Drawer Component`, `Footer And Brand Mark`,
  `Booking Pipeline Table`, `Stage Tracker And Chase Card`,
  `Legal Queue And Sorting`, `Direct Table Import`, `Record Update Form`,
  `Landing Page Moments`, `Persona Switcher`, `Booking Template Generator`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `react` connect `Message Entry And Filters` to
  `Evidence And Chart UI`, `Frontend UI Dependencies`?** _High betweenness
  centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend UI Dependencies` to
  `Dependency: date-fns`, `Dependency: framer-motion`,
  `Dependency: @mortar/core`, `Dependency: radix-ui`,
  `Dependency: @radix-ui/react-dialog`, `Dependency: @radix-ui/react-separator`,
  `Dependency: @radix-ui/react-slot`, `Dependency: react-day-picker`,
  `Dependency: react-router-dom`, `Dependency: recharts`,
  `Dependency: tailwind-merge`, `Dependency: tailwindcss-animate`,
  `Leakage Tests`, `Frontend Package Manifest`, `Message Entry And Filters`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `createApp()` (e.g. with
  `extraction()` and `withMaskedContact()`) actually correct?** _`createApp()`
  has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _638 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `Search And Core Dependencies` be split into smaller, more focused
  modules?** _Cohesion score 0.10695187165775401 - nodes in this community are
  weakly interconnected._
- **Should `Evidence And Chart UI` be split into smaller, more focused
  modules?** _Cohesion score 0.10776942355889724 - nodes in this community are
  weakly interconnected._
