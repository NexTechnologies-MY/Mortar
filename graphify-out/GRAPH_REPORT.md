# Graph Report - . (2026-09-28)

## Corpus Check

- 18 files · ~292,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 4010 nodes · 9208 edges · 236 communities (202 shown, 34 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 607 edges
  (avg confidence: 0.82)
- Token cost: 249,457 input · 0 output

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
- CLAUDE.md
- Assumptions And Constraints
- Assumptions And Constraints
- .hasPointerCapture
- .releasePointerCapture
- .scrollIntoView
- main.tsx
- .hasPointerCapture
- .releasePointerCapture
- .scrollIntoView
- .hasPointerCapture
- .releasePointerCapture
- .scrollIntoView
- setup.ts
- .matches
- .hasPointerCapture
- .releasePointerCapture
- .scrollIntoView
- .scrollIntoView
- GEMINI.md
- Draft While Unfinished
- react
- ForecastPage.tsx
- react
- core/vitest.config.ts
- jev/vitest.config.ts
- ref_node_assert
- Deploy Prototype Workflow
- Tailwind Merge Utility
- Tailwind Animate Plugin
- Vaul Drawer Dependency
- Spreadsheet Export Dependency
- Vite Dev Server Config
- Fresh Main Before Review
- Narration Shell Script
- FAQ Route
- Frontend Global Stylesheet
- Draft Before Review Rule
- Core Sheet Field Registry
- Assertion Reference Node
- Resemble Perth Pinned Setup

## God Nodes (most connected - your core abstractions)

1. `cn()` - 120 edges
2. `usePersona()` - 56 edges
3. `Button` - 47 edges
4. `Booking` - 45 edges
5. `CaseSummary` - 45 edges
6. `Database` - 44 edges
7. `FakeDb` - 36 edges
8. `CaseEvent` - 32 edges
9. `formatDate()` - 30 edges
10. `ballInCourt` - 29 edges

## Surprising Connections (you probably didn't know these)

- `Keep It Current` --semantically_similar_to--> `Never Do These` [INFERRED]
  [semantically similar] docs/agents/graphify.md → .github/CONTRIBUTING.md
- `failingClient()` --indirect_call--> `request()` [INFERRED]
  packages/jev/src/service.test.ts → frontend/src/lib/api.ts
- `fakeClient()` --indirect_call--> `request()` [INFERRED]
  packages/jev/src/service.test.ts → frontend/src/lib/api.ts
- `AddMessageForm()` --indirect_call--> `day()` [INFERRED]
  frontend/src/components/bookings/AddMessageForm.tsx →
  server/src/assistant/tools.ts
- `BookingFiltersProps` --references--> `Stage` [EXTRACTED]
  frontend/src/components/bookings/BookingFilters.tsx →
  packages/core/src/types.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Jev Proposal Review Flow** — docs_trd_pending_proposal,
  docs_trd_event_reviews_table [EXTRACTED 1.00]
- **Jev Service Fallback And Caching Ladder** — docs_trd_jev_service,
  docs_trd_ladder_exact_cache, docs_trd_ladder_unavailable, docs_trd_input_hash,
  docs_trd_jev_answers_table [EXTRACTED 1.00]
- **Server-Side Write Path Authorization** — docs_trd_case_summary,
  docs_trd_summarize_cases, docs_trd_scope_snapshot,
  docs_trd_current_case_assignee [INFERRED 0.85]
- **Booking-to-disbursement funnel stages** — docs_readme_funnel_stage_booking,
  docs_readme_funnel_stage_loan_application,
  docs_readme_funnel_stage_letter_of_offer, docs_readme_funnel_stage_spa_signed,
  docs_readme_funnel_stage_loan_agreement, docs_readme_funnel_stage_disbursement
  [EXTRACTED 1.00]
- **Mortar runtime: browser, Render, Bun process, Neon Postgres** —
  docs_readme_snapshot_provider, docs_readme_render_web_service,
  docs_readme_bun_serve_index, docs_readme_neon_postgres, docs_readme_jev_client
  [EXTRACTED 1.00]
- **AI surfaces and their guardrails** — docs_readme_jev_client,
  docs_readme_ask_mortarai, docs_readme_run_jev_locally,
  docs_readme_limitation_ai_assistant_not_decider, docs_readme_limitation_pdpa,
  docs_readme_gemini_free_tier_privacy [INFERRED 0.85]
- **Persona access boundary (pages, guard, session, header)** —
  docs_agents_notes_persona_pages, docs_agents_notes_persona_route,
  docs_agents_notes_can_persona_open, docs_agents_notes_server_session,
  docs_agents_notes_profile_id_header, docs_agents_notes_persona_switch
  [EXTRACTED 1.00]
- **Snapshot cache contract (read list, write forget)** —
  docs_agents_notes_create_database, docs_agents_notes_snapshot_reads,
  docs_agents_notes_forget_snapshot, docs_agents_notes_server_db_reset,
  docs_agents_notes_integration_test [EXTRACTED 1.00]
- **Ask answer flow (Gemini tools with scripted fallback)** —
  docs_agents_notes_assistant_tools, docs_agents_notes_gemini_api_key,
  docs_agents_notes_ask_panel, docs_agents_notes_brain_askbrain,
  docs_agents_notes_brain_buildaskcontext,
  docs_agents_notes_assistant_503_fallback [EXTRACTED 1.00]
- **Demo Voice Synthesis Lane** — scripts_demo_readme_speak_py,
  scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py,
  scripts_demo_readme_narrate_sh, scripts_demo_readme_lines_json,
  scripts_demo_readme_manifest_py [EXTRACTED 1.00]
- **Demo Capture Lane (walk, record, contract, warmup, proof)** —
  scripts_demo_readme_walk_mjs, scripts_demo_readme_record_mjs,
  scripts_demo_readme_contract_mjs, scripts_demo_readme_warmup_mjs,
  scripts_demo_readme_proof_mjs, scripts_demo_readme_beats_json,
  scripts_demo_readme_capture_webm, scripts_demo_readme_mark [EXTRACTED 1.00]
- **Pacing and Duration Guardrails** — scripts_demo_readme_target_runtime,
  scripts_demo_readme_picture_fits_voice, scripts_demo_readme_no_dead_air,
  scripts_demo_readme_disable_mkl_dnn, scripts_demo_readme_env_demo_max_gap_ms,
  scripts_demo_readme_env_demo_fit_tail_ms,
  scripts_demo_readme_env_demo_mute_seg_ms,
  scripts_demo_readme_env_demo_min_duration,
  scripts_demo_readme_env_demo_max_duration [INFERRED 0.85]
- **Dark Mode Boot Path (stored preference, OS media query, class toggle,
  browser chrome color)** — frontend_index_html_fouc_guard_script,
  frontend_index_html_theme_localstorage_key,
  frontend_index_html_prefers_color_scheme_media_query,
  frontend_index_html_dark_class_toggle, frontend_index_html_theme_color_dark,
  frontend_index_html_theme_color_light [EXTRACTED 1.00]
- **Social Share Card (Open Graph + Twitter Card metadata pointing at the Render
  deployment)** — frontend_index_html_social_preview_metadata_group,
  frontend_index_html_og_title, frontend_index_html_og_description,
  frontend_index_html_og_url, frontend_index_html_og_image,
  frontend_index_html_twitter_card, frontend_index_html_twitter_image,
  frontend_index_html_brand_tagline [EXTRACTED 1.00]
- **First-Paint Critical Path (fonts, favicon, theme guard, mount div, module
  entry)** — frontend_index_html_fonts_preconnect,
  frontend_index_html_geist_font_stylesheet, frontend_index_html_favicon_svg,
  frontend_index_html_fouc_guard_script, frontend_index_html_root_mount_div,
  frontend_index_html_main_tsx_module_entry [INFERRED 0.85]
- **check Job Step Sequence** — github_workflows_ci_step_checkout,
  github_workflows_ci_step_setup_bun,
  github_workflows_ci_step_install_frozen_lockfile,
  github_workflows_ci_step_run_check, github_workflows_ci_step_run_build
  [EXTRACTED 1.00]
- **Test Database Wiring for the Check Step** —
  github_workflows_ci_service_postgres, github_workflows_ci_test_database_url,
  github_workflows_ci_env_postgres_user_mortar,
  github_workflows_ci_env_postgres_password_mortar,
  github_workflows_ci_env_postgres_db_mortar_test,
  github_workflows_ci_port_mapping_5432, github_workflows_ci_step_run_check
  [INFERRED 0.95]
- **Main Branch Deploy Gate Chain** — github_workflows_ci_trigger_push_main,
  github_workflows_ci_check, github_workflows_ci_render_deploy_gate [INFERRED
  0.85]
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

## Communities (236 total, 34 thin omitted)

### Community 0 - "Booking Record Update Forms"

Cohesion: 0.06 Nodes (69): CaseHeader(), CaseQuickView(), progressFromKinds(),
SEGMENTS, STAGE_PROGRESS, StageTracker(), AWAITING_DOCUMENTS, BOOKING (+61 more)

### Community 1 - "Chase Task And Next Step Logic"

Cohesion: 0.06 Nodes (48): ApplicationsCard(), STATUS_TONES,
APPLICATION_STATUS_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS,
EXTRACTED_EVENT_LABELS, NEXT_ACTION_LABELS, SENDER_ROLE_LABELS (+40 more)

### Community 2 - "BookingsPage.tsx"

Cohesion: 0.09 Nodes (44): addDays(), altDataset(), datasetFor(),
SOURCE_TAG_LABELS, SOURCE_TAG_TONES, SeedRun, SeedSpreadCard(), PageContainer()
(+36 more)

### Community 3 - "api.ts"

Cohesion: 0.06 Nodes (44): react, BookingFiltersProps, RISKS, View, DateField(),
monthOf(), toDate(), toIso() (+36 more)

### Community 4 - "Mortar Demo Recorder"

Cohesion: 0.12 Nodes (31): SOURCE_LABELS, TRACK_LABELS, formatPercent(),
frontend_src_components_case_index_formatrm, ProbabilityBar(),
ChartTooltipContent(), ChartTooltipContentProps, TooltipEntry (+23 more)

### Community 5 - "ForecastPage.tsx"

Cohesion: 0.07 Nodes (54): Architecture And Components, Architecture Topology
Diagram, Build And Start Step, bun run check (ESLint + tsc + Vitest), bun run
format (Prettier, 80-Column Markdown), Bun HTTP Server On Render, CI Gate Before
Render Deploys, CI Postgres 17 Service Container (+46 more)

### Community 6 - "DirectTableImport.tsx"

Cohesion: 0.06 Nodes (28): BookingRow, BookingsTable(), PILL_STAGES, WIDTHS,
TaskCell(), booking, RISK, BOOKING (+20 more)

### Community 7 - "Page And Persona Switching Tests"

Cohesion: 0.08 Nodes (52): Support For Automation (AI Safe Areas), Where AI
Helps And Where People Decide, Aster Heights Fictional Project, Beneficiaries
Who Do Not Log In (Finance, Sales Director), Booking BK-9001 Lifecycle, Booking
Leakage, Centralized Case Workspace, Ask MortarAI (+44 more)

### Community 8 - "Mortar Notes For Agents"

Cohesion: 0.07 Nodes (21): EVENTS, TrackTimelines(), row(), waiting(),
defaultData(), mocks, provisionalEvent(), SNAP (+13 more)

### Community 9 - "Product Overview: Users And Problem"

Cohesion: 0.08 Nodes (33): EvidenceLog(), formatDateTime(), MessageItem(),
TasksPanel(), EXTRACTION, MESSAGE, PROPOSAL, DemoDataCard() (+25 more)

### Community 10 - "Booking"

Cohesion: 0.06 Nodes (25): SignalsPanel(), RANKING, SNAPSHOT, SIGNALS,
EXTRACTION_9001, EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001 (+17 more)

### Community 11 - "BookingPipelineFlow.tsx"

Cohesion: 0.04 Nodes (45): concurrently, eslint, eslint-config-prettier,
@eslint/js, eslint-plugin-react-hooks, globals, husky, lint-staged (+37 more)

### Community 12 - "package.json"

Cohesion: 0.11 Nodes (45): API Reference, Caching Strategy: Cache-First Reads,
Live-First Mutations, Explicit No-Match Fallback Options, Fallback And Caching
Ladder, Fallback Ladder Flow Diagram, Fan-Out Job Pattern, GET
/api/bookings/:id/playbooks, GET /api/bookings/:id/signals (+37 more)

### Community 13 - "button.tsx"

Cohesion: 0.12 Nodes (42): Advisory Early Warning, Not A Blocking Gate,
TenureYears = min(35, 70 - age), Application State Derivation, BNM Margin Rules
(Nov 2010), BNM 35-Year Tenure Cap (Jul 2013), Case Derivation Rules,
CaseSummary, packages/core/src/sim.ts Generator + Forecasting (+34 more)

### Community 14 - "App Shell And Navigation"

Cohesion: 0.12 Nodes (33): AddMessageForm(), defaultName(), normalTime(), ROLES,
timeNow(), AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED (+25 more)

### Community 15 - "Slide 06: Three Desks, One Book"

Cohesion: 0.10 Nodes (34): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL,
drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+26 more)

