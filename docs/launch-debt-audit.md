# Launch Gate Phase A Code Closure

**Date**: 2026-06-12
**Issue**: #60
**Verdict**: Code Ready — Deployment Setup Required

## Closed In Code

- Root-only splash now waits for the session check, while direct `/splash` exits through the normal onboarding/home route.
- Bottom navigation order is standardized across Home, Calendar, Services, Salaries, and More.
- Asia/Riyadh date helpers are centralized and used by Home, Calendar, financial countdowns, daily content, exports, and API day-sensitive routes.
- Prayer fallback uses GPS coordinates when available, known city coordinates otherwise, no silent Riyadh substitution, Riyadh-date cache keys, and loading/error/empty states.
- Financial display logic is centralized and exact-date based. Old monthly roll-forward behavior was removed from API and Supabase adapter countdowns.
- Visible service entries open real pages. Goals keeps Supabase sync for authenticated users, while Costs and Reminders are clearly local-first.
- Reminders are Gregorian-only until a verified Hijri converter is introduced.
- Admin complaint actions call the existing complaint service. Member and permission mutations are read-only in the browser until server-side admin endpoints exist.
- PWA registration is explicit at startup and notification cards have real in-app open actions.
- RLS migrations use owner/admin checks, forced RLS, and `WITH CHECK` constraints on user-owned writes.
- CI includes launch-gate hygiene and static route smoke checks.

## Deployment Setup Required

- Apply Supabase migrations.
- Configure Vercel environment variables.
- Configure VAPID private keys.
- Deploy the Supabase Edge Function for push delivery.
- Configure Scheduler/Cron for push delivery.
- Perform real Push delivery tests.
- Perform iOS and Android PWA install tests on devices.

## Verification Commands

Run from the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run check:launch-gate
pnpm run typecheck
pnpm run build
pnpm -r --if-present run lint
pnpm -r --if-present run test
pnpm -r --if-present run smoke
```

