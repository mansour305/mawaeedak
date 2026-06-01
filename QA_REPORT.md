# تقرير QA النهائي — مواعيدك

**التاريخ**: 1 يونيو 2026  
**الحالة**: Security/API/Auth/Deployment/Data Gateway stabilization complete — GitHub Actions Phase 4 gate installed and verified through PR workflow; Production Readiness Final Gate added as the final manual live-production gate and still requires live environment secrets before passing.

## Project Snapshot

- **Stack**: pnpm monorepo, React 19 + Vite 7 + TypeScript 5.9, Express 5 API, PostgreSQL/Drizzle, Supabase-ready auth
- **Package manager**: pnpm 10
- **Workspace structure**: `artifacts/mawaeedak` frontend, `artifacts/api-server` API, `lib/*` shared libraries, `scripts` QA tooling
- **Frontend path**: `artifacts/mawaeedak`
- **API path**: `artifacts/api-server`
- **Production URL**: `https://mawaeedak-api-server.vercel.app/`
- **Deployment provider**: Vercel
- **Frontend build command**: `pnpm --filter @workspace/mawaeedak run build`
- **Root typecheck command**: `pnpm run typecheck`
- **Deployment output directory**: `artifacts/mawaeedak/dist/public`
- **API routing model**: frontend can use same-origin `/api/*` or external API through `VITE_API_BASE_URL`
- **Supabase status**: schema/RLS readiness documented; production connection not proven until deployment variables and SQL policies are applied
- **Auth/admin status**: browser-local admin bypass removed; production admin role source is Supabase `app_metadata.role`

## Completed Since Audit

| Area | Status | Evidence |
|---|---:|---|
| API write-route lockdown | ✅ Complete | PR #2 merged |
| Post-merge verification fixes | ✅ Complete | PR #7 merged |
| Admin/Auth production guard | ✅ Complete | PR #8 merged |
| Deployment API routing | ✅ Complete | PR #9 merged |
| Supabase/RLS readiness docs | ✅ Complete | PR #10 merged |
| Data Gateway API transport cleanup | ✅ Complete | PR #14 merged |
| Duplicate tracking issue cleanup | ✅ Complete | Issues #11/#12 closed as duplicates, #13 completed |
| Phase 4 GitHub Actions Gate | ✅ Installed and verified | PR #25 merged, PR #26 verification passed |
| Legacy CI runtime alignment | ✅ Complete | Node 22 + pnpm/action-setup@v4 + pnpm 10 |
| Production Readiness Final Gate | 🟡 Installed on branch, not passed | Requires GitHub Secrets and manual run after merge |

## Security / Authorization

- Appointment create/update/delete API routes are protected server-side.
- Financial event create/update/delete API routes are protected server-side.
- Notification mutation/read-state routes are protected server-side.
- Demo admin fallback cannot grant production admin access.
- Frontend admin role reads trust Supabase `app_metadata`, not user-editable `user_metadata`.
- Hardcoded demo admin password was removed from frontend source; development demo auth requires an environment value.
- No elevated backend credential should be exposed in frontend assets.
- Phase 4 GitHub Actions gate now includes a deterministic committed credential value scan.

## Deployment / API Routing

- Frontend API calls can now target a separately deployed Express API through `VITE_API_BASE_URL`.
- `authedFetch` normalizes `VITE_API_BASE_URL`, appends relative `/api/*` paths, and attaches Bearer tokens when Supabase session exists.
- `dataGateway.ts` uses the shared authenticated API transport, reducing inconsistent raw `fetch('/api/...')` behavior.

## Supabase / RLS

- `SUPABASE_SCHEMA.sql` documents the proposed Supabase tables and RLS enablement.
- `RLS_POLICIES.sql` documents user-owned policies for sensitive tables and public-read policies for active/published content.
- `docs/SUPABASE_RLS_READINESS.md` documents setup order, environment variables, SQL checks, and smoke checks.
- Production Supabase verification is still pending until real Supabase project variables are configured and policies are executed.

## GitHub Actions / Phase 4 Gate

- Workflow file: `.github/workflows/phase-4-github-actions-gate.yml`.
- Triggers: push to `main`, pull requests targeting `main`, and manual `workflow_dispatch`.
- Required gates:
  - `pnpm install --frozen-lockfile`
  - root script verification for `typecheck` and `build`
  - `pnpm run typecheck`
  - `pnpm -r --if-present run lint`
  - `pnpm run build`
  - `pnpm -r --if-present run smoke`
  - static smoke against first discovered `dist/index.html` when present
  - deterministic committed credential value scan

## Production Readiness Final Gate

- Workflow file: `.github/workflows/production-readiness-final-gate.yml`.
- Trigger: manual `workflow_dispatch` only.
- Existing environment script: `pnpm --filter @workspace/scripts run production-readiness-gate`.
- New live smoke script: `pnpm --filter @workspace/scripts run production-readiness-live-smoke`.
- New script file: `scripts/src/production-readiness-live-smoke.ts`.
- Documentation: `docs/PRODUCTION_READINESS_FINAL_GATE.md`.
- Required live checks:
  - production secrets preflight
  - production app URL returns built HTML
  - API health endpoint returns status ok
  - Supabase Auth signs in two different test users
  - Supabase Auth verifies access token
  - RLS prevents User B from reading User A appointment
  - temporary RLS probe row is cleaned up by the owning user
  - protected admin endpoint accepts a real admin bearer token