### Community 16 - "generate.ts"

Cohesion: 0.06 Nodes (42): 16-bit PCM WAV Requirement, CPU Attention Trap
(Silent All-NaN Audio), Perth/setuptools Pin (setuptools<81), Base
(Impractically Slow Without GPU), Nano as CPU Default,
chatterbox-requirements.txt, Chatterbox TTS Install (Optional Cloned Voice),
Turbo (Larger Model) (+34 more)

### Community 17 - "A Company Brain For Booking-To-SPA Conversion"

Cohesion: 0.05 Nodes (37): See Also, 10. A Short Learning Path, 11. Questions To
Resolve With The Company, 1. What A Central Company Brain Should Mean Here, 2.
Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How
The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge (+29
more)

### Community 18 - "Page Container And Card Primitives"

Cohesion: 0.10 Nodes (29): IMAGE_TYPES, readableSize(), Turn, bookingsWord(),
ImportedCard(), COLUMNS, FIXED_WIDTH, WIDTHS (+21 more)

### Community 19 - "docs/README.md"

Cohesion: 0.09 Nodes (32): ApplicationFacts, appointmentDay(), byOccurred(),
CaseDataInput, CaseFacts, deriveApplication(), deriveCase(), DocumentLedger (+24
more)

### Community 20 - "Booking"

Cohesion: 0.08 Nodes (31): BookingFilter, BookingFilters(), Sort, SortKey,
buildClosedExportRows(), ClosedExportRow, closedOnDate(), CLOSING_KIND (+23
more)

### Community 21 - "questions.ts"

Cohesion: 0.08 Nodes (37): Brand Tagline: Booked Is Not Sold. Signed Is. Every
Booking, Tracked To The Signed SPA., Browser Chrome Theming (Android browser
chrome, Safari address bar), meta charset UTF-8, crossorigin Attribute on
fonts.gstatic.com Preconnect, Dark Class Toggle on documentElement, SEO
Description Meta (internal sales administration for SPA signing), HTML5 Doctype,
frontend/index.html (Vite SPA Entry Document) (+29 more)

### Community 22 - "Slide 14: Playbooks: Staff Experience, Reviewed"

Cohesion: 0.12 Nodes (24): DirectTableImport(), Entry, fakeBuyer(), newEntry(),
rowId(), salesProfiles, ProjectSettingsCard(), importBookings() (+16 more)

### Community 23 - "BookingsTable.tsx"

Cohesion: 0.08 Nodes (36): package.json build Script, package.json check Script,
bun-version-file: package.json, Cancel In Progress, check Job, Lint, typecheck,
unit tests, build, CI Workflow, Concurrency Group ci-${{ github.ref }} (+28
more)

### Community 24 - "Slide 14: Playbooks: Staff Experience, Reviewed"

Cohesion: 0.10 Nodes (27): count(), days(), isLive(), isOpen(), joinList(),
percent(), ringgit, rm() (+19 more)

### Community 25 - "Industry Practitioner Survey Findings, n = 8"

Cohesion: 0.14 Nodes (35): Task Writes Share A Natural-Key Advisory Lock,
booking_removals Minimal Deletion Audit, bookings Table,
packages/core/src/types.ts Domain Contract, currentCaseAssignee Responsibility
Resolution, Data Minimization And Scoped Access, Data Model And Schema,
db.insertApplication (+27 more)

### Community 26 - "Mortar Brief"

