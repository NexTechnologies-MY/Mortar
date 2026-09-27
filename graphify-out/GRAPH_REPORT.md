# Graph Report - . (2026-09-27)

## Corpus Check

- 114 files · ~290,443 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 3247 nodes · 7237 edges · 186 communities (156 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 351 edges
  (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- persona.tsx
- Slide 14: Playbooks: Staff Experience, Reviewed
- Mortar Demo Recorder
- button.tsx
- BookingPipelineFlow.tsx
- api.ts
- BookingsPage.tsx
- Mortar Notes For Agents
- Assumptions And Constraints
- DirectTableImport.tsx
- generate.ts
- ForecastPage.tsx
- react
- package.json
- BookingsTable.tsx
- react
- Components
- CaseEvent
- Assumptions And Constraints
- Markdown Style Guide
- Assumptions And Constraints
- app.ts
- Assumptions And Constraints
- A Company Brain For Booking-To-SPA Conversion
- Booking
- assistant/index.ts
- questions.ts
- Mortar Brief
- Mortar Product Overview
- ChaseCard.tsx
- import.ts
- app.test.ts
- Industry Practitioner Survey Findings, n = 8
- Mortar Product Overview
- MotionSites: cinematic landing page prompts
- forecast/forecast.ts
- CaseEvent
- persona.tsx
- live-check.ts
- docs/README.md
- Perch Landing Teardown
- FakeDb
- EvidencePill.tsx
- json
- better-ui Skill: surfaces, icons, motion values
- reset.ts
- WaitingOn.tsx
- Hugeicons by Halal Lab
- Booking
- LandingPage.tsx
- tools.ts
- projectSettings.ts
- LegalPage.test.tsx
- CaseEvent
- sim.ts
- proxyClient.ts
- Mortar Product Overview
- Product Requirements: Mortar
- Slide 06: Three Desks, One Book
- Persona
- jev/package.json
- assistant.test.ts
- server/package.json
- dependencies
- devDependencies
- speak.py
- record.mjs
- sim.test.ts
- ref_vitest
- core/src/index.ts
- app.ts
- ChaseCard.tsx
- frontend/tsconfig.json
- Reviews And Merging
- Slide 06: Three Desks, One Book
- precompute.ts
- Keep It Current
- components.json
- cn
- CaseQuickView
- core/package.json
- brain.test.ts
- compilerOptions
- Design: Mortar
- CaseSummary
- ChaseCard.tsx
- notificationStore.ts
- Bug Report Issue Form
- banks.test.ts
- test_assemble.py
- RTK Commands By Workflow
- UI Triage: The Signed-In App
- CaseSummary
- MessagesPanel.tsx
- WaitingOn.tsx
- Product Requirements: Mortar
- Conversion Forecasting And Leakage
- Mortar Product Overview
- Landing Video Pipeline
- Jakub Krehel's Interface Skills
- Jev Extraction Contract And Fixtures
- ref_node_fs
- BatchSpeechTests
- Financing-Risk Method
- scripts
- Security, Secrets And Privacy
- Route /forecast (Projected Signings)
- walk.mjs
- booking-template.mjs
- db/index.ts
- types.ts
- service.ts
- jev/tsconfig.json
- NarrateTests
- Agent Skills
- Booking Intake And Two-Tab Flow
- CaseSummary
- AppErrorBoundary
- Pull Request Template
- Checklist
- server/tsconfig.json
- subtitles.py
- Ask The Graph First
- sim.test.ts
- Assumptions And Constraints
- CaseSummary
- TourProvider.tsx
- Slide 06: Three Desks, One Book
- useTheme.tsx
- .prettierrc.json
- proof.test.mjs
- Andrej Karpathy Skills
- formatters.ts
- What Happened
- core/tsconfig.json
- schedule.py
- SubtitleLayoutTests
- TourProvider.test.tsx
- GitHub Issues And Pull Requests
- Deck Assets Manifest
- Route /import (Add Bookings)
- persona.tsx
- Slide 10: Where AI Helps, Where People Decide
- assemble.sh
- record.mjs
- Documents Routing Table
- booking-template.mjs
- Slide 18: A 12-Week Pilot
- Product Overview
- Technical Requirements Document
- Slide 17: The One Number We Are Judged By
- dependencies
- dependencies
- .releasePointerCapture
- .scrollIntoView
- dependencies
- read-excel-file/browser
- dependencies
- frontend/package.json
- Start From Fresh main
- narrate.sh
- Colour
- db/index.ts
- main.tsx
- Draft While Unfinished
- ref_node_assert
- Deploy Prototype Workflow

## God Nodes (most connected - your core abstractions)

1. `cn()` - 96 edges
2. `usePersona()` - 56 edges
3. `Booking` - 54 edges
4. `CaseEvent` - 54 edges
5. `CaseSummary` - 47 edges
6. `Database` - 43 edges
7. `FakeDb` - 39 edges
8. `createApp()` - 39 edges
9. `Task` - 37 edges
10. `FakeDb` - 34 edges

## Surprising Connections (you probably didn't know these)

- `demo_seed Provenance Flag` --semantically_similar_to-->
  `warmup.mjs Clean-Seed Check And Warm-Up` [INFERRED] [semantically similar]
  docs/TRD.md → scripts/demo/README.md
- `POST /api/admin/demo/add` --semantically_similar_to-->
  `record.mjs Browser Runner` [INFERRED] [semantically similar] docs/TRD.md →
  scripts/demo/README.md
- `POST /api/admin/demo/delete` --semantically_similar_to-->
  `proof.mjs /api/snapshot Clean-Seed Verification` [INFERRED] [semantically
  similar] docs/TRD.md → scripts/demo/README.md
- `Caution: Recording Writes` --semantically_similar_to-->
  `Write Rules And Error Codes` [INFERRED] [semantically similar]
  scripts/demo/README.md → docs/TRD.md
- `Capture Beat Sequence` --semantically_similar_to-->
  `Case Derivation Rules (summarizeCases)` [INFERRED] [semantically similar]
  scripts/demo/README.md → docs/TRD.md

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Human Verification Loop: Extract, Propose, Confirm** —
  docs_prd_fr6_jev_extraction, docs_prd_proposal_from_extraction,
  docs_prd_review_decisions, docs_prd_fr4_evidence_log,
  docs_product_division_of_responsibility, docs_prd_human_in_the_loop [INFERRED
  0.95]
- **From Stalled Booking To Stage-Weighted Forecast** — docs_prd_stall_rules,
  docs_prd_pipeline_stages, docs_prd_fr8_conversion_forecasting,
  docs_prd_wilson_interval, docs_prd_thirty_day_verified_spa_rate [INFERRED
  0.90]
- **Offline Demo Resilience Stack** — docs_prd_jev_three_tier_fallback,
  docs_prd_cache_first_gets, docs_prd_nfr4_zero_demo_failure,
  docs_prd_snapshot_staleness, docs_product_jev_fallback_hierarchy,
  docs_readme_mortar_jev [INFERRED 0.90]
- **Jev Fallback And Caching Stack** — docs_trd_fallback_ladder,
  docs_trd_input_hash, docs_trd_table_jev_answers, docs_trd_jev_precompute,
  docs_trd_stale_flag, docs_trd_caching_strategy [EXTRACTED 1.00]
- **Case State Derivation From The Event Ledger** —
  docs_trd_case_derivation_rules, docs_trd_stage_derivation,
  docs_trd_application_state, docs_trd_outstanding_documents,
  docs_trd_unknown_status_flag, docs_trd_stall_detection, docs_trd_case_summary
  [EXTRACTED 1.00]
- **Demo Recorder Pipeline** — scripts_demo_readme_narration_txt,
  scripts_demo_readme_manifest_py, scripts_demo_readme_speak_py,
  scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py,
  scripts_demo_readme_assemble_sh, scripts_demo_readme_lines_json [EXTRACTED
  1.00]
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

## Communities (186 total, 30 thin omitted)

### Community 0 - "persona.tsx"

Cohesion: 0.06 Nodes (37): AskTrigger(), mocks, SwitchProfile(), AppLayout(),
AppLayoutProps, AppNav(), Crumb, ROUTE_LABELS (+29 more)

### Community 1 - "Slide 14: Playbooks: Staff Experience, Reviewed"

Cohesion: 0.05 Nodes (9): AssignmentAccessContext, CaseEvent, EvidenceStatus,
IsoDateTime, LoanApplication, Task, Database, ImportBatch (+1 more)

### Community 2 - "Mortar Demo Recorder"

Cohesion: 0.06 Nodes (58): assemble.sh Picture Timeline And Mux, Beat-Keyed
Timing, Capture Beat Sequence, Execution Step 1: Capture, Caution: 16-Bit PCM
Audio, Caution: Beat Deconfliction, Caution: 16:10 To 16:9 Canvas, Caution:
Chatterbox Variants (+50 more)

### Community 3 - "button.tsx"

Cohesion: 0.07 Nodes (40): ROLES, EvidenceLog(), DOCUMENT_LABELS,
EVENT_KIND_LABELS, EXTRACTED_EVENT_LABELS, formatDateTime(), NEXT_ACTION_LABELS,
SENDER_ROLE_LABELS (+32 more)

### Community 4 - "BookingPipelineFlow.tsx"

Cohesion: 0.06 Nodes (43): BookingFilter, BookingFilters(), BookingFiltersProps,
RISKS, View, BookingPipelineFlow(), BookingPipelineFlowProps, PipelineCounts
(+35 more)

### Community 5 - "api.ts"

Cohesion: 0.07 Nodes (37): AddMessageForm(), defaultName(), normalTime(),
timeNow(), TasksPanel(), DemoDataCard(), HealthCard(), row() (+29 more)

### Community 6 - "BookingsPage.tsx"

Cohesion: 0.06 Nodes (41): DateField(), monthOf(), toDate(), toIso(),
formatDate(), PageContainer(), PageContainerProps, VARIANTS (+33 more)

### Community 7 - "Mortar Notes For Agents"

Cohesion: 0.05 Nodes (52): App Shell File Map, Assistant File Map, Charts And
Formatters, .github/workflows/ci.yml, Gotcha: Copilot Calls Gemini With Five
Read-Only Tools, DateField Shared Date Control, server/db/reset.ts Demo Data
Actions, File Map Section (+44 more)

### Community 8 - "Assumptions And Constraints"

Cohesion: 0.05 Nodes (49): docs/TRD.md, Hooks And Stores, Gotcha: Profile
Switches Clear The Workspace, Tooltip Component, Tooltip Rule (InfoTooltip),
POST /api/assistant, POST /api/assistant/stream (SSE), GET /api/health (+41
more)

### Community 9 - "DirectTableImport.tsx"

Cohesion: 0.11 Nodes (28): CaseHeader(), JevTag(), pill(), RISK_TONES, band(),
HESITATION, RESPONSIVENESS, SignalChips() (+20 more)

### Community 10 - "generate.ts"

Cohesion: 0.09 Nodes (40): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), stamp(), toEpoch(), workDaysBetween() (+32 more)

### Community 11 - "ForecastPage.tsx"

Cohesion: 0.15 Nodes (27): SOURCE_LABELS, TRACK_LABELS,
frontend_src_components_case_index_formatrm, ChartTooltipContent(),
ChartTooltipContentProps, TooltipEntry, AppErrorBoundaryProps,
AppErrorBoundaryState (+19 more)

### Community 12 - "react"

Cohesion: 0.08 Nodes (30): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
generated, mocks, SNAP, StubReader (+22 more)

### Community 13 - "package.json"

Cohesion: 0.04 Nodes (45): concurrently, eslint, eslint-config-prettier,
@eslint/js, eslint-plugin-react-hooks, globals, husky, lint-staged (+37 more)

### Community 14 - "BookingsTable.tsx"

Cohesion: 0.09 Nodes (27): DirectTableImport(), Entry, fakeBuyer(), newEntry(),
rowId(), salesProfiles, UnitAutocompleteInput(), UnitAutocompleteInputProps (+19
more)

### Community 15 - "react"

Cohesion: 0.06 Nodes (34): STATUS_TONES, APPLICATION_STATUS_LABELS, AFTER_SPA,
BANK_OPTIONAL, BANK_REQUIRED, CONFIRM, DECIDED, DECISIONS (+26 more)

### Community 16 - "Components"

Cohesion: 0.06 Nodes (43): Import File Map, Booking Row And Table Header, Brand
Mark (Kigumi Joint), Chart Series Colour Binding, Colour Section, Density
Decision (36px / 44px / 14px), Drop Zone, Drop Zone Hidden File Input Exception
(+35 more)

### Community 17 - "CaseEvent"

Cohesion: 0.07 Nodes (25): SignalsPanel(), formatDays(), formatPercent(),
formatRm(), formatRmCompact(), MONTHS, ringgit, FILLS (+17 more)

### Community 18 - "Assumptions And Constraints"

Cohesion: 0.09 Nodes (41): docs/TRD.md#data-retention, Closed Export
(closedExport.ts), Gotcha: Imported Bookings Are Born booked, POST
/api/applications, POST /api/bookings/import, DELETE /api/bookings/:id, POST
/api/admin/demo/add, POST /api/admin/demo/delete (+33 more)

### Community 19 - "Markdown Style Guide"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

### Community 20 - "Assumptions And Constraints"

Cohesion: 0.07 Nodes (40): Jev Proxy Client (createProxySystemOne), Calibrated
Contrast (WCAG AA), Chase Card Urgency Words, Association of Banks In Malaysia
2017 Guidelines, Backtest Validation, Bank Application Chains, Brier Score And
Calibration Table, Brown, Cai And DasGupta (2001) Interval Estimation (+32 more)

### Community 21 - "app.ts"

Cohesion: 0.12 Nodes (35): canAccessBooking(), createAssignmentAccessContext(),
currentCaseAssignee(), DEMO_PROFILES, profileFor(), scopeSnapshot(), other,
snapshot (+27 more)

### Community 22 - "Assumptions And Constraints"

Cohesion: 0.06 Nodes (38): bun run check Then bun run format Rule,
.github/CONTRIBUTING.md, docs/DESIGN.md, Documents Section,
docs/research/feature-ideas/README.md, Frontend Stack (React 19 / Vite /
Tailwind 4 / shadcn), docs/agents/github.md, GitHub Issues And PRs Rule (+30
more)

### Community 23 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.05 Nodes (36): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+28 more)

### Community 24 - "Booking"

Cohesion: 0.09 Nodes (30): ReadSheetOptions, ApplicationFacts, appointmentDay(),
byOccurred(), CaseDataInput, CaseFacts, deriveApplication(), deriveCase() (+22
more)

### Community 25 - "assistant/index.ts"

Cohesion: 0.08 Nodes (27): Persona, callGemini(), GeminiContent,
GeminiFunctionCall, GeminiOptions, GeminiPart, GeminiResponse, isAbort() (+19
more)

### Community 26 - "questions.ts"

Cohesion: 0.10 Nodes (26): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+18 more)

