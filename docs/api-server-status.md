# API Server Status Documentation

## Location
`/workspace/project/mawaeedak/artifacts/api-server/`

## Deployment Status
**NOT DEPLOYED via Vercel in this repository**

### Evidence:
1. No `vercel.json` in `artifacts/api-server/`
2. No `.vercel/` folder tracking api-server deployment
3. `.gitignore` contains `.vercel/` — Vercel config is gitignored
4. Root `vercel.json` only configures `artifacts/mawaeedak/` for Vercel deployment
5. api-server is a standalone Express server, not designed for Vercel serverless

### Build Status (Local)
```bash
cd artifacts/api-server && pnpm run build
# ✅ Build succeeded
```

## Vercel App Deployment
- **Vercel project**: `mawaeedak-mawaeedak`
- **Configured via**: `vercel.json` at repo root
- **Output directory**: `artifacts/mawaeedak/dist/public`
- **Build command**: `pnpm run build`
- **Build status**: ✅ PASSED

## api-server Purpose
The api-server is a standalone backend for:
- Gateway data fetching (optional)
- Server-side cron jobs
- Advanced features requiring server-side logic

It is NOT required for the core application functionality which uses:
- Supabase for database (when configured with `VITE_DATA_SOURCE_MODE=supabase`)
- localStorage for persistence (fallback/demo mode)
- Client-side rendering

## Production Data Flow

### Recommended Production Setup:
```bash
# Set in Vercel environment variables:
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_SOURCE_MODE=supabase
```

With `VITE_DATA_SOURCE_MODE=supabase`:
- App reads/writes directly to Supabase
- api-server NOT needed
- All admin operations work via Supabase

### Legacy API Mode (requires api-server):
```bash
VITE_DATA_SOURCE_MODE=api
VITE_API_BASE_URL=https://your-api-server.com
```

## Conclusion
`mawaeedak-api-server` is **OUT OF SCOPE** of this repository's Vercel deployment.

**Two valid production paths:**
1. **Supabase only** (recommended): Set `VITE_DATA_SOURCE_MODE=supabase` — api-server NOT needed
2. **API + Supabase**: Deploy api-server separately (Docker/Railway/etc.) — OUT OF SCOPE of this repo

The core application (`mawaeedak-mawaeedak`) deploys and functions correctly with Supabase mode.

---
Generated: 2026-06-07