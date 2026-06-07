# Production Data Source Configuration — مواعيدك

## Current Architecture

### Data Source Modes

The app supports three data source modes configured via `VITE_DATA_SOURCE_MODE`:

| Mode | Description | Production Use |
|------|-------------|----------------|
| `api` (default) | PostgreSQL + Express API | Requires api-server deployment |
| `supabase_shadow` | API + Supabase comparison | Development/transition |
| `supabase` | Supabase direct | **Production recommended** |

### Production Mode: Supabase

**Recommended for production deployment:**

```bash
# .env.production
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_SOURCE_MODE=supabase
```

### Fallback Mode: Local Demo

In development without Supabase:
- Admin login: `admin` / `admin123`
- Data persists in localStorage
- No network calls to external APIs

## api-server Status

**Location:** `artifacts/api-server/`
**Status:** NOT deployed via Vercel in this repository

### Why api-server is separate:
1. No `vercel.json` in `artifacts/api-server/`
2. No `.vercel/` tracking folder
3. `.vercel/` is in `.gitignore`
4. Root `vercel.json` only deploys `artifacts/mawaeedak/`
5. api-server is Express, not designed for Vercel serverless

### Deploying api-server (optional):

```bash
# Option 1: Docker
docker build -t mawaeedak-api artifacts/api-server
docker run -p 3001:3001 -e PORT=3001 mawaeedak-api

# Option 2: Railway/Render/Heroku
# Push artifacts/api-server to separate repo
```

## Gateway Pattern

The app uses a Gateway pattern (`dataGateway.ts`) that routes:
- **mode=api**: All reads/writes via Express API
- **mode=supabase**: Reads/writes via Supabase directly
- **Fallback**: Graceful degradation when source unavailable

## Supabase Schema Required

Run `supabase-bootstrap.sql` in Supabase SQL Editor to create tables:
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

## Admin Panel Data Flow

| Section | Read | Write |
|---------|------|-------|
| Dashboard | Gateway/Supabase | localStorage (demo) |
| Members | Supabase direct | Supabase direct |
| Financial | Orval API hooks | Orval mutations |
| Notifications | Gateway | Orval (API fan-out) |
| News/Jobs | Gateway | Gateway |
| Messages | Gateway | Gateway |
| Themes | Gateway | Gateway |
| Story | Gateway | Gateway |
| Complaints | localStorage | localStorage |
| Support | Supabase | Supabase |
| Official Prayer | Supabase | Supabase |
| Official Financial | Supabase | Supabase |
| Settings | localStorage | localStorage |
| Social | Orval API | Orval API |
| Reports | Orval API | - |
| Permissions | localStorage | localStorage |

## Verification Commands

```bash
# Typecheck
pnpm run typecheck

# Build
pnpm run build

# Check scripts
node scripts/check-app-actions.mjs

# Test admin login (dev mode)
# Open /admin → admin/admin123
```

---
Generated: 2026-06-07