### Community 27 - "Mortar Brief"

Cohesion: 0.06 Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+23 more)

### Community 28 - "Mortar Product Overview"

Cohesion: 0.09 Nodes (32): CaseQuickView Side Sheet, daysSinceLoanApproved And
daysSinceSpaSet, Atomic Demo Data Add/Delete Transactions, FR-15 SPA Execution
Desk, FR-19 Record An Update, JTBD: Multi-Bank Application Tracking, JTBD:
Closing Out Appointments, JTBD: Guidance Retrieval (+24 more)

### Community 29 - "ChaseCard.tsx"

Cohesion: 0.10 Nodes (24): progressFromKinds(), SEGMENTS, STAGE_PROGRESS,
StageTracker(), TaskCell(), CaseJourney(), WaitingOnCell(), WaitingOnPanel()
(+16 more)

### Community 30 - "import.ts"

Cohesion: 0.12 Nodes (30): ageOn(), BookingDraft, checkBookingDraft(),
DateOrder, detectDateOrder(), EXCEL_EPOCH, findHeader(), HEADER_NAMES (+22 more)

### Community 31 - "app.test.ts"

Cohesion: 0.06 Nodes (17): packages_core_src_index_evidencestatus, JevService,
BookingMovedOnError, EventSettledError, ImportMovedOnError,
OpenApplicationError, UnitHeldError, APPLICATION (+9 more)

