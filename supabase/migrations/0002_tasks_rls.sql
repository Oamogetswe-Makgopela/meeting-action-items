-- Issue #3: Supabase Auth and Row Level Security for per-user task isolation
-- Ref: docs/adr/ADR-001-core-architecture.md (Decision 5)
--      docs/specs/SPEC-003-auth-rls.md

alter table public.tasks enable row level security;

drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own
  on public.tasks
  for select
  using (user_id = auth.uid());

drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own
  on public.tasks
  for insert
  with check (user_id = auth.uid());

drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own
  on public.tasks
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own
  on public.tasks
  for delete
  using (user_id = auth.uid());
