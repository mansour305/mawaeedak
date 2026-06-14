# Phase A Code Closure

**Repository**: `DANGERMANS/mawaeedak`  
**Issue**: #60  
**Branch**: `fix/launch-gate-phase-a-code-closure`  
**Verdict**: Code Ready — Deployment Setup Required

## GitHub-Executable Items Closed

- Routing, deep links, root splash, and direct `/splash` behavior hardened.
- Bottom navigation order standardized.
- Shared Asia/Riyadh date helpers added and applied to date-sensitive app/API paths.
- Prayer engine hardened for official-first data, GPS-aware fallback, no silent city substitution, Riyadh-date cache keys, and explicit states.
- Financial event display standardized and exact-date countdowns enforced across Home, Salaries, API, and Supabase adapter.
- Services reviewed: visible entries route to real pages; Goals sync remains gateway-backed; Costs and Reminders are labelled local-first.
- Unsupported approximate Hijri reminder handling removed.
- Admin actions hardened: complaint operations use real service methods; browser-only user/permission mutations are read-only.
- PWA registration and notification open actions added.
- RLS migrations tightened with forced RLS, owner checks, `WITH CHECK`, and Gregorian-only reminders.
- Launch-gate static checks and route smoke checks added to CI.

## Deployment Setup Required

- Apply Supabase migrations.
- Configure Vercel environment variables.
- Configure VAPID private keys.
- Deploy Supabase Edge Function.
- Configure Scheduler/Cron.
- Run real Push delivery test.
- Run iOS/Android PWA install tests on devices.

## Route Smoke Scope

`/`, `/splash`, `/welcome`, `/calendar`, `/finance`, `/salaries`, `/centers`, `/services`, `/services/goals`, `/services/costs`, `/services/reminders`, `/notifications`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/more`, `/admin`, `/admin/:rest*`.

