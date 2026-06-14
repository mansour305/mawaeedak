# Mawaeedak Launch Readiness Closure Matrix

This file tracks the production closure of Issue #60 after PR #59 was merged.

## Verdict rules

Allowed final verdict values only:

- `READY`
- `Code Ready — Deployment Setup Required`
- `NOT READY`

The current verdict remains:

`Code Ready — Deployment Setup Required`

The app must not be declared public-launch ready until every P0 gate below is closed with evidence.

## P0 gates

### 1. Deployment setup

- [ ] Supabase migrations applied in production.
- [ ] Vercel environment variables configured.
- [ ] Supabase Edge Function secrets configured.
- [ ] `send-push` Edge Function deployed.
- [ ] Scheduler/Cron configured for due reminders.
- [ ] Production data mode verified with no silent fallback.

### 2. Home, Riyadh time, prayer, and financial engine

- [ ] Asia/Riyadh day key is consistently used for UI day decisions.
- [ ] Midnight rollover verified.
- [ ] Next-prayer countdown verified every second.
- [ ] GPS latitude/longitude verified for prayer fallback.
- [ ] No silent fallback to Riyadh without user-facing state.
- [ ] About page explains prayer/financial sources.
- [ ] Unified financial engine feeds Home, Salaries, Calendar, Notifications, and Admin.
- [ ] Financial statuses support confirmed/expected/changed/delayed/advanced/unavailable.
- [ ] Financial change log and reason tracking verified.

### 3. Services

- [ ] Services order matches: احسب هدفك، حساب التكاليف، ذكرني، السفر، الدراسة والإجازات، الوظائف والأخبار، بطاقة اليوم، صوتك مسموع.
- [ ] Every visible service opens a real page.
- [ ] Incomplete services are hidden or clearly disabled.
- [ ] Goals service cloud sync verified.
- [ ] Costs service cloud sync or clear local-only mode verified.
- [ ] Reminders cloud sync or clear local-only mode verified.
- [ ] Fake Hijri conversion removed or clearly disabled.
- [ ] Money/date input validation verified.

### 4. Notifications and PWA

- [ ] Service Worker registration verified in production build.
- [ ] Offline app shell verified.
- [ ] Navigation fallback verified.
- [ ] Update prompt/version behavior verified.
- [ ] Push subscription creation verified.
- [ ] Push subscription persistence verified in Supabase.
- [ ] Real Push delivery verified from Edge Function.
- [ ] Scheduler/Cron sends due reminders.
- [ ] Notification click opens the related route.
- [ ] Mark read / mark all read / delete actions verified.

### 5. Admin/security

- [ ] RLS verified for sensitive tables.
- [ ] User-owned tables enforce strict `user_id` ownership.
- [ ] Admin-only operations use real role checks.
- [ ] Pending admin actions removed, hidden, or implemented.
- [ ] Complaint reply/status/delete implemented or hidden.
- [ ] Admin writes create audit logs.
- [ ] Theme features removed/hidden if forbidden by final audit.
- [ ] No service role key is present in frontend.
- [ ] No committed secrets.

### 6. QA/CI/Monitoring

- [ ] Route smoke tests for main user routes.
- [ ] Prayer engine tests.
- [ ] Financial counter tests.
- [ ] Services validation tests.
- [ ] Supabase/RLS verification notes or tests.
- [ ] PWA smoke/offline checks.
- [ ] Accessibility checks for core screens.
- [ ] Monitoring/error tracking plan or implementation.

## Evidence required in each closing PR

Every PR that claims to close part of this matrix must include:

- commit SHA
- CI status
- changed files
- routes verified
- commands run
- checklist items closed
- remaining risks
- final verdict

