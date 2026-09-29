# Graph Report - Mortar  (2026-09-29)

## Corpus Check
- 373 files · ~312,337 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 9, .css 3, .example 1)

## Summary
- 4522 nodes · 12573 edges · 206 communities (164 shown, 42 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 899 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8e5103e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ChasePage.tsx
- BookingDetailPage.tsx
- ForecastPage.tsx
- cn
- InfoTooltip
- Deployment Workflow
- tourAnchors.test.tsx
- Industry Practitioner Survey (n=8)
- core/src/index.ts
- Profile Menu
- brain.test.ts
- package.json
- jev_answers Table (Model Answer History)
- Financing-Risk Method
- app.ts
- generate.ts
- Environment Configuration
- A Company Brain For Booking-To-SPA Conversion
- BookingsPage.tsx
- Booking
- Generator Pipeline Diagram
- frontend/index.html (Vite SPA Entry Document)
- Ask MortarAI (Gemini assistant)
- check Job
- questions.ts
- GET /api/snapshot
- sim.test.ts
- lucide-react
- db/index.ts
- Mortar Brief
- better-accessibility Skill: reduced motion, zoom, autoplay
- persona.tsx
- Mortar (Product Requirements)
- About The Project section
- StatusPill
- Five named demo profiles behind the four personas
- Approved Glyph List
- AskPanel.tsx
- Live Walkthrough
- Capture Beat Sequence
- FakeDb
- Persona: Legal Admin (home /legal)
- BookingsPage.test.tsx
- RecordUpdateForm.test.tsx
- generate() Stage-Transition Monte Carlo
- banks.test.ts
- ref_playwright
- User Stories Per Screen
- json
- Mortar Demo Recorder
- tools.ts
- Sources
- FR-2 Case Summarization And Stall Detection
- Data Retention
- forecast() projects forward
- PersonaRoute.tsx (route guard)
- Hugeicons by Halal Lab
- proxyClient.ts
- assistant/index.ts
- Front-End Simulation
- CaseSummary
- Gotcha: manager workflows
- Questions To Expect
- precompute.ts
- jev/package.json
- slides/render.mjs (Slide PNG Renderer)
- server/package.json
- dependencies
- Know The Company
- FR-6 TypeSafe Jev Structured Message Extraction
- devDependencies
- speak.py
- MotionSites: cinematic landing page prompts
- App Shell
- LandingPage.tsx
- POST /api/assistant
- usePersona
- narrate.sh (Voice + Schedule + Subtitles)
- Preserved Technical Cautions
- Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)
- assistant.test.ts
- Status Language
- Acceptance Criteria (14)
- Functional Requirements
- askBrain (scripted fallback)
- How It Works section
- CaseEvent
- record.mjs
- patch_docs.py
- Typeface
- Landing Page
- Markdown Style Guide
- API Reference
- Design Research: Layerhand Landing Page
- frontend/ Workspace
- frontend/tsconfig.json
- Pull Request Template
- core/package.json
- import.ts
- cases.ts
- mappers.ts
- react-router-dom
- api.ts
- components.json
- Step 1: Capture
- Case-free forecast aggregate (built from full resolved history before profile scoping)
- compilerOptions
- Harness Structure
- Music Bed
- The Jev Boundary And Resilience
- Mortar Notes For Agents
- Getting Started
- UI Triage: The Signed-In App
- Plain Language
- closedExport.ts
- Bug Report Issue Form
- RecordUpdateForm.tsx
- Jev (Reading Engine)
- test_assemble.py
- HowItWorks.tsx
- Perch Landing Teardown
- Checklist
- Gotcha: named profiles define data access
- Import area
- packages_core_src_index_caseevent
- This Week. What We Need.
- Keep It Current
- packages_core_src_sim_default_seed
- BatchSpeechTests
- schema.sql
- ImportPage.tsx
- scripts
- booking-template.mjs
- packages_core_src_sim_horizon_days
- reset.ts
- packages_core_src_sim_persona_staff
- Documents Index
- File Map
- Gotchas
- RTK Commands By Workflow
- Step 6: Request Follow-Up From Tan Mei Ling
- Today Rail
- FR-8 Statistical Conversion Forecasting
- Radius Tokens
- Project Structure tree
- assemble.sh Mux Phase
- notificationStore.ts
- packages_core_src_sim_reference_date
- Agent Skills
- Assistant area (server/src/assistant/)
- jev/tsconfig.json
- NarrateTests
- Personas
- Meet MortarAI. One Reads, One Answers.
- Jakub Krehel's Interface Skills
- Run Of Show
- server/tsconfig.json
- subtitles.py
- Manager (persona)
- Andrej Karpathy Skills
- Ask The Graph First
- frontend_src_components_case_index_owner_role_labels
- frontend_src_components_case_index_ownerbadge
- frontend_src_components_case_index_riskchip
- frontend_src_components_case_index_stage_labels
- packages_core_src_index_playbooks
- packages_core_src_index_stories
- .prettierrc.json
- Agent Rules
- packages_jev_src_index_defaultplaybookquery
- formatters.ts
- core/tsconfig.json
- SubtitleLayoutTests
- ref_vitest
- packages_jev_src_index_jevinputhash
- packages_jev_src_index_nextactionjob
- packages_jev_src_index_question_version
- better-ui Skill: surfaces, icons, motion values
- assemble.sh
- packages_jev_src_index_signalsjob
- schedule.py
- frontend/package.json
- Start From Fresh main
- narrate.sh
- Draft While Unfinished
- packages_core_src_index_sheetfield
- types.ts
- resemble-perth Pinned Commit and setuptools<81

## God Nodes (most connected - your core abstractions)
1. `cn()` - 161 edges
2. `Button` - 97 edges
3. `react` - 88 edges
4. `lucide-react` - 60 edges
5. `@testing-library/react` - 58 edges
6. `usePersona()` - 56 edges
7. `Booking` - 56 edges
8. `CaseEvent` - 56 edges
9. `react-router-dom` - 55 edges
10. `Card` - 52 edges

## Surprising Connections (you probably didn't know these)
- `Run bun run check Then bun run format` --semantically_similar_to--> `Run The Checks Locally Before Pushing`  [INFERRED] [semantically similar]
  AGENTS.md → .github/CONTRIBUTING.md
- `App()` --implements--> `Route Map`  [INFERRED]
  frontend/src/App.tsx → AGENTS.md
- `ProfileMenu()` --implements--> `Profile Menu (Header Role Switcher)`  [INFERRED]
  frontend/src/components/layout/ProfileMenu.tsx → docs/PRODUCT.md
- `managerQueue()` --implements--> `Decisions For You`  [INFERRED]
  frontend/src/components/manager/managerQueue.ts → docs/PRODUCT.md
- `mortar.persona localStorage key` --shares_data_with--> `PERSONA_STORAGE_KEY`  [INFERRED]
  AGENTS.md → frontend/src/lib/persona.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MortarAI Two-Engine Architecture (Jev + Gemini)** — docs_prd_mortarai_ai_layer, docs_prd_typesafe_jev, docs_prd_gemini_assistant, docs_prd_ask_mortarai_renamed [EXTRACTED 1.00]
