# Graph Report - . (2026-09-27)

## Corpus Check

- 0 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 2951 nodes · 7255 edges · 173 communities (145 shown, 28 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 236 edges
  (avg confidence: 0.79)
- Token cost: 0 input · 0 output

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
- TourProvider.test.tsx
- usePagination
- GitHub Issues And Pull Requests
- Route /import (Add Bookings)
- Start From Fresh main
- narrate.sh
- ref_node_fs
- Slide 10: Where AI Helps, Where People Decide
- Documents Routing Table
- Product Overview
- Technical Requirements Document
- Slide 17: The One Number We Are Judged By
- Slide 18: A 12-Week Pilot
- .releasePointerCapture
- .scrollIntoView
- frontend/package.json
- ref_vitest
- Draft While Unfinished
- read-excel-file/browser
- packages_core_src_index_sheetfield
- ref_node_assert

## God Nodes (most connected - your core abstractions)

1. `cn()` - 122 edges
2. `CaseEvent` - 53 edges
3. `Booking` - 51 edges
4. `Button` - 46 edges
5. `createApp()` - 46 edges
6. `CaseSummary` - 44 edges
7. `Product Requirements Document (PRD.md)` - 44 edges
8. `usePersona()` - 41 edges
9. `Database` - 38 edges
10. `FakeDb` - 34 edges

## Surprising Connections (you probably didn't know these)

- `warmProduction()` --indirect_call--> `error()` [INFERRED]
  scripts/demo/warmup.mjs → server/src/util.ts
- `Keep It Current` --semantically_similar_to--> `Never Do These` [INFERRED]
  [semantically similar] docs/agents/graphify.md → .github/CONTRIBUTING.md
- `Mortar index.html: fonts, OG tags, FOUC guard` --semantically_similar_to-->
  `Perch Landing Teardown` [INFERRED] [semantically similar] frontend/index.html
  → docs/research/perch/landing.md
- `AddMessageForm()` --indirect_call--> `day()` [INFERRED]
  frontend/src/components/bookings/AddMessageForm.tsx →
  server/src/assistant/tools.ts
- `EvidenceLog()` --indirect_call--> `a()` [INFERRED]
  frontend/src/components/bookings/EvidenceLog.tsx →
  packages/core/src/sim/assumptions.ts

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
- **Jev Intelligence Pipeline (fan-out, cache, degradation)** —
  docs_trd_typesafe_jev, docs_trd_mortar_jev, docs_trd_jev_fanout,
  docs_trd_jev_primitives, docs_trd_jev_jobs, docs_trd_jev_fallback_ladder,
  docs_trd_input_hash, docs_trd_jev_answers, docs_trd_jev_precompute,
  docs_trd_jev_review_threshold [EXTRACTED 1.00]
- **Case Derivation From the Event Ledger** — docs_trd_event_ledger,
  docs_trd_event_tracks, docs_trd_verification_states, docs_trd_summarize_cases,
  docs_trd_case_summary, docs_trd_stall_detection, docs_trd_unknown_flag,
  docs_trd_event_reviews, docs_trd_write_rules [EXTRACTED 1.00]
- **Retention, Deletion and Audit Trail** — docs_trd_data_retention,
  docs_trd_retention_laws, docs_trd_booking_removals, docs_trd_import_undo,
  docs_trd_event_reviews, docs_trd_demo_seed, docs_trd_pdpa_compliance
  [EXTRACTED 1.00]
- **Jev Structured Assistance Pipeline (extraction, scoring, resilience)** —
  docs_prd_fr6_typesafe_jev_structured_message_extraction,
  docs_prd_fr7_next_action_playbook_fit_and_buyer_signals_scoring,
  docs_prd_fr12_high_availability_offline_jev_fallback,
  docs_prd_fr18_jev_through_a_local_model_proxy, docs_prd_typesafe_jev,
  docs_prd_jev_tiered_fallback, docs_prd_jev_local_proxy [INFERRED 0.85]
- **Confirmed Evidence To Operational Queue** — docs_prd_evidence_log,
  docs_prd_case_summary, docs_prd_stall_detection, docs_prd_nextstep,
  docs_prd_today_desk, docs_prd_waiting_on_party, docs_prd_record_an_update
  [INFERRED 0.85]
- **Statistical Conversion Forecast Stack** — docs_prd_stage_weighted_forecast,
  docs_prd_wilson_score_interval, docs_prd_monte_carlo_simulation,
  docs_prd_brier_score, docs_prd_backtesting, docs_prd_default_assumptions,
  docs_prd_30_day_verified_spa_rate [INFERRED 0.85]
- **Mortar Design System Components** — docs_design_button,
  docs_design_checkbox, docs_design_field, docs_design_tooltip,
  docs_design_status_pill, docs_design_scrollbar, docs_design_menu,
  docs_design_date_picker, docs_design_dialog, docs_design_drop_zone [EXTRACTED
  1.00]
- **Mortar App Shell Chrome** — docs_design_app_shell,
  docs_design_navigation_sidebar, docs_design_top_bar,
  docs_design_content_canvas, docs_design_persona_routing,
  docs_design_guided_tour_chrome [EXTRACTED 1.00]
- **Mortar Public Page Surface** — docs_design_public_pages,
  docs_design_landing, docs_design_chromatic_panel, docs_design_sample_ledger,
  docs_design_feature_cards, docs_design_public_footer, docs_design_sign_in,
  docs_design_public_shell [EXTRACTED 1.00]
- **Ask Mortar Request Flow And Fallback** — docs_agents_notes_ask_panel,
  docs_agents_notes_assistant_endpoint, docs_agents_notes_gemini_readonly_tools,
  docs_agents_notes_ask_brain [EXTRACTED 1.00]
- **Radix Overlay Stacking And jsdom Test Friction** —
  docs_agents_notes_date_field, docs_agents_notes_z_index_popover_over_dialog,
  docs_agents_notes_radix_popover_jsdom, docs_agents_notes_inline_popover,
  docs_agents_notes_focus_sheet_not_first_control [INFERRED 0.85]
- **Persona Model (Pages, Guard, No Data Masking)** —
  docs_agents_notes_persona_context, docs_agents_notes_persona_route,
  docs_agents_notes_persona_pages_drive_nav,
  docs_agents_notes_app_sidebar_hoists_persona_home,
  docs_agents_notes_no_data_masking [EXTRACTED 1.00]
- **Narration-to-Deliverable Pipeline** — scripts_demo_readme_narration_txt,
  scripts_demo_readme_manifest_py, scripts_demo_readme_speak_py,
  scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py,
  scripts_demo_readme_narrate_sh, scripts_demo_readme_lines_json [EXTRACTED
  1.00]
- **Capture and Picture Pipeline** — scripts_demo_readme_walk_mjs,
  scripts_demo_readme_record_mjs, scripts_demo_readme_contract_mjs,
  scripts_demo_readme_warmup_mjs, scripts_demo_readme_proof_mjs,
  scripts_demo_readme_motion_mjs, scripts_demo_readme_slides_render_mjs,
  scripts_demo_readme_assemble_sh [EXTRACTED 1.00]
- **Preserved Technical Cautions** — scripts_demo_readme_cpu_attention_trap,
  scripts_demo_readme_pcm_format_caution,
  scripts_demo_readme_perth_setuptools_pin,
  scripts_demo_readme_beat_deconfliction, scripts_demo_readme_canvas_pillarbox,
  scripts_demo_readme_subtitle_layout,
  scripts_demo_readme_slide_subtitle_clearance,
  scripts_demo_readme_synthetic_data_only [EXTRACTED 1.00]

## Communities (173 total, 28 thin omitted)

### Community 0 - "questions.ts"

Cohesion: 0.10 Nodes (26): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+18 more)