### Community 32 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.11 Nodes (31): Feature Ideas: written up but not built, 48-Hour
Clean Exit, Advisory-Only Financing Flag That Never Blocks a Booking, Early
Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time
Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages
Ruling (+23 more)

### Community 33 - "Mortar Product Overview"

Cohesion: 0.10 Nodes (29): FR-14 Persona Navigation And Page Routing, FR-24
Guided Walkthrough, FR-5 Today Desk And Task Management, Approved Manager And
Copilot Intake (#60), JTBD: Stall Resolution, Manager Flagging And Follow-Up
Task Assignment, Manager Suggestions Before Overview, Named Profile Access
Scoping (+21 more)

### Community 34 - "MotionSites: cinematic landing page prompts"

Cohesion: 0.13 Nodes (29): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Glass Object (Three.js effect), html-in-canvas API, Peel Effect,
Scroll-Driven Effects: Laser, Particle Scroll, Bend, Jakub Antalik Portfolio
Study (+21 more)

### Community 35 - "forecast/forecast.ts"

Cohesion: 0.10 Nodes (20): SeedRun, assumptions, booking, event(), snapshot(),
financingRisk(), GeneratorOptions, at() (+12 more)

### Community 36 - "CaseEvent"

Cohesion: 0.12 Nodes (18): react, DropZone(), readableSize(), appointmentDate(),
COLUMNS, FIXED_WIDTH, LegalQueueTable(), WIDTHS (+10 more)

### Community 37 - "persona.tsx"

Cohesion: 0.11 Nodes (11): App(), HomeRedirect(), usePersona(),
ProfileWorkspace(), ChasePage(), FaqPage(), FAQS, LegalPage() (+3 more)

### Community 38 - "live-check.ts"

Cohesion: 0.10 Nodes (27): Fourteen Acceptance Criteria, Button Component, Chase
Card, Elevation: Card (--shadow-card), Focus Ring (2px --ring, 2px Offset),
font-display: swap, Geist Mono Typeface, Landing Page (+19 more)

### Community 39 - "docs/README.md"

Cohesion: 0.14 Nodes (27): FR-11 Database Persistence And Demo Data Management,
FR-12 High-Availability Offline Jev Fallback, JevMeta (source/stale/latencyMs),
Three-Tier Jev Resolution Strategy, NFR-4 Zero Demo Failure, PostgreSQL Schema
Tables, Snapshot Staleness Re-Check, US-19 Demo Data First (+19 more)

### Community 40 - "Perch Landing Teardown"

Cohesion: 0.10 Nodes (27): Layered Card Surface: hairline ring and stacked
shadow, better-layout Skill, explain-interface Skill, shadow-border Three-Layer
Token, Figma Pairing: Newsreader display + Geist UI, Perch Sign-In Teardown,
Authored Disabled States, Perch Fake Auth Flow: no session, no guard (+19 more)

### Community 42 - "EvidencePill.tsx"

Cohesion: 0.13 Nodes (14): frontend_src_lib_persona_persona, PERSONAS, Rect,
Spotlight(), resolveRoute(), Harness(), mocks, TourContext (+6 more)

### Community 43 - "json"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 44 - "better-ui Skill: surfaces, icons, motion values"

Cohesion: 0.12 Nodes (25): Chip Economy Rule, Copilot 503 Scripted Fallback,
Five Read-Only Copilot Tools, docs/DESIGN.md Visual Standards, FR-18 Jev Through
A Local Model Proxy, FR-23 Copilot Grounded Assistant, Google Gemini Assistant
Service, Human In The Loop (+17 more)

### Community 45 - "reset.ts"

Cohesion: 0.13 Nodes (20): packages_core_src_index_proposalfromextraction,
packages_core_src_index_summarizecases, ref_bun, sql,
TaskAssignmentChangedError, addDemoData(), applySchema(), deleteDemoData() (+12
more)

### Community 46 - "WaitingOn.tsx"

Cohesion: 0.10 Nodes (24): bun run check Gate, Bun Workspaces And --filter,
Conventions Section, @mortar/core No-Build Import, .prettierrc.json Formatting
Rules, Recipe: Add Shared Domain Types Or Logic, Gotcha: Root Scripts Fan Out
With --filter '*', shadcn/ui Component Installation (+16 more)

### Community 47 - "Hugeicons by Halal Lab"

Cohesion: 0.13 Nodes (24): Design the Fallback First, Canvas UI shadcn Registry
Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add),
Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons
Stroke Rounded Free Style, Why Hugeicons Fits (+16 more)

