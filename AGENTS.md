# AGENTS.md

## Project Identity

This repository is `DANGERMANS/mawaeedak`.

The active Codex work branch for controlled setup work is:

`codex/setup-control-files`

This project is a **WEB-ONLY** production scheduling/events application. All mobile/Flutter artifacts have been removed.

## Repository Architecture

Core areas:

- `artifacts/mawaeedak/` - Main web application (Vite + React)
- `artifacts/api-server/` - Backend API server
- `lib/` - Shared libraries (API client, DB schemas, utilities)
- Root workspace and package control files.

## Absolute Forbidden Actions

Never do any of the following unless the user explicitly requests that exact action:

- Push to GitHub.
- Commit changes.
- Work directly on `main`.
- Delete files or folders.
- Restore files or reset branches.
- Run broad repository scans repeatedly.
- Run `pnpm install`, build, typecheck, migrations, seed scripts, or deployment commands.
- Modify application source code during documentation/control-file tasks.
- Claim the project is production ready before evidence-based QA and security checks are complete.
- Expose secrets, tokens, service keys, or admin credentials.
- Add mobile/Flutter/React Native code or dependencies.

## Security/Auth/Admin Rules

- Treat auth, admin access, password reset, and privileged routes as high risk.
- Admin-only behavior must be enforced server-side, not only in the UI.
- Never rely on client-side role checks as the source of truth.
- Any security change requires explicit verification steps and a rollback-aware summary.
- Never log secrets, JWTs, refresh tokens, reset tokens, or private Supabase keys.

## Supabase/RLS Rules

- Supabase Row Level Security must be considered mandatory for user-owned or privileged data.
- Do not disable RLS as a workaround.
- Policies must be least-privilege and tied to authenticated user identity or admin role.
- Service-role keys must never be exposed to frontend code.
- Any RLS change must include policy intent, affected tables, and verification queries or smoke checks.

## Data Source Rules

- Identify the source of truth before changing data flows.
- Do not create duplicate competing data sources.
- Mock, seed, local, and production data must be clearly separated.
- Frontend views must not silently fall back to fake data in production paths.
- Any migration or data-shape change requires an explicit verification plan.

## Frontend RTL/Web Rules

- Arabic and RTL behavior must be treated as first-class requirements.
- Responsive layout must be verified for primary flows.
- Text must not overlap, truncate critical meaning, or break controls on small screens.
- Forms, navigation, dialogs, and admin screens must be usable in RTL.
- Visual-reference work must be isolated and verified separately from functional fixes.

## API/Backend Rules

- API routes must validate input and return predictable error responses.
- Authenticated and admin endpoints must enforce authorization on the server.
- Backend code must not trust client-submitted role or ownership fields.
- Error handling must avoid leaking internals or secrets.
- API changes require focused smoke checks for success and failure paths.

## Verification Rules

- Verification must match the scope of the task.
- Do not run expensive commands unless the task explicitly calls for them.
- Prefer focused checks over broad repeated scans.
- If a command is not run, report that honestly.
- Do not claim a fix is verified unless the verification actually ran and passed.

## Final Report Format

Every task report should include:

- Files changed.
- Files read.
- Commands run.
- Verification performed.
- Risks or gaps.
- Next recommended task.
- Final verdict.

## Allowed Final Verdicts

Use only task-specific verdicts requested by the user.

If no task-specific verdict is provided, use one of:

- `TASK COMPLETE`
- `TASK NEEDS FIXES`