### Community 1 - "ForecastPage.tsx"

Cohesion: 0.13 Nodes (31): WIDTHS, SOURCE_LABELS, TRACK_LABELS,
frontend_src_components_case_index_formatdate,
frontend_src_components_case_index_formatpercent,
frontend_src_components_case_index_formatrm,
frontend_src_components_case_index_formatrmcompact, ChartTooltipContent() (+23
more)

### Community 2 - "api.ts"

Cohesion: 0.08 Nodes (25): MessageItem(), DemoDataCard(), addDemoData(),
askAssistant(), AssistantAnswer, deleteBooking(), deleteDemoData(),
extractMessage() (+17 more)

### Community 3 - "app.test.ts"

Cohesion: 0.06 Nodes (44): EVENTS, BookingDraft,
packages_core_src_index_bookingdraft, packages_core_src_index_caseevent,
packages_core_src_index_evidencestatus, packages_core_src_index_isodatetime,
packages_core_src_index_loanapplication, packages_core_src_index_message (+36
more)

### Community 4 - "package.json"

Cohesion: 0.04 Nodes (45): concurrently, eslint, eslint-config-prettier,
@eslint/js, eslint-plugin-react-hooks, globals, husky, lint-staged (+37 more)

### Community 5 - "sim.test.ts"

Cohesion: 0.14 Nodes (20): Association of Banks in Malaysia (2017) Housing Loan
Processing Press Release, Bank Negara Malaysia (2010) Measures to Promote a
Stable Property Market, Bank Negara Malaysia (2013) 35-Year Maximum Loan Tenure
Circular, Bank Negara Malaysia Monthly Statistical Bulletin Tables 1.10 and
1.12, DEFAULT_ASSUMPTIONS Panel, Atomic Demo Data Management, Empirical
Grounding Table, FR-10 Transparent Assumptions And Browser Re-Simulation (+12
more)