### Community 48 - "Booking"

Cohesion: 0.12 Nodes (15): SOURCE_TAG_LABELS, SOURCE_TAG_TONES,
assumptionValue(), DEFAULT_ASSUMPTIONS,
packages_core_src_sim_default_assumptions, computeFinancingRisk(),
financingRiskFor(), monthlyInstalment() (+7 more)

### Community 49 - "LandingPage.tsx"

Cohesion: 0.11 Nodes (14): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+6 more)

### Community 50 - "tools.ts"

Cohesion: 0.15 Nodes (23): packages_core_src_index_default_assumptions,
bookingLine(), cap(), caseDetail(), casesFor(), day(), DESK_OF_OWNER_ROLE,
deskOfNextMove() (+15 more)

### Community 51 - "projectSettings.ts"

Cohesion: 0.23 Nodes (18): packages_core_src_index_unitkey, Playbook,
createDatabase(), isoDate(), isoDateTime(), jsonb(), maskDigits(), Row (+10
more)

### Community 52 - "LegalPage.test.tsx"

Cohesion: 0.13 Nodes (12): PageHeaderCard(), PageHeaderCardProps, Disclosure(),
ForecastPage(), ManagerPage(), SNAP, SNAP, packages_core_src_index_forecast (+4
more)

### Community 53 - "CaseEvent"