Cohesion: 0.11 Nodes (28): FUNNEL_STAGES, groupBy(), backtest(), bucketOf(),
buildModel(), CALIBRATION_BUCKETS, factsFor(), forecast() (+20 more)

### Community 27 - "Assumptions And Constraints"

Cohesion: 0.12 Nodes (21): AskTrigger(), RISK_LABELS, RISK_TONES, band(),
HESITATION, RESPONSIVENESS, SignalChips(), RISK (+13 more)

### Community 29 - "persona.tsx"

Cohesion: 0.06 Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How
Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules,
Interview Questions, Mortar Brief (+23 more)

### Community 30 - "import.ts"

Cohesion: 0.11 Nodes (32): Canvas UI: 35 WebGL/WebGPU effects over live HTML,
Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and
React Bits, Design the Fallback First, Glass Object (Three.js effect),
html-in-canvas API, Peel Effect, Scroll-Driven Effects: Laser, Particle Scroll,
Bend (+24 more)

### Community 31 - "core/src/index.ts"

Cohesion: 0.11 Nodes (18): buildSnapshot(), AppLayoutProps, PERSONAS, Rect,
Spotlight(), TourButton(), resolveRoute(), Harness() (+10 more)

### Community 32 - "FakeDb"

Cohesion: 0.11 Nodes (31): Feature Ideas
(docs/research/feature-ideas/README.md), Feature Ideas: written up but not
built, 48-Hour Clean Exit, Advisory-Only Financing Flag That Never Blocks a
Booking, Early Financing Eligibility Check, LAD Burn Clock, Learned Durations
and On-Time Follow-Ups, Mortgage Rescue Engine (+23 more)

### Community 33 - "sim.ts"

Cohesion: 0.11 Nodes (31): 48-hour screening of every booking, About The Project
section, Forecast accuracy score sentence, Acknowledgements: YEI 3.0/Kabel, Chin
Hin Group, shadcn/ui, Radix UI, Lucide, Booking conversion challenge, Chin Hin
Group, Consequences worn openly, @mortar/core domain rules: stage tracking, risk
flags, Today queue, risk-weighted forecast (+23 more)

### Community 34 - "tools.ts"

Cohesion: 0.12 Nodes (31): Bank Application Chains (1-3 Per Booking), Baseline
Bookings BK-0001..BK-0140, bookings.created_at Entry Time Semantics,
DEFAULT_SEED = 20260918, Demo Data Add/Delete Retention, Canonical 140 Generated
Bookings Demo Seed, Four Demo `meta` Keys, demo_seed Provenance Flag (+23 more)

### Community 35 - "Persona"

Cohesion: 0.09 Nodes (30): Legal queue section: Appointment Set, Not Signed,
Funnel: booking fee to bank disbursement, 12 app pages, 4 personas (measured
count), 6 funnel stages tracked, Closed Excel export from /bookings, Four
personas switched in the header, Funnel stage 1: Booking (small fee) (+22 more)

### Community 36 - "ChaseCard.tsx"

Cohesion: 0.10 Nodes (21): currentProposal(), MessagesPanel(), EXTRACTION,
MESSAGE, PROPOSAL, EVENT_MAP, STATUS_RANK, extraction() (+13 more)

### Community 37 - "Mortar Product Overview"

Cohesion: 0.12 Nodes (17): App(), HomeRedirect(), AppLayout(), AppShell(),
PersonaRoute(), ScrollToTop(), mocks, canPersonaOpen() (+9 more)

### Community 38 - "json"

Cohesion: 0.11 Nodes (13): ref_bun_test, BookingMovedOnError, cached(),
createDatabase(), EventSettledError, ImportMovedOnError, OpenApplicationError,
SNAPSHOT_READS (+5 more)

### Community 39 - "app.test.ts"

Cohesion: 0.07 Nodes (29): banker_message Beat, Banker's mixed Malay/English
message; payslip missing, buyer_reply Beat, Pasted Malay buyer reply; Jev
answers Documents Received, case_cleared Beat, Outstanding-document pill leaves
the case header, case_risk Beat, Financing-risk chip tooltip naming the flag
driver (+21 more)

### Community 41 - "CaseEvent"

Cohesion: 0.11 Nodes (28): Ask MortarAI (Gemini assistant), Without a key,
/api/assistant returns 503 and UI falls back to scripted answers, Case data sent
as a prompt to the proxy model, 2 shared packages, POST /api/assistant, Env var
GEMINI_API_KEY, Env var GEMINI_MODEL (default gemini-3.5-flash-lite), Env var
JEV_PROXY_KEY (proxy x-api-key) (+20 more)

### Community 42 - "Financing Risk And Assumptions"

Cohesion: 0.11 Nodes (28): Approval Probability 0.62 Bridging REHDA And
Benchmarks, bun run test (Vitest), research/company-brain/README.md,
docs/DESIGN.md, research/company-brain/simulation.md Seed Table, JevService, Not
Legal Advice Disclaimer, Parameter: Bank Approval Per Application (+20 more)

### Community 43 - "Conversion Forecasting Accuracy"

Cohesion: 0.09 Nodes (17): BackToTop(), HowItWorks(), Moment, MOMENTS,
LandingFaq(), QUESTIONS, LedgerPlate(), Row (+9 more)

### Community 44 - "EvidencePill.tsx"

Cohesion: 0.13 Nodes (27): Backtest Card Caption: Proves The Method, Not The
Business, Backtest Cutoff At 2026-08-19, Strict Temporal Data Isolation, Scoring
Against Truth, Backtest Validation, Brier Score, Brown, Cai & DasGupta (2001),
Four-Bucket Calibration Table (+19 more)

### Community 45 - "app.ts"

Cohesion: 0.11 Nodes (21): A, approved(), b, booked, ev(), received(),
rejected(), requested() (+13 more)

### Community 47 - "Next Step Derivation And Jev"

Cohesion: 0.10 Nodes (26): Arvind Raj (Legal Admin), CaseQuickView Side Sheet,
Chip Economy Rule, daysSinceLoanApproved / daysSinceSpaSet, Atomic Demo Data
Add/Delete, FR-15 SPA Execution Desk, FR-19 Record An Update, Independent Loan
And Legal Tracks (+18 more)

### Community 48 - "Assumptions And Constraints"

Cohesion: 0.15 Nodes (16): importlib_util, json, os, pathlib, re, Resolve
beat-keyed narration into a timing manifest with visual boundaries.,
NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 49 - "proxyClient.ts"

Cohesion: 0.09 Nodes (26): legal_persona Beat, Legal Admin persona; /legal
signing queue, A Camera and Dubber, @capture Token, TolongLabs/codenection-dev
scripts/demo, DEMO_SLIDES name:seconds Token, Deployed Mortar Site
(mortar-d18f.onrender.com), Eight-Step Live Walkthrough (+18 more)

### Community 50 - "better-ui Skill: surfaces, icons, motion values"

Cohesion: 0.14 Nodes (24): packages_core_src_index_default_assumptions,
bookingLine(), cap(), caseDetail(), casesFor(), day(), DESK_OF_OWNER_ROLE,
deskOfNextMove() (+16 more)

### Community 51 - "reset.ts"

Cohesion: 0.15 Nodes (24): Association of Banks in Malaysia (2017) Press
Release, Annuity Monthly Instalment, Bank Negara Malaysia (2010) Property Market
Measures, Bank Negara Malaysia Monthly Statistical Bulletin, Bank Negara
Malaysia (2013) 35-Year Tenure Circular, Debt Service Ratio (DSR),
DEFAULT_ASSUMPTIONS Panel, DEFAULT_SEED (20260918) (+16 more)

### Community 52 - "projectSettings.ts"

Cohesion: 0.10 Nodes (24): Backtest Caption: Proves Method Not Business, Booking
Fee Prohibition (Reg 11(2) 1989), Brown, Cai & DasGupta (2001) Wilson Interval,
Four-Bucket Calibration Table, FR-8 Statistical Conversion Forecasting, FR-9
Historical Forecast Backtesting, Goals And Non-Goals, Housing Development
(Control and Licensing) Regulations (+16 more)

### Community 53 - "jev/package.json"

Cohesion: 0.16 Nodes (24): AMLA 2001 s17 (6 Years, Not Applicable To
Developers), 72-Hour Breach Notification Groundwork, Companies Act 2016
(Act 777) s245(3), Data Retention, Seven-Year Backup Exports Are A Hosting Task,
DELETE /api/bookings/:id, Housing Development (Control and Licensing) Act 1966,
ImportMovedOnError (409) (+16 more)

