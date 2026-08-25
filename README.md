# Meeting Action Items

Paste raw meeting notes, extract action items with AI, review/edit before
saving, and manage them in a per-user task list backed by Supabase.

See `docs/adr/ADR-001-core-architecture.md` for the architecture decisions
and `docs/specs/` for the per-issue specs this app was built against.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Supabase project, then apply the migrations in
   `supabase/migrations/` (via the SQL editor or `supabase db push`) —
   see `supabase/README.md`.

3. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — from the Supabase
     project's API settings.
   - `ANTHROPIC_API_KEY` — server-side only, never exposed to the browser.

4. Run the dev server:
   ```
   npm run dev
   ```
   This serves the app and, locally, the `/api/extract` endpoint via a
   Vite dev-server middleware (`server/devMiddlewarePlugin.js`).

## Scripts

- `npm run dev` — local dev server (app + `/api/extract`)
- `npm run build` — production build (`dist/`)
- `npm test` — unit tests (vitest)
- `npm run lint` — lint (oxlint)

## Deployment

Deploys to Vercel: it serves the Vite static build and `api/extract.js`
(a Vercel serverless function — see `docs/specs/SPEC-005-ai-extraction-endpoint.md`)
from one project. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
`ANTHROPIC_API_KEY` as Vercel project environment variables before
deploying — `ANTHROPIC_API_KEY` only needs to reach the serverless
function, not the client bundle.