### Community 6 - "DirectTableImport.tsx"

Cohesion: 0.11 Nodes (32): progressFromKinds(), SEGMENTS, StageTracker(),
CaseJourney(), AskTrigger(), RISK_TONES, band(), HESITATION (+24 more)

### Community 7 - "StagePill.tsx"

Cohesion: 0.10 Nodes (27): date(), BookingFilter, BookingFilters(),
BookingFiltersProps, RISKS, View, DateField(), monthOf() (+19 more)

### Community 8 - "MessagesPanel.tsx"

Cohesion: 0.12 Nodes (12): currentProposal(), MessagesPanel(), EXTRACTION,
MESSAGE, PROPOSAL, EXTRACTION, MESSAGE, PROPOSAL (+4 more)

### Community 9 - "Mortar Brief"

Cohesion: 0.06 Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+23 more)

### Community 10 - "import.ts"

Cohesion: 0.05 Nodes (59): createEmptyRow(), DirectTableImport(),
generateMockIc(), readSheetFile(), sheetKind(), SheetReadError, DEFAULTS,
FIXTURE (+51 more)

### Community 11 - "app.ts"

Cohesion: 0.11 Nodes (42): packages_core_src_index_checkbookingdraft,
packages_core_src_index_language, proposalFromExtraction(), simNow(),
IsoDateTime, Language, AppOptions, caseRuleProblem() (+34 more)

### Community 12 - "Booking"

Cohesion: 0.09 Nodes (33): BallHolder, listOf(), ApplicationFacts,
appointmentDay(), byOccurred(), CaseDataInput, CaseFacts, deriveApplication()
(+25 more)

### Community 13 - "generate.ts"

Cohesion: 0.09 Nodes (40): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), stamp(), toEpoch(), workDaysBetween() (+32 more)

### Community 15 - "db/index.ts"

Cohesion: 0.13 Nodes (14): PersonaSwitch(), DropdownMenu(),
DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator (+6 more)

### Community 16 - "Hugeicons by Halal Lab"

Cohesion: 0.14 Nodes (26): Design the Fallback First, Canvas UI shadcn Registry
Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add),
Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons
Stroke Rounded Free Style, Why Hugeicons Fits (+18 more)

### Community 17 - "assistant/index.ts"

Cohesion: 0.08 Nodes (27): packages_core_src_index_persona, Persona,
callGemini(), GeminiContent, GeminiFunctionCall, GeminiOptions, GeminiPart,
GeminiResponse (+19 more)

### Community 18 - "Assumptions And Constraints"

Cohesion: 0.05 Nodes (65): Annuity Amortization Monthly Instalment, Ask Mortar
Grounded Operational Assistant, Association of Banks in Malaysia (October 2017)
Processing Guidelines, Temporal Backtest Validation and Brier Score, Bank Negara
Malaysia Statutory Baselines, booking_removals Minimal Deletion Audit Record,
Brown, Cai and DasGupta (2001) Interval Estimation for a Binomial Proportion,
Single Bun HTTP Server on Google Cloud Run (+57 more)

### Community 19 - "BookingsPage.tsx"

Cohesion: 0.08 Nodes (39): ForecastDocuments(), SeedRun, SeedSpreadCard(),
DropZone(), readableSize(), FREE_FEATURES, Pricing(), PRO_FEATURES (+31 more)

### Community 20 - "BookingsTable.tsx"

Cohesion: 0.15 Nodes (15): Ask Mortar Grounded Assistant, Assistant Read-Only
Tool Set, Buyer Signals Scoring, Debt Service Ratio (DSR), FR-12
High-Availability Offline Jev Fallback, FR-18 Jev Through A Local Model Proxy,
FR-20 Message Timing And Buyer Response Explanation, FR-23 Ask Mortar Grounded
Assistant (+7 more)

### Community 21 - "Technical Requirements Document: Mortar"

Cohesion: 0.22 Nodes (14): Peel Effect, Jakub Antalik Portfolio Study, Layered
Card Surface: hairline ring and stacked shadow, Bottom Sheet Drawer Recipe,
libraries.dev: UI libraries for AI agents, Restraint: one signature interaction,
Thinking Orbs, transitions.dev: UI transitions for AI agents (+6 more)

### Community 22 - "projectSettings.ts"

Cohesion: 0.16 Nodes (7): AppSidebar(), AppSidebarProps, PAGE_ICONS,
NAV_GROUP_LABELS, NavGroup, pagesForPersona(), PersonaPage

### Community 23 - "button.tsx"