### Community 54 - "assistant.test.ts"

Cohesion: 0.16 Nodes (22): AppOptions, caseRuleProblem(), cleanDraft(),
confirmProblem(), cookieValue(), createApp(), DOCUMENT_KINDS, EVENT_KINDS (+14
more)

### Community 55 - "assistant/index.ts"

Cohesion: 0.10 Nodes (23): App shell area, AskPanel (Dialog), AskTrigger (in
AppNav), canPersonaOpen, frontend/src/App.tsx (routes), Gotcha: / is landing,
/app is persona-relative, Gotcha: localStorage access is always wrapped in
try/catch, Gotcha: persona pages drive the sidebar and route guard (+15 more)

### Community 56 - "server/package.json"

Cohesion: 0.13 Nodes (23): Canvas UI shadcn Registry Install, Hugeicons by Halal
Lab, Hugeicons Agent Skill (npx skills add), Hugeicons CDN Icon Font
(use.hugeicons.com), Hugeicons MCP Server, Hugeicons Stroke Rounded Free Style,
Why Hugeicons Fits, Iconsax, from the Vuesax team (+15 more)

### Community 57 - "dependencies"

Cohesion: 0.14 Nodes (16): AnthropicContentBlock, AnthropicMessageResponse,
argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(),
buildNoulAnswer() (+8 more)

### Community 58 - "Landing Video Pipeline"

