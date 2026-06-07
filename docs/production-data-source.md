# Production Data Source Configuration — مواعيدك

## Current Architecture

### Data Source Modes

The app supports three data source modes configured via `VITE_DATA_SOURCE_MODE`:

| Mode | Description | Production Use |
|------|-------------|----------------|
| `api` | PostgreSQL + Express API | Legacy only; requires api-server deployment |
| `supabase_shadow` | API + Supabase comparison | Development/transition |
| `supabase` | Supabase direct | **Production recommended** |

### Production Mode: Supabase

Recommended production deployment:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_SOURCE_MODE=supabase
```

In `supabase` mode, Gateway-backed reads/writes go directly to Supabase. The app must not silently fall back to api-server when Supabase fails; failures must be visible so production problems are not hidden.

### Fallback Mode: Local Demo

In development without Supabase:
- Admin login: `admin` / `admin123`
- Data persists in localStorage
- This is demo/fallback behavior only, not a full production backend.

## api-server Status

**Location:** `artifacts/api-server/`  
**Status:** NOT deployed via the app Vercel project in this repository

Why api-server is separate:
1. No `vercel.json` in `artifacts/api-server/`
2. No `.vercel/` tracking folder
3. `.vercel/` is in `.gitignore`
4. Root `vercel.json` only deploys `artifacts/mawaeedak/`
5. api-server is Express, not designed as the current Vercel frontend deployment

If `VITE_DATA_SOURCE_MODE=api`, api-server must be deployed separately and `VITE_API_BASE_URL` must point to it. If production is Supabase-only, do not claim API-backed sections are working unless they have been converted, disabled, or clearly marked as requiring a server.

## Supabase Schema Required

Run the approved Supabase bootstrap/migrations in Supabase SQL Editor to create the required tables:
- `daily_messages`
- `story_templates`
- `themes`
- `news`
- `jobs`
- `appointments`
- `financial_events`
- `notifications`
- `complaints`
- `user_profiles`
- `official_financial_dates`
- `official_prayer_times`

## Admin Panel Data Flow After Runtime Fixes

| Section | Read | Write | Production verdict |
|---------|------|-------|--------------------|
| Dashboard | Mixed dashboard data | local/demo actions only | Not a full production control surface |
| Members | Supabase direct | Supabase direct | Production path |
| Financial | Gateway | Gateway | Converted from Orval/API to Gateway |
| Official Prayer | Supabase | Supabase | Production path |
| Official Financial | Supabase | Supabase | Production path |
| Messages | Gateway | Gateway | Production path; reflected on HomePage |
| Story | Gateway | Gateway | Production path for templates |
| Themes | Gateway | Gateway update | Production path |
| News/Jobs | Gateway | Gateway | Production path |
| Notifications | Gateway read/delete | Broadcast requires server/Edge Function | Partial: no fake broadcast in Supabase-only |
| Complaints | Gateway read / local fallback by page | localStorage remains in some flows | Partial |
| Reports | Local report/export | no server write | API dependency removed; central audit requires Supabase table later |
| Settings | localStorage | localStorage | Demo/local settings, not global production settings |
| Social | External integration required | external integration required | Must remain disabled unless API keys/server exist |
| Permissions | localStorage | localStorage | Demo/local only |

## Verification Commands

```bash
pnpm run typecheck
pnpm run build
node scripts/check-app-actions.mjs
```

Functional closure still requires real browser/E2E proof for each production path, especially:
- admin login
- create/edit/delete
- refresh persistence
- user-facing reflection when relevant

---
Generated: 2026-06-07