Cohesion: 0.07 Nodes (38): BookingsTable(), PILL_STAGES, CaseHeader(),
NEXT_ACTION_LABELS, TaskCell(), TasksPanel(), EVIDENCE_LABELS, EVIDENCE_TONES
(+30 more)

### Community 24 - "Markdown Style Guide"

Cohesion: 0.05 Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid
Relative Paths Unless Within The Same Directory, Better Is Better Than Best,
Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers,
Character Line Limit (+32 more)

### Community 25 - "AddBookingDialog.tsx"

Cohesion: 0.18 Nodes (6): buildSnapshot(), BASE, BREADCRUMB,
buildTourSnapshot(), confirmed(), PAGE_OF

### Community 26 - "LandingPage.tsx"

Cohesion: 0.12 Nodes (12): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Shot() (+4 more)

### Community 27 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.11 Nodes (31): Feature Ideas: written up but not built, 48-Hour
Clean Exit, Advisory-Only Financing Flag That Never Blocks a Booking, Early
Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time
Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages
Ruling (+23 more)

### Community 28 - "EvidencePill.tsx"

Cohesion: 0.28 Nodes (8): frontend_src_lib_persona_persona, Rect, Spotlight(),
TourContext, TourContextValue, TourStepBar(), TOUR_STEPS, TourStep

### Community 29 - "Mortar Product Overview"

Cohesion: 0.06 Nodes (36): Ask Mortar, Beneficiaries Who Do Not Log In Daily,
Centralized Case Workspace, Core Operational Capabilities, Current Prototype
Versus Production Roadmap, Daily Users, Deliberately Not Users, Division Of
Operational Responsibility (+28 more)

### Community 30 - "persona.tsx"

Cohesion: 0.15 Nodes (14): PersonaRoute(), mocks, canPersonaOpen(), isPersona(),
pageAt(), pageLabelFor(), PERSONA_DESK_ROLE, PERSONA_PAGES (+6 more)

### Community 31 - "Product Requirements: Mortar"

Cohesion: 0.18 Nodes (23): 30-Day Verified SPA Rate (Business Success Metric),
Historical Forecast Backtesting, Bookings Ledger Filters And Export, Brier Score
Calibration, CaseQuickView Side Sheet, CaseSummary Derivation, Demo Script As
Acceptance, Evidence Log And Event Verification (+15 more)

### Community 33 - "Slide 14: Playbooks: Staff Experience, Reviewed"

Cohesion: 0.05 Nodes (7): CaseEvent, EvidenceStatus, LoanApplication, Message,
Task, Database, FakeDb

### Community 34 - "Perch Landing Teardown"

Cohesion: 0.10 Nodes (27): Mortar Project Guidelines (AGENTS.md), Mortar Agent
Notes, Mortar Design System (Figma), Design: Mortar (visual specification),
Seven Core Design Decisions, Perch Sign-In Teardown, Authored Disabled States,
Perch Fake Auth Flow: no session, no guard (+19 more)

### Community 35 - "reset.ts"

Cohesion: 0.10 Nodes (22): packages_core_src_index_proposalfromextraction,
packages_core_src_index_simulationmeta, JevService, ref_bun, ref_node_path, sql,
addDemoData(), applySchema() (+14 more)

### Community 36 - "assistant.test.ts"

Cohesion: 0.10 Nodes (17): CaseData, App, APPLICATIONS, ask(), BOOKING,
chipsFor(), EVENTS, fakeJev() (+9 more)

### Community 37 - "sim.ts"

Cohesion: 0.13 Nodes (25): groupBy(), backtest(), bucketOf(), buildModel(),
CALIBRATION_BUCKETS, factsFor(), forecast(), leftAge() (+17 more)

### Community 38 - "tools.ts"

Cohesion: 0.13 Nodes (26): packages_core_src_index_default_assumptions,
searchPlaybooks(), packages_core_src_sim_forecast, summarizeCases(),
bookingLine(), cap(), caseDetail(), casesFor() (+18 more)

### Community 39 - "forecast/forecast.ts"

Cohesion: 0.17 Nodes (13): assumptionValue(), DEFAULT_ASSUMPTIONS,
packages_core_src_sim_default_assumptions, financingRisk(),
computeFinancingRisk(), financingRiskFor(), monthlyInstalment(), RiskInputs (+5
more)

### Community 40 - "types.ts"

Cohesion: 0.18 Nodes (8): createProxySystemOne(), client(), colorQuestions,
fakeFetch(), FakeResponse, FetchCall, createJevService(), call()

### Community 41 - "proxyClient.ts"

Cohesion: 0.14 Nodes (16): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+8 more)

### Community 42 - "jev/package.json"

Cohesion: 0.09 Nodes (21): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+13 more)

### Community 43 - "server/package.json"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 44 - "dependencies"