## Phase 4 Verification Evidence

| Run | Result | Evidence |
|---|---:|---|
| Phase 4 GitHub Actions Gate | ✅ Passed | PR #26, run `26764914099`, job `78888483074` |
| Legacy CI | ✅ Passed | PR #26, run `26764914189`, job `78888482890` |
| PR #25 install/fix gate | ✅ Merged | merge commit `221d9066e48a27de9029f8bcb88a1aca62d1416c` |
| PR #26 main smoke verification | ✅ Merged | merge commit `70f51f40be5b2da97e860273af0d0f411a9a6acd` |

## Verification Results

| Check | Result |
|---|---|
| API server typecheck/build after security lockdown | ✅ Passed in prior Codex report |
| Frontend post-merge typecheck/build after issue #3 | ✅ Passed in prior Codex report |
| Vercel preview for Supabase readiness doc PR | ✅ Ready |
| Connector static review of PR #14 | ✅ Completed |
| Phase 4 GitHub Actions Gate file present on main | ✅ Installed |
| Phase 4 fresh runtime gate | ✅ Passed in GitHub Actions PR #26 |
| Legacy CI fresh runtime gate | ✅ Passed in GitHub Actions PR #26 |
| Production Readiness Final Gate files present | 🟡 Added in branch; pending PR verification and manual live run |
| Authorized admin API smoke with real Supabase admin | ⚠️ Requires live credentials |
| Supabase RLS live user-isolation smoke | ⚠️ Requires configured Supabase project |

## Remaining Limitations

- Native iOS/Android packaging is not configured and still requires platform credentials/signing assets.
- Production Supabase/RLS behavior is not proven until real environment variables and SQL execution are completed.
- Full end-to-end visual validation against the owner’s reference screenshots has not been completed in this QA report.
- Production Readiness Final Gate must be run manually after secrets are configured.

## Current Verdict

**Publishable Preview / Stabilized Web-PWA baseline with Phase 4 GitHub Actions Gate installed and verified, plus final live-production gate prepared.**

Not yet full Production Ready because live Supabase credentials, RLS execution, authorized smoke tests, native packaging, and final visual-reference validation remain external/runtime gates.

## Next Required Runtime Gate

Run from a clean checkout of `main`:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/mawaeedak run typecheck
pnpm --filter @workspace/mawaeedak run build
```

Then run smoke tests for:

- `/`
- `/login`
- `/register`
- `/finance`
- `/story`
- `/notifications`
- `/admin`
- unauthenticated protected API mutations → must return 401/403
- authorized admin API mutations → must succeed with real Supabase admin token
- normal user RLS isolation → cannot access another user’s rows

## PHASE 4 LIVE ENV/RLS BLOCKER CHECK - 2026-06-01

Verdict for this Codex runtime: **NEEDS FIXES — PHASE 4 ADMIN CONTROL AND LIVE PERSISTENCE INCOMPLETE**.

Environment availability was checked without printing secret values:

| Secret | Status |
|---|---|
| `DATABASE_URL` | MISSING |
| `SUPABASE_URL` | MISSING |
| `SUPABASE_ANON_KEY` | MISSING |
| `VITE_SUPABASE_URL` | MISSING |
| `VITE_SUPABASE_ANON_KEY` | MISSING |
| `ADMIN_API_TOKEN` | MISSING |
| `SUPABASE_JWT_SECRET` | MISSING |
| `SUPABASE_SERVICE_ROLE_KEY` | MISSING / not used by current server guard |

Commands executed after the Windows/runtime fixes:

| Command | Result | Notes |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | pnpm 10.33.4 local runtime, lockfile frozen |
| `pnpm run typecheck` | PASS | Workspace libs, api-server, mawaeedak, mockup-sandbox, scripts |
| `pnpm run build` | PASS | api-server, mawaeedak, mockup-sandbox built |
| `node work/phase4-admin-smoke.cjs` | FAIL / BLOCKED | Required live secrets missing |

Latest Phase 4 blocker rerun after `.env.local` became available in the correct runtime:

| Check | Result | Evidence |
|---|---|---|
| Env loading | PASS | `.env.local` loaded; secrets reported as PRESENT/MISSING only |
| DB proof | PASS | `select 1` succeeded with SSL |
| Supabase REST proof | PASS | HTTP 200 |
| Guest mutation denial | PASS | Guest create returned HTTP 401 |
| Admin mutation proof | FAIL | Live `financial_events.name_ar` is NOT NULL and the current app/smoke payload is not aligned |
| Audit log proof | NOT RUN | Admin mutation did not create the test record |
| Frontend service-role exposure | PASS | No frontend source/bundle reference found |

Commands on the latest run: `pnpm run typecheck` PASS, `pnpm run build` PASS, `node work/phase4-admin-smoke.cjs` FAIL/NEEDS FIXES. Do not mark Phase 4 complete until the live schema alignment allows admin create/update/cleanup, public read, and audit proof to pass.
