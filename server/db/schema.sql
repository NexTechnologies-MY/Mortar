-- Mortar database schema; mirrors packages/core/src/types.ts (camelCase there,
-- snake_case here). The server applies it idempotently on boot and on reset.
-- Insert order for seeding: bookings, loan_applications, messages, events,
-- playbooks, tasks, jev_answers, meta. `imports` starts empty.

create table if not exists meta (
  key text primary key,
  value jsonb not null
);

create table if not exists bookings (
  id text primary key,
  project text not null,
  unit text not null,
  price_rm integer not null,
  booking_date date not null,
  buyer jsonb not null,
  sales_owner text not null,
  loan_owner text not null,
  legal_firm text not null
);

create table if not exists loan_applications (
  id text primary key,
  booking_id text not null references bookings (id) on delete cascade,
  bank text not null,
  banker text not null
);
create index if not exists loan_applications_booking_idx on loan_applications (booking_id);

create table if not exists messages (
  id text primary key,
  booking_id text not null references bookings (id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'banker', 'solicitor', 'sales_agent')),
  sender_name text not null,
  language text not null check (language in ('en', 'ms', 'zh', 'mixed')),
  sent_at timestamptz not null,
  body text not null,
  origin text not null check (origin in ('fixture', 'live'))
);
create index if not exists messages_booking_idx on messages (booking_id);

create table if not exists events (
  id text primary key,
  booking_id text not null references bookings (id) on delete cascade,
  application_id text references loan_applications (id) on delete cascade,
  track text not null check (track in ('sales', 'loan', 'legal')),
  kind text not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null,
  reported_by text not null,
  verified_by text,
  status text not null check (status in ('confirmed', 'provisional', 'disputed', 'superseded')),
  source text not null check (source in ('generator', 'story', 'staff', 'jev')),
  message_id text references messages (id) on delete set null,
  document text,
  note text
);
create index if not exists events_booking_idx on events (booking_id, occurred_at);
create index if not exists events_message_idx on events (message_id);
create index if not exists events_application_idx on events (application_id);

-- Every staff review of a Jev proposal (confirm, dispute, dismiss), append-only:
-- who moved which update from what to what, and when. No foreign key, so the
-- trail outlives the event and a reset from an older build can still truncate
-- `events`.
create table if not exists event_reviews (
  id bigint generated always as identity primary key,
  event_id text not null,
  from_status text not null,
  to_status text not null,
  reviewer text not null,
  at timestamptz not null
);
create index if not exists event_reviews_event_idx on event_reviews (event_id, at);

create table if not exists playbooks (
  id text primary key,
  title text not null,
  situation text not null,
  evidence text not null,
  action text not null,
  rationale text not null,
  limits text not null,
  outcome text not null,
  author text not null,
  reviewer text not null,
  reviewed_on date not null,
  status text not null check (status in ('draft', 'approved', 'superseded', 'retired')),
  tags text[] not null default '{}'
);

create table if not exists tasks (
  id text primary key,
  booking_id text not null references bookings (id) on delete cascade,
  action text not null,
  title text not null,
  owner_role text not null check (owner_role in ('sales', 'sales_admin', 'loan_admin', 'legal')),
  owner_name text not null,
  due_on date not null,
  status text not null check (status in ('open', 'done', 'cancelled')),
  origin text not null check (origin in ('jev', 'staff')),
  created_at timestamptz not null,
  completed_at timestamptz
);
create index if not exists tasks_booking_idx on tasks (booking_id);

-- One row per spreadsheet import, so a batch can be undone as a whole while
-- none of its bookings has moved on. An undo keeps the row, stamped with who
-- undid it and when, so every removal leaves a trace (docs/RETENTION.md).
-- `removed` is that trace's content: each undone booking's id, unit, project,
-- buyer name and price, never its IC or phone, since the row itself is gone.
create table if not exists imports (
  id text primary key,
  source text,
  reported_by text not null,
  created_at timestamptz not null,
  booking_ids text[] not null,
  undone_at timestamptz,
  undone_by text,
  removed jsonb
);
alter table imports add column if not exists undone_at timestamptz;
alter table imports add column if not exists undone_by text;
alter table imports add column if not exists removed jsonb;

-- Every Jev answer, live or precomputed. The latest row per key serves as the cache.
create table if not exists jev_answers (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('extract', 'next_action', 'playbooks', 'signals')),
  subject_id text not null,
  input_hash text not null,
  answer jsonb not null,
  source text not null check (source in ('live', 'precomputed')),
  latency_ms integer,
  created_at timestamptz not null default now()
);
create index if not exists jev_answers_key_idx on jev_answers (kind, subject_id, created_at desc);
