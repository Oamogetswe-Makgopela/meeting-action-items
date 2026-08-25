# Supabase schema

Migrations in `migrations/` define the `tasks` table (issue #2 /
[SPEC-002](../docs/specs/SPEC-002-supabase-project-tasks-table.md)).

## Applying

No live Supabase project is provisioned yet. Once one exists:

1. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from the project's API settings.
2. Apply `migrations/0001_create_tasks_table.sql` via the Supabase SQL
   editor, or `supabase db push` if using the Supabase CLI linked to the
   project.
3. Row Level Security policies (issue #3 /
   [SPEC-003](../docs/specs/SPEC-003-auth-rls.md)) are defined separately
   in a later migration and must be applied before the app is used with
   real user data.