Cohesion: 0.16 Nodes (19): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, legalQueue(), LegalRow, LegalSortKey, median() (+11 more)

### Community 54 - "sim.ts"

Cohesion: 0.17 Nodes (20): groupBy(), backtest(), bucketOf(), buildModel(),
CALIBRATION_BUCKETS, factsFor(), forecast(), leftAge() (+12 more)

### Community 55 - "proxyClient.ts"

Cohesion: 0.14 Nodes (16): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+8 more)

### Community 56 - "Mortar Product Overview"

Cohesion: 0.16 Nodes (22): FR-17 Waiting On Party, Quick View, And Next Move,
Practitioner Support For Automation, Where AI Helps And Where People Decide,
Booking Leakage, What The Daily Users Have In Common, Deliberately Not Users,
Division Of Operational Responsibility, Evidence From Research And Industry (+14
more)

### Community 57 - "Product Requirements: Mortar"

Cohesion: 0.13 Nodes (22): Goals And Non-Goals, Honest Accounting Rule, Sale and
Purchase Agreement (SPA), Stall Rules Not Gated On The 30-Day Horizon,
Deterministic Stall Rules, Stage-Weighted 30-Day SPA Conversion Forecast, 30-Day
Verified SPA Rate, Booking Visibility Gap (+14 more)

### Community 58 - "Slide 06: Three Desks, One Book"

Cohesion: 0.12 Nodes (17): RANKING, SNAPSHOT, buildSnapshot(), EXTRACTION_9001,
EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001 (+9 more)

### Community 59 - "Persona"

Cohesion: 0.13 Nodes (9): packages_core_src_index_jevcache,
packages_core_src_index_jevservice, JevCache, JevKind, MemoryCache,
JevServiceOptions, MemoryCache, DbJevCache (+1 more)

### Community 60 - "jev/package.json"

Cohesion: 0.09 Nodes (21): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+13 more)

### Community 61 - "assistant.test.ts"

Cohesion: 0.12 Nodes (17): App, APPLICATIONS, ask(), BOOKING, chipsFor(),
EVENTS, fakeJev(), makeApp() (+9 more)

### Community 62 - "server/package.json"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 63 - "dependencies"

Cohesion: 0.10 Nodes (21): class-variance-authority, clsx, dependencies,
class-variance-authority, clsx, lucide-react, @radix-ui/react-dropdown-menu,
@radix-ui/react-label (+13 more)

### Community 64 - "devDependencies"

Cohesion: 0.10 Nodes (21): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+13 more)

### Community 65 - "speak.py"

Cohesion: 0.18 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 66 - "record.mjs"

Cohesion: 0.10 Nodes (15): ref_node_module, ref_node_os, ref_node_path,
ref_node_url, beats, errors, filmed, OUT (+7 more)

### Community 67 - "sim.test.ts"

Cohesion: 0.13 Nodes (20): Booking Fee Prohibition (Reg 11(2)),
DEFAULT_ASSUMPTIONS, Empirical Grounding Table, Direct Core ERP Integration (Out
Of Scope), FR-10 Transparent Assumptions And Browser Re-Simulation, Functional
Requirements, PJD Regency Late-Delivery Damages Clock, Mortar Product
Requirements (+12 more)

### Community 68 - "ref_vitest"

Cohesion: 0.19 Nodes (15): stepToTask(), ownerName(), ManagerCase(),
ManagerCases(), fetchNextAction(), postTask(), PERSONA_DESK_ROLE, AdminToday()
(+7 more)

### Community 69 - "core/src/index.ts"

