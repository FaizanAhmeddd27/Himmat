-- Sessions and learner profiles as JSON documents. Safe to run more than once.
-- Row level security with no policies means Supabase's public API cannot read or
-- write these tables: only the backend's own database connection can.

create table if not exists himmat_sessions (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists himmat_learners (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table himmat_sessions enable row level security;
alter table himmat_learners enable row level security;