Cohesion: 0.10 Nodes (21): class-variance-authority, clsx, dependencies,
class-variance-authority, clsx, lucide-react, @mortar/core,
@radix-ui/react-label (+13 more)

### Community 45 - "docs/README.md"

Cohesion: 0.13 Nodes (16): About The Project, Architecture, Ask Mortar (Gemini
Assistant), Getting Started, How It Works, License, Limitations, Project
Structure (+8 more)

### Community 46 - "devDependencies"

Cohesion: 0.10 Nodes (21): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+13 more)

### Community 47 - "brain.test.ts"

Cohesion: 0.11 Nodes (28): canonicalSnapshot(), ctx, satisfying(), askBrain(),
buildAskContext(), contentWords(), coverage(), matchQuestion() (+20 more)

### Community 48 - "MotionSites: cinematic landing page prompts"

Cohesion: 0.19 Nodes (16): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Glass Object (Three.js effect), html-in-canvas API, Scroll-Driven
Effects: Laser, Particle Scroll, Bend, MotionSites: cinematic landing page
prompts, MotionSites Academy Lessons (+8 more)

### Community 49 - "useTheme.tsx"

Cohesion: 0.14 Nodes (12): App(), HomeRedirect(), ScrollToTop(),
getSystemTheme(), resolveTheme(), Theme, ThemeContext, ThemeContextValue (+4
more)

### Community 50 - "live-check.ts"

Cohesion: 0.20 Nodes (11): Data Formats, Geist (UI typeface), Geist Mono,
InfoTooltip, Landing Type Exceptions, Nine Approved Text Styles, Progressive
Disclosure, Screen Density (+3 more)

### Community 51 - "LegalPage.test.tsx"

Cohesion: 0.10 Nodes (16): appointment(), row(), waiting(), defaultData(),
mocks, provisionalEvent(), SNAP, CASES (+8 more)

### Community 52 - "Security, Secrets And Privacy"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 53 - "CaseQuickView"

Cohesion: 0.24 Nodes (4): NextStep, booking(), jevMove(), renderCard()

### Community 54 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 55 - "react"

Cohesion: 0.11 Nodes (35): AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED, CONFIRM,
DECIDED, DECISIONS, DOCUMENTS, GROUPS (+27 more)

### Community 56 - "CaseEvent"

Cohesion: 0.29 Nodes (9): appointmentDate(), firmLoad, LEGAL_FIRST_DIR,
legalQueue(), LegalSortKey, median(), sortLegalRows(), sortValue() (+1 more)

### Community 57 - "speak.py"

Cohesion: 0.18 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 58 - "Forecast And Backtest Method"

Cohesion: 0.29 Nodes (4): Checkbox(), RadioGroup(), RadioGroupItem(),
SignInPage()

### Community 59 - "ChaseCard.tsx"

Cohesion: 0.08 Nodes (44): CaseQuickView(), STAGE_PROGRESS, AWAITING_DOCUMENTS,
BOOKING, RISK, WITH_BANK, WaitingOnCell(), WaitingOnPanel() (+36 more)

### Community 60 - "cn"

Cohesion: 0.25 Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(),
DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 61 - "frontend/tsconfig.json"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 62 - "precompute.ts"

Cohesion: 0.11 Nodes (16): packages_core_src_index_jevcacheentry,
packages_core_src_index_searchplaybooks, JevCacheEntry, cache, caseData, client,
CollectingCache, generated (+8 more)

### Community 63 - "components.json"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 64 - "compilerOptions"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 65 - "record.mjs"

Cohesion: 0.07 Nodes (22): bookings, COLUMNS, howTo, OUT, SAMPLES, ref_node_fs,
ref_node_module, ref_node_os (+14 more)

### Community 66 - "Andrej Karpathy Skills"

Cohesion: 0.33 Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3.
Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 67 - "service.ts"

Cohesion: 0.18 Nodes (8): packages_core_src_index_jevkind, jevInputHash(),
sortKeys(), stableJson(), CapturedRequest, extractAnswers, JevClient,
ref_node_crypto

### Community 68 - "test_assemble.py"

Cohesion: 0.27 Nodes (9): AssembleMuxTests, AssemblePictureTests, color_video(),
ff(), probe_duration(), CompletedProcess, Path, slide_png() (+1 more)

### Community 69 - "UI Triage: The Signed-In App"

Cohesion: 0.19 Nodes (16): better-writing Skill, MotionSites Prompt Format:
exact tokens and acceptance views, UI Triage: The Signed-In App, Copy Rules: the
drop and write table, Density Budget, The Desk Lens Becomes a Preset, Not a
Banner, Three Stacked Filter Systems With Disagreeing Numbers, Four-Phase
Implementation Plan (+8 more)

