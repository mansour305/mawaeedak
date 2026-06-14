# OpenHands Execution Lock — Mawaeedak

This repository has a strict execution rule: do not report READY unless the claimed files, routes, and verification commands are real and present in git.

## Current confirmed blockers

1. The Web app package currently has no `typecheck` script in `artifacts/mawaeedak/package.json`.
   - Root `pnpm run typecheck` uses `pnpm -r --filter "./artifacts/**" --if-present run typecheck`.
   - Because `artifacts/mawaeedak` has no `typecheck` script, the web app may be skipped by typecheck.
   - Build success alone is not enough.

2. `artifacts/mawaeedak/vite.config.ts` defines aliases:
   - `@` -> `src`
   - `@assets` -> `src/assets`
   - `@api-client` -> `src/lib/api-client`

3. `artifacts/mawaeedak/tsconfig.json` currently only defines:
   - `@/*` -> `./src/*`

4. Therefore TypeScript can fail to resolve `@api-client` unless tsconfig paths are fixed.

5. A previous report claimed these files existed, but they were not present on the inspected branch:
   - `artifacts/mawaeedak/src/features/services/GoalsPage.tsx`
   - `artifacts/mawaeedak/src/features/services/CostsPage.tsx`
   - `artifacts/mawaeedak/src/features/services/RemindersPage.tsx`
   - `artifacts/mawaeedak/src/lib/aladhanService.ts`
   - `artifacts/mawaeedak/src/hooks/usePrayerEngine.ts`

6. A previous report claimed these routes existed, but `App.tsx` did not contain them:
   - `/services/goals`
   - `/services/costs`
   - `/services/reminders`

7. `CentersPage.tsx` was still routing core services to `/centers/work`.

## Mandatory first fixes before feature work

Before implementing or reporting feature completion, do this first:

1. Add a real web typecheck script to `artifacts/mawaeedak/package.json`:

```json
"typecheck": "tsc -p tsconfig.json --noEmit"
```

2. Fix `artifacts/mawaeedak/tsconfig.json` paths so TypeScript matches Vite aliases:

```json
"paths": {
  "@/*": ["./src/*"],
  "@assets/*": ["./src/assets/*"],
  "@api-client": ["./src/lib/api-client/index.ts"],
  "@api-client/*": ["./src/lib/api-client/*"]
}
```

3. After that, run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

If typecheck fails, fix the errors. Do not mark typecheck as non-blocking.

## Mandatory proof before final READY

Before writing READY, provide proof for:

```bash
git status --short
git diff --stat
test -f artifacts/mawaeedak/src/features/services/GoalsPage.tsx
test -f artifacts/mawaeedak/src/features/services/CostsPage.tsx
test -f artifacts/mawaeedak/src/features/services/RemindersPage.tsx
test -f artifacts/mawaeedak/src/lib/aladhanService.ts
test -f artifacts/mawaeedak/src/hooks/usePrayerEngine.ts
grep -n "/services/goals" artifacts/mawaeedak/src/App.tsx
grep -n "/services/costs" artifacts/mawaeedak/src/App.tsx
grep -n "/services/reminders" artifacts/mawaeedak/src/App.tsx
grep -n "/services/goals" artifacts/mawaeedak/src/features/centers/CentersPage.tsx
grep -n "/services/costs" artifacts/mawaeedak/src/features/centers/CentersPage.tsx
grep -n "/services/reminders" artifacts/mawaeedak/src/features/centers/CentersPage.tsx
```

## READY is forbidden if any of these are true

- The required files are missing.
- `App.tsx` does not contain the required routes.
- `CentersPage.tsx` still routes Goals, Costs, or Reminders to `/centers/work`.
- Web typecheck is skipped.
- TypeScript errors remain.
- Build fails.
- Flutter/Dart/mobile app files are added.
- Any feature is claimed as implemented without actual git changes.