Cohesion: 0.22 Nodes (16): packages_core_src_index_scoreanswer, ScoreAnswer,
jevInputHash(), sortKeys(), stableJson(), caseState(), defaultPlaybookQuery(),
extractJob() (+8 more)

### Community 70 - "app.ts"

Cohesion: 0.15 Nodes (14): Language, fakeFetch(), ref_bun_test,
warmProduction(), call(), body(), error(), isIsoDate() (+6 more)

### Community 71 - "ChaseCard.tsx"

Cohesion: 0.19 Nodes (12): actionIcon(), addDays(), blockerIcon(),
DOCUMENT_LABELS, documentStepLabel(), dueOnForUrgency(), NEXT_ACTION_ICONS,
NEXT_ACTION_LABELS (+4 more)

### Community 72 - "frontend/tsconfig.json"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 73 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 74 - "Slide 06: Three Desks, One Book"

Cohesion: 0.11 Nodes (10): packages_core_src_index_reference_date, CaseData,
JevAnswerRow, app, db, generated, jev, payload (+2 more)

### Community 75 - "precompute.ts"

Cohesion: 0.12 Nodes (14): JevCacheEntry, cache, caseData, client,
CollectingCache, generated, jev, metered (+6 more)

### Community 76 - "Keep It Current"

Cohesion: 0.18 Nodes (17): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+9 more)

### Community 77 - "components.json"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 78 - "cn"

Cohesion: 0.16 Nodes (13): blockerQuery(), FIT_PRESENTATION, PlaybooksPanel(),
Ranked, STATUS_BADGES, FREE_FEATURES, Pricing(), PRO_FEATURES (+5 more)

### Community 79 - "CaseQuickView"

Cohesion: 0.18 Nodes (10): CaseNextStep, CreateTaskPayload, defaultOwnerRole(),
jevStep(), NextStep, nextStepFor(), stepFor(), booking() (+2 more)

### Community 80 - "core/package.json"

Cohesion: 0.12 Nodes (16): minisearch, dependencies, minisearch,
devDependencies, typescript, vitest, exports, typescript (+8 more)

### Community 81 - "brain.test.ts"

Cohesion: 0.23 Nodes (14): ctx, satisfying(), askBrain(), buildAskContext(),
contentWords(), coverage(), matchQuestion(), questionIndex() (+6 more)

### Community 82 - "compilerOptions"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 83 - "Design: Mortar"

Cohesion: 0.13 Nodes (16): App Shell, Chip Economy, Content Canvas (1280px Cap),
Elevation: Card Hover (--shadow-card-hover), Guided Tour Chrome, App Shell
Layout, Motion Section, Motion Tokens (fast / base / slow) (+8 more)

### Community 84 - "CaseSummary"

Cohesion: 0.13 Nodes (8): BOOKING, RISK, SUMMARY, TASK, defaultData(), mocks,
provisionalEvent(), packages_core_src_index_casesummary

### Community 85 - "ChaseCard.tsx"

Cohesion: 0.17 Nodes (10): BOOKING, next(), RISK, WITH_BANK, BallHolder,
ballInCourt, listOf(), DOCUMENT_LABELS (+2 more)

### Community 86 - "notificationStore.ts"

Cohesion: 0.19 Nodes (13): Notification, NotificationPopover(),
useNotifications(), emit(), Listener, listeners, loadNotifications(),
notifications (+5 more)

### Community 87 - "Bug Report Issue Form"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 88 - "banks.test.ts"

Cohesion: 0.18 Nodes (12): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+4 more)

### Community 89 - "test_assemble.py"

Cohesion: 0.27 Nodes (9): AssembleMuxTests, AssemblePictureTests, color_video(),
ff(), probe_duration(), CompletedProcess, Path, slide_png() (+1 more)

### Community 90 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 91 - "UI Triage: The Signed-In App"

Cohesion: 0.21 Nodes (15): transitions.dev: UI transitions for AI agents, UI
Triage: The Signed-In App, Copy Rules: the drop and write table, Density Budget,
The Desk Lens Becomes a Preset, Not a Banner, Three Stacked Filter Systems With
Disagreeing Numbers, Four-Phase Implementation Plan, Jargon a Sales Admin Does
Not Use (+7 more)

### Community 92 - "CaseSummary"

Cohesion: 0.19 Nodes (10): buildClosedExportRows(), ClosedExportRow,
closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header(),
isoToDate() (+2 more)

### Community 93 - "MessagesPanel.tsx"

Cohesion: 0.15 Nodes (6): EVENT_MAP, proposalFromExtraction(), STATUS_RANK,
extraction(), PLAYBOOKS, Message

### Community 94 - "WaitingOn.tsx"

Cohesion: 0.20 Nodes (14): Authentication Theatre, Mortar Design System In
Figma, Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer Link
Columns, Perch Landing And Footer Research, Sign-In Persona Picker (+6 more)

### Community 95 - "Product Requirements: Mortar"

Cohesion: 0.14 Nodes (14): Backtest Caption: Proves The Method, Not The
Business, Brier Score, Buyer Signals (responsiveness, hesitation), Cache-First
GET Routes, Four-Bucket Calibration Table, FR-20 Message Timing And Buyer
Response Explanation, FR-7 Next Action, Playbook Fit, And Buyer Signals Scoring,
FR-9 Historical Forecast Backtesting (+6 more)

