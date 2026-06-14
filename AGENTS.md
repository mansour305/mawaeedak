# AGENTS.md — Mawaeedak OpenHands Instructions

## Project Identity

This repository is `DANGERMANS/mawaeedak`.

Mawaeedak is a **React/Vite/TypeScript Web/PWA mobile-first app**. It must feel like a mobile app on iPhone and Android browsers while remaining one Web/PWA codebase.

## Product Direction

Work only on the existing Web/PWA app.

Strictly forbidden unless the user explicitly requests otherwise:

- Flutter
- Dart
- React Native
- Separate mobile app folders
- `android/appwidget`
- `ios/Runner`
- `main.dart`
- Any new native mobile project

## Required Reading Before Editing

Before editing code, read:

- `OPENHANDS_EXECUTION_LOCK.md`
- `package.json`
- `pnpm-workspace.yaml`
- `artifacts/mawaeedak/package.json`
- `artifacts/mawaeedak/tsconfig.json`
- `artifacts/mawaeedak/vite.config.ts`
- `artifacts/mawaeedak/src/App.tsx`
- `artifacts/mawaeedak/src/features/centers/CentersPage.tsx`

## Current Priority Task

The current priority is to finish the missing Web/PWA service wiring and fix verification so false READY reports are impossible.

Required physical files:

- `artifacts/mawaeedak/src/features/services/GoalsPage.tsx`
- `artifacts/mawaeedak/src/features/services/CostsPage.tsx`
- `artifacts/mawaeedak/src/features/services/RemindersPage.tsx`
- `artifacts/mawaeedak/src/lib/aladhanService.ts`
- `artifacts/mawaeedak/src/hooks/usePrayerEngine.ts`

Required routes in `artifacts/mawaeedak/src/App.tsx`:

- `/services/goals`
- `/services/costs`
- `/services/reminders`

Required service links in `artifacts/mawaeedak/src/features/centers/CentersPage.tsx`:

- `احسب هدفك` -> `/services/goals`
- `حساب التكاليف` -> `/services/costs`
- `ذكرني` -> `/services/reminders`

These must not route to `/centers/work`.

## Known Verification Blockers To Fix First

1. `artifacts/mawaeedak/package.json` must have a real web typecheck script:

```json
"typecheck": "tsc -p tsconfig.json --noEmit"
```

2. `artifacts/mawaeedak/tsconfig.json` must include TypeScript paths matching Vite aliases:

```json
"paths": {
  "@/*": ["./src/*"],
  "@assets/*": ["./src/assets/*"],
  "@api-client": ["./src/lib/api-client/index.ts"],
  "@api-client/*": ["./src/lib/api-client/*"]
}
```

## Commands Are Explicitly Allowed For This Task

For this task, the agent is explicitly allowed and required to run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm -r --if-present run lint
pnpm -r --if-present run test
pnpm -r --if-present run smoke
```

If a command fails, fix the root cause and rerun it. Do not mark typecheck or build as non-blocking.

## Verification Proof Required Before READY

Before writing READY, provide proof:

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

## READY Is Forbidden If

- Required files are missing.
- Required routes are missing.
- `CentersPage.tsx` still routes Goals, Costs, or Reminders to `/centers/work`.
- Web typecheck is skipped.
- TypeScript errors remain.
- Build fails.
- Flutter/Dart/mobile app files are added.
- A feature is claimed as implemented without actual git changes.

## Final Report Format

Every completion report must include:

- Branch name
- Commit SHA
- PR URL if created
- Files changed
- Files physically created
- Route proof grep output
- Commands run
- Verification results
- Risks or gaps
- Final verdict

Allowed final verdicts for this task:

- `READY`
- `NOT READY`