### Community 70 - "core/src/index.ts"

Cohesion: 0.44 Nodes (8): caseState(), defaultPlaybookQuery(), extractJob(),
messageState(), nextActionJob(), playbooksJob(), QUESTION_VERSION, signalsJob()

### Community 71 - "banks.test.ts"

Cohesion: 0.15 Nodes (14): blockerQuery(), PlaybooksPanel(), fetchPlaybooks(),
A, approved(), b, booked, ev() (+6 more)

### Community 72 - "Route /forecast (Projected Signings)"

Cohesion: 0.27 Nodes (9): DialogOverlay, frontend_src_components_ui_sheet_sheet,
SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(),
SheetOverlay(), SheetTitle() (+1 more)

### Community 73 - "WaitingOn.tsx"

Cohesion: 0.31 Nodes (9): Checkbox, Day Cell And Date Picker, Field, Menu Item
And Menu, mortar.persona (localStorage key), Native Controls Ban, Persona
Routing, Sign-In (+1 more)

### Community 74 - "Mortar Demo Recorder"

Cohesion: 0.07 Nodes (44): assemble.sh (Two-Phase Picture Timeline and Mux),
Beat Deconfliction Rule, Beat-Keyed Timing, beats.json (Measured Beat Timeline),
16:10 to 16:9 Pillarbox Padding, Chatterbox TTS (Cloned Voice), Clean-Seed
Fixture Contract (27 messages, 0 tasks), contract.mjs (Beat Sequence Contract)
(+36 more)

### Community 75 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.11 Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve
With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does
A Knowledge Graph Help? (+11 more)

### Community 76 - "CaseSummary"

Cohesion: 0.08 Nodes (22): BookingRow, buildClosedExportRows(), ClosedExportRow,
closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header()
(+14 more)

### Community 77 - "AddBookingDialog.test.tsx"

Cohesion: 0.20 Nodes (5): BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 78 - "Keep It Current"

Cohesion: 0.18 Nodes (17): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+9 more)

### Community 80 - "Mortar Notes For Agents"

Cohesion: 0.05 Nodes (47): App Shell, Sidebar Hoists The Persona's Home First,
ballInCourt, bun run check Must Pass, Closed Export (closedExport.ts),
Conventions, DateField Shared Mortar Date Field, Demo Data Reset (+39 more)

### Community 81 - "core/package.json"

Cohesion: 0.12 Nodes (16): minisearch, dependencies, minisearch,
devDependencies, typescript, vitest, exports, typescript (+8 more)

### Community 82 - "Jakub Krehel's Interface Skills"

Cohesion: 0.18 Nodes (15): Jakub Krehel's Interface Skills, better-accessibility
Skill: reduced motion, zoom, autoplay, better-colors Skill, better-interface
Skill: orchestrated review, better-layout Skill, better-typography Skill, break
Skill, explain-interface Skill (+7 more)

### Community 83 - "Functional Requirements"

Cohesion: 0.48 Nodes (4): Mortar Technical Requirements Document, MortarBench
(Columbia University 2026, arXiv:2606.19416), PJD Regency Sdn Bhd v. Tribunal
Tuntutan Pembeli Rumah (2021), Synthetic Data Guarantee

### Community 84 - "notificationStore.ts"

Cohesion: 0.22 Nodes (10): Notification, NotificationPopover(),
useNotifications(), emit(), Listener, listeners, notifications,
notificationStore (+2 more)

### Community 85 - "Components"

Cohesion: 0.29 Nodes (11): Booking Row And Table Header, Button, Chase Card,
Drop Zone, Icon Supplements A Word, Never Replaces One, Icons, One Primary
Action Per View, Stage Tracker (+3 more)

### Community 86 - "Bug Report Issue Form"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 87 - "scripts"

Cohesion: 0.17 Nodes (11): license, name, private, scripts, build, dev, preview,
template:bookings (+3 more)

### Community 88 - "nextStep.ts"

Cohesion: 0.47 Nodes (6): askBrain Scripted Fallback, Ask Mortar Gemini
Contract, AskPanel, POST /api/assistant, Gemini Read-Only Tool Set,
matchQuestion Ranks On Coverage

### Community 89 - "walk.mjs"

Cohesion: 0.30 Nodes (9): scrollDuration(), scrollTarget(), smoothScrollTo(),
film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink(), visible() (+1
more)

### Community 90 - "Landing Video Pipeline"

Cohesion: 0.19 Nodes (14): Porting Its Hover Motion without React, LQIP
Placeholder Behind Video Tiles, Each Rule Has One Owner, Reduced Motion Kill
Switch: 0.01ms not none, WCAG 2.2.2 Autoplay Pause Requirement, Landing Video
Pipeline, The Agent's Video Checklist, Gemini Videos Composer at
gemini.google.com/videos (+6 more)