Cohesion: 0.15 Nodes (22): Admin Today Leads With Assigned Tasks, Ask Mortar
Renamed To Ask MortarAI, Forecast Documents Panel Removed, FR-5 Today Desk And
Task Management, Approved Manager And Ask MortarAI Intake (#60), JTBD: Message
Intake, JTBD: Stall Resolution, Manager Flagging And Follow-Up Tasks (+14 more)

### Community 59 - "devDependencies"

Cohesion: 0.13 Nodes (22): Brier Score, ClosedExport Excel Export, FR-16 Leakage
Analysis And Recovery Sizing, FR-17 Waiting On Party, Quick View, Next Move,
FR-21 Bookings Active And Closed Views With Export, FR-24 Guided Walkthrough,
FR-2 Case Summarization And Stall Detection, Functional Requirements (+14 more)

### Community 60 - "CaseEvent"

Cohesion: 0.17 Nodes (22): Second Undecided Application To Same Bank (409), PDPC
Automated Decision Guidelines (May 2026), Event Status: confirmed, Event Status:
disputed, Event Model And Evidence Lifecycle, POST /api/events Refusal Rules,
Monotonic Funnel: booked -> loan_applied -> lo_issued -> spa_signed ->
loan_agreement -> disbursed, Three Parallel Tracks: sales / loan / legal (+14
more)

### Community 61 - "speak.py"

Cohesion: 0.14 Nodes (14): mocks, SwitchProfile(), PersonaProvider(),
activeProfile, pending, readProfile(), selectProfile(), notifications (+6 more)

### Community 62 - "Pipeline, Leakage And Exports"

Cohesion: 0.12 Nodes (14): BallHolder, listOf(), canonicalSnapshot(), STORIES,
DOCUMENT_LABELS, packages_core_src_sim_default_assumptions, financingRisk(),
data (+6 more)

### Community 63 - "Assumptions And Constraints"

Cohesion: 0.19 Nodes (18): packages_core_src_index_scoreanswer, ScoreAnswer,
jevInputHash(), sortKeys(), stableJson(), caseState(), defaultPlaybookQuery(),
extractJob() (+10 more)

### Community 64 - "Assumptions And Constraints"

Cohesion: 0.09 Nodes (21): dependencies, @mortar/core, @typesafe-ai/sdk,
devDependencies, @types/node, typescript, vitest, exports (+13 more)

### Community 65 - "Components"

Cohesion: 0.10 Nodes (22): Broadcast-Safe Slide Rendering, Scale 1440x900 to
1728x1080, Capture Normalization to 1920x1080, Capture Viewport 1440x900, 16:10
to 16:9 Canvas Conversion, $DEMO_DIR/demo.mp4, DEMO_DECK
(docs/demo/mortar-pitch-deck.html), Pitch-deck HTML for slides/render.mjs (+14
more)

### Community 66 - "app.ts"

Cohesion: 0.10 Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core,
@mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 67 - "WaitingOn.tsx"

Cohesion: 0.10 Nodes (21): class-variance-authority, clsx, dependencies,
class-variance-authority, clsx, lucide-react, @radix-ui/react-dropdown-menu,
@radix-ui/react-label (+13 more)

### Community 68 - "Design Surfaces, Motion, Chrome"

Cohesion: 0.11 Nodes (21): Five read-only tools grounded in the live snapshot,
Bun API reading Postgres, 1 backend service, Figma Mortar Design System, GET
/api/snapshot, Hero banner and stack badges, Prerequisites: Bun 1.3.14, Postgres
17, desktop browser, bun run check (lint, typecheck, test) (+13 more)

### Community 69 - "Markdown Style Guide"

Cohesion: 0.13 Nodes (21): Docker Builder Stage (bun install + frontend build),
Bun Multi-Package Monorepo, frontend/src/components/case/CaseQuickView.tsx,
packages/core/src/jev.ts MiniSearch Playbook Helpers, docs/ (Non-Package),
packages/core/src/fixtures/playbooks.ts, packages/core/src/fixtures/stories.ts,
frontend/src/lib/persona.tsx Persona Definitions (+13 more)

### Community 70 - "Mortar Product Overview"

Cohesion: 0.10 Nodes (21): devDependencies, jsdom, tailwindcss,
@tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom,
typescript (+13 more)

### Community 71 - "TypeSafe Jev And Audit Log"

Cohesion: 0.18 Nodes (15): hashlib, chatterbox_cache_path(),
chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer,
main(), Path (+7 more)

### Community 72 - "Assumptions And Constraints"

Cohesion: 0.10 Nodes (15): ref_node_module, ref_node_os, ref_node_path, beats,
errors, filmed, OUT, require (+7 more)

### Community 73 - "frontend/tsconfig.json"

Cohesion: 0.18 Nodes (20): App Shell, Authentication Theatre, Brand Mark (Kigumi
Joint), Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer
Link Columns, Shell Layout (+12 more)

### Community 74 - "Reviews And Merging"

Cohesion: 0.13 Nodes (20): Data Retention section (TRD.md#data-retention),
Settings: demo dataset controls (seed, reference date, record counts), Env var
MORTAR_DEMO_RESET=off for a server holding real data, Interview
(source/interview.md), Limitation: demo profile sign-in with no real
authentication, Limitation: no bank, solicitor or CRM integrations, Limitation:
7-year record retention (Companies Act 2016 s245, Income Tax Act 1967 s82),
Limitation: income figures reach the browser because risk is worked out there
(+12 more)

### Community 75 - "precompute.ts"

Cohesion: 0.18 Nodes (20): Scripted askBrain Answers, Grounded Operational
Assistant (Ask MortarAI), 503 { fallback: true } And askBrain Fallback,
Citations Link Only Tool-Returned Bookings, Assistant Limits (1,000 Chars, 6
Turns, 8/min, 300/day), Assistant Never Writes Or Decides, System Prompt
Reflects Persona Desk, Five Read-Only Assistant Tools (+12 more)

### Community 76 - "live-check.ts"

Cohesion: 0.14 Nodes (14): canAccessBooking(), createAssignmentAccessContext(),
scopeSnapshot(), other, snapshot, AssistantAnswer, AssistantOptions,
AssistantStreamEvent (+6 more)

### Community 77 - "components.json"

Cohesion: 0.13 Nodes (20): Narration Beat Anchoring, Beat-Keyed Timing, A Beat
Marks When a Moment Appears, $DEMO_DIR/beats.json, beats.json Rewrite so Slide
Names Are Narratable Beats, Beat Deconfliction Rule, Subtitle Layout, DEMO_SPEAK
(scripts/demo/speak.py) (+12 more)

### Community 78 - "brain.test.ts"

Cohesion: 0.12 Nodes (20): case_overview Beat, /bookings/BK-9001 loan and legal
tracks, evidence provenance, $DEMO_DIR/capture.webm, Recording Writes, Synthetic
Data Only, Clean-Seed Check, Delete Demo Data Intentionally Keeps Filming Edits,
Discard the Disposable Deployment After Capture (+12 more)

### Community 79 - "compilerOptions"

Cohesion: 0.10 Nodes (12): ImportBatch, App, APPLICATION, BOOKING, clock,
FIXTURE_MESSAGE, makeApp(), OTHER_APPLICATION (+4 more)

### Community 80 - "notificationStore.ts"

Cohesion: 0.14 Nodes (17): APPLICATIONS, ask(), BOOKING, chipsFor(), event(),
EVENTS, fakeJev(), makeApp() (+9 more)

### Community 81 - "Bug Report Issue Form"

Cohesion: 0.23 Nodes (19): Booking Row And Table Header, Chart Series Colours,
Chase Card, Do And Do Not, Landing Sample Ledger, No Row Tinting Or Zebra
Stripes, Red Is Strictly For Danger, Signed Pill Inversion (+11 more)

### Community 82 - "test_assemble.py"

Cohesion: 0.17 Nodes (19): Calendar Replacement For Native Date Input, Day Cell
And Date Picker, Dialog Component, Drop Zone, Drop Zone Hidden File Input
Exception, Elevation: Card Hover, Elevation: Overlay, Guided Tour Chrome (+11
more)

### Community 83 - "Non-Functional Requirements"

Cohesion: 0.19 Nodes (19): Cache-First GET Routes, Demo Script As Acceptance,
Design Standards Compliance, FR-12 High-Availability Offline Jev Fallback, FR-18
Jev Through A Local Model Proxy, JEV_PROXY_URL Mode Selection, Jev Three-Tier
Resolution Strategy, The Live AI Moment (Demo Step 4) (+11 more)

### Community 84 - "Jakub Krehel's Interface Skills"

Cohesion: 0.15 Nodes (19): Client Boundary: No VITE_* Tokens, Render
Environment-Tab Secrets, DATABASE_URL / TEST_DATABASE_URL / GEMINI_API_KEY /
TYPESAFE_API_KEY, server/db/**tests**/integration.test.ts, Demo Hygiene On
/import, Gemini Free-Tier Data Use Caveat, Unmapped Errors Become Generic 500,
MAX_IMPORT_ROWS Import Cap (+11 more)

### Community 85 - "Checklist"

Cohesion: 0.14 Nodes (13): PersonaSwitch(), DropdownMenu(),
DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator (+5 more)

### Community 86 - "Slide 06: Three Desks, One Book"

Cohesion: 0.16 Nodes (16): appointmentDate(), firmLoad, LEGAL_FIRST_DIR,
LegalSortKey, median(), sortLegalRows(), sortValue(), appointmentDate() (+8
more)

### Community 87 - "Assumptions And Constraints"

Cohesion: 0.12 Nodes (7): ref_node_test, BK_MESSAGES, verifyCleanSeed(),
openDemoSession(), cleanEvents, SEEDED_MESSAGES, WALK_BEATS

### Community 88 - "Data Display And Tooltip Rules"

Cohesion: 0.11 Nodes (18): banks.test.ts (reversal, ledger, bank clocks), bun
run check (ESLint + tsc + Vitest gate), bun run --filter <name-or-glob>
<script>, Bun workspaces (frontend + packages/_), .github/workflows/ci.yml,
packages/core/src/index.test.ts, bun run --filter '_' fans root scripts out,
Gotcha: DB integration tests require TEST_DATABASE_URL (+10 more)

### Community 89 - "Mortar Product Overview"

Cohesion: 0.13 Nodes (18): Data Formats, Date Format (19 Sep 2026), Duration
Formats, Empty Values Are Em Dashes, font-display: Swap, Geist, Geist Mono, Nine
Text Styles, No Third Typeface (+10 more)

### Community 90 - "Perch Landing Teardown"

Cohesion: 0.18 Nodes (18): Elevation: Card, Flat Ledger Look, Bookings
Bulk-Action Glass Island, Single Sanctioned Gradient (Landing Panel), Landing
Page, Landing Card Elevation, Landing Chromatic Panel (.land-panel), Landing
Claim (+10 more)

### Community 91 - "core/package.json"

Cohesion: 0.11 Nodes (18): Better Is Better Than Best, Break Up Dense Text,
Capitalization, Character Line Limit, Document Layout, Exceptions, Images, Lists
(+10 more)

### Community 92 - "banks.test.ts"

Cohesion: 0.15 Nodes (18): Case Event Schema, Event Statuses
(confirmed/provisional/disputed/superseded), FR-11 Database Persistence And Demo
Data, FR-4 Evidence Log And Multi-Party Verification, FR-6 TypeSafe Jev
Structured Message Extraction, Human In The Loop, JevMeta
(source/stale/latencyMs), Jev Choice / Score / Noul Primitives (+10 more)

### Community 93 - "Keep It Current"

Cohesion: 0.16 Nodes (18): AGENTS.md, Architecture: one deployable and two
shared libraries, assets/architecture.svg stack diagram (solid shipped, dashed
planned), assets/architecture.drawio editable diagram source, CI checks gate the
Render deploy, Design Spec (DESIGN.md), @mortar/core shared by browser and
server, so a booking has one definition, Piece docs/: README, design spec,
sources, agent notes (+10 more)

### Community 94 - "UI Triage: The Signed-In App"

Cohesion: 0.16 Nodes (10): AppSidebar(), AppSidebarProps, PAGE_ICONS,
NAV_GROUP_LABELS, NavGroup, pagesForPersona(), PersonaContext,
PersonaContextValue (+2 more)

### Community 95 - "app.ts"

Cohesion: 0.11 Nodes (17): compilerOptions, jsx, lib, paths, types, exclude,
extends, include (+9 more)

### Community 96 - "ref_node_fs"

Cohesion: 0.15 Nodes (18): Answer Every Comment Then Resolve The Thread, Branch
Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy,
Commit Message Format type(scope): what changed, Delete The Branch After
Merging, Merging Into main Deploys To The Live Site, Green Checks Only, The
Journey Of A Change (+10 more)

### Community 97 - "BatchSpeechTests"

Cohesion: 0.11 Nodes (17): minisearch, dependencies, minisearch,
devDependencies, typescript, vitest, exports, typescript (+9 more)

### Community 98 - "Financing-Risk Method"

Cohesion: 0.12 Nodes (17): ageOn(), BookingDraft, checkBookingDraft(),
DateOrder, EXCEL_EPOCH, HEADER_NAMES, headerCandidates(), isCount() (+9 more)

### Community 99 - "live-check.ts"

Cohesion: 0.12 Nodes (14): JevCacheEntry, cache, caseData, client,
CollectingCache, generated, jev, metered (+6 more)

### Community 100 - "Hugeicons by Halal Lab"

Cohesion: 0.25 Nodes (15): SimulationMeta, isoDate(), isoDateTime(), jsonb(),
maskDigits(), Row, rowsToMeta(), rowToBooking() (+7 more)

### Community 101 - "scripts"

Cohesion: 0.16 Nodes (17): Porting Its Hover Motion without React, Jakub
Krehel's Interface Skills, better-accessibility Skill: reduced motion, zoom,
autoplay, better-colors Skill, better-interface Skill: orchestrated review,
better-typography Skill, break Skill, explain-interface Skill (+9 more)

### Community 102 - "Security, Secrets And Privacy"

Cohesion: 0.16 Nodes (17): LQIP Placeholder Behind Video Tiles, better-layout
Skill, WCAG 2.2.2 Autoplay Pause Requirement, Landing Video Pipeline, The
Agent's Video Checklist, Gemini Videos Composer at gemini.google.com/videos,
Clip Prompt Shape: no text in frame, one camera move, Silent Loop Encode: ffmpeg
-an libx264 crf 22 plus faststart (+9 more)

### Community 103 - "Route /forecast (Projected Signings)"

Cohesion: 0.12 Nodes (16): aliases, components, hooks, lib, ui, utils, rsc,
$schema (+8 more)

### Community 104 - "walk.mjs"

Cohesion: 0.23 Nodes (13): managerSuggestions(), assumptions, booking, event(),
snapshot(), WaitingSuggestion, assumptionValue(), DEFAULT_ASSUMPTIONS (+5 more)

### Community 105 - "RTK Commands By Workflow"

Cohesion: 0.17 Nodes (6): JevCache, JevKind, MemoryCache, MemoryCache,
JevAnswerRow, DbJevCache

### Community 106 - "Components"

Cohesion: 0.12 Nodes (16): dist, node_modules, compilerOptions, esModuleInterop,
forceConsistentCasingInFileNames, isolatedModules, lib, module (+8 more)

### Community 107 - "Components"

Cohesion: 0.21 Nodes (17): /api/snapshot, assemble.sh (Picture Timeline + Mux),
Capture-Completeness Audit, Pacing and Scrolling, contract.mjs (Beat Contract &
Audit), Harness Structure, mark() Beat Marker, motion.mjs (Constant-Rate
Scrolling) (+9 more)

### Community 108 - "Assumptions And Constraints"

Cohesion: 0.12 Nodes (17): Music Bed Processing (loop, fade, duck), Bundled
Chromium (or DEMO_CHANNEL=chrome), Ducked Music Bed, DEMO_BGM (""), Music file;
looped, faded, ducked under the voice when set, DEMO_BGM_GAIN_DB (-20), Music
gain before speech-triggered ducking, DEMO_CHANNEL (unset (bundled Chromium))
(+9 more)

### Community 109 - "booking-template.mjs"

Cohesion: 0.12 Nodes (17): Burned Subtitles, Slide Subtitle Clearance, Deck
Foot-Lines Would Sit Under Burned Captions, DEMO_MAX_GAP_MS (1000), Max allowed
gap between consecutive spoken lines (dead-air rule), DEMO_MUTE_SEG_MS (900),
Max picture kept for a beat with no narration, DEMO_SEGMENTS (synthesize) (+9
more)

### Community 110 - "react"

Cohesion: 0.14 Nodes (16): 30-second budget, max 4 rounds, bun run format,
Conventions, docs/README.md (human quickstart), File Map, GEMINI_API_KEY,
GEMINI_MODEL (default gemini-3.5-flash-lite), Gemini free tier may train on
prompts (+8 more)

### Community 111 - "react"

Cohesion: 0.17 Nodes (16): DB tables: bookings, loan_applications, events,
messages, tasks, playbooks, jev_answers, meta, Env var DATABASE_URL,
.env.example copied to .env at repo root, Env var TEST_DATABASE_URL (dedicated
test Postgres), Getting Started, server/db/**tests**/integration.test.ts, Local
Postgres 17 via docker run (mortar-pg), Neon project mortar-test (+8 more)

### Community 112 - "record.mjs"

Cohesion: 0.19 Nodes (16): transitions.dev: UI transitions for AI agents, R7,
the Dissenting Expert, UI Triage: The Signed-In App, Copy Rules: the drop and
write table, Density Budget, The Desk Lens Becomes a Preset, Not a Banner, Three
Stacked Filter Systems With Disagreeing Numbers, Four-Phase Implementation Plan
(+8 more)

### Community 113 - "Assumptions And Constraints"

Cohesion: 0.17 Nodes (10): AppNav(), useBreadcrumbs(), getSystemTheme(),
resolveTheme(), Theme, ThemeContext, ThemeContextValue, ThemeProvider() (+2
more)

### Community 114 - "Assumptions And Constraints"

Cohesion: 0.20 Nodes (13): Notification, NotificationPopover(),
useNotifications(), emit(), Listener, listeners, loadNotifications(),
notifications (+5 more)

### Community 115 - "Agent Skills"

Cohesion: 0.18 Nodes (16): Check For Duplicates And Conflicts Before Opening An
Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form,
Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check,
Describe What You Saw, Not What You Think The Cause Is (+8 more)

### Community 116 - "react"

Cohesion: 0.25 Nodes (13): ctx, satisfying(), askBrain(), buildAskContext(),
contentWords(), coverage(), matchQuestion(), questionIndex() (+5 more)

### Community 117 - "persona.tsx"

Cohesion: 0.17 Nodes (13): fakeFetch(), AssistantImage, AssistantRequest,
clientIp(), HistoryTurn, IMAGE_MIME_TYPES, PERSONAS, RateLimiter (+5 more)

### Community 118 - "jev/tsconfig.json"

Cohesion: 0.27 Nodes (9): AssembleMuxTests, AssemblePictureTests, color_video(),
ff(), probe_duration(), CompletedProcess, Path, slide_png() (+1 more)

### Community 119 - "NarrateTests"

Cohesion: 0.14 Nodes (15): createDatabase (shared snapshot),
createProxySystemOne (Jev proxy client), demo_seed provenance, DEMO_WEB
disposable recording env, Docs, .env.example (empty-not-commented convention),
db.forgetSnapshot(), Gotcha: JEV_PROXY_MODEL falls back on || not ?? (+7 more)

### Community 120 - "Assumptions And Constraints"

Cohesion: 0.16 Nodes (15): Layered Card Surface: hairline ring and stacked
shadow, shadow-border Three-Layer Token, Perch Sign-In Teardown, Authored
Disabled States, Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path
Check, Porting Plan: the persona folds into the guest button, Perch Storage
Keys: perch.trip.v1, perch.theme.v1, perch.voter.v1 (+7 more)

### Community 121 - "CaseSummary"

Cohesion: 0.15 Nodes (15): Follow The Design Guide And Shared UI Components,
Keep AI Agents On Task, Never Do These, Never Force-Push A Shared Branch, No
Pushes Straight To main, Never Commit Real Buyer Data, Never Commit Secrets, One
Problem Per Issue (+7 more)

### Community 122 - "AppErrorBoundary"

Cohesion: 0.15 Nodes (9): packages_core_src_index_jevcache,
packages_core_src_index_jevkind, packages_core_src_index_jevservice,
createProxySystemOne(), client(), colorQuestions, FakeResponse, FetchCall (+1
more)

### Community 123 - "generate.ts"

Cohesion: 0.19 Nodes (14): Client-Only Spreadsheet Parsing, FR-13 Add Bookings
Intake And Validation, FR-14 Persona Navigation And Page Routing, FR-22 Add
Bookings Intake, Personas Set Defaults Not Data Access, PERSONA_PAGES Access
Map, PersonaRoute.tsx Route Guard, Shared Project And Unit Range Settings (+6
more)

### Community 124 - "server/tsconfig.json"

Cohesion: 0.27 Nodes (13): detectDateOrder(), findHeader(), houseDate(),
isoFromParts(), parseAmount(), parseSheetDate(), readBookingSheet(), readIc()
(+5 more)

### Community 125 - "record.mjs"

Cohesion: 0.23 Nodes (9): Language, modelErrorResponse(), error(), isIsoDate(),
isIsoDateTime(), isResetEnabled(), isString(), RESET_DISABLED_VALUES (+1 more)

### Community 126 - "subtitles.py"

Cohesion: 0.26 Nodes (13): --force Flag For Node-Count Regression, When To Do A
Full Rebuild, Graphify, .graphifyignore, Installing Graphify, Keep It Current,
Never Merge Graph Files By Hand, Refresh The Graph As The Last Commit Of Every
Pull Request (+5 more)

### Community 127 - "Andrej Karpathy Skills"

Cohesion: 0.17 Nodes (11): ref_bun, sql, applySchema(), app, db, fetch(), port,
resetEnabled (+3 more)

### Community 129 - "Markdown Style Guide"

Cohesion: 0.23 Nodes (12): booking_removals, bookings, event_reviews, events,
imports, jev_answers, loan_applications, messages (+4 more)

### Community 130 - "Markdown Style Guide"

Cohesion: 0.18 Nodes (12): assistant/tools.ts (five read-only tools),
find_bookings tool, get_case tool, get_forecast_summary tool, get_my_queue tool,
Gotcha: keyword score alone does not gate a question, Gotcha: named profiles
define data access, matchQuestion (ranks on query coverage) (+4 more)

### Community 131 - "Personas And Jobs To Be Done"

Cohesion: 0.17 Nodes (11): license, name, private, scripts, build, dev, preview,
template:bookings (+3 more)

### Community 132 - "Playbook Search With Minisearch"

Cohesion: 0.17 Nodes (7): bookings, COLUMNS, date(), howTo, OUT, SAMPLES,
ref_node_url

### Community 133 - "CaseSummary"

Cohesion: 0.24 Nodes (6): MortarMark(), MortarMarkProps, AppFooter(),
FooterLink, LINK_COLUMNS, SiteShell()

### Community 134 - "assistant/index.ts"

Cohesion: 0.23 Nodes (8): readSheetFile(), sheetKind(), SheetReadError,
DEFAULTS, FIXTURE, TEMPLATE, parseCsv(), ref_node_fs

### Community 135 - "WaitingOn.tsx"

Cohesion: 0.30 Nodes (9): scrollDuration(), scrollTarget(), smoothScrollTo(),
film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink(), visible() (+1
more)

### Community 136 - "CaseEvent"

Cohesion: 0.24 Nodes (11): Project Notes (docs/agents/notes.md),
docs/agents/notes.md, Mortar Agent Notes, Mortar Project Guidelines (AGENTS.md),
Design: Mortar (Visual Specification), Mortar Design System In Figma, Landing
Video Pipeline (superseded), House Markdown Style Guide (+3 more)

### Community 137 - "useTheme.tsx"

Cohesion: 0.22 Nodes (10): AppErrorBoundary, DateField.tsx (shared Mortar date
field), Gotcha: forecast detail is collapsible (#60 reversed #54/#61), Gotcha:
Radix Popover stalls jsdom (14-24s), Gotcha: Radix popovers need z-[80] to clear
a dialog, inlinePopover.tsx test double, RefreshErrorBanner (non-blocking, Try
Again), bunx shadcn add <component> (+2 more)

### Community 138 - "Pull Request Template"

Cohesion: 0.18 Nodes (11): ballInCourt (who holds a case),
components/case/ball.ts (labels, icons, owners), CaseQuickView.tsx (side sheet),
createJevService / systemOne surface, Gotcha: focus the sheet, not its first
control, Jev Suggests: <Step> Instead, Manager Suggestions view, nextStep.ts
(one next step per case) (+3 more)

### Community 139 - "forecast/forecast.ts"

Cohesion: 0.18 Nodes (11): Analysis & Debug (70-90% Savings), Build & Compile
(80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub
(26-87% Savings), Infrastructure (85% Savings), JavaScript/TypeScript Tooling
(70-90% Savings), Meta Commands (+3 more)

### Community 140 - ".prettierrc.json"

Cohesion: 0.24 Nodes (11): Button Component, Checkbox Component, Density
Decision (36px Controls, 44px Rows), Field Component, Focus Ring, Ink Is The
Action Colour, Public-Page Radius Steps (2xl/3xl), Radius Tokens (+3 more)

### Community 141 - "proof.test.mjs"

Cohesion: 0.27 Nodes (11): Content Canvas, Icon Rules (Never Alone, aria-label +
Tooltip), Icons, Lucide (lucide-react) Icon System, Money Formats, One Focus Per
Screen, Progressive Disclosure, Screen Density (+3 more)

### Community 142 - "GitHub Issues And Pull Requests"

Cohesion: 0.22 Nodes (11): Buyer Signals (responsiveness/hesitation), Assistant
Read-Only Tool Set, FR-20 Message Timing And Buyer Response, FR-7 Next Action,
Playbook Fit And Buyer Signals, JTBD: Guidance Retrieval, Loan Admin Persona,
MiniSearch Playbook Index, REFERENCE_DATE (2026-09-18) (+3 more)

### Community 143 - "persona.tsx"

Cohesion: 0.22 Nodes (9): BookingPipelineFlow(), BookingPipelineFlowProps,
PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId,
StepConfig, STEPS (+1 more)

### Community 144 - "Markdown Style Guide"

Cohesion: 0.20 Nodes (5): BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 145 - "persona.tsx"

Cohesion: 0.18 Nodes (11): DEMO_FFPROBE (ffprobe on PATH), ffprobe executable,
DEMO_MAX_DURATION (300), Reject a deliverable longer than this many seconds,
DEMO_MIN_DURATION (240), Reject a deliverable shorter than this many seconds,
Step 4: Verify the Deliverable, Target Runtime 4:00-4:45 (ceiling 5:00) (+3
more)

### Community 146 - "formatters.ts"

Cohesion: 0.22 Nodes (9): Run bun run check Then bun run format, Graphify
(docs/agents/graphify.md), Ask Graph Before Grepping / Refresh On Last Commit
Rule, RTK (docs/agents/rtk.md), RTK Command Prefix Rule, Agent Rules, Golden
Rule, RTK (Rust Token Killer) - Token-Optimized Commands (+1 more)

### Community 147 - "What Happened"

Cohesion: 0.24 Nodes (9): Contributing (.github/CONTRIBUTING.md), Data Retention
section (docs/TRD.md#data-retention), Design (docs/DESIGN.md), Documents Index,
Markdown Style Guide (docs/markdown-style.md), Product Requirements Document
(docs/PRD.md), Product Overview (docs/PRODUCT.md), Technical Requirements
Document (docs/TRD.md) (+1 more)

### Community 148 - "core/tsconfig.json"

Cohesion: 0.20 Nodes (9): Skills (docs/agents/skills.md), Agent Skills, Install
And Update, leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On
Windows, pbakaus/impeccable (+1 more)

### Community 149 - "schedule.py"

Cohesion: 0.20 Nodes (10): blockPrefix legacy read alongside blocks, BK-nnnn ids
stop before BK-9001, POST /api/bookings/import, Atomic duplicate-unit
protection, Gotcha: imported bookings are born booked, dated to the desks'
today, Gotcha: shared settings and inventory, Inventory API (held project/unit
pairs, no buyer names), Project settings (server-held, Manager-only) (+2 more)

### Community 150 - "SubtitleLayoutTests"

Cohesion: 0.20 Nodes (5): CapturedRequest, extractAnswers, failingClient(),
fakeClient(), JevClient

### Community 151 - "TourProvider.test.tsx"

Cohesion: 0.20 Nodes (9): compilerOptions, types, extends, include, src/**/*.ts,
../../tsconfig.json, vitest.config.ts, node (+1 more)

### Community 152 - "Deck Assets Manifest"

Cohesion: 0.29 Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 153 - "Route /import (Add Bookings)"

Cohesion: 0.33 Nodes (8): Frontend Stack (React 19 + Vite + Tailwind 4 +
shadcn/ui), @mortar/core package, mortar.persona localStorage key,
mortar.profile localStorage key, Personas, Mortar Product Definition, Route Map,
Stack (Bun workspaces)

### Community 154 - "Slide 10: Where AI Helps, Where People Decide"

Cohesion: 0.25 Nodes (9): booking-sheet-template.xlsx/.csv, checkBookingDraft,
DropZone / readSheetFile, frontend/src/main.tsx (providers), Import area,
ImportPage.tsx, frontend/src/pages/ (one file per route), parseCsv (+1 more)

### Community 155 - "assemble.sh"

Cohesion: 0.25 Nodes (9): currentCaseAssignee recipient resolution, forecast()
projects forward, Gotcha: both halves of /forecast read one log, Gotcha: manager
workflows, HORIZON_DAYS (30), leakage() counts backward, Trigger at 150% of
expected duration, Manager Overview view (+1 more)

### Community 156 - "Mortar Demo Recorder"

Cohesion: 0.31 Nodes (9): Acceptance Criteria (14), Calibrated Contrast Ratios,
Colour, Light And Dark From One Token Set, Primitives: ink Ramp, Primitives:
paper Ramp, Selected Row Ground (--selected), Semantic Colour (Color Collection)
(+1 more)

### Community 157 - "Assumptions And Constraints"

Cohesion: 0.31 Nodes (9): Scripted askBrain Fallback, Direct Core ERP
Integration (Out Of Scope), FR-23 Ask MortarAI Grounded Assistant,
Gemini-Powered Assistant Service, Document OCR And Computer Vision (Deferred),
Operational Constraints, Out Of Scope, Synthetic Data Policy (+1 more)

### Community 159 - "Slide 18: A 12-Week Pilot"

Cohesion: 0.50 Nodes (8): addDays(), addWorkDays(), diffDays(), fromEpoch(),
isWeekend(), toEpoch(), workDaysBetween(), workDayOffset()

### Community 160 - "Product Overview"

Cohesion: 0.22 Nodes (8): bun-types, db/**/\*.ts, compilerOptions, types,
extends, include, src/**/*.ts, ../tsconfig.json

### Community 161 - "Technical Requirements Document"

Cohesion: 0.33 Nodes (8): build(), cards(), Builds the burned-in subtitle track
from the same lines.json the narration uses,, Split into lines of similar
length, never mid-word. Two things depend on th, Group wrapped lines into cards
of at most MAX_LINES., ts(), wav_ms(), wrap()

### Community 162 - "dependencies"

Cohesion: 0.22 Nodes (7): app, db, generated, jev, payload, persona, SNAPSHOT

### Community 163 - "Slide 17: The One Number We Are Judged By"

Cohesion: 0.25 Nodes (7): Andrej Karpathy Skills
(docs/agents/andrej-karpathy-skills.md), Think Before Coding / Surgical Changes
Rule, 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4.
Goal-Driven Execution, Andrej Karpathy Skills

### Community 164 - "dependencies"

Cohesion: 0.32 Nodes (8): graphify affected, Ask The Graph First, graphify
explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query,
Graph First, Then Grep

### Community 165 - "dependencies"

Cohesion: 0.29 Nodes (8): frontend/public/ai-mascot*.png, Assistant area
(server/src/assistant/), assistant/gemini.ts, assistant/guardrails.ts,
assistant/live-check.ts, assistant/prompt.ts, buildAskContext, User messages
fenced as untrusted data

### Community 166 - "CaseEvent"

Cohesion: 0.25 Nodes (8): Avoid Relative Paths Unless Within The Same Directory,
Define Reference Links After Their First Use, Links, Reference Links, Use
Explicit Paths For Links Within Markdown, Use Informative Markdown Link Titles,
Use Reference Links For Long Links, Use Reference Links To Reduce Duplication

### Community 167 - "dependencies"

Cohesion: 0.25 Nodes (8): Code, Codeblocks, Declare The Language, Escape
Newlines, Inline, Nest Codeblocks Within Lists, Use Code Span For Escaping, Use
Fenced Code Blocks Instead Of Indented Code Blocks

### Community 168 - ".releasePointerCapture"

Cohesion: 0.29 Nodes (8): Bun.serve single process, server/src/index.ts, 15 API
routes, Piece server/: Bun.serve on Render, static assets, /api/_, SQL schema on
boot, POST /api/_ writes, Render web service (Singapore), Settings: server
health and folded layouts, Stack: Render web service, Free instance (Singapore),
Dockerfile: Bun build → Bun alpine runtime

### Community 169 - "dependencies"

Cohesion: 0.29 Nodes (7): callGemini(), GeminiContent, GeminiFunctionCall,
GeminiOptions, GeminiPart, GeminiResponse, isAbort()

### Community 170 - ".scrollIntoView"

Cohesion: 0.43 Nodes (7): 503 { fallback: true } scripted fallback, askBrain
(scripted fallback), brain/helpers.ts isOpen filter, brain.test.ts pins Ask's
stalled set, deriveCase (computes open and live), Gotcha: open is not live,
stallReasons (derived from open)

### Community 171 - "read-excel-file/browser"

Cohesion: 0.29 Nodes (7): docs/DESIGN.md, frontend/src/globals.css (@theme
tokens from DESIGN.md), Gotcha: grid-cols-1 required on every responsive grid,
frontend/public/media/ hero clip, frontend/index.html (fonts, FOUC theme
script), ThemeToggle, hooks/useTheme.tsx

### Community 172 - "frontend/package.json"

Cohesion: 0.38 Nodes (7): Ask Panel, Chip Economy, Internal Names Stay Internal,
Jev (Assistant), Jev Acts, It Does Not Report Status, Landing Ledger Is
Illustrative, Plain Language

### Community 173 - "Start From Fresh main"

Cohesion: 0.38 Nodes (7): Fill In The Pull Request Template, Show UI Changes
With Screenshots, Screenshots Or Recording, Pull Request Template, Screenshots,
What Changed, Why

### Community 174 - "narrate.sh"

Cohesion: 0.29 Nodes (6): overrides, printWidth, $schema, semi, singleQuote,
trailingComma

### Community 175 - "CLAUDE.md"

Cohesion: 0.33 Nodes (5): GitHub Issues And Pull Requests
(docs/agents/github.md), Read Existing Issues And PRs Rule, Before Opening A
Pull Request, Before Opening An Issue, GitHub Issues And Pull Requests

### Community 176 - "Assumptions And Constraints"

Cohesion: 0.33 Nodes (6): Add Spacing To Headings, ATX-Style Headings,
Capitalization Of Titles And Headers, Headings, Use A Single H1 Heading, Use
Unique, Complete Names For Headings

### Community 177 - "Assumptions And Constraints"

Cohesion: 0.40 Nodes (4): currencyFormatter, formatCurrency(),
formatTooltipCurrency(), numberFormatter

### Community 178 - ".hasPointerCapture"

Cohesion: 0.33 Nodes (6): What You Expected, Steps To Reproduce, What Happened,
Where: Live Site / Running Locally / Both, Pitch Priority, How To Check It

### Community 179 - ".releasePointerCapture"

Cohesion: 0.33 Nodes (5): extends, include, src/**/*.ts, ../../tsconfig.json,
vitest.config.ts

### Community 180 - ".scrollIntoView"

Cohesion: 0.47 Nodes (5): deconflict(), duration_ms(), main(), Prevent narration
collisions and reject speech that crosses a visual beat. A be, Push starts later
so no line is still speaking when the next begins. Pure s

### Community 181 - "main.tsx"

Cohesion: 0.40 Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 184 - ".scrollIntoView"

Cohesion: 0.67 Nodes (4): buildClosedExportRows (pure, no DOM/network),
closedExport.ts, downloadClosedExport (lazy-loads writer),
write-excel-file/browser

### Community 185 - ".hasPointerCapture"

Cohesion: 0.50 Nodes (3): Deck Assets Manifest, Generated Art, Product
Screenshots

### Community 186 - ".releasePointerCapture"

Cohesion: 0.67 Nodes (3): isOff(), typescriptFiles, warnings()

### Community 187 - ".scrollIntoView"

Cohesion: 0.50 Nodes (4): AssumptionsCard(), formatAssumptionValue(),
suggestedQuestions(), a()

### Community 188 - "setup.ts"

Cohesion: 0.67 Nodes (3): AppLayout (mounts the tour), frontend/src/tour/ guided
walkthrough, tourSteps.ts (data-tour anchors)

## Ambiguous Edges - Review These

- `Managed Neon PostgreSQL` →
  `Legacy Cloud Run Service (No Longer Receiving Deploys)` [AMBIGUOUS]
  docs/TRD.md · relation: references
- `Managed Neon PostgreSQL` → `Singapore Region Next To Neon ap-southeast-1`
  [AMBIGUOUS] docs/TRD.md · relation: references
- `TypeSafe Jev Service (model: jev-latest)` →
  `Health `jev` Reports Wiring, Not Last Success` [AMBIGUOUS] docs/TRD.md ·
  relation: references
- `Booking conversion challenge` → `How It Works section` [AMBIGUOUS]
  docs/README.md · relation: conceptually_related_to

## Knowledge Gaps

- **868 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`,
  `trailingComma` (+863 more) These have ≤1 connection - possible missing edges
  or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query`
  to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Managed Neon PostgreSQL` and
  `Legacy Cloud Run Service (No Longer Receiving Deploys)`?** _Edge tagged
  AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Managed Neon PostgreSQL` and
  `Singapore Region Next To Neon ap-southeast-1`?** _Edge tagged AMBIGUOUS
  (relation: references) - confidence is low._
- **What is the exact relationship between
  `TypeSafe Jev Service (model: jev-latest)` and
  `Health `jev` Reports Wiring, Not Last Success`?** _Edge tagged AMBIGUOUS
  (relation: references) - confidence is low._
- **What is the exact relationship between `Booking conversion challenge` and
  `How It Works section`?** _Edge tagged AMBIGUOUS (relation:
  conceptually_related_to) - confidence is low._
- **Why does `Design: Mortar (Visual Specification)` connect `CaseEvent` to
  `frontend/tsconfig.json`?** _High betweenness centrality (0.174) - this node
  is a cross-community bridge._
- **Why does `Button Component` connect `.prettierrc.json` to
  `Perch Landing Teardown`, `api.ts`?** _High betweenness centrality (0.171) -
  this node is a cross-community bridge._
- **Why does `Seven Core Design Decisions` connect `CaseEvent` to
  `.prettierrc.json`, `proof.test.mjs`, `Mortar Product Overview`,
  `Perch Landing Teardown`, `Mortar Demo Recorder`?** _High betweenness
  centrality (0.169) - this node is a cross-community bridge._