### Community 96 - "Conversion Forecasting And Leakage"

Cohesion: 0.16 Nodes (14): Brown, Cai & DasGupta (2001) Wilson Interval
Reference, FR-16 Leakage Analysis And Recovery Sizing, FR-8 Statistical
Conversion Forecasting, Live Booking Definition (30-day window), Monte Carlo
10th-90th Percentile Range, Recoverable Share Sizing, Root-Cause Attribution
Order, Sources (+6 more)

### Community 97 - "Mortar Product Overview"

Cohesion: 0.20 Nodes (14): Event Record Schema, Event Statuses
(confirmed/provisional/disputed/superseded), FR-2 Case Summarization And Stall
Detection, FR-4 Evidence Log And Multi-Party Event Verification, Independent
Loan And Legal Tracks, NFR-7 Auditable Event Log, Outstanding Document Kinds,
Funnel Pipeline Stages (+6 more)

### Community 98 - "Landing Video Pipeline"

Cohesion: 0.19 Nodes (14): Porting Its Hover Motion without React, LQIP
Placeholder Behind Video Tiles, Each Rule Has One Owner, Reduced Motion Kill
Switch: 0.01ms not none, WCAG 2.2.2 Autoplay Pause Requirement, Landing Video
Pipeline, The Agent's Video Checklist, Gemini Videos Composer at
gemini.google.com/videos (+6 more)

### Community 99 - "Jakub Krehel's Interface Skills"

Cohesion: 0.20 Nodes (14): Jakub Krehel's Interface Skills, better-accessibility
Skill: reduced motion, zoom, autoplay, better-colors Skill, better-interface
Skill: orchestrated review, better-typography Skill, better-writing Skill, break
Skill, interface-review Skill (+6 more)

### Community 100 - "Jev Extraction Contract And Fixtures"

Cohesion: 0.18 Nodes (13): DEFAULT_SEED (20260918), Demo Script As Acceptance,
FR-1 Canonical Simulation Dataset Generation, FR-6 TypeSafe Jev Structured
Message Extraction, Jev Choice, Noul and Score Primitives, JEV_REVIEW_THRESHOLD
0.6, Demo Step 4: The Live AI Moment, NFR-2 Jev SLA And Timeout (3000ms) (+5
more)

### Community 101 - "ref_node_fs"

Cohesion: 0.15 Nodes (4): ref_node_test, cleanEvents, SEEDED_MESSAGES,
WALK_BEATS

### Community 103 - "Financing-Risk Method"

Cohesion: 0.23 Nodes (12): booking_removals, bookings, event_reviews, events,
imports, jev_answers, loan_applications, messages (+4 more)

### Community 104 - "scripts"

Cohesion: 0.17 Nodes (11): license, name, private, scripts, build, dev, preview,
template:bookings (+3 more)

### Community 105 - "Security, Secrets And Privacy"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 106 - "Route /forecast (Projected Signings)"

Cohesion: 0.23 Nodes (8): readSheetFile(), sheetKind(), SheetReadError,
DEFAULTS, FIXTURE, TEMPLATE, parseCsv(), ref_node_fs

### Community 107 - "walk.mjs"

Cohesion: 0.30 Nodes (9): scrollDuration(), scrollTarget(), smoothScrollTo(),
film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink(), visible() (+1
more)

### Community 108 - "booking-template.mjs"

Cohesion: 0.18 Nodes (6): bookings, COLUMNS, date(), howTo, OUT, SAMPLES

### Community 109 - "db/index.ts"

Cohesion: 0.18 Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent,
DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem,
DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 110 - "types.ts"

Cohesion: 0.22 Nodes (6): createProxySystemOne(), client(), colorQuestions,
FakeResponse, FetchCall, createJevService()

### Community 111 - "service.ts"

Cohesion: 0.20 Nodes (5): CapturedRequest, extractAnswers, failingClient(),
fakeClient(), JevClient

### Community 112 - "jev/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, types, extends, include, src/**/*.ts,
../../tsconfig.json, vitest.config.ts, node (+1 more)

### Community 113 - "NarrateTests"

Cohesion: 0.29 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 114 - "Agent Skills"

Cohesion: 0.22 Nodes (8): Agent Skills, Install And Update,
leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows,
pbakaus/impeccable, Which Skill First

### Community 115 - "Booking Intake And Two-Tab Flow"

Cohesion: 0.25 Nodes (9): Client-Side Spreadsheet Parsing, closedExport.ts Excel
Export, FR-13 Add Bookings Intake And Validation, FR-21 Bookings Active And
Closed Views With Export, FR-22 Add Bookings Intake, readBookingSheet,
Seven-Year Record Retention Rule, Undo Import Race Protection (+1 more)

### Community 116 - "CaseSummary"

Cohesion: 0.25 Nodes (4): booking, riskLabel(),
packages_core_src_index_risklevel, RiskLevel

### Community 118 - "Pull Request Template"

Cohesion: 0.28 Nodes (9): Fill In The Pull Request Template, Never Commit Real
Buyer Data, Show UI Changes With Screenshots, Data Check, Screenshots Or
Recording, Pull Request Template, Screenshots, What Changed (+1 more)