### Community 91 - "What Mortar Does"

Cohesion: 0.28 Nodes (9): Acceptance Criteria (fourteen), Ask Panel, Dialog,
Internal Names Stay Internal, Jev (assistant), Name The Thing, Not The
Mechanism, Plain Language, Tabular Numerals (+1 more)

### Community 92 - "Persona"

Cohesion: 0.22 Nodes (4): JevKind, MemoryCache, MemoryCache, DbJevCache

### Community 93 - "NarrateTests"

Cohesion: 0.29 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 94 - "Front-End Simulation"

Cohesion: 0.12 Nodes (17): First Build, Forecast And Backtest, Front-End
Simulation, Generator, How The Simulation Works, Legal And Domain Notes,
Messages And Proposed Updates, Open Questions (+9 more)

### Community 96 - "Pull Request Template"

Cohesion: 0.28 Nodes (9): Fill In The Pull Request Template, Never Commit Real
Buyer Data, Show UI Changes With Screenshots, Data Check, Screenshots Or
Recording, Pull Request Template, Screenshots, What Changed (+1 more)

### Community 97 - "jev/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, types, extends, include, src/**/*.ts,
../../tsconfig.json, vitest.config.ts, node (+1 more)

### Community 98 - "Slide 06: Three Desks, One Book"

Cohesion: 0.04 Nodes (43): RANKING, SNAPSHOT, EXTRACTION_9001,
EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001, SIGNALS_9001
(+35 more)

### Community 99 - "Do Not"

Cohesion: 0.24 Nodes (12): Chromatic Panel (.land-panel), Landing Feature Cards
(.land-desk), Landing, LandingPage.css, Landing Panel Tokens, Perch (earlier
project), Public Footer, Public Pages (+4 more)

### Community 100 - "Design: Mortar"

Cohesion: 0.21 Nodes (12): App Shell, Content Canvas, Elevation And Focus, Flat
Ledger Look, Focus Ring, Guided Tour Chrome, Lucide (lucide-react), Motion (+4
more)

### Community 101 - "Checklist"

Cohesion: 0.25 Nodes (9): Follow The Design Guide And Shared UI Components, Keep
AI Agents On Task, One Problem Per Issue, One Thing Per Pull Request, Point
Agents At The Rules, Read The Diff Before Committing, Update The Docs In The
Same Pull Request, Working With AI Coding Agents (+1 more)

### Community 102 - "Ask The Graph First"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 103 - "Deck Assets Manifest"

Cohesion: 0.50 Nodes (3): Deck Assets Manifest, Generated Art, Product
Screenshots

### Community 105 - "What Happened"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 106 - "server/tsconfig.json"

Cohesion: 0.22 Nodes (8): bun-types, db/**/\*.ts, compilerOptions, types,
extends, include, src/**/*.ts, ../tsconfig.json

### Community 107 - "subtitles.py"

Cohesion: 0.33 Nodes (8): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration uses,, Split into lines of similar
length, never mid-word. Two things depend on th, Group wrapped lines into cards
of at most MAX_LINES., ts(), wav_ms(), wrap()

### Community 108 - "AskPanel.tsx"

Cohesion: 0.13 Nodes (17): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
ownerName(), taskTitle(), askAssistantStream(), AssistantImage (+9 more)

### Community 109 - "packages_core_src_index_task"

Cohesion: 0.16 Nodes (11): packages_core_src_index_jevcache,
packages_core_src_index_jevmeta, packages_core_src_index_jevservice,
packages_core_src_index_scoreanswer, JevCache, JevMeta, ScoreAnswer, AnswersOf
(+3 more)

### Community 111 - "TourProvider.tsx"

Cohesion: 0.17 Nodes (12): AppLayout(), AppLayoutProps, AppNav(),
useBreadcrumbs(), AppShell(), usePersona(), TourButton(), resolveRoute() (+4
more)

### Community 112 - "RTK Commands By Workflow"

Cohesion: 0.13 Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Golden Rule, Infrastructure (85% Savings),
JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 113 - "Colour"

Cohesion: 0.27 Nodes (10): Calibrated Contrast, Colour, Do And Do Not,
globals.css, Ink Is The Action Colour, ink Neutral Ramp, paper Neutral Ramp,
Primitives Collection (+2 more)

### Community 115 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 116 - "render.mjs"

Cohesion: 0.06 Nodes (54): AddMessageForm(), defaultName(), normalTime(), ROLES,
timeNow(), ApplicationsCard(), STATUS_TONES, EvidenceLog() (+46 more)

### Community 117 - "SubtitleLayoutTests"

Cohesion: 0.40 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 118 - "Financing-Risk Method"

