-- Issue #2: Provision Supabase project and tasks table schema
-- Ref: docs/adr/ADR-001-core-architecture.md (Decision 4)
--      docs/specs/SPEC-002-supabase-project-tasks-table.md

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  owner text,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  source_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();
