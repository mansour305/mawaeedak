# Deployment Environment Variables

**Last Updated**: 2026-06-12

---

## Overview

This document lists all environment variables required for Mawaeedak deployment.

**Important**: Never commit actual values. Use placeholders in examples.

---

## Vercel (Frontend)

### Required Variables

#### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` → `VITE_SUPABASE_URL`
5. Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`

### Optional Variables

#### Custom API Server
```
VITE_API_BASE_URL=https://your-api-server.vercel.app
```

Only required if using a custom backend API server (not Supabase).

#### Data Source Mode
```
VITE_DATA_SOURCE_MODE=supabase
```

Options:
- `supabase` — Use Supabase (default if keys present)
- `supabase_shadow` — Use Supabase with API logging
- `api` — Use custom API server
- (not set) — Auto-detect based on other config

**Note**: In production, if no valid source is found, the app throws a clear error.

#### Push Notifications
```
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```

**Generation**:
```bash
npx web-push generate-vapid-keys
```

**Required for**: Web push notifications

### Development Variables

```
VITE_USE_MOCK_DATA=true      # Use mock data (dev only)
```

---

## Supabase Edge Functions

### Required for send-push Function

```
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_SUBJECT=mailto:your-email@example.com
```

**Where to set**:
1. Go to Supabase Dashboard
2. Select your project
3. Go to Edge Functions → send-push → Settings
4. Add environment variables

---

## Supabase Database

### SQL Editor Migrations

Apply in order:
1. `artifacts/mawaeedak/supabase-bootstrap.sql` — Core tables
2. `supabase/migrations/20250612000001_create_push_subscriptions.sql` — Push subscriptions
3. `supabase/migrations/20250612000002_create_services_tables.sql` — Goals, costs, reminders

---

## Vercel Deployment Checklist

### Before First Deploy

- [ ] Create Supabase project
- [ ] Apply all SQL migrations
- [ ] Generate VAPID keys
- [ ] Add environment variables to Vercel

### Environment Variables to Add

```bash
# Vercel CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_VAPID_PUBLIC_KEY
```

Or add via Vercel Dashboard:
1. Go to Project Settings
2. Click Environment Variables
3. Add each variable

### Required for Production

| Variable | Required | Description |
|-----------|----------|-------------|
| VITE_SUPABASE_URL | ✅ Yes | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | ✅ Yes | Supabase anon key |
| VITE_VAPID_PUBLIC_KEY | ⚠️ For push | Web Push public key |
| VITE_API_BASE_URL | ❌ No | Only if using custom API |

### Optional for Development

| Variable | Default | Description |
|-----------|---------|-------------|
| VITE_DATA_SOURCE_MODE | auto | Force specific mode |
| VITE_USE_MOCK_DATA | false | Use mock data |

---

## Security Notes

1. **Never commit secrets**: Use `.env.example` as template
2. **ANON key is safe**: Frontend-only, protected by RLS
3. **SERVICE_ROLE key is secret**: Only in Edge Functions
4. **VAPID private key is secret**: Only in Edge Function environment

---

## Troubleshooting

### "No valid data source configured"

Check:
1. `VITE_SUPABASE_URL` is set
2. `VITE_SUPABASE_ANON_KEY` is set
3. Supabase project is active

### "Push notifications not working"

Check:
1. `VITE_VAPID_PUBLIC_KEY` is set
2. Edge Function `send-push` is deployed
3. Edge Function environment variables are set
4. Browser supports Push API

### "App shows error on load"

Check:
1. Environment variables are set correctly
2. No typos in variable names
3. URL format is correct (https://xxx.supabase.co)