### Community 119 - "Checklist"

Cohesion: 0.25 Nodes (9): Follow The Design Guide And Shared UI Components, Keep
AI Agents On Task, One Problem Per Issue, One Thing Per Pull Request, Point
Agents At The Rules, Read The Diff Before Committing, Update The Docs In The
Same Pull Request, Working With AI Coding Agents (+1 more)

### Community 120 - "server/tsconfig.json"

Cohesion: 0.22 Nodes (8): bun-types, db/**/\*.ts, compilerOptions, types,
extends, include, src/**/*.ts, ../tsconfig.json

### Community 121 - "subtitles.py"

Cohesion: 0.33 Nodes (8): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration uses,, Split into lines of similar
length, never mid-word. Two things depend on th, Group wrapped lines into cards
of at most MAX_LINES., ts(), wav_ms(), wrap()

### Community 122 - "Ask The Graph First"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 123 - "sim.test.ts"

Cohesion: 0.25 Nodes (8): Annuity Monthly Instalment At 4.2%, Debt Service Ratio
(DSR), DSR 40% Cap, FR-3 Deterministic Financing Risk Calculation, Loan Tenure
min(35, 70 - age), Margin of Financing Caps (90% / 70%), Risk Levels high /
medium / low, US-13 Risk In Plain Words

### Community 124 - "Assumptions And Constraints"

Cohesion: 0.43 Nodes (8): Amortization Tenure Cap, Annuity Monthly Instalment,
Bank Negara Malaysia Financing Rules, Debt Service Ratio (DSR), Financing-Risk
Method, Loan Principal Calculation, Margin Ceiling Determination, Risk
Categorization (High/Medium/Low)

### Community 125 - "CaseSummary"

Cohesion: 0.25 Nodes (5): AWAITING_DOCUMENTS, BOOKING, RISK, WITH_BANK,
packages_core_src_index_nextactionsuggestion

### Community 126 - "TourProvider.tsx"

Cohesion: 0.36 Nodes (3): ChaseTasks(), groupTasks(), ROLE_ORDER

### Community 127 - "Slide 06: Three Desks, One Book"

Cohesion: 0.29 Nodes (4): buildFreshDisbursedSnapshot(), buildLargeSnapshot(),
exportMocks, packages_core_src_index_default_seed

### Community 128 - "useTheme.tsx"

Cohesion: 0.43 Nodes (6): getSystemTheme(), resolveTheme(), Theme, ThemeContext,
ThemeContextValue, ThemeProvider()

### Community 129 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 130 - "proof.test.mjs"

Cohesion: 0.48 Nodes (3): BK_MESSAGES, verifyCleanSeed(), openDemoSession()

### Community 131 - "Andrej Karpathy Skills"

Cohesion: 0.33 Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3.
Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 132 - "formatters.ts"

Cohesion: 0.40 Nodes (4): currencyFormatter, formatCurrency(),
formatTooltipCurrency(), numberFormatter

### Community 133 - "What Happened"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 134 - "core/tsconfig.json"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 135 - "schedule.py"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A be, Push starts later
so no line is still speaking when the next begins. Pure s

### Community 136 - "SubtitleLayoutTests"

Cohesion: 0.40 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 138 - "GitHub Issues And Pull Requests"

Cohesion: 0.50 Nodes (3): Before Opening A Pull Request, Before Opening An
Issue, GitHub Issues And Pull Requests

### Community 139 - "Deck Assets Manifest"

Cohesion: 0.50 Nodes (3): Deck Assets Manifest, Generated Art, Product
Screenshots

### Community 140 - "Route /import (Add Bookings)"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

## Knowledge Gaps

- **754 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+749 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `BookingsPage.tsx` to `button.tsx`, `CaseEvent`,
  `DirectTableImport.tsx`, `Security, Secrets And Privacy`, `ForecastPage.tsx`,
  `db/index.ts`, `cn`, `react`, `CaseEvent`, `LandingPage.tsx`,
  `ChaseCard.tsx`?** _High betweenness centrality (0.030) - this node is a
  cross-community bridge._
- **Why does `react` connect `CaseEvent` to `ForecastPage.tsx`,
  `dependencies`?** _High betweenness centrality (0.025) - this node is a
  cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `CaseEvent`, `scripts`,
  `Documents Routing Table`, `booking-template.mjs`,
  `Slide 18: A 12-Week Pilot`, `Product Overview`,
  `Technical Requirements Document`,
  `Slide 17: The One Number We Are Judged By`, `dependencies`, `dependencies`,
  `.releasePointerCapture`, `.scrollIntoView`, `dependencies`,
  `read-excel-file/browser`, `dependencies`?** _High betweenness centrality
  (0.025) - this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _754 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `persona.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05654761904761905 - nodes in this community are weakly
  interconnected._
- **Should `Slide 14: Playbooks: Staff Experience, Reviewed` be split into
  smaller, more focused modules?** _Cohesion score 0.05028248587570622 - nodes
  in this community are weakly interconnected._
- **Should `Mortar Demo Recorder` be split into smaller, more focused modules?**
  _Cohesion score 0.056261343012704176 - nodes in this community are weakly
  interconnected._
