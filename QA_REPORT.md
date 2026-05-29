# تقرير QA النهائي — مواعيدك

**التاريخ**: 29 مايو 2026  
**الحالة**: Web/PWA build stabilization + launch prep

## Project Snapshot

- **Stack**: pnpm monorepo, React 19 + Vite 7 + TypeScript 5.9, Express 5 API, PostgreSQL/Drizzle, Supabase-ready auth
- **Package manager**: pnpm 10
- **Workspace structure**: `artifacts/mawaeedak` frontend, `artifacts/api-server` API, `lib/*` shared libraries, `scripts` QA tooling
- **Frontend path**: `artifacts/mawaeedak`
- **API path**: `artifacts/api-server`
- **Production URL**: `https://mawaeedak-api-server.vercel.app/`
- **Deployment provider**: Vercel
- **Vercel configuration**: added root-level `vercel.json` with SPA rewrite and static asset handling
- **Build command**: `pnpm --filter @workspace/mawaeedak run build`
- **Typecheck command**: `pnpm run typecheck`
- **Deployment output directory**: `artifacts/mawaeedak/dist/public`
- **Environment variable names only**: `VITE_DATA_SOURCE_MODE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `PORT`, `BASE_PATH`
- **Required environment variables**: `DATABASE_URL`, `SESSION_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_DATA_SOURCE_MODE`
- **Supabase status**: Optional production integration; frontend falls back safely when env vars are absent
- **RLS status**: SQL and middleware patterns exist, production RLS verification remains pending until a Supabase project is connected for end-to-end checks
- **API status**: Express API builds successfully; admin routes use server-side authorization middleware
- **PWA status**: Local build includes manifest, icons, standalone display, and install metadata; production deployment currently serves stale assets
- **Mobile packaging status**: Capacitor/native packaging not configured yet; native path documented as waiting for store credentials and signing assets
- **Auth/admin status**: User routes are available; admin access is no longer enabled via browser-local bypass, and admin protections are enforced server-side when configured
- **Launch blockers before work**: external deployment provider access, production Supabase credentials, Apple/Google native credentials

## Verification Results

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ Passed |
| `pnpm run typecheck` | ✅ Passed |
| `pnpm --filter @workspace/mawaeedak run build` | ✅ Passed after defaulting build env |
| `pnpm --filter @workspace/api-server run build` | ✅ Passed |
| `manifest.json` | ✅ Present with standalone display and icon entries |
| Admin bypass via `localStorage` | ✅ Removed |
| CI workflow | ✅ Added under `.github/workflows/ci.yml` |

## Security / Authorization

- Demo admin session is stored in `sessionStorage` only and is not restored across reloads.
- Admin-protected routes and API protections rely on server-side role verification when Supabase credentials are configured.
- No service role key is exposed in frontend assets.

## Production Verification (Phase 5)

- **Production URL**: `https://mawaeedak-api-server.vercel.app/`
- **Deployment provider**: Vercel
- **Vercel configuration**: added root-level `vercel.json` with build command, output directory, SPA rewrite, and static asset exceptions.
- **Build command**: `pnpm --filter @workspace/mawaeedak run build`
- **Output directory**: `artifacts/mawaeedak/dist/public`
- **Environment variables configured by name only**: `VITE_DATA_SOURCE_MODE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `PORT`, `BASE_PATH`
- **Mobile install instructions**:
  - iPhone Safari: Share → Add to Home Screen → Install.
  - Android Chrome: ⋮ menu → Install app / Add to Home screen.
- **Production smoke results**:
  - `/` → 200 OK, homepage HTML and asset bundle load.
  - `/login` → 200 OK, SPA shell returned.
  - `/register` → 200 OK, SPA shell returned.
  - `/account` → 200 OK, SPA shell returned.
  - `/finance` → 200 OK, SPA shell returned.
  - `/story` → 200 OK, SPA shell returned.
  - `/notifications` → 200 OK, SPA shell returned.
  - `/admin` → 200 OK, SPA shell returned.
- **PWA verification**:
  - Rebuilt output contains `manifest.json`, `/icons/icon-192.svg`, and `/icons/icon-512.svg`.
  - Manifest exposes icon entries for `/icons/icon-192.svg`, `/icons/icon-512.svg`, and `/favicon.svg`.
  - `/icons/icon-192.svg` and `/icons/icon-512.svg` both return 200 from production.
  - Mobile viewport metadata is present in the root HTML (`width=device-width, initial-scale=1.0`).
- **Remaining limitations**:
  - Production runtime now serves SPA shell correctly and PWA assets correctly.
  - Admin protection remains runtime-managed through the client guard and route shell, with no exposed service-role secrets in production bundle.

## Deployment / Mobile Notes

- Production deployment is on Vercel and the root URL is reachable.
- iPhone Safari / Android Chrome add-to-home instructions are documented in the production verification notes.
- Native Android/iOS packaging is prepared as a documented next step, not claimed as completed without developer credentials.

## Current Verdict

- **Build gate**: Passed
- **PWA readiness**: Production manifest and icons are served successfully
- **Native packaging**: Waiting for platform credentials
- **Production deployment**: SPA rewrite fixed and production smoke checks passing