Cohesion: 0.23 Nodes (12): booking_removals, bookings, event_reviews, events,
imports, jev_answers, loan_applications, messages (+4 more)

### Community 119 - "formatters.ts"

Cohesion: 0.28 Nodes (6): ChartTooltipContentProps, TooltipEntry,
currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 120 - "core/tsconfig.json"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 121 - "schedule.py"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A be, Push starts later
so no line is still speaking when the next begins. Pure s

### Community 123 - "BookingPipelineFlow.tsx"

Cohesion: 0.07 Nodes (31): BookingPipelineFlow(), BookingPipelineFlowProps,
PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId,
StepConfig, STEPS (+23 more)

### Community 124 - "proof.test.mjs"

Cohesion: 0.50 Nodes (3): BK_MESSAGES, verifyCleanSeed(), warmProduction()

### Community 125 - "json"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 127 - "better-ui Skill: surfaces, icons, motion values"

Cohesion: 0.18 Nodes (18): Design Specification (DESIGN.md), Product
Requirements Document (PRD.md), Add Bookings Intake And Validation, Companies
Act 2016 s245(3) and Income Tax Act 1967 s82(1)(a), FR-13 Add Bookings Intake
And Validation, FR-14 Persona Navigation And Page Routing, FR-15 SPA Execution
Desk, FR-21 Bookings Active And Closed Views With Export (+10 more)

### Community 129 - "Agent Skills"

Cohesion: 0.22 Nodes (8): Agent Skills, Install And Update,
leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows,
pbakaus/impeccable, Which Skill First

### Community 132 - "AppErrorBoundary"

Cohesion: 0.10 Nodes (7): mocks, RISK, AppErrorBoundary, isChunkLoadError(),
packages_core_src_index_financingrisk, FinancingRisk, ref_vitest

### Community 137 - "usePagination"

Cohesion: 0.25 Nodes (11): FR-16 Leakage Analysis And Recovery Sizing, FR-24
Guided Walkthrough, FR-4 Evidence Log And Multi-Party Event Verification, Guided
Walkthrough Tour, Leakage Analysis And Recovery Sizing, Legal Admin (Arvind
Raj), Loan Admin (Tan Mei Ling), PERSONA_PAGES (+3 more)

### Community 138 - "GitHub Issues And Pull Requests"

Cohesion: 0.50 Nodes (3): Before Opening A Pull Request, Before Opening An
Issue, GitHub Issues And Pull Requests

### Community 143 - "Route /import (Add Bookings)"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

### Community 147 - "ref_node_fs"

Cohesion: 0.15 Nodes (4): ref_node_test, cleanEvents, SEEDED_MESSAGES,
WALK_BEATS

### Community 171 - "ref_vitest"

Cohesion: 0.13 Nodes (17): booking, riskLabel(), fetchNextAction(),
updateTask(), SnapshotContext, SnapshotContextValue, useCases(), useSnapshot()
(+9 more)

## Knowledge Gaps

- **715 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+710 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `BookingsPage.tsx` to `ForecastPage.tsx`,
  `Forecast And Backtest Method`, `DirectTableImport.tsx`, `StagePill.tsx`,
  `banks.test.ts`, `ChaseCard.tsx`, `import.ts`,
  `Route /forecast (Projected Signings)`, `db/index.ts`, `render.mjs`, `react`,
  `Security, Secrets And Privacy`, `button.tsx`, `LandingPage.tsx`,
  `BookingPipelineFlow.tsx`, `cn`?** _High betweenness centrality (0.034) - this
  node is a cross-community bridge._
- **Why does `CaseEvent` connect
  `Slide 14: Playbooks: Staff Experience, Reviewed` to `ForecastPage.tsx`,
  `api.ts`, `app.test.ts`, `MessagesPanel.tsx`, `app.ts`, `Booking`,
  `generate.ts`, `AddBookingDialog.tsx`, `FakeDb`, `reset.ts`,
  `assistant.test.ts`, `sim.ts`, `tools.ts`, `forecast/forecast.ts`,
  `brain.test.ts`, `LegalPage.test.tsx`, `CaseEvent`, `banks.test.ts`,
  `CaseSummary`, `Slide 06: Three Desks, One Book`, `render.mjs`?** _High
  betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `react` connect `case/index.ts` to `ForecastPage.tsx`,
  `BookingsPage.tsx`, `dependencies`?** _High betweenness centrality (0.029) -
  this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _715 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `questions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10252100840336134 - nodes in this community are weakly
  interconnected._
- **Should `ForecastPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1341350601295097 - nodes in this community are weakly
  interconnected._
- **Should `api.ts` be split into smaller, more focused modules?** _Cohesion
  score 0.08414634146341464 - nodes in this community are weakly
  interconnected._