- **Redesign Supersedes #60 Points (Suggestions Tabs, Forecast Documents Removal)** — docs_prd_intake_60, docs_prd_manager_suggestions_first, docs_prd_forecast_documents_removed, docs_prd_decisions_for_you, docs_prd_team_page, docs_prd_forecast_document_stack [EXTRACTED 1.00]
- **Cross-Desk Booking Handoff In The Live Walkthrough** — docs_demo_mortar_pitch_deck_persona_sales_admin, docs_demo_mortar_pitch_deck_persona_loan_admin, docs_demo_mortar_pitch_deck_persona_legal_admin, docs_demo_mortar_pitch_deck_persona_manager [EXTRACTED 1.00]
- **Seven-Step Live Walkthrough Sequence** — docs_demo_pitch_script_walkthrough_step1_queue_cards, docs_demo_pitch_script_walkthrough_step2_waiting_on_view, docs_demo_pitch_script_walkthrough_step3_confirm_jev_suggestion, docs_demo_pitch_script_walkthrough_step4_paste_message_confirm, docs_demo_pitch_script_walkthrough_step5_record_appointment, docs_demo_pitch_script_walkthrough_step6_request_followup, docs_demo_pitch_script_walkthrough_step7_forecast_numbers [EXTRACTED 1.00]
- **MortarAI's Two-Engine System (Jev Reads, Gemini Answers)** — docs_demo_mortar_pitch_deck_mortarai, docs_demo_mortar_pitch_deck_jev, docs_demo_mortar_pitch_deck_gemini_engine, docs_demo_mortar_pitch_deck_ask_mortarai [EXTRACTED 1.00]
- **The Desk Never Waits On AI: Budgets And Fallbacks** — docs_demo_pitch_script_graceful_degradation, docs_demo_pitch_script_jev_three_second_budget, docs_demo_pitch_script_contingency_jev_slow_or_wrong, docs_demo_pitch_script_contingency_gemini_fallback_counted, docs_demo_pitch_script_q_ai_wrong_or_down, docs_demo_pitch_script_10_technology_second_b_1_minute [INFERRED 0.85]
- **Manager Oversight Flow (Decisions For You, Follow-Up, Team View)** — docs_demo_mortar_pitch_deck_persona_manager, docs_prd_jtbd_decisions_waiting_on_me, docs_prd_decisions_for_you, docs_prd_manager_flagging, docs_prd_jtbd_reading_the_desks, docs_prd_team_page [INFERRED 0.85]
- **Jev Picks, Scores Its Confidence, A Person Confirms** — docs_demo_pitch_script_jev, docs_demo_pitch_script_jev_fixed_answers_calibrated_confidence, docs_demo_pitch_script_needs_review_threshold, docs_demo_pitch_script_jev_picks_never_writes, docs_demo_pitch_script_ai_proposes_people_confirm, docs_demo_pitch_script_walkthrough_step3_confirm_jev_suggestion [INFERRED 0.85]
- **Evidence Base Cited Across The Pitch Deck** — docs_demo_mortar_pitch_deck_source_practitioner_survey, docs_demo_mortar_pitch_deck_source_rehda_industry_survey, docs_demo_mortar_pitch_deck_source_chgp_2q_2026_results, docs_demo_mortar_pitch_deck_source_chin_hin_challenge_brief [INFERRED 0.85]
- **Booking-To-SPA Evidence Chain From Interview to Feature Proposal** — docs_source_interview, docs_research_practitioner_survey_readme, docs_source_problem_statement_booking_to_spa_gap, docs_research_feature_ideas_readme_early_financing_eligibility [EXTRACTED 1.00]
- **Demo Capture Lane (walk, record, contract, warmup, proof)** — scripts_demo_readme_walk_mjs, scripts_demo_readme_record_mjs, scripts_demo_readme_contract_mjs, scripts_demo_readme_warmup_mjs, scripts_demo_readme_proof_mjs, scripts_demo_readme_beats_json, scripts_demo_readme_capture_webm, scripts_demo_readme_mark [EXTRACTED 1.00]
- **Demo Voice Synthesis Lane** — scripts_demo_readme_speak_py, scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py, scripts_demo_readme_narrate_sh, scripts_demo_readme_lines_json, scripts_demo_readme_manifest_py [EXTRACTED 1.00]
- **Document Patching Pipeline (prepare, edit, check, merge, finish)** — docs_agents_graphify_patch_workflow, scripts_graph_patch_docs, docs_agents_graphify_patch_prepare, docs_agents_graphify_patch_check, docs_agents_graphify_patch_merge, docs_agents_graphify_patch_finish [EXTRACTED 1.00]
- **Manager Works From Today With Team Desk Health** — docs_product_project_management, docs_product_robert_khoo, docs_product_decisions_for_you, docs_product_desk_health, docs_product_team_view, docs_product_mortar_workspace_engine [EXTRACTED 1.00]
- **Architecture: case intake, staff review, web app, API, and backend services** — docs_readme_case_messages, docs_readme_staff_personas, docs_readme_bun_serve_index, docs_readme_mortar_core_shared, docs_readme_neon_postgres, docs_readme_jev_client, docs_readme_google_gemini, docs_readme_render_autodeploy [EXTRACTED 1.00]
- **Jev Four-Tier Fallback Ladder (Live, Exact Cache, Stale, Unavailable)** — docs_trd_jev_service, docs_trd_ladder_live_call, docs_trd_ladder_exact_cache, docs_trd_ladder_stale_cache, docs_trd_ladder_unavailable, docs_trd_jev_answers_table [EXTRACTED 1.00]
- **MortarAI's Two Engines (Jev Classification + Gemini Answers)** — docs_trd_mortar_ai, docs_trd_mortar_jev_package, docs_trd_gemini_model, docs_trd_ask_mortar_ai [EXTRACTED 1.00]
- **Persona Route Guarding (Profiles, Page Map, Home Routes, Guard, /team)** — docs_trd_frontend_persona_tsx, docs_trd_five_named_demo_profiles, docs_trd_persona_pages, docs_trd_persona_home_routes, docs_trd_persona_route_component, docs_trd_team_page, docs_trd_manager_redirect [EXTRACTED 1.00]
- **Dark Mode Boot Path (stored preference, OS media query, class toggle, browser chrome color)** — frontend_index_html_fouc_guard_script, frontend_index_html_theme_localstorage_key, frontend_index_html_prefers_color_scheme_media_query, frontend_index_html_dark_class_toggle, frontend_index_html_theme_color_dark, frontend_index_html_theme_color_light [EXTRACTED 1.00]
- **Social Share Card (Open Graph + Twitter Card metadata pointing at the Render deployment)** — frontend_index_html_social_preview_metadata_group, frontend_index_html_og_title, frontend_index_html_og_description, frontend_index_html_og_url, frontend_index_html_og_image, frontend_index_html_twitter_card, frontend_index_html_twitter_image, frontend_index_html_brand_tagline [EXTRACTED 1.00]
- **The Seven Stages Of The Journey Of A Change** — github_contributing_start_with_an_issue, github_contributing_branch_naming, github_contributing_commit_message_format, github_contributing_fill_in_the_template, github_contributing_review_and_merging, github_contributing_check_the_live_site [EXTRACTED 1.00]
- **check Job Step Sequence** — github_workflows_ci_step_checkout, github_workflows_ci_step_setup_bun, github_workflows_ci_step_install_frozen_lockfile, github_workflows_ci_step_run_check, github_workflows_ci_step_run_build [EXTRACTED 1.00]
- **Landing Page Design Synthesis Across Eight Sources** — docs_research_design_readme, docs_research_design_hugeicons_stroke_rounded, docs_research_design_isocons, docs_research_design_motionsites_scroll_scrubbed_video, docs_research_design_jakub_antalik_drawer, docs_research_design_canvas_ui_peel, docs_research_design_jakubkrehel_skills_better_ui [EXTRACTED 1.00]
- **Public Page Chrome (Landing, Footer, Sign-In)** — docs_design_public_pages, docs_design_landing, docs_design_public_footer, docs_design_sign_in, docs_design_landing_panel_tokens [EXTRACTED 1.00]
- **Status Visual Language (tone + word + pill)** — docs_design_status_tones, docs_design_status_language, docs_design_status_pill, docs_design_signed_pill_inversion, docs_design_urgency_words [EXTRACTED 1.00]
- **MortarAI AI layer: Jev and Gemini engines** — docs_readme_mortarai, docs_readme_jev_client, docs_readme_typesafe, docs_readme_ask_mortarai, docs_readme_google_gemini [EXTRACTED 1.00]
- **Reduction of Visual Noise Across Product and Marketing Surfaces** — docs_research_perch_landing_single_cta, docs_research_ui_triage_readme_density_budget, docs_research_ui_triage_readme_uniform_volume, docs_research_design_jakub_antalik_restraint [INFERRED 0.75]
- **Persona Switching And Profile Persistence** — agents_personas, docs_product_profile_menu, agents_mortar_profile_key, agents_mortar_persona_key, agents_routes [INFERRED 0.85]
- **Pacing and Duration Guardrails** — scripts_demo_readme_target_runtime, scripts_demo_readme_picture_fits_voice, scripts_demo_readme_no_dead_air, scripts_demo_readme_disable_mkl_dnn, scripts_demo_readme_env_demo_max_gap_ms, scripts_demo_readme_env_demo_fit_tail_ms, scripts_demo_readme_env_demo_mute_seg_ms, scripts_demo_readme_env_demo_min_duration, scripts_demo_readme_env_demo_max_duration [INFERRED 0.85]
- **Safeguards Against Graph Churn And Node Loss** — docs_agents_graphify_pinned_version, docs_agents_graphify_install_line, docs_agents_graphify_sql_extra, docs_agents_graphify_force_flag, docs_agents_graphify_semantic_origin_marker, docs_agents_graphify_labels_sig [INFERRED 0.85]
- **Manager Follow-Up Flow (Decisions For You to flagged task to recipient)** — docs_agents_notes_decisions_for_you, docs_agents_notes_request_follow_up, docs_agents_notes_flagged_department_tasks, docs_agents_notes_current_case_assignee, docs_agents_notes_follow_up_responsibility_rule, docs_agents_notes_follow_ups_you_sent [INFERRED 0.85]
- **Named-Profile Access Boundary (server session scopes APIs, tools and forecasts)** — docs_agents_notes_server_session, docs_agents_notes_profile_id_header, docs_agents_notes_gotcha_named_profiles, docs_agents_notes_assistant_tools, docs_agents_notes_brain_askbrain, docs_agents_notes_forecast, docs_agents_notes_import_role_gate, docs_agents_notes_can_manage_task_status [INFERRED 0.85]
- **Forecast Aggregate And Its Consumers (#79)** — docs_agents_notes_forecast_model_aggregate, docs_agents_notes_forecast_model_v1, docs_agents_notes_scoped_snapshot_aggregate, docs_agents_notes_forecast, docs_agents_notes_manager_home_today, docs_agents_notes_assistant_area, docs_agents_notes_brain_askbrain [INFERRED 0.85]
- **First-Paint Critical Path (fonts, favicon, theme guard, mount div, module entry)** — frontend_index_html_fonts_preconnect, frontend_index_html_geist_font_stylesheet, frontend_index_html_favicon_svg, frontend_index_html_fouc_guard_script, frontend_index_html_root_mount_div, frontend_index_html_main_tsx_module_entry [INFERRED 0.85]
- **No Staging Step Protects Every Rule** — github_contributing_deploys_to_live, github_contributing_never_merge_your_own_pull_request, github_contributing_green_checks_only, github_contributing_run_the_checks_locally, github_contributing_check_the_live_site, github_contributing_live_site_incident [INFERRED 0.85]
- **Rules Encoded As Required Form Fields** — github_issue_template_bug_duplicate_and_conflict_check, github_issue_template_bug_data_check, github_issue_template_feature_duplicate_and_conflict_check, github_issue_template_feature_done_when, github_issue_template_config_blank_issues_disabled, github_pull_request_template_checklist [INFERRED 0.85]
- **Main Branch Deploy Gate Chain** — github_workflows_ci_trigger_push_main, github_workflows_ci_check, github_workflows_ci_render_deploy_gate [INFERRED 0.85]
- **Flat Ledger Surface System** — docs_design_flat_ledger, docs_design_elevation_card, docs_design_radius_tokens, docs_design_no_row_tinting, docs_design_semantic_colour, docs_design_canvas_dot_grid [INFERRED 0.85]
- **Test Database Wiring for the Check Step** — github_workflows_ci_service_postgres, github_workflows_ci_test_database_url, github_workflows_ci_env_postgres_user_mortar, github_workflows_ci_env_postgres_password_mortar, github_workflows_ci_env_postgres_db_mortar_test, github_workflows_ci_port_mapping_5432, github_workflows_ci_step_run_check [INFERRED 0.95]

## Communities (206 total, 42 thin omitted)

### Community 0 - "ChasePage.tsx"
Cohesion: 0.05
Nodes (66): AWAITING_DOCUMENTS, BOOKING, RISK, WITH_BANK, BALL_HOLDERS, MOVE_OWNER, CaseNextStep, CreateTaskPayload (+58 more)

### Community 1 - "BookingDetailPage.tsx"
Cohesion: 0.07
Nodes (56): ROLES, ApplicationsCard(), STATUS_TONES, EvidenceLog(), SOURCE_LABELS, TRACK_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS (+48 more)

### Community 2 - "ForecastPage.tsx"
Cohesion: 0.15
Nodes (34): formatRmCompact(), frontend_src_components_case_index_formatrm, frontend_src_components_case_index_formatrmcompact, addDays(), altDataset(), datasetFor(), RecoveryCard(), SeedRun (+26 more)

### Community 3 - "cn"
Cohesion: 0.06
Nodes (68): BookingFilters(), RISKS, View, DateField(), monthOf(), toDate(), toIso(), blockerQuery() (+60 more)

### Community 4 - "InfoTooltip"
Cohesion: 0.10
Nodes (55): BookingsTable(), frontend_src_components_case_index_formatpercent, ProbabilityBar(), ChartTooltipContent(), ChartTooltipContentProps, TooltipEntry, AssumptionsCard(), BacktestCard() (+47 more)

### Community 5 - "Deployment Workflow"
Cohesion: 0.20
Nodes (21): Build And Start Step, Docker Builder Stage (bun install + frontend build), CI Gate Before Render Deploys, Legacy Cloud Run Service (No Longer Receiving Deploys), Deploy And CI, Deployment Workflow, Multi-Stage Dockerfile, GET /api/health (+13 more)

### Community 6 - "tourAnchors.test.tsx"
Cohesion: 0.11
Nodes (19): frontend_src_lib_persona_persona, Rect, Spotlight(), BASE, BREADCRUMB, PAGE_OF, resolveRoute(), Harness() (+11 more)

### Community 7 - "Industry Practitioner Survey (n=8)"
Cohesion: 0.36
Nodes (8): Booking Leakage, Evidence From Research And Industry, Inventory Lock, Ranked Causes Of Booking Leakage, Official And Industry Benchmarks, PJD Regency Sdn Bhd v Tribunal Tuntutan Pembeli Rumah (2021), Industry Practitioner Survey (n=8), The Problem And Its Cost

### Community 8 - "core/src/index.ts"
Cohesion: 0.06
Nodes (37): booking, BOOKING, RISK, SUMMARY, TASK, LegalRow, row(), waiting() (+29 more)

### Community 9 - "Profile Menu"
Cohesion: 0.13
Nodes (24): Calendar Replacement For Native Date Input, Date Format (19 Sep 2026), Day Cell And Date Picker, Dialog Component, Drop Zone, Drop Zone Hidden File Input Exception, Elevation: Card Hover, Elevation: Overlay (+16 more)

### Community 10 - "brain.test.ts"
Cohesion: 0.16
Nodes (16): canonicalSnapshot(), ctx, askBrain(), contentWords(), coverage(), matchQuestion(), questionIndex(), STOPWORDS (+8 more)

### Community 11 - "package.json"
Cohesion: 0.05
Nodes (45): isOff(), typescriptFiles, warnings(), description, devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 12 - "jev_answers Table (Model Answer History)"
Cohesion: 0.13
Nodes (40): packages/core/src/jev.ts MiniSearch Playbook Helpers, Explicit No-Match Fallback Options, Fallback And Caching Ladder, Fallback Ladder Flow Diagram, Fan-Out Job Pattern, GET /api/bookings/:id/playbooks, Input Hash: SHA-256 Of Canonical {kind, state, questionVersion}, jev_answers Table (Model Answer History) (+32 more)

### Community 13 - "Financing-Risk Method"
Cohesion: 0.14
Nodes (35): Advisory Early Warning, Not A Blocking Gate, TenureYears = min(35, 70 - age), Approval Probability 0.62 Bridging REHDA And Benchmarks, BNM Margin Rules (Nov 2010), BNM 35-Year Tenure Cap (Jul 2013), Debt Service Ratio Formula, DEFAULT_ASSUMPTIONS Parameter Table, Document Deficit Loop (~35%) (+27 more)

### Community 14 - "app.ts"
Cohesion: 0.06
Nodes (56): unitKey(), packages_core_src_index_canaccessbooking, packages_core_src_index_canmanagetaskstatus, packages_core_src_index_checkbookingdraft, packages_core_src_index_createassignmentaccesscontext, packages_core_src_index_default_project_settings, packages_core_src_index_language, packages_core_src_index_normalizeprojectsettings (+48 more)

### Community 15 - "generate.ts"
Cohesion: 0.11
Nodes (34): stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL, drawPrice(), drawUnit(), generateDataset(), HESITANT_NOTES (+26 more)

### Community 16 - "Environment Configuration"
Cohesion: 0.08
Nodes (34): Perth/setuptools Pin (setuptools<81), Base (Impractically Slow Without GPU), Nano as CPU Default, chatterbox-requirements.txt, Chatterbox TTS Install (Optional Cloned Voice), Turbo (Larger Model), CHATTERBOX_CACHE ($CHATTERBOX_HOME/cache), Content-addressed cache of synthesized lines (+26 more)

### Community 17 - "A Company Brain For Booking-To-SPA Conversion"
Cohesion: 0.11
Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve With The Company, 1. What A Central Company Brain Should Mean Here, 2. Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does A Knowledge Graph Help? (+11 more)

### Community 18 - "BookingsPage.tsx"
Cohesion: 0.06
Nodes (55): BookingFilter, BookingFiltersProps, BookingPipelineFlow(), BookingPipelineFlowProps, PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId (+47 more)

### Community 19 - "Booking"
Cohesion: 0.08
Nodes (20): SOURCE_TAG_LABELS, SOURCE_TAG_TONES, STORIES, packages_core_src_index_assumption, packages_core_src_index_dataset, packages_core_src_index_isodate, packages_core_src_index_sourcetag, at() (+12 more)

### Community 20 - "Generator Pipeline Diagram"
Cohesion: 0.21
Nodes (17): Bank Application Chains (1-3 Per Booking), Baseline Bookings BK-0001..BK-0140, Demo Data Add/Delete Retention, Canonical 140 Generated Bookings Demo Seed, Four Demo `meta` Keys, demo_seed Provenance Flag, Fixed Reference Time (REFERENCE_DATE = 2026-09-18), Generator Pipeline Diagram (+9 more)

### Community 21 - "frontend/index.html (Vite SPA Entry Document)"
Cohesion: 0.08
Nodes (37): Brand Tagline: Booked Is Not Sold. Signed Is. Every Booking, Tracked To The Signed SPA., Browser Chrome Theming (Android browser chrome, Safari address bar), meta charset UTF-8, crossorigin Attribute on fonts.gstatic.com Preconnect, Dark Class Toggle on documentElement, SEO Description Meta (internal sales administration for SPA signing), HTML5 Doctype, frontend/index.html (Vite SPA Entry Document) (+29 more)

### Community 22 - "Ask MortarAI (Gemini assistant)"
Cohesion: 0.11
Nodes (28): Ask MortarAI (Gemini assistant), Without a key, /api/assistant returns 503 and UI falls back to scripted answers, Five read-only tools grounded in the live snapshot, Bun API and static file serving process, Case data sent as a prompt to the proxy model, Case Messages And Documents From External Parties, 15 API routes, Env var GEMINI_API_KEY (+20 more)

### Community 23 - "check Job"
Cohesion: 0.08
Nodes (36): package.json build Script, package.json check Script, bun-version-file: package.json, Cancel In Progress, check Job, Lint, typecheck, unit tests, build, CI Workflow, Concurrency Group ci-${{ github.ref }} (+28 more)

### Community 24 - "questions.ts"
Cohesion: 0.10
Nodes (26): count(), days(), isLive(), isOpen(), joinList(), percent(), ringgit, rm() (+18 more)

### Community 25 - "GET /api/snapshot"
Cohesion: 0.13
Nodes (39): POST /api/bookings/import, GET /api/snapshot, Task Writes Share A Natural-Key Advisory Lock, bookings.created_at Entry Time Semantics, bookings Table, Event Status: confirmed, packages/core/src/types.ts Domain Contract, currentCaseAssignee Responsibility Resolution (+31 more)

### Community 26 - "sim.test.ts"
Cohesion: 0.12
Nodes (21): managerSuggestions(), assumptions, booking, event(), snapshot(), WaitingSuggestion, assumptionValue(), DEFAULT_ASSUMPTIONS (+13 more)

### Community 27 - "lucide-react"
Cohesion: 0.11
Nodes (30): progressFromKinds(), StageTracker(), TaskCell(), ASK_EVENT, AskRequest, AskTrigger(), band(), HESITATION (+22 more)

### Community 28 - "db/index.ts"
Cohesion: 0.06
Nodes (36): BookingDraft, packages_core_src_index_bookingdraft, packages_core_src_index_buildforecastmodel, packages_core_src_index_evidencestatus, packages_core_src_index_forecastmodel, packages_core_src_index_funnel_stages, packages_core_src_index_reference_date, packages_core_src_index_summarizecases (+28 more)

### Community 29 - "Mortar Brief"
Cohesion: 0.06
Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules, Interview Questions, Mortar Brief (+23 more)

### Community 30 - "better-accessibility Skill: reduced motion, zoom, autoplay"
Cohesion: 0.29
Nodes (10): LQIP Placeholder Behind Video Tiles, better-accessibility Skill: reduced motion, zoom, autoplay, Each Rule Has One Owner, Reduced Motion Kill Switch: 0.01ms not none, WCAG 2.2.2 Autoplay Pause Requirement, Gemini Videos Composer at gemini.google.com/videos, Silent Loop Encode: ffmpeg -an libx264 crf 22 plus faststart, Footer Focus Reveal for WCAG 2.4.11 (+2 more)

### Community 31 - "persona.tsx"
Cohesion: 0.07
Nodes (43): renderAsNamedSalesProfile(), renderImport(), AppSidebar(), AppSidebarProps, NavGroup(), NavLink(), PAGE_ICONS, SectionHeading() (+35 more)

### Community 32 - "Mortar (Product Requirements)"
Cohesion: 0.08
Nodes (44): docs/DESIGN.md, Docs, frontend/src/globals.css (@theme tokens from DESIGN.md), docs/PRD.md, docs/PRODUCT.md, docs/TRD.md, Mortar (Product Requirements), Mortar Product Overview (+36 more)

### Community 33 - "About The Project section"
Cohesion: 0.13
Nodes (25): About The Project section, Acknowledgements: YEI 3.0/Kabel, Chin Hin Group, shadcn/ui, Radix UI, Lucide, Booking conversion challenge, Chin Hin Group, Design Spec (DESIGN.md), Hero banner, Illustrative RM24M of phantom reported sales, Interview (source/interview.md) (+17 more)

### Community 34 - "StatusPill"
Cohesion: 0.08
Nodes (48): CaseHeader(), EVIDENCE_LABELS, EVIDENCE_TONES, EvidenceState, formatDate(), formatDays(), formatDaysLong(), formatPercent() (+40 more)

### Community 35 - "Five named demo profiles behind the four personas"
Cohesion: 0.13
Nodes (28): @mortar/core domain rules: stage tracking, risk flags, Today queue, risk-weighted forecast, 12 app pages, 1 backend service, 4 personas (measured count), 5 demo profiles (measured count), Decisions For You: the Manager's overdue cases, then escalation, Desk colours mark the role and avatar, never a status, Features section (+20 more)

### Community 36 - "Approved Glyph List"
Cohesion: 0.18
Nodes (17): ArrowUpRight Glyph, BriefcaseBusiness Glyph, ChevronsUpDown Glyph, Desk Colour: Legal Admin, Desk Colour: Loan Admin, Desk Colour: Manager, Desk Colour: Sales Admin, Desk Colours (+9 more)

### Community 37 - "AskPanel.tsx"
Cohesion: 0.09
Nodes (22): AskPanel(), Citations(), IMAGE_TYPES, Mascot(), readableSize(), Turn, generated, mocks (+14 more)

### Community 38 - "Live Walkthrough"
Cohesion: 0.14
Nodes (29): 7. Live Walkthrough — C, 7 Minutes, 8. Before And After — C, 1 Minute, The Bank Still Decides The Loan, Before You Present, BK-9001 (Demo Booking), Contingency: The App Will Not Load → Walk Slide 7 From Screenshot, Contingency: Ask MortarAI Says Counted From Your Bookings, Contingency: Receipt Already Confirmed → Reset Shared Data (+21 more)

### Community 39 - "Capture Beat Sequence"
Cohesion: 0.07
Nodes (29): banker_message Beat, Banker's mixed Malay/English message; payslip missing, buyer_reply Beat, Pasted Malay buyer reply; Jev answers Documents Received, case_cleared Beat, Outstanding-document pill leaves the case header, case_risk Beat, Financing-risk chip tooltip naming the flag driver (+21 more)

### Community 41 - "Persona: Legal Admin (home /legal)"
Cohesion: 0.15
Nodes (17): 48-hour screening of every booking, Forecast accuracy score sentence, Legal queue section: Appointment Set, Not Signed, Consequences worn openly, Forecast supporting document stack, Funnel stage 4: SPA signed (buyer pays 10%), Legal queue section: No Appointment Yet, Persona: Legal Admin (home /legal) (+9 more)

### Community 42 - "BookingsPage.test.tsx"
Cohesion: 0.07
Nodes (31): RANKING, renderPanel(), SNAPSHOT, buildSnapshot(), EXTRACTION_9001, EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001 (+23 more)

### Community 43 - "RecordUpdateForm.test.tsx"
Cohesion: 0.12
Nodes (6): PopoverState, BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 44 - "generate() Stage-Transition Monte Carlo"
Cohesion: 0.08
Nodes (49): get_forecast_summary tool, Backtest Card Caption: Proves The Method, Not The Business, Backtest Cutoff At 2026-08-19, Strict Temporal Data Isolation, Scoring Against Truth, Backtest Validation, Brier Score, Brown, Cai & DasGupta (2001) (+41 more)

### Community 45 - "banks.test.ts"
Cohesion: 0.19
Nodes (11): A, approved(), b, booked, ev(), received(), rejected(), requested() (+3 more)

### Community 47 - "User Stories Per Screen"
Cohesion: 0.14
Nodes (26): Admin Today Leads With Assigned Tasks, CaseQuickView Side Sheet, ClosedExport Excel Export, Atomic Demo Data Add/Delete, FR-11 Database Persistence And Demo Data, FR-17 Waiting On Party, Quick View, Next Move, FR-21 Bookings Active And Closed Views With Export, FR-5 Today Desk And Task Management (+18 more)

### Community 48 - "json"
Cohesion: 0.15
Nodes (16): importlib_util, json, os, pathlib, re, Resolve beat-keyed narration into a timing manifest with visual boundaries., NarrationManifestTests, NarrationScheduleTests (+8 more)

### Community 49 - "Mortar Demo Recorder"
Cohesion: 0.12
Nodes (19): A Camera and Dubber, @capture Token, TolongLabs/codenection-dev scripts/demo, DEMO_SLIDES name:seconds Token, Deployed Mortar Site (mortar-d18f.onrender.com), Eight-Step Live Walkthrough, DEMO_FIT_TAIL_MS (250), Picture kept after a segment's last narrated line (+11 more)

### Community 50 - "tools.ts"
Cohesion: 0.13
Nodes (23): packages_core_src_index_default_assumptions, bookingLine(), cap(), caseDetail(), day(), DESK_OF_OWNER_ROLE, deskOfNextMove(), deskOfOwnerRole() (+15 more)

### Community 51 - "Sources"
Cohesion: 0.10
Nodes (35): Association of Banks in Malaysia (2017) Press Release, Annuity Monthly Instalment, Bank Negara Malaysia (2010) Property Market Measures, Bank Negara Malaysia Monthly Statistical Bulletin, Bank Negara Malaysia (2013) 35-Year Tenure Circular, Booking Fee Prohibition (Reg 11(2) 1989), Debt Service Ratio (DSR), DEFAULT_ASSUMPTIONS Panel (+27 more)

### Community 52 - "FR-2 Case Summarization And Stall Detection"
Cohesion: 0.12
Nodes (26): Case Event Schema, Event Statuses (confirmed/provisional/disputed/superseded), FR-15 SPA Execution Desk, FR-19 Record An Update, FR-2 Case Summarization And Stall Detection, FR-4 Evidence Log And Multi-Party Verification, Independent Loan And Legal Tracks, JTBD: Application Tracking (+18 more)

### Community 53 - "Data Retention"
Cohesion: 0.15
Nodes (26): AMLA 2001 s17 (6 Years, Not Applicable To Developers), PDPC Automated Decision Guidelines (May 2026), booking_removals Minimal Deletion Audit, 72-Hour Breach Notification Groundwork, Companies Act 2016 (Act 777) s245(3), Data Retention, Seven-Year Backup Exports Are A Hosting Task, DELETE /api/bookings/:id (+18 more)

### Community 54 - "forecast() projects forward"
Cohesion: 0.29
Nodes (8): forecast() projects forward, Forecast document card (Open Document, Ask MortarAI), Forecast document stack (#54/#61, chips, above headline figures), Gotcha: forecast documents are back (#54/#61 stack restored after #60), Gotcha: both halves of /forecast read one log, leakage() counts backward, Manager Suggestions view, Wilson interval + sample size on screen

### Community 55 - "PersonaRoute.tsx (route guard)"
Cohesion: 0.15
Nodes (20): AppErrorBoundary, App shell area, canPersonaOpen, frontend/src/App.tsx (routes), frontend/src/main.tsx (providers), Gotcha: / is landing, /app is persona-relative, Gotcha: persona pages drive the sidebar and route guard, Gotcha: sidebar puts the persona home first (+12 more)

### Community 56 - "Hugeicons by Halal Lab"
Cohesion: 0.18
Nodes (18): Design the Fallback First, Canvas UI shadcn Registry Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add), Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons Stroke Rounded Free Style, Iconsax, from the Vuesax team (+10 more)

### Community 57 - "proxyClient.ts"
Cohesion: 0.16
Nodes (23): AnthropicContentBlock, AnthropicMessageResponse, argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(), buildNoulAnswer() (+15 more)

### Community 58 - "assistant/index.ts"
Cohesion: 0.07
Nodes (42): User messages fenced as untrusted data, ASSISTANT_TIMEOUT_MS, callGemini(), GeminiContent, GeminiFunctionCall, GeminiOptions, GeminiPart, GeminiResponse (+34 more)

### Community 59 - "Front-End Simulation"
Cohesion: 0.12
Nodes (17): First Build, Forecast And Backtest, Front-End Simulation, Generator, How The Simulation Works, Legal And Domain Notes, Messages And Proposed Updates, Open Questions (+9 more)

### Community 60 - "CaseSummary"
Cohesion: 0.10
Nodes (38): Application State Derivation, Second Undecided Application To Same Bank (409), Case Derivation Rules, CaseSummary, db.insertApplication, Event Status: disputed, Event Model And Evidence Lifecycle, event_reviews Append-Only Review Log (+30 more)

### Community 61 - "Gotcha: manager workflows"
Cohesion: 0.13
Nodes (27): Busiest Desk shortcut, canManageTaskStatus (exact owner name and department, Manager override, booking must be accessible), currentCaseAssignee recipient resolution, Decisions For You (Manager's queue of overdue cases not yet followed up), Flagged department tasks (persist, notification bell, 30 s refresh), Follow-up responsibility rule (shared by server follow-ups and Waiting On Them), Follow-Ups You Sent, Gotcha: manager workflows (+19 more)

### Community 62 - "Questions To Expect"
Cohesion: 0.11
Nodes (33): Do Not Say (Slide 4): 87.5 Percent Or 7/8 Chin Hin Bookings Fail On Financing, 4. Evidence And Assumptions — B, 1:30, 9. Adoption — A, 1:30, Inside The Brief's Rules: No New CRM, No Consultant, No Vendor, Do Not Say, Do Not Say: We Increased Conversion, Saved Inventory Days Or Brought Cash Forward, Do Not Say: Receiving A Document Approves A Loan Or Recovers A Sale, Do Not Say: The Forecast Is AI (+25 more)

### Community 63 - "precompute.ts"
Cohesion: 0.05
Nodes (54): packages_core_src_index_jevcache, packages_core_src_index_jevkind, packages_core_src_index_jevmeta, packages_core_src_index_jevservice, packages_core_src_index_playbook, packages_core_src_index_scoreanswer, packages_core_src_index_searchplaybooks, JevCache (+46 more)

### Community 64 - "jev/package.json"
Cohesion: 0.10
Nodes (20): dependencies, @mortar/core, @typesafe-ai/sdk, devDependencies, @types/node, typescript, vitest, exports (+12 more)

### Community 65 - "slides/render.mjs (Slide PNG Renderer)"
Cohesion: 0.12
Nodes (17): Scale 1440x900 to 1728x1080, Capture Normalization to 1920x1080, 16:10 to 16:9 Canvas Conversion, DEMO_DECK (docs/demo/mortar-pitch-deck.html), Pitch-deck HTML for slides/render.mjs, DEMO_SLIDES (""), name:seconds tokens; @capture marks the capture position, Execution Commands (+9 more)

### Community 66 - "server/package.json"
Cohesion: 0.10
Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core, @mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 67 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, @mortar/core, radix-ui (+17 more)

### Community 68 - "Know The Company"
Cohesion: 0.18
Nodes (20): Mortar (product), Do Not Say (Slide 2): Unbilled Sales Are Unsigned Bookings, 2. The Business — A, 1:30, Chang Tze Yoong (Group CEO, Property Division), CHGP Developments: Dawn, Avantro, Crown, Aricia, Ayanna, Botanica Hills, Chin Hin Group Berhad (Wider Group), Chin Hin Group Property Berhad (CHGP), Claim: RM2.2 Billion Unbilled Sales, 30 June 2026 (+12 more)

### Community 69 - "FR-6 TypeSafe Jev Structured Message Extraction"
Cohesion: 0.19
Nodes (14): FR-6 TypeSafe Jev Structured Message Extraction, Goals And Non-Goals, Honest Accounting, Human In The Loop, JevMeta (source/stale/latencyMs), Jev Choice / Score / Noul Primitives, JEV_REVIEW_THRESHOLD (0.6), MortarAI (AI Layer With Two Engines) (+6 more)

### Community 70 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, jsdom, tailwindcss, @tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom, typescript (+3 more)

### Community 71 - "speak.py"
Cohesion: 0.16
Nodes (14): hashlib, chatterbox_cache_path(), chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer, main(), Path (+6 more)

### Community 72 - "MotionSites: cinematic landing page prompts"
Cohesion: 0.21
Nodes (13): Glass Object (Three.js effect), MotionSites: cinematic landing page prompts, MotionSites Academy Lessons, Layered Parallax Hero: sky, title, foreground, MotionSites MCP Server, Three.js Scroll Scene: multi-view to GLB, tone mapping, No Three.js Yet, Landing Video Pipeline (+5 more)

### Community 73 - "App Shell"
Cohesion: 0.14
Nodes (25): App Shell, Authentication Theatre, Brand Mark (Kigumi Joint), Canvas Dot Grid, Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer Link Columns (+17 more)

### Community 74 - "LandingPage.tsx"
Cohesion: 0.20
Nodes (11): BackToTop(), JointSketch(), LandingFaq(), QUESTIONS, LedgerPlate(), Row, ROWS, STATS (+3 more)

### Community 75 - "POST /api/assistant"
Cohesion: 0.10
Nodes (40): POST /api/assistant, Scripted askBrain Answers, Grounded Operational Assistant (Ask MortarAI), 503 { fallback: true } And askBrain Fallback, Citations Link Only Tool-Returned Bookings, Assistant Limits (1,000 Chars, 6 Turns, 8/min, 300/day), Assistant Never Writes Or Decides, System Prompt Reflects Persona Desk (+32 more)

### Community 76 - "usePersona"
Cohesion: 0.10
Nodes (42): AddMessageForm(), defaultName(), normalTime(), mocks, renderAt(), SwitchProfile(), DirectTableImport(), Entry (+34 more)

### Community 77 - "narrate.sh (Voice + Schedule + Subtitles)"
Cohesion: 0.09
Nodes (30): Narration Beat Anchoring, Beat-Keyed Timing, A Beat Marks When a Moment Appears, $DEMO_DIR/beats.json, beats.json Rewrite so Slide Names Are Narratable Beats, Beat Deconfliction Rule, Slide Subtitle Clearance, Subtitle Layout (+22 more)

### Community 78 - "Preserved Technical Cautions"
Cohesion: 0.11
Nodes (22): case_overview Beat, /bookings/BK-9001 loan and legal tracks, evidence provenance, 16-bit PCM WAV Requirement, CPU Attention Trap (Silent All-NaN Audio), Recording Writes, Synthetic Data Only, Clean-Seed Check, Delete Demo Data Intentionally Keeps Filming Edits (+14 more)

### Community 79 - "Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)"
Cohesion: 0.17
Nodes (22): Beneficiaries Who Do Not Log In (Finance, Sales Director), Centralized Case Workspace, What The Daily Users Have In Common, Four Daily Users, Decisions For You, Deliberately Not Users (buyers, agents, bankers, solicitors), Desk Health, Interrupt-Driven Work (+14 more)

### Community 80 - "assistant.test.ts"
Cohesion: 0.11
Nodes (20): packages_core_src_index_isodatetime, packages_core_src_index_loanapplication, App, APPLICATIONS, ask(), BOOKING, chipsFor(), event() (+12 more)

### Community 81 - "Status Language"
Cohesion: 0.18
Nodes (23): Booking Row And Table Header, Chart Series Colours, Chase Card, Do And Do Not, Icon Rules (Never Alone, aria-label + Tooltip), Icons, Landing Sample Ledger, Lucide (lucide-react) Icon System (+15 more)

### Community 82 - "Acceptance Criteria (14)"
Cohesion: 0.31
Nodes (9): Acceptance Criteria (14), Calibrated Contrast Ratios, Colour, Light And Dark From One Token Set, Primitives: ink Ramp, Primitives: paper Ramp, Selected Row Ground (--selected), Semantic Colour (Color Collection) (+1 more)

### Community 83 - "Functional Requirements"
Cohesion: 0.10
Nodes (38): Buyer Signals (responsiveness/hesitation), Cache-First GET Routes, Scripted askBrain Fallback, Assistant Read-Only Tool Set, Demo Script As Acceptance, Design Standards Compliance, Direct Core ERP Integration (Out Of Scope), FR-12 High-Availability Offline Jev Fallback (+30 more)

### Community 84 - "askBrain (scripted fallback)"
Cohesion: 0.29
Nodes (10): askBrain (scripted fallback), brain/helpers.ts isOpen filter, brain.test.ts pins Ask's stalled set, deriveCase (computes open and live), Gotcha: keyword score alone does not gate a question, Gotcha: open is not live, HORIZON_DAYS (30), matchQuestion (ranks on query coverage) (+2 more)

### Community 85 - "How It Works section"
Cohesion: 0.09
Nodes (34): Funnel: booking fee to bank disbursement, 6 funnel stages tracked, Settings: demo dataset controls (seed, reference date, record counts), Closed Excel export from /bookings, Funnel stage 1: Booking (small fee), Funnel stage 6: Bank disburses progressively, Funnel stage 3: Letter of Offer, Funnel stage 5: Loan agreement (panel solicitor) (+26 more)

### Community 86 - "CaseEvent"
Cohesion: 0.04
Nodes (11): AssignmentAccessContext, ProjectSettings, CaseEvent, EvidenceStatus, Message, Task, Database, OpenApplicationError (+3 more)

### Community 87 - "record.mjs"
Cohesion: 0.05
Nodes (37): css, ref_node_assert, ref_node_fs, ref_node_module, ref_node_os, ref_node_test, ref_node_url, auditCapture() (+29 more)

### Community 88 - "patch_docs.py"
Cohesion: 0.14
Nodes (23): argparse, collections, datetime, Agy Worker Doc Patching, New Document Or Large Rewrite Extraction, patch_docs check, patch_docs finish, patch_docs prepare (+15 more)

### Community 89 - "Typeface"
Cohesion: 0.22
Nodes (11): font-display: Swap, Geist, Geist Mono, Nine Text Styles, No Third Typeface, Body/Default, Display/Page, Eyebrow, Heading/Section (+3 more)

### Community 90 - "Landing Page"
Cohesion: 0.27
Nodes (12): Landing Page, Landing Card Elevation, Landing Claim, Landing Copy Specification, Landing Feature Cards (.land-desk), Landing Header Row, Landing Type Exceptions, Lead Line Sentence-Case Carve-Out (+4 more)

### Community 91 - "Markdown Style Guide"
Cohesion: 0.05
Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid Relative Paths Unless Within The Same Directory, Better Is Better Than Best, Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers, Character Line Limit (+32 more)

### Community 92 - "API Reference"
Cohesion: 0.10
Nodes (37): Data Retention section (docs/TRD.md#data-retention), Technical Requirements Document (docs/TRD.md), API Reference, Architecture And Components, Architecture Topology Diagram, Bun Multi-Package Monorepo, Bun HTTP Server On Render, Caching Strategy: Cache-First Reads, Live-First Mutations (+29 more)

### Community 93 - "Design Research: Layerhand Landing Page"
Cohesion: 0.18
Nodes (16): Design Research Index, Canvas UI: 35 WebGL/WebGPU effects over live HTML, Canvas UI Browser Support and Origin Trial, David Haz, author of Canvas UI and React Bits, html-in-canvas API, Peel Effect, Its Hover layers-icon Component Pattern, Jakub Antalik Portfolio Study (+8 more)

### Community 94 - "frontend/ Workspace"
Cohesion: 0.47
Nodes (10): Five Named Demo Profiles, frontend/src/lib/persona.tsx Persona Definitions, frontend/ Workspace, Manager Persona (Cross-Department Access), /manager Redirect To /team, Persona Home Routes, Persona Navigation And Route Guarding, PERSONA_PAGES Route Permission Map (+2 more)

### Community 95 - "frontend/tsconfig.json"
Cohesion: 0.20
Nodes (9): compilerOptions, jsx, lib, paths, types, exclude, extends, include (+1 more)

### Community 96 - "Pull Request Template"
Cohesion: 0.13
Nodes (22): Answer Every Comment Then Resolve The Thread, Branch Naming Convention <type>/<short-topic>, Check The Live Site After The Deploy, Commit Message Format type(scope): what changed, Delete The Branch After Merging, Merging Into main Deploys To The Live Site, Fill In The Pull Request Template, Green Checks Only (+14 more)

### Community 97 - "core/package.json"
Cohesion: 0.12
Nodes (16): dependencies, minisearch, devDependencies, typescript, vitest, exports, typescript, vitest (+8 more)

### Community 98 - "import.ts"
Cohesion: 0.08
Nodes (37): DEFAULTS, FIXTURE, TEMPLATE, ageOn(), checkBookingDraft(), DateOrder, detectDateOrder(), EXCEL_EPOCH (+29 more)

### Community 99 - "cases.ts"
Cohesion: 0.09
Nodes (38): appointment(), BallHolder, listOf(), ApplicationFacts, appointmentDay(), byOccurred(), CaseDataInput, CaseFacts (+30 more)

### Community 100 - "mappers.ts"
Cohesion: 0.11
Nodes (29): packages_core_src_index_casedata, packages_core_src_index_simulationmeta, CaseData, SimulationMeta, cached(), createDatabase(), isoDate(), isoDateTime() (+21 more)

### Community 101 - "react-router-dom"
Cohesion: 0.09
Nodes (30): frontend/index.html (fonts, FOUC theme script), ThemeToggle, App(), HomeRedirect(), MortarMark(), MortarMarkProps, AppFooter(), FooterLink (+22 more)

### Community 102 - "api.ts"
Cohesion: 0.08
Nodes (31): addDemoData(), ApiError, askAssistant(), askAssistantStream(), AssistantAnswer, deleteBooking(), deleteDemoData(), extractMessage() (+23 more)

### Community 103 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 104 - "Step 1: Capture"
Cohesion: 0.13
Nodes (16): legal_persona Beat, Legal Admin persona; /legal signing queue, Broadcast-Safe Slide Rendering, Capture Viewport 1440x900, $DEMO_DIR/capture.webm, $DEMO_DIR/demo.mp4, DEMO_DIR ($TMPDIR/mortar-demo), Scratch directory for captures, segments, slides and the MP4 (+8 more)

### Community 105 - "Case-free forecast aggregate (built from full resolved history before profile scoping)"
Cohesion: 0.24
Nodes (13): Backtests train only on evidence available at their cutoff, createDatabase (shared snapshot), demo_seed provenance, DEMO_WEB disposable recording env, Missing history is unavailable, not a supported zero (a measured zero stays valid), Case-free forecast aggregate (built from full resolved history before profile scoping), meta key forecast_model_v1 (refreshed on next read after seven days), db.forgetSnapshot() (+5 more)

### Community 106 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+5 more)

### Community 107 - "Harness Structure"
Cohesion: 0.18
Nodes (19): /api/snapshot, assemble.sh (Picture Timeline + Mux), Capture-Completeness Audit, Pacing and Scrolling, contract.mjs (Beat Contract & Audit), DEMO_WARMUP (1), Set 0 to skip the clean-seed check and off-camera warm-up, Harness Structure (+11 more)

### Community 108 - "Music Bed"
Cohesion: 0.12
Nodes (17): Music Bed Processing (loop, fade, duck), Bundled Chromium (or DEMO_CHANNEL=chrome), Ducked Music Bed, DEMO_BGM (""), Music file; looped, faded, ducked under the voice when set, DEMO_BGM_GAIN_DB (-20), Music gain before speech-triggered ducking, DEMO_CHANNEL (unset (bundled Chromium)) (+9 more)

### Community 109 - "The Jev Boundary And Resilience"
Cohesion: 0.17
Nodes (26): @mortar/core package, Support For Automation (AI Safe Areas), Where AI Helps And Where People Decide, Aster Heights Fictional Project, Booking BK-9001 Lifecycle, Ask MortarAI, The Ask MortarAI Boundary, Division Of Operational Responsibility (+18 more)

### Community 110 - "Mortar Notes For Agents"
Cohesion: 0.15
Nodes (19): Project Notes (docs/agents/notes.md), bun run check (ESLint + tsc + Vitest gate), bun run --filter <name-or-glob> <script>, bun run format, Bun workspaces (frontend + packages/*), Conventions, docs/README.md (human quickstart), bun run --filter '*' fans root scripts out (+11 more)

### Community 111 - "Getting Started"
Cohesion: 0.16
Nodes (18): DB tables: bookings, loan_applications, events, messages, tasks, playbooks, jev_answers, meta, Env var DATABASE_URL, .env.example copied to .env at repo root, Env var TEST_DATABASE_URL (dedicated test Postgres), Getting Started, Installation steps, Local Postgres 17 via docker run (mortar-pg), Neon project mortar-test (+10 more)

### Community 112 - "UI Triage: The Signed-In App"
Cohesion: 0.18
Nodes (17): transitions.dev: UI transitions for AI agents, R7, the Dissenting Expert, UI Triage: The Signed-In App, Copy Rules: the drop and write table, Density Budget, The Desk Lens Becomes a Preset, Not a Banner, Three Stacked Filter Systems With Disagreeing Numbers, Four-Phase Implementation Plan (+9 more)

### Community 113 - "Plain Language"
Cohesion: 0.31
Nodes (9): Ask Panel, Chip Economy, Internal Names Stay Internal, Jev (Assistant), Jev Acts, It Does Not Report Status, Landing Ledger Is Illustrative, Plain Language, Top Bar (+1 more)

### Community 114 - "closedExport.ts"
Cohesion: 0.16
Nodes (12): buildClosedExportRows (pure, no DOM/network), downloadClosedExport (lazy-loads writer), buildClosedExportRows(), ClosedExportRow, closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank() (+4 more)

### Community 115 - "Bug Report Issue Form"
Cohesion: 0.15
Nodes (20): Check For Duplicates And Conflicts Before Opening An Issue, Check Open Pull Requests For Overlap, Start With An Issue, Use A Form, Blank Issues Are Off, Area, Bug Report Issue Form, Duplicate And Conflict Check, What You Expected (+12 more)

### Community 116 - "RecordUpdateForm.tsx"
Cohesion: 0.12
Nodes (36): APPLICATION_STATUS_LABELS, AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED, CONFIRM, DECIDED, DECISIONS, DOCUMENTS (+28 more)

### Community 117 - "Jev (Reading Engine)"
Cohesion: 0.12
Nodes (40): MortarAI (AI layer), 10. Technology Second — B, 1 Minute, 5. Solution Logic — B, 1:30, Slide 6: How Jev Works, 6. Meet MortarAI — B, 1 Minute, Slide 6: Why It Helps, AI Proposes; People Confirm; Every Blocker Gets An Owner, Archify (Diagramming Tool) (+32 more)

### Community 118 - "test_assemble.py"
Cohesion: 0.24
Nodes (10): AssembleMuxTests, AssemblePictureTests, color_video(), ff(), probe_duration(), CompletedProcess, Path, slide_png() (+2 more)

### Community 119 - "HowItWorks.tsx"
Cohesion: 0.38
Nodes (5): HowItWorks(), Moment, MOMENTS, Shot(), ShotProps

### Community 120 - "Perch Landing Teardown"
Cohesion: 0.13
Nodes (20): Layered Card Surface: hairline ring and stacked shadow, better-layout Skill, shadow-border Three-Layer Token, Perch Sign-In Teardown, Authored Disabled States, Perch Fake Auth Flow: no session, no guard, isJoiner Entry-Path Check, Porting Plan: the persona folds into the guest button (+12 more)

### Community 121 - "Checklist"
Cohesion: 0.10
Nodes (21): Follow The Design Guide And Shared UI Components, Keep AI Agents On Task, Never Do These, Never Bypass The Checks, Never Force-Push A Shared Branch, No Pushes Straight To main, Never Commit Real Buyer Data, Never Commit Secrets (+13 more)

### Community 122 - "Gotcha: named profiles define data access"
Cohesion: 0.33
Nodes (9): Gotcha: booking imports require Sales Admin or Manager (#80), Gotcha: named profiles define data access, Gotcha: profile switches clear the workspace, Hiding the Add Bookings page is not the authorization boundary, A request body claiming another role does not widen access, Import API session-profile gate (403 for Loan and Legal Admin), Profile id header must match the session, ProfileWorkspace (keys providers by profile id) (+1 more)

### Community 123 - "Import area"
Cohesion: 0.24
Nodes (12): booking-sheet-template.xlsx/.csv, checkBookingDraft, DropZone / readSheetFile, Import area, parseCsv, readBookingSheet, Client-Only Spreadsheet Parsing, FR-13 Add Bookings Intake And Validation (+4 more)

### Community 124 - "packages_core_src_index_caseevent"
Cohesion: 0.10
Nodes (16): EXTRACTION, MESSAGE, PROPOSAL, EXTRACTION, MESSAGE, PROPOSAL, renderPanel(), packages_core_src_index_caseevent (+8 more)

### Community 125 - "This Week. What We Need."
Cohesion: 0.06
Nodes (58): A1 — Chin Hin's Leaks Follow The Same Order (test: rebuild loss reasons from closed files), A2 — Follow-Up Lifts Stalled Bookings From 20% To 40% Signed (test: assisted cohort vs ordinary follow-up), A3 — Staff Will Paste Banker Messages In Daily (test: one admin, two weeks), A4 — Bookings Can Start From A Spreadsheet Export (test: first upload, week one), BK-9001 (booking), BK-9006 (booking), Chin Hin Group Property (CHGP), Forecast (expected signings with a range — page rebuilt since 20 Sep) (+50 more)

### Community 126 - "Keep It Current"
Cohesion: 0.20
Nodes (20): Commit Everything graphify update Writes, --force Flag For Node-Count Regression, When To Do A Full Rebuild, Graphify, .graphifyignore, Install Line: uv tool install graphifyy[sql]==0.9.71, graphify install --platform claude, Installing Graphify (+12 more)

### Community 129 - "schema.sql"
Cohesion: 0.16
Nodes (20): booking_removals, bookings, event_reviews, event_reviews_event_idx, events, events_application_idx, events_booking_idx, events_message_idx (+12 more)

### Community 130 - "ImportPage.tsx"
Cohesion: 0.21
Nodes (16): DropZone(), accept(), clear(), readableSize(), readSheetFile(), sheetKind(), SheetReadError, Tabs() (+8 more)

### Community 131 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, preview, template:bookings, test, typecheck

### Community 132 - "booking-template.mjs"
Cohesion: 0.18
Nodes (6): bookings, COLUMNS, howTo, merged(), OUT, SAMPLES

### Community 134 - "reset.ts"
Cohesion: 0.09
Nodes (25): timeNow(), packages_core_src_index_jevcacheentry, packages_core_src_index_proposalfromextraction, packages_core_src_index_simnow, simNow(), JevService, ref_node_path, sql (+17 more)

### Community 136 - "Documents Index"
Cohesion: 0.15
Nodes (15): Contributing (.github/CONTRIBUTING.md), Design (docs/DESIGN.md), Documents Index, Feature Ideas (docs/research/feature-ideas/README.md), Markdown Style Guide (docs/markdown-style.md), Product Requirements Document (docs/PRD.md), Product Overview (docs/PRODUCT.md), UI Triage (docs/research/ui-triage/README.md) (+7 more)

### Community 137 - "File Map"
Cohesion: 0.12
Nodes (23): ballInCourt (who holds a case), banks.test.ts (reversal, ledger, bank clocks), components/case/ball.ts (labels, icons, owners), CaseQuickView.tsx (side sheet), ChartTooltipContent.tsx (recharts shell), .github/workflows/ci.yml, createJevService / systemOne surface, createProxySystemOne (Jev proxy client) (+15 more)

### Community 138 - "Gotchas"
Cohesion: 0.13
Nodes (19): blockPrefix legacy read alongside blocks, BK-nnnn ids stop before BK-9001, Atomic duplicate-unit protection, .env.example (empty-not-commented convention), Gotcha: focus the sheet, not its first control, Gotcha: grid-cols-1 required on every responsive grid, Gotcha: imported bookings are born booked, dated to the desks' today, Gotcha: JEV_PROXY_MODEL falls back on || not ?? (+11 more)

### Community 139 - "RTK Commands By Workflow"
Cohesion: 0.14
Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile (80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub (26-87% Savings), Golden Rule, Infrastructure (85% Savings), JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 140 - "Step 6: Request Follow-Up From Tan Mei Ling"
Cohesion: 0.27
Nodes (11): BK-9006 (Demo Booking), Decisions For You (Manager's Today), Do Not Say: Mortar Sends WhatsApp Messages, Precondition: Legal Has A No-Appointment Row; Manager Has A Suggestion, Q: What Happens When Someone Clicks Create Task?, Legal Admin Desk, Step 5: Record Appointment On BK-9006, Step 6: Request Follow-Up From Tan Mei Ling (+3 more)

### Community 141 - "Today Rail"
Cohesion: 0.25
Nodes (14): Content Canvas, Data Formats, Duration Formats, Empty Values Are Em Dashes, Money Formats, One Focus Per Screen, Progressive Disclosure, Screen Density (+6 more)

### Community 142 - "FR-8 Statistical Conversion Forecasting"
Cohesion: 0.16
Nodes (16): Backtest Caption: Proves Method Not Business, Brown, Cai & DasGupta (2001) Wilson Interval, FR-16 Leakage Analysis And Recovery Sizing, FR-8 Statistical Conversion Forecasting, FR-9 Historical Forecast Backtesting, Live And Resolved Booking Definitions, Monte Carlo 10th-90th Percentile Range, Funnel Pipeline Stages (+8 more)

### Community 143 - "Radius Tokens"
Cohesion: 0.18
Nodes (15): Button Component, Checkbox Component, Density Decision (36px Controls, 44px Rows), Elevation: Card, Field Component, Mortar Design System In Figma, Flat Ledger Look, Focus Ring (+7 more)

### Community 144 - "Project Structure tree"
Cohesion: 0.08
Nodes (43): AppLayout (mounts the tour), frontend/src/pages/ (one file per route), frontend/src/tour/ guided walkthrough, tourSteps.ts (data-tour anchors), Archify architecture diagram: staff-to-service flow and tech stack, Architecture: staff personas, web app, API, shared core, AI, database, hosting, Bun API reading Postgres, CI checks gate the Render deploy (+35 more)

### Community 145 - "assemble.sh Mux Phase"
Cohesion: 0.11
Nodes (18): Burned Subtitles, DEMO_FFPROBE (ffprobe on PATH), ffprobe executable, DEMO_MAX_DURATION (300), Reject a deliverable longer than this many seconds, DEMO_MAX_GAP_MS (1000), Max allowed gap between consecutive spoken lines (dead-air rule), DEMO_MIN_DURATION (240) (+10 more)

### Community 146 - "notificationStore.ts"
Cohesion: 0.16
Nodes (15): Gotcha: localStorage access is always wrapped in try/catch, Notification, NotificationPopover(), useNotifications(), emit(), Listener, listeners, loadNotifications() (+7 more)

### Community 148 - "Agent Skills"
Cohesion: 0.20
Nodes (9): Skills (docs/agents/skills.md), Agent Skills, Install And Update, leonxlnx/taste-skill, mattpocock/skills, obra/superpowers, On Windows, pbakaus/impeccable (+1 more)

### Community 149 - "Assistant area (server/src/assistant/)"
Cohesion: 0.16
Nodes (18): frontend/public/ai-mascot*.png, AskPanel (Dialog), AskTrigger (in AppNav), 503 { fallback: true } scripted fallback, Assistant area (server/src/assistant/), 30-second budget, max 4 rounds, assistant/tools.ts (five read-only tools), buildAskContext (+10 more)

### Community 151 - "jev/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.json

### Community 152 - "NarrateTests"
Cohesion: 0.27
Nodes (4): NarrateTests, CompletedProcess, Path, write_wav()

### Community 153 - "Personas"
Cohesion: 0.24
Nodes (12): Frontend Stack (React 19 + Vite + Tailwind 4 + shadcn/ui), Manager Persona (Home Route /chase), mortar.persona localStorage key, mortar.profile localStorage key, Personas, Mortar Product Definition, Route Map, Stack (Bun workspaces) (+4 more)

### Community 157 - "Meet MortarAI. One Reads, One Answers."
Cohesion: 0.13
Nodes (29): Apex Bank, Ask MortarAI (feature), By Hand (staff record the update), Cached Answer (asked before, reused), Live Answer (typed, with a confidence), Stale, Marked (shown with a stale tag), Gemini's Differentiator: Booking-Scoped, Read-Only Answers, Gemini (Google — answers staff questions) (+21 more)

### Community 158 - "Jakub Krehel's Interface Skills"
Cohesion: 0.19
Nodes (14): Jakub Krehel's Interface Skills, better-colors Skill, better-interface Skill: orchestrated review, better-typography Skill, better-writing Skill, break Skill, explain-interface Skill, interface-review Skill (+6 more)

### Community 159 - "Run Of Show"
Cohesion: 0.19
Nodes (16): 11. This Week — All, 1:45, 1. Cover — A, 45 Seconds, 3. The Workflow Today — A, 1:30, Chin Hin Earns On Signed SPAs; Stalled Bookings Cost It, Booked Is Not Sold, Signed Is, Kabel DXP Weekly Check-In, 29 September 2026, The Gap Is Ownership, Not Information, Manager Desk (+8 more)

### Community 160 - "server/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 161 - "subtitles.py"
Cohesion: 0.25
Nodes (10): build(), cards(), Builds the burned-in subtitle track from the same lines.json the narration…, Split into lines of similar length, never mid-word. Two things depend on this…, Group wrapped lines into cards of at most MAX_LINES., ts(), wav_ms(), wrap() (+2 more)

### Community 162 - "Manager (persona)"
Cohesion: 0.23
Nodes (22): Manager (persona), Ask Mortar Renamed To Ask MortarAI, Decisions For You (Manager Today Queue), Forecast Document Stack (#54), Forecast Documents Panel Removed, FR-14 Persona Navigation And Page Routing, Header Profile Menu, Approved Manager And Ask MortarAI Intake (#60) (+14 more)

### Community 163 - "Andrej Karpathy Skills"
Cohesion: 0.29
Nodes (7): Andrej Karpathy Skills (docs/agents/andrej-karpathy-skills.md), Think Before Coding / Surgical Changes Rule, 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 164 - "Ask The Graph First"
Cohesion: 0.29
Nodes (8): graphify affected, Ask The Graph First, graphify explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query, Graph First, Then Grep

### Community 174 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): overrides, printWidth, $schema, semi, singleQuote, trailingComma

### Community 175 - "Agent Rules"
Cohesion: 0.19
Nodes (11): Run bun run check Then bun run format, GitHub Issues And Pull Requests (docs/agents/github.md), Read Existing Issues And PRs Rule, Graphify (docs/agents/graphify.md), Ask Graph Before Grepping / Refresh On Last Commit Rule, RTK (docs/agents/rtk.md), RTK Command Prefix Rule, Agent Rules (+3 more)

### Community 177 - "formatters.ts"
Cohesion: 0.40
Nodes (4): currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 179 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.json

### Community 181 - "SubtitleLayoutTests"
Cohesion: 0.33
Nodes (3): Path, SubtitleLayoutTests, write_silence()

### Community 184 - "ref_vitest"
Cohesion: 0.08
Nodes (9): SIGNALS, task, RISK, LocationEcho(), renderTasks(), LEAKAGE, packages_core_src_index_financingrisk, @testing-library/react (+1 more)

### Community 189 - "better-ui Skill: surfaces, icons, motion values"
Cohesion: 0.22
Nodes (14): Scroll-Driven Effects: Laser, Particle Scroll, Bend, Why Hugeicons Fits, Its Hover Mixed Fill and Stroke Conventions, Bottom Sheet Drawer Recipe, better-ui Skill: surfaces, icons, motion values, Concentric Radius: outer equals inner plus padding, Icon Stroke Scale by Adjacent Text Weight, Interruptible Motion: transitions for toggles, keyframes for entrances (+6 more)

### Community 205 - "schedule.py"
Cohesion: 0.47
Nodes (5): deconflict(), duration_ms(), main(), Prevent narration collisions and reject speech that crosses a visual beat. A…, Push starts later so no line is still speaking when the next begins. Pure so it…

### Community 207 - "frontend/package.json"
Cohesion: 0.07
Nodes (27): @mortar/core, typescript, vitest, license, name, private, type, clsx (+19 more)

### Community 232 - "types.ts"
Cohesion: 0.10
Nodes (38): backtest(), FUNNEL_STAGES, groupBy(), DEFAULT_SEED, HORIZON_DAYS, PERSONA_STAFF, backtest(), bucketOf() (+30 more)

## Ambiguous Edges - Review These
- `Kabel DXP Weekly Check-In, 29 September 2026` → `Chin Hin Group Property Berhad (CHGP)`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to
- `meta Key-Value Table` → `GET /api/settings`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `meta Key-Value Table` → `PUT /api/settings (Manager Only)`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `Do Not Say: IFCA Is Chin Hin's System` → `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to

## Knowledge Gaps
- **896 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+891 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Kabel DXP Weekly Check-In, 29 September 2026` and `Chin Hin Group Property Berhad (CHGP)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `meta Key-Value Table` and `GET /api/settings`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `meta Key-Value Table` and `PUT /api/settings (Manager Only)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Do Not Say: IFCA Is Chin Hin's System` and `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Documents Index` connect `Documents Index` to `Andrej Karpathy Skills`, `Mortar Notes For Agents`, `Agent Rules`, `Agent Skills`, `Personas`, `API Reference`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `AGENTS.md` connect `Personas` to `Documents Index`, `About The Project section`, `Project Structure tree`, `Agent Rules`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Keep It Current` connect `Keep It Current` to `patch_docs.py`, `Checklist`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._