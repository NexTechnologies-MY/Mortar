# Graph Report - . (2026-09-27)

## Corpus Check

- 21 files · ~290,538 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 3309 nodes · 7789 edges · 203 communities (169 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 360 edges
  (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- Booking Record Update Forms
- Chase Task And Next Step Logic
- BookingsPage.tsx
- api.ts
- Mortar Demo Recorder
- ForecastPage.tsx
- DirectTableImport.tsx
- Page And Persona Switching Tests
- Mortar Notes For Agents
- Product Overview: Users And Problem
- Booking
- BookingPipelineFlow.tsx
- package.json
- button.tsx
- App Shell And Navigation
- Slide 06: Three Desks, One Book
- generate.ts
- A Company Brain For Booking-To-SPA Conversion
- Page Container And Card Primitives
- docs/README.md
- Booking
- questions.ts
- Slide 14: Playbooks: Staff Experience, Reviewed
- BookingsTable.tsx
- Slide 14: Playbooks: Staff Experience, Reviewed
- Industry Practitioner Survey Findings, n = 8
- Mortar Brief
- Assumptions And Constraints
- CaseSummary
- persona.tsx
- import.ts
- core/src/index.ts
- FakeDb
- sim.ts
- tools.ts
- Persona
- ChaseCard.tsx
- Mortar Product Overview
- json
- app.test.ts
- MotionSites: cinematic landing page prompts
- CaseEvent
- Financing Risk And Assumptions
- Conversion Forecasting Accuracy
- EvidencePill.tsx
- app.ts
- Hugeicons by Halal Lab
- Next Step Derivation And Jev
- Assumptions And Constraints
- proxyClient.ts
- better-ui Skill: surfaces, icons, motion values
- reset.ts
- projectSettings.ts
- jev/package.json
- assistant.test.ts
- assistant/index.ts
- server/package.json
- dependencies
- Landing Video Pipeline
- devDependencies
- CaseEvent
- speak.py
- Pipeline, Leakage And Exports
- Assumptions And Constraints
- Assumptions And Constraints
- Components
- app.ts
- WaitingOn.tsx
- Design Surfaces, Motion, Chrome
- Markdown Style Guide
- Mortar Product Overview
- TypeSafe Jev And Audit Log
- Assumptions And Constraints
- frontend/tsconfig.json
- Reviews And Merging
- precompute.ts
- live-check.ts
- components.json
- brain.test.ts
- compilerOptions
- notificationStore.ts
- Bug Report Issue Form
- test_assemble.py
- Non-Functional Requirements
- Jakub Krehel's Interface Skills
- Checklist
- Slide 06: Three Desks, One Book
- Assumptions And Constraints
- Data Display And Tooltip Rules
- Mortar Product Overview
- Perch Landing Teardown
- core/package.json
- banks.test.ts
- Keep It Current
- UI Triage: The Signed-In App
- app.ts
- ref_node_fs
- BatchSpeechTests
- Financing-Risk Method
- live-check.ts
- Hugeicons by Halal Lab
- scripts
- Security, Secrets And Privacy
- Route /forecast (Projected Signings)
- walk.mjs
- RTK Commands By Workflow
- Components
- Components
- Assumptions And Constraints
- booking-template.mjs
- react
- react
- record.mjs
- Assumptions And Constraints
- Assumptions And Constraints
- Agent Skills
- react
- persona.tsx
- jev/tsconfig.json
- NarrateTests
- Assumptions And Constraints
- CaseSummary
- AppErrorBoundary
- generate.ts
- server/tsconfig.json
- record.mjs
- subtitles.py
- Andrej Karpathy Skills
- Ask The Graph First
- Markdown Style Guide
- Markdown Style Guide
- Personas And Jobs To Be Done
- Playbook Search With Minisearch
- CaseSummary
- assistant/index.ts
- WaitingOn.tsx
- CaseEvent
- useTheme.tsx
- Pull Request Template
- forecast/forecast.ts
- .prettierrc.json
- proof.test.mjs
- GitHub Issues And Pull Requests
- persona.tsx
- Markdown Style Guide
- persona.tsx
- formatters.ts
- What Happened
- core/tsconfig.json
- schedule.py
- SubtitleLayoutTests
- TourProvider.test.tsx
- Deck Assets Manifest
- Route /import (Add Bookings)
- Slide 10: Where AI Helps, Where People Decide
- assemble.sh
- Mortar Demo Recorder
- Assumptions And Constraints
- booking-template.mjs
- Slide 18: A 12-Week Pilot
- Product Overview
- Technical Requirements Document
- dependencies
- Slide 17: The One Number We Are Judged By
- dependencies
- dependencies
- CaseEvent
- dependencies
- .releasePointerCapture
- dependencies
- .scrollIntoView
- read-excel-file/browser
- frontend/package.json
- Start From Fresh main
- narrate.sh
- Assumptions And Constraints
- Assumptions And Constraints
- main.tsx
- Draft While Unfinished
- react
- ForecastPage.tsx
- react
- ref_node_assert
- Deploy Prototype Workflow

## God Nodes (most connected - your core abstractions)

1. `cn()` - 120 edges
2. `usePersona()` - 52 edges
3. `Booking` - 48 edges
4. `CaseEvent` - 48 edges
5. `Button` - 46 edges
6. `CaseSummary` - 44 edges
7. `Database` - 39 edges
8. `FakeDb` - 39 edges
9. `formatDate()` - 30 edges
10. `Task` - 30 edges

## Surprising Connections (you probably didn't know these)

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
- `MessagesPanel()` --indirect_call--> `extraction()` [INFERRED]
  frontend/src/components/bookings/MessagesPanel.tsx →
  packages/core/src/jev.test.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Persona Scoping And Access Model** — docs_prd_named_profile_scoping,
  docs_prd_persona_pages, docs_prd_persona_route,
  docs_prd_persona_defaults_not_access, docs_prd_sign_in_as [INFERRED 0.95]
- **Evidence Log To Verified Case Stage Chain** — docs_prd_fr4_evidence_log,
  docs_prd_event_schema, docs_prd_event_statuses, docs_prd_review_decisions,
  docs_prd_proposal_from_extraction, docs_prd_fr2_stall_detection [EXTRACTED
  1.00]
- **Offline Resilient AI Assistance** — docs_prd_fr6_jev_extraction,
  docs_prd_fr12_offline_fallback, docs_prd_jev_three_tier_fallback,
  docs_prd_nfr4_zero_demo_failure, docs_prd_fr18_local_model_proxy,
  docs_prd_nfr2_jev_sla [EXTRACTED 1.00]
- **AI-Human Operating Boundary** — docs_product_ai_human_boundary,
  docs_product_copilot_boundary, docs_product_jev_boundary,
  docs_product_division_of_responsibility, docs_product_what_mortar_is_not
  [EXTRACTED 1.00]
- **Four-Persona Workspace** — docs_product_sales_administration,
  docs_product_loan_administration, docs_product_legal_operations,
  docs_product_project_management, docs_product_persona_comparison,
  docs_product_who_uses_mortar [EXTRACTED 1.00]
- **Evidence-Grounded Success Measurement** — docs_product_practitioner_survey,
  docs_product_official_benchmarks, docs_product_thirty_day_verified_spa_metric,
  docs_product_twelve_week_plan, docs_product_pilot_evaluation [INFERRED 0.85]
- **One Deployable: Bun Process, Cloud Run, Neon Postgres, GitHub Actions** —
  docs_readme_bun_single_process, docs_readme_google_cloud_run,
  docs_readme_neon_postgres, docs_readme_github_actions_deploy [EXTRACTED 1.00]
- **Shared Packages: @mortar/core and @mortar/jev** — docs_readme_mortar_core,
  docs_readme_mortar_jev, docs_readme_architecture [EXTRACTED 1.00]
- **AI Surface: Jev proposals, Ask MortarAI assistant, human confirmation** —
  docs_readme_mortar_jev, docs_readme_copilot_gemini_setup,
  docs_readme_run_jev_locally, docs_readme_ai_assistant_not_decider [INFERRED
  0.85]
- **Human-In-The-Loop Event Ledger** — docs_trd_table_events,
  docs_trd_table_event_reviews, docs_trd_event_verification_states,
  docs_trd_provisional_event, docs_trd_api_event_review,
  docs_trd_ui_verification [EXTRACTED 1.00]
- **Resilient Jev Read Path** — docs_trd_fallback_ladder,
  docs_trd_table_jev_answers, docs_trd_input_hash, docs_trd_stale_flag,
  docs_trd_jev_cache_fixture, docs_trd_caching_strategy [EXTRACTED 1.00]
- **Privacy And Statutory Guardrails** — docs_trd_synthetic_data_guarantee,
  docs_trd_pria, docs_trd_data_retention, docs_trd_pdpa_2010,
  docs_trd_pdpa_compliance, docs_trd_profile_sessions [INFERRED 0.85]
- **One Access Boundary Across Reads, Writes, And Assistant Tools** —
  docs_agents_notes_named_profiles_access, docs_agents_notes_copilot_five_tools,
  docs_agents_notes_persona_pages_drive_nav,
  docs_agents_notes_profile_switch_workspace [INFERRED 0.85]
- **Confirmed Event Log Drives Forecast, Stall Reasons, And Manager
  Suggestions** — docs_agents_notes_forecast_two_halves,
  docs_agents_notes_open_is_not_live, docs_agents_notes_manager_workflows,
  docs_agents_notes_mortar_core_import [INFERRED 0.95]
- **Radix Workarounds For Tests And Dialog Stacking** —
  docs_agents_notes_radix_popover_jsdom, docs_agents_notes_inline_popover_mock,
  docs_agents_notes_radix_z_index, docs_agents_notes_focus_sheet_not_control
  [INFERRED 0.85]
- **Persona-driven home routing and profile persistence** — agents_personas,
  agents_mortar_profile_key, agents_mortar_persona_key, agents_routes,
  agents_mortar_core_package [EXTRACTED 1.00]
- **Agent workflow rules and their detail documents** — agents_rules,
  agents_rtk_rule, agents_karpathy_rule, agents_github_rule,
  agents_graphify_rule, agents_check_format_rule, agents_rtk_doc,
  agents_karpathy_doc, agents_github_doc, agents_graphify_doc [EXTRACTED 1.00]
- **Flat Ledger Surface System** — docs_design_flat_ledger,
  docs_design_elevation_card, docs_design_radius_tokens,
  docs_design_no_row_tinting, docs_design_semantic_colour [INFERRED 0.85]
- **Status Visual Language (tone + word + pill)** — docs_design_status_tones,
  docs_design_status_language, docs_design_status_pill,
  docs_design_signed_pill_inversion, docs_design_urgency_words [EXTRACTED 1.00]
- **Public Page Chrome (Landing, Footer, Sign-In)** — docs_design_public_pages,
  docs_design_landing, docs_design_public_footer, docs_design_sign_in,
  docs_design_landing_panel_tokens [EXTRACTED 1.00]
- **Narration Script Feeds Voice, Schedule and Subtitles** —
  scripts_demo_readme_narration_txt, scripts_demo_readme_manifest_py,
  scripts_demo_readme_lines_json, scripts_demo_readme_speak_py,
  scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py [EXTRACTED
  1.00]
- **Beat-Keyed Timing Contract Across Walk, Record and Schedule** —
  scripts_demo_readme_walk_mjs, scripts_demo_readme_record_mjs,
  scripts_demo_readme_contract_mjs, scripts_demo_readme_schedule_py,
  scripts_demo_readme_beat_keyed_timing,
  scripts_demo_readme_caution_beat_deconfliction [INFERRED 0.95]
- **Deliverable Mux: Picture, Voice, Subtitles, Music Bed** —
  scripts_demo_readme_slides_render_mjs, scripts_demo_readme_assemble_sh,
  scripts_demo_readme_music_bed, scripts_demo_readme_verify_deliverable,
  scripts_demo_readme_demo_out [EXTRACTED 1.00]
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

## Communities (203 total, 34 thin omitted)

### Community 0 - "Booking Record Update Forms"

Cohesion: 0.07 Nodes (59): AddMessageForm(), defaultName(), normalTime(), ROLES,
timeNow(), APPLICATION_STATUS_LABELS, AFTER_SPA, BANK_OPTIONAL (+51 more)

### Community 1 - "Chase Task And Next Step Logic"

Cohesion: 0.06 Nodes (56): TaskCell(), AWAITING_DOCUMENTS, BOOKING, RISK,
WITH_BANK, WaitingOnPanel(), waitingOnTask(),
frontend_src_components_case_index_formatrm (+48 more)

### Community 2 - "BookingsPage.tsx"

Cohesion: 0.05 Nodes (51): date(), DateField(), monthOf(), toDate(), toIso(),
DropZone(), readableSize(), BackToTop() (+43 more)

### Community 3 - "api.ts"

Cohesion: 0.05 Nodes (36): currentProposal(), MessageItem(), MessagesPanel(),
EXTRACTION, MESSAGE, PROPOSAL, EXTRACTION, MESSAGE (+28 more)

### Community 4 - "Mortar Demo Recorder"

Cohesion: 0.06 Nodes (60): assemble.sh, Beat-Keyed Timing, Capture Beat Sequence
Table, Execution Step 1: Capture, Caution: 16-bit PCM Audio, Caution: Beat
Deconfliction, Caution: 16:10 to 16:9 Canvas Padding, Caution: Chatterbox
Variants (+52 more)

### Community 5 - "ForecastPage.tsx"

Cohesion: 0.11 Nodes (33): ApplicationsCard(), STATUS_TONES, NEXT_ACTION_LABELS,
SignalsPanel(), TasksPanel(), SIGNALS, ChartTooltipContent(),
ChartTooltipContentProps (+25 more)

### Community 6 - "DirectTableImport.tsx"

Cohesion: 0.08 Nodes (40): FIT_PRESENTATION, Ranked, STATUS_BADGES, JevTag(),
pill(), RISK_TONES, band(), HESITATION (+32 more)

### Community 7 - "Page And Persona Switching Tests"

Cohesion: 0.06 Nodes (20): RISK, row(), waiting(), PersonaProvider(),
defaultData(), mocks, provisionalEvent(), SNAP (+12 more)

### Community 8 - "Mortar Notes For Agents"

Cohesion: 0.07 Nodes (56): App Shell Files, Assistant Files, bun run check Gate,
Bun Workspaces And Filtering, Charts Files, CI Workflow
(.github/workflows/ci.yml), closedExport (buildClosedExportRows /
downloadClosedExport), Conventions (+48 more)

### Community 9 - "Product Overview: Users And Problem"

Cohesion: 0.08 Nodes (52): Support For Automation (AI Safe Areas), Where AI
Helps And Where People Decide, Aster Heights Fictional Project, Beneficiaries
Who Do Not Log In (Finance, Sales Director), Booking BK-9001 Lifecycle, Booking
Leakage, Centralized Case Workspace, Ask MortarAI (+44 more)

### Community 10 - "Booking"

Cohesion: 0.08 Nodes (36): altDataset(), SOURCE_TAG_LABELS, SOURCE_TAG_TONES,
canonicalSnapshot(), STORIES, assumptions, booking, event() (+28 more)

### Community 11 - "BookingPipelineFlow.tsx"

Cohesion: 0.07 Nodes (38): BookingFilter, BookingFilters(), BookingFiltersProps,
RISKS, View, BookingPipelineFlow(), BookingPipelineFlowProps, PipelineCounts
(+30 more)

### Community 12 - "package.json"

Cohesion: 0.04 Nodes (45): concurrently, eslint, eslint-config-prettier,
@eslint/js, eslint-plugin-react-hooks, globals, husky, lint-staged (+37 more)

### Community 13 - "button.tsx"

Cohesion: 0.09 Nodes (32): CaseHeader(), EvidenceLog(), SOURCE_LABELS,
TRACK_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS, EXTRACTED_EVENT_LABELS,
formatDateTime() (+24 more)

### Community 14 - "App Shell And Navigation"

Cohesion: 0.08 Nodes (29): App(), HomeRedirect(), CaseQuickView(), addDays(),
datasetFor(), AppLayout(), AppLayoutProps, AppNav() (+21 more)

### Community 15 - "Slide 06: Three Desks, One Book"

Cohesion: 0.08 Nodes (31): RANKING, SNAPSHOT, buildSnapshot(), EXTRACTION_9001,
EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001 (+23 more)

### Community 16 - "generate.ts"

Cohesion: 0.10 Nodes (32): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL,
drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+24 more)

### Community 17 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.05 Nodes (37): See Also, 10. A Short Learning Path, 11. Questions To
Resolve With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge (+29
more)

### Community 18 - "Page Container And Card Primitives"

Cohesion: 0.12 Nodes (24): SeedSpreadCard(), PageContainer(),
PageContainerProps, VARIANTS, PageHeaderCard(), PageHeaderCardProps,
HealthCard(), row() (+16 more)

### Community 19 - "docs/README.md"

Cohesion: 0.13 Nodes (37): AGENTS.md Agent Instructions, Mortar Design Spec,
48-Hour Screening and Early Release of Doomed Units, AI Is an Assistant, Not a
Decider, Architecture, Architecture Diagram (assets/architecture.svg, drawio
source), Booking Leakage Problem (RM24M Illusory Sales), Bun.serve Single
Process (Static + /api/*) (+29 more)

### Community 20 - "Booking"

Cohesion: 0.10 Nodes (30): ApplicationFacts, appointmentDay(), byOccurred(),
CaseDataInput, CaseFacts, deriveApplication(), deriveCase(), DocumentLedger (+22
more)

### Community 21 - "questions.ts"

Cohesion: 0.10 Nodes (27): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+19 more)

### Community 23 - "BookingsTable.tsx"

Cohesion: 0.12 Nodes (25): DirectTableImport(), Entry, fakeBuyer(), newEntry(),
rowId(), salesProfiles, ProjectSettingsCard(), fetchProjectSettings() (+17 more)

### Community 24 - "Slide 14: Playbooks: Staff Experience, Reviewed"

Cohesion: 0.08 Nodes (8): BookingDraft, CaseEvent, EvidenceStatus, IsoDateTime,
Message, StaffProfile, Database, ImportBatch

### Community 25 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.10 Nodes (33): Feature Ideas
(docs/research/feature-ideas/README.md), Survey Evidence (n=8 Malaysian
Practitioners), Feature Ideas: written up but not built, 48-Hour Clean Exit,
Advisory-Only Financing Flag That Never Blocks a Booking, Early Financing
Eligibility Check, LAD Burn Clock, Learned Durations and On-Time Follow-Ups (+25
more)

### Community 26 - "Mortar Brief"

Cohesion: 0.06 Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+23 more)

### Community 27 - "Assumptions And Constraints"

Cohesion: 0.08 Nodes (31): Amortization Tenure Cap, Annuity Monthly Instalment,
Backtest Interface Caption, Temporal Backtest Validation, Bank Application
Chains, Bank Negara Malaysia Statistical Bulletins And Policy, Brier Score And
Calibration Buckets, Brown, Cai & DasGupta (2001) Interval Estimation For A
Binomial Proportion (+23 more)

### Community 28 - "CaseSummary"

Cohesion: 0.09 Nodes (21): BookingRow, buildClosedExportRows(), ClosedExportRow,
closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header()
(+13 more)

### Community 29 - "persona.tsx"

Cohesion: 0.11 Nodes (18): AppSidebar(), AppSidebarProps, PAGE_ICONS,
PersonaRoute(), mocks, canPersonaOpen(), NAV_GROUP_LABELS, NavGroup (+10 more)

### Community 30 - "import.ts"

Cohesion: 0.13 Nodes (29): ageOn(), checkBookingDraft(), DateOrder,
detectDateOrder(), EXCEL_EPOCH, findHeader(), HEADER_NAMES, headerCandidates()
(+21 more)

### Community 31 - "core/src/index.ts"

Cohesion: 0.13 Nodes (22): packages_core_src_index_jevkind,
packages_core_src_index_scoreanswer, ScoreAnswer, jevInputHash(), sortKeys(),
stableJson(), caseState(), defaultPlaybookQuery() (+14 more)

### Community 33 - "sim.ts"

Cohesion: 0.15 Nodes (25): SeedRun, FUNNEL_STAGES, groupBy(), backtest(),
bucketOf(), buildModel(), CALIBRATION_BUCKETS, factsFor() (+17 more)

### Community 34 - "tools.ts"

Cohesion: 0.13 Nodes (27): ballInCourt, listOf(),
packages_core_src_index_default_assumptions, bookingLine(), cap(), caseDetail(),
casesFor(), day() (+19 more)

### Community 35 - "Persona"

Cohesion: 0.10 Nodes (11): JevCache, JevKind, createProxySystemOne(), client(),
colorQuestions, FakeResponse, FetchCall, MemoryCache (+3 more)

### Community 36 - "ChaseCard.tsx"

Cohesion: 0.14 Nodes (19): progressFromKinds(), SEGMENTS, STAGE_PROGRESS,
StageTracker(), CaseJourney(), WaitingOnCell(), BALL_HOLDER_ICONS,
BALL_HOLDER_LABELS (+11 more)

### Community 37 - "Mortar Product Overview"

Cohesion: 0.10 Nodes (26): Arvind Raj (Legal Admin), CaseQuickView Side Sheet,
Chip Economy Rule, daysSinceLoanApproved / daysSinceSpaSet, Atomic Demo Data
Add/Delete, FR-15 SPA Execution Desk, FR-19 Record An Update, Independent Loan
And Legal Tracks (+18 more)

### Community 38 - "json"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 39 - "app.test.ts"

Cohesion: 0.08 Nodes (15): packages_core_src_index_evidencestatus,
BookingMovedOnError, EventSettledError, ImportMovedOnError,
OpenApplicationError, UnitHeldError, APPLICATION, BOOKING (+7 more)

### Community 40 - "MotionSites: cinematic landing page prompts"

Cohesion: 0.13 Nodes (25): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Glass Object (Three.js effect), html-in-canvas API, Peel Effect,
Scroll-Driven Effects: Laser, Particle Scroll, Bend, Jakub Antalik Portfolio
Study (+17 more)

### Community 41 - "CaseEvent"

Cohesion: 0.14 Nodes (21): appointmentDate(), firmLoad, isLegalStall(),
LEGAL_FIRST_DIR, LegalSortKey, median(), sortLegalRows(), sortValue() (+13 more)

### Community 42 - "Financing Risk And Assumptions"

Cohesion: 0.15 Nodes (24): Association of Banks in Malaysia (2017) Press
Release, Annuity Monthly Instalment, Bank Negara Malaysia (2010) Property Market
Measures, Bank Negara Malaysia Monthly Statistical Bulletin, Bank Negara
Malaysia (2013) 35-Year Tenure Circular, Debt Service Ratio (DSR),
DEFAULT_ASSUMPTIONS Panel, DEFAULT_SEED (20260918) (+16 more)

### Community 43 - "Conversion Forecasting Accuracy"

Cohesion: 0.10 Nodes (24): Backtest Caption: Proves Method Not Business, Booking
Fee Prohibition (Reg 11(2) 1989), Brown, Cai & DasGupta (2001) Wilson Interval,
Four-Bucket Calibration Table, FR-8 Statistical Conversion Forecasting, FR-9
Historical Forecast Backtesting, Goals And Non-Goals, Housing Development
(Control and Licensing) Regulations (+16 more)

### Community 44 - "EvidencePill.tsx"

Cohesion: 0.13 Nodes (13): frontend_src_lib_persona_persona, Rect, Spotlight(),
resolveRoute(), TourContext, TourContextValue, TourStepBar(), TOUR_STEPS (+5
more)

### Community 45 - "app.ts"

Cohesion: 0.16 Nodes (23): AppOptions, caseRuleProblem(), cleanDraft(),
confirmProblem(), cookieValue(), createApp(), DOCUMENT_KINDS, EVENT_KINDS (+15
more)

### Community 46 - "Hugeicons by Halal Lab"

Cohesion: 0.15 Nodes (23): Design the Fallback First, Canvas UI shadcn Registry
Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add),
Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons
Stroke Rounded Free Style, Iconsax, from the Vuesax team (+15 more)

### Community 47 - "Next Step Derivation And Jev"

Cohesion: 0.09 Nodes (23): ABM Timely Processing Guidelines (Oct 2017), POST
/api/events/:id/review, POST /api/messages/:id/extract, POST
/api/bookings/:id/next-action, GET /api/bookings/:id/playbooks, GET
/api/bookings/:id/signals, frontend CaseQuickView Side Sheet, Row-Locked Event
Review Flow (+15 more)

### Community 48 - "Assumptions And Constraints"

Cohesion: 0.09 Nodes (23): POST /api/events, REST API Reference, Unified Bun
HTTP Server on Cloud Run, summarizeCases Derivation Rules, CaseSummary
Interface, packages/core/src/types.ts Domain Contract, Data Model And Schema,
Demographic Synthesis (+15 more)

### Community 49 - "proxyClient.ts"

Cohesion: 0.14 Nodes (16): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+8 more)

### Community 50 - "better-ui Skill: surfaces, icons, motion values"

Cohesion: 0.13 Nodes (22): Buyer Signals (responsiveness/hesitation), Scripted
askBrain Fallback, Assistant Read-Only Tool Set, FR-18 Jev Through A Local Model
Proxy, FR-20 Message Timing And Buyer Response, FR-23 Ask MortarAI Grounded
Assistant, FR-24 Guided Walkthrough, FR-7 Next Action, Playbook Fit And Buyer
Signals (+14 more)

### Community 51 - "reset.ts"

Cohesion: 0.11 Nodes (14): packages_core_src_index_jevcache,
packages_core_src_index_jevservice, JevService, ref_node_path, app, db, fetch(),
port (+6 more)

### Community 52 - "projectSettings.ts"

Cohesion: 0.26 Nodes (17): packages_core_src_index_loanapplication,
packages_core_src_index_task, createDatabase(), isoDate(), isoDateTime(),
jsonb(), maskDigits(), Row (+9 more)

### Community 53 - "jev/package.json"

Cohesion: 0.09 Nodes (21): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+13 more)

### Community 54 - "assistant.test.ts"

Cohesion: 0.13 Nodes (18): App, APPLICATIONS, ask(), BOOKING, chipsFor(),
event(), EVENTS, fakeJev() (+10 more)

### Community 55 - "assistant/index.ts"

Cohesion: 0.14 Nodes (15): modelErrorResponse(), AssistantImage,
AssistantRequest, clientIp(), HistoryTurn, IMAGE_MIME_TYPES, PERSONAS,
RateLimiter (+7 more)

### Community 56 - "server/package.json"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 57 - "dependencies"

Cohesion: 0.10 Nodes (21): class-variance-authority, clsx, date-fns,
dependencies, class-variance-authority, clsx, date-fns, lucide-react (+13 more)

### Community 58 - "Landing Video Pipeline"

Cohesion: 0.14 Nodes (21): LQIP Placeholder Behind Video Tiles, WCAG 2.2.2
Autoplay Pause Requirement, Figma Pairing: Newsreader display + Geist UI,
Landing Video Pipeline, The Agent's Video Checklist, Gemini Videos Composer at
gemini.google.com/videos, Clip Prompt Shape: no text in frame, one camera move,
Silent Loop Encode: ffmpeg -an libx264 crf 22 plus faststart (+13 more)

### Community 59 - "devDependencies"

Cohesion: 0.10 Nodes (21): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+13 more)

### Community 60 - "CaseEvent"

Cohesion: 0.15 Nodes (12): formatPercent(), formatRm(), formatRmCompact(),
FILLS, ProbabilityBar(), RiskChip(), BacktestCard(), LeakageCard() (+4 more)

### Community 61 - "speak.py"

Cohesion: 0.18 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 62 - "Pipeline, Leakage And Exports"

Cohesion: 0.13 Nodes (20): Brier Score, ClosedExport Excel Export, FR-16 Leakage
Analysis And Recovery Sizing, FR-17 Waiting On Party, Quick View, Next Move,
FR-21 Bookings Active And Closed Views With Export, FR-2 Case Summarization And
Stall Detection, Live And Resolved Booking Definitions, Metrics (+12 more)

### Community 63 - "Assumptions And Constraints"

Cohesion: 0.11 Nodes (20): POST /api/applications, GET /api/health, /api/session
Profile Session Routes, /api/settings Shared Project Settings, Application State
Derivation, Event Tracks (sales, loan, legal), Event seq Ordering (occurred_at,
seq), Outstanding Documents Rule (+12 more)

### Community 64 - "Assumptions And Constraints"

Cohesion: 0.13 Nodes (20): POST /api/assistant, POST /api/assistant/stream
(SSE), POST /api/messages, GET /api/snapshot, askBrain Scripted Fallback
Answers, Assistant Read-Only Tool Set, server/src/assistant/tools.ts Read-Only
Tools, Cache-First / Live-First Caching Strategy (+12 more)

### Community 65 - "Components"

Cohesion: 0.23 Nodes (19): Booking Row And Table Header, Chart Series Colours,
Chase Card, Do And Do Not, Landing Sample Ledger, No Row Tinting Or Zebra
Stripes, Red Is Strictly For Danger, Signed Pill Inversion (+11 more)

### Community 66 - "app.ts"

Cohesion: 0.16 Nodes (14): Language, fakeFetch(), ref_bun_test,
warmProduction(), call(), body(), error(), isIsoDate() (+6 more)

### Community 67 - "WaitingOn.tsx"

Cohesion: 0.21 Nodes (18): App Shell, Authentication Theatre, Brand Mark (Kigumi
Joint), Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer
Link Columns, Single Sanctioned Gradient (Landing Panel) (+10 more)

### Community 68 - "Design Surfaces, Motion, Chrome"

Cohesion: 0.18 Nodes (18): Calendar Replacement For Native Date Input, Day Cell
And Date Picker, Dialog Component, Drop Zone, Drop Zone Hidden File Input
Exception, Elevation: Card Hover, Elevation: Overlay, Bookings Bulk-Action Glass
Island (+10 more)

### Community 69 - "Markdown Style Guide"

Cohesion: 0.11 Nodes (18): Better Is Better Than Best, Break Up Dense Text,
Capitalization, Character Line Limit, Document Layout, Exceptions, Images, Lists
(+10 more)

### Community 70 - "Mortar Product Overview"

Cohesion: 0.20 Nodes (18): Admin Today Leads With Assigned Tasks, Ask Mortar
Renamed To Ask MortarAI, Forecast Documents Panel Removed, FR-5 Today Desk And
Task Management, Approved Manager And Ask MortarAI Intake (#60), JTBD: Stall
Resolution, Manager Flagging And Follow-Up Tasks, Manager Suggestions-First
Navigation (+10 more)

### Community 71 - "TypeSafe Jev And Audit Log"

Cohesion: 0.15 Nodes (18): Case Event Schema, Event Statuses
(confirmed/provisional/disputed/superseded), FR-11 Database Persistence And Demo
Data, FR-4 Evidence Log And Multi-Party Verification, FR-6 TypeSafe Jev
Structured Message Extraction, Human In The Loop, JevMeta
(source/stale/latencyMs), Jev Choice / Score / Noul Primitives (+10 more)

### Community 72 - "Assumptions And Constraints"

Cohesion: 0.13 Nodes (18): Anti-Money Laundering Act 2001 s17, POST
/api/bookings/import, DELETE /api/bookings/:id, POST /api/admin/demo/add, POST
/api/admin/demo/delete, POST /api/imports/:id/undo, GET /api/inventory,
Companies Act 2016 (Act 777) s245(3) (+10 more)

### Community 73 - "frontend/tsconfig.json"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 74 - "Reviews And Merging"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 75 - "precompute.ts"

Cohesion: 0.12 Nodes (14): JevCacheEntry, cache, caseData, client,
CollectingCache, generated, jev, metered (+6 more)

### Community 76 - "live-check.ts"

Cohesion: 0.21 Nodes (17): Acceptance Criteria (14), Elevation: Card, Flat
Ledger Look, Landing Page, Landing Card Elevation, Landing Chromatic Panel
(.land-panel), Landing Claim, Landing Copy Specification (+9 more)

### Community 77 - "components.json"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 78 - "brain.test.ts"

Cohesion: 0.24 Nodes (14): ctx, satisfying(), askBrain(), buildAskContext(),
contentWords(), coverage(), matchQuestion(), questionIndex() (+6 more)

### Community 79 - "compilerOptions"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 80 - "notificationStore.ts"

Cohesion: 0.20 Nodes (13): Notification, NotificationPopover(),
useNotifications(), emit(), Listener, listeners, loadNotifications(),
notifications (+5 more)

### Community 81 - "Bug Report Issue Form"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 82 - "test_assemble.py"

Cohesion: 0.27 Nodes (9): AssembleMuxTests, AssemblePictureTests, color_video(),
ff(), probe_duration(), CompletedProcess, Path, slide_png() (+1 more)

### Community 83 - "Non-Functional Requirements"

Cohesion: 0.24 Nodes (15): Cache-First GET Routes, Demo Script As Acceptance,
Design Standards Compliance, FR-12 High-Availability Offline Jev Fallback, Jev
Three-Tier Resolution Strategy, The Live AI Moment (Demo Step 4), NFR-10 WCAG AA
Contrast, NFR-11 Keyboard Accessibility (+7 more)

### Community 84 - "Jakub Krehel's Interface Skills"

Cohesion: 0.19 Nodes (15): Jakub Krehel's Interface Skills, better-accessibility
Skill: reduced motion, zoom, autoplay, better-colors Skill, better-interface
Skill: orchestrated review, better-layout Skill, better-typography Skill, break
Skill, explain-interface Skill (+7 more)

### Community 85 - "Checklist"

Cohesion: 0.15 Nodes (15): Follow The Design Guide And Shared UI Components,
Keep AI Agents On Task, Never Do These, Never Force-Push A Shared Branch, No
Pushes Straight To main, Never Commit Real Buyer Data, Never Commit Secrets, One
Problem Per Issue (+7 more)

### Community 86 - "Slide 06: Three Desks, One Book"

Cohesion: 0.14 Nodes (10): CaseData, SimulationMeta, StoredMeta, app, db,
generated, jev, payload (+2 more)

### Community 87 - "Assumptions And Constraints"

Cohesion: 0.18 Nodes (14): Project Notes (docs/agents/notes.md),
docs/agents/notes.md, Mortar Agent Notes, Mortar Project Guidelines (AGENTS.md),
Design: Mortar (Visual Specification), Mortar Design System In Figma, Icon Rules
(Never Alone, aria-label + Tooltip), Icons (+6 more)

### Community 88 - "Data Display And Tooltip Rules"

Cohesion: 0.21 Nodes (14): Content Canvas, Data Formats, Date Format (19 Sep
2026), Duration Formats, Empty Values Are Em Dashes, Money Formats, One Focus
Per Screen, Progressive Disclosure (+6 more)

### Community 89 - "Mortar Product Overview"

Cohesion: 0.19 Nodes (14): Client-Only Spreadsheet Parsing, FR-13 Add Bookings
Intake And Validation, FR-14 Persona Navigation And Page Routing, FR-22 Add
Bookings Intake, Personas Set Defaults Not Data Access, PERSONA_PAGES Access
Map, PersonaRoute.tsx Route Guard, Shared Project And Unit Range Settings (+6
more)

### Community 90 - "Perch Landing Teardown"

Cohesion: 0.18 Nodes (14): Perch Sign-In Teardown, Authored Disabled States,
Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path Check, Porting
Plan: the persona folds into the guest button, Perch Storage Keys:
perch.trip.v1, perch.theme.v1, perch.voter.v1, Perch Footer And Chrome Teardown,
Footer Focus Reveal for WCAG 2.4.11 (+6 more)

### Community 91 - "core/package.json"

Cohesion: 0.14 Nodes (13): devDependencies, typescript, vitest, exports,
typescript, vitest, name, private (+5 more)

### Community 92 - "banks.test.ts"

Cohesion: 0.20 Nodes (10): A, approved(), b, booked, ev(), received(),
rejected(), submitted() (+2 more)

### Community 93 - "Keep It Current"

Cohesion: 0.26 Nodes (13): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+5 more)

### Community 94 - "UI Triage: The Signed-In App"

Cohesion: 0.23 Nodes (13): better-writing Skill, MotionSites Prompt Format:
exact tokens and acceptance views, UI Triage: The Signed-In App, Copy Rules: the
drop and write table, Density Budget, The Desk Lens Becomes a Preset, Not a
Banner, Three Stacked Filter Systems With Disagreeing Numbers, Four-Phase
Implementation Plan (+5 more)

### Community 95 - "app.ts"

Cohesion: 0.28 Nodes (10): notifications, AssignmentAccessContext,
canAccessBooking(), createAssignmentAccessContext(), currentCaseAssignee(),
DEMO_PROFILES, profileFor(), scopeSnapshot() (+2 more)

### Community 96 - "ref_node_fs"

Cohesion: 0.15 Nodes (4): ref_node_test, cleanEvents, SEEDED_MESSAGES,
WALK_BEATS

### Community 98 - "Financing-Risk Method"

Cohesion: 0.23 Nodes (12): booking_removals, bookings, event_reviews, events,
imports, jev_answers, loan_applications, messages (+4 more)

### Community 99 - "live-check.ts"

Cohesion: 0.20 Nodes (12): font-display: Swap, Geist, Geist Mono, Nine Text
Styles, No Third Typeface, Body/Default, Body/Small, Display/Page, Eyebrow (+4
more)

### Community 100 - "Hugeicons by Halal Lab"

Cohesion: 0.21 Nodes (12): Why Hugeicons Fits, Its Hover Mixed Fill and Stroke
Conventions, Layered Card Surface: hairline ring and stacked shadow,
transitions.dev: UI transitions for AI agents, better-ui Skill: surfaces, icons,
motion values, Concentric Radius: outer equals inner plus padding, Icon Stroke
Scale by Adjacent Text Weight, shadow-border Three-Layer Token (+4 more)

### Community 101 - "scripts"

Cohesion: 0.17 Nodes (11): license, name, private, scripts, build, dev, preview,
template:bookings (+3 more)

### Community 102 - "Security, Secrets And Privacy"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 103 - "Route /forecast (Projected Signings)"

Cohesion: 0.23 Nodes (8): readSheetFile(), sheetKind(), SheetReadError,
DEFAULTS, FIXTURE, TEMPLATE, parseCsv(), ref_node_fs

### Community 104 - "walk.mjs"

Cohesion: 0.30 Nodes (9): scrollDuration(), scrollTarget(), smoothScrollTo(),
film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink(), visible() (+1
more)

### Community 105 - "RTK Commands By Workflow"

Cohesion: 0.18 Nodes (11): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Infrastructure (85% Savings), JavaScript/TypeScript Tooling
(70-90% Savings), Meta Commands (+3 more)

### Community 106 - "Components"

Cohesion: 0.24 Nodes (11): Button Component, Checkbox Component, Density
Decision (36px Controls, 44px Rows), Field Component, Focus Ring, Ink Is The
Action Colour, Public-Page Radius Steps (2xl/3xl), Radius Tokens (+3 more)

### Community 107 - "Components"

Cohesion: 0.20 Nodes (11): Calibrated Contrast Ratios, Colour, Landing Panel
Tokens, Light And Dark From One Token Set, Primitives: ink Ramp, Primitives:
paper Ramp, Scrollbar Component, Selected Row Ground (--selected) (+3 more)

### Community 108 - "Assumptions And Constraints"

Cohesion: 0.24 Nodes (11): packages/core/src/jev.ts MiniSearch Playbook Search,
Mortar Technical Requirements Document, packages/core/src/fixtures/playbooks.ts,
packages/core/src/fixtures/stories.ts, server/fixtures/jev-cache.json, bun run
jev:precompute, @mortar/core Pure TypeScript Core Library, Neon PostgreSQL
Managed Database (+3 more)

### Community 109 - "booking-template.mjs"

Cohesion: 0.18 Nodes (6): bookings, COLUMNS, howTo, OUT, SAMPLES, ref_node_url

### Community 110 - "react"

Cohesion: 0.20 Nodes (5): BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 111 - "react"

Cohesion: 0.18 Nodes (4): generated, mocks, SNAP, StubReader

### Community 112 - "record.mjs"

Cohesion: 0.22 Nodes (7): auditCapture(), REQUIRED_BEATS, beats, errors, filmed,
OUT, require

### Community 113 - "Assumptions And Constraints"

Cohesion: 0.22 Nodes (9): Run bun run check Then bun run format, Graphify
(docs/agents/graphify.md), Ask Graph Before Grepping / Refresh On Last Commit
Rule, RTK (docs/agents/rtk.md), RTK Command Prefix Rule, Agent Rules, Golden
Rule, RTK (Rust Token Killer) - Token-Optimized Commands (+1 more)

### Community 114 - "Assumptions And Constraints"

Cohesion: 0.24 Nodes (9): Contributing (.github/CONTRIBUTING.md), Data Retention
section (docs/TRD.md#data-retention), Design (docs/DESIGN.md), Documents Index,
Markdown Style Guide (docs/markdown-style.md), Product Requirements Document
(docs/PRD.md), Product Overview (docs/PRODUCT.md), Technical Requirements
Document (docs/TRD.md) (+1 more)

### Community 115 - "Agent Skills"

Cohesion: 0.20 Nodes (9): Skills (docs/agents/skills.md), Agent Skills, Install
And Update, leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On
Windows, pbakaus/impeccable (+1 more)

### Community 116 - "react"

Cohesion: 0.27 Nodes (7): AskPanel(), IMAGE_TYPES, readableSize(), Turn,
askAssistantStream(), AssistantImage, AssistantStreamEvent

### Community 117 - "persona.tsx"

Cohesion: 0.22 Nodes (6): usePersonaSafe(), activeProfile, pending,
readProfile(), defaultProfileForPersona(), profileForPersona()

### Community 118 - "jev/tsconfig.json"

Cohesion: 0.20 Nodes (9): compilerOptions, types, extends, include, src/**/*.ts,
../../tsconfig.json, vitest.config.ts, node (+1 more)

### Community 119 - "NarrateTests"

Cohesion: 0.29 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 120 - "Assumptions And Constraints"

Cohesion: 0.33 Nodes (8): Frontend Stack (React 19 + Vite + Tailwind 4 +
shadcn/ui), @mortar/core package, mortar.persona localStorage key,
mortar.profile localStorage key, Personas, Mortar Product Definition, Route Map,
Stack (Bun workspaces)

### Community 121 - "CaseSummary"

Cohesion: 0.25 Nodes (4): booking, riskLabel(),
packages_core_src_index_risklevel, RiskLevel

### Community 123 - "generate.ts"

Cohesion: 0.50 Nodes (8): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), toEpoch(), workDaysBetween(), workDayOffset()

### Community 124 - "server/tsconfig.json"

Cohesion: 0.22 Nodes (8): bun-types, db/**/\*.ts, compilerOptions, types,
extends, include, src/**/*.ts, ../tsconfig.json

### Community 125 - "record.mjs"

Cohesion: 0.22 Nodes (8): ref_node_module, ref_node_os, failures, HERE, page,
rawSlides, require, SLIDES

### Community 126 - "subtitles.py"

Cohesion: 0.33 Nodes (8): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration uses,, Split into lines of similar
length, never mid-word. Two things depend on th, Group wrapped lines into cards
of at most MAX_LINES., ts(), wav_ms(), wrap()

### Community 127 - "Andrej Karpathy Skills"

Cohesion: 0.25 Nodes (7): Andrej Karpathy Skills
(docs/agents/andrej-karpathy-skills.md), Think Before Coding / Surgical Changes
Rule, 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4.
Goal-Driven Execution, Andrej Karpathy Skills

### Community 128 - "Ask The Graph First"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 129 - "Markdown Style Guide"

Cohesion: 0.25 Nodes (8): Avoid Relative Paths Unless Within The Same Directory,
Define Reference Links After Their First Use, Links, Reference Links, Use
Explicit Paths For Links Within Markdown, Use Informative Markdown Link Titles,
Use Reference Links For Long Links, Use Reference Links To Reduce Duplication

### Community 130 - "Markdown Style Guide"

Cohesion: 0.25 Nodes (8): Code, Codeblocks, Declare The Language, Escape
Newlines, Inline, Nest Codeblocks Within Lists, Use Code Span For Escaping, Use
Fenced Code Blocks Instead Of Indented Code Blocks

### Community 131 - "Personas And Jobs To Be Done"

Cohesion: 0.25 Nodes (8): Direct Core ERP Integration (Out Of Scope), JTBD:
Message Intake, Loan Admin Persona, Nurul Aina (Sales Admin), Operational
Constraints, Personas And Jobs To Be Done, Sales Admin Persona, Tan Mei Ling
(Loan Admin)

### Community 132 - "Playbook Search With Minisearch"

Cohesion: 0.25 Nodes (8): blockerQuery(), PlaybooksPanel(), fetchPlaybooks(),
minisearch, dependencies, minisearch, requested(), searchPlaybooks()

### Community 133 - "CaseSummary"

Cohesion: 0.25 Nodes (4): BOOKING, RISK, SUMMARY, TASK

### Community 134 - "assistant/index.ts"

Cohesion: 0.29 Nodes (7): callGemini(), GeminiContent, GeminiFunctionCall,
GeminiOptions, GeminiPart, GeminiResponse, isAbort()

### Community 135 - "WaitingOn.tsx"

Cohesion: 0.38 Nodes (7): Ask Panel, Chip Economy, Internal Names Stay Internal,
Jev (Assistant), Jev Acts, It Does Not Report Status, Landing Ledger Is
Illustrative, Plain Language

### Community 136 - "CaseEvent"

Cohesion: 0.33 Nodes (5): plural(), SheetReview(), Pagination(),
usePagination(), Harness()

### Community 137 - "useTheme.tsx"

Cohesion: 0.43 Nodes (6): getSystemTheme(), resolveTheme(), Theme, ThemeContext,
ThemeContextValue, ThemeProvider()

### Community 138 - "Pull Request Template"

Cohesion: 0.38 Nodes (7): Fill In The Pull Request Template, Show UI Changes
With Screenshots, Screenshots Or Recording, Pull Request Template, Screenshots,
What Changed, Why

### Community 139 - "forecast/forecast.ts"

Cohesion: 0.33 Nodes (3): at(), ev(), LoanApplication

### Community 140 - ".prettierrc.json"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 141 - "proof.test.mjs"

Cohesion: 0.48 Nodes (3): BK_MESSAGES, verifyCleanSeed(), openDemoSession()

### Community 142 - "GitHub Issues And Pull Requests"

Cohesion: 0.33 Nodes (5): GitHub Issues And Pull Requests
(docs/agents/github.md), Read Existing Issues And PRs Rule, Before Opening A
Pull Request, Before Opening An Issue, GitHub Issues And Pull Requests

### Community 143 - "persona.tsx"

Cohesion: 0.40 Nodes (3): Navigation Scroll Restoration, ScrollToTop,
ScrollToTop()

### Community 144 - "Markdown Style Guide"

Cohesion: 0.33 Nodes (6): Add Spacing To Headings, ATX-Style Headings,
Capitalization Of Titles And Headers, Headings, Use A Single H1 Heading, Use
Unique, Complete Names For Headings

### Community 145 - "persona.tsx"

Cohesion: 0.40 Nodes (3): AskTrigger(), mocks, SwitchProfile()

### Community 146 - "formatters.ts"

Cohesion: 0.40 Nodes (4): currencyFormatter, formatCurrency(),
formatTooltipCurrency(), numberFormatter

### Community 147 - "What Happened"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 148 - "core/tsconfig.json"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 149 - "schedule.py"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A be, Push starts later
so no line is still speaking when the next begins. Pure s

### Community 150 - "SubtitleLayoutTests"

Cohesion: 0.40 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 152 - "Deck Assets Manifest"

Cohesion: 0.50 Nodes (3): Deck Assets Manifest, Generated Art, Product
Screenshots

### Community 153 - "Route /import (Add Bookings)"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

### Community 156 - "Mortar Demo Recorder"

Cohesion: 0.67 Nodes (3): Mortar Demo Recorder README, Demo Video Pipeline,
Provenance (Layak / codenection-dev / MakanLah)

## Ambiguous Edges - Review These

- `Mortar Technical Requirements Document` →
  `Ask MortarAI Calls Gemini With Five Read-Only Tools` [AMBIGUOUS]
  docs/agents/notes.md · relation: conceptually_related_to

## Knowledge Gaps

- **729 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+724 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between
  `Mortar Technical Requirements Document` and
  `Ask MortarAI Calls Gemini With Five Read-Only Tools`?** _Edge tagged
  AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Design: Mortar (Visual Specification)` connect
  `Assumptions And Constraints` to `Mortar Notes For Agents`, `WaitingOn.tsx`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `Button Component` connect `Components` to
  `Booking Record Update Forms`, `live-check.ts`?** _High betweenness centrality
  (0.212) - this node is a cross-community bridge._
- **Why does `Seven Core Design Decisions` connect `Assumptions And Constraints`
  to `live-check.ts`, `Components`, `Components`, `live-check.ts`?** _High
  betweenness centrality (0.205) - this node is a cross-community bridge._
- **What connects `$schema`, `printWidth`, `singleQuote` to the rest of the
  system?** _729 weakly-connected nodes found - possible documentation gaps or
  missing edges._
- **Should `Booking Record Update Forms` be split into smaller, more focused
  modules?** _Cohesion score 0.06869446343130553 - nodes in this community are
  weakly interconnected._
- **Should `Chase Task And Next Step Logic` be split into smaller, more focused
  modules?** _Cohesion score 0.06220095693779904 - nodes in this community are
  weakly interconnected._
