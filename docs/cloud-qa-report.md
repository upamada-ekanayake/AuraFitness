# AuraFitness Cloud QA Report

## Status

Cloud QA completed for repo, build, routing, deployed auth gate, local no-confirmation signup, friendly auth errors, friendly sync errors, and demo-mode safeguards.

Authenticated Supabase row sync is blocked by Supabase table setup or policies. The app now reports that state safely with a friendly message.

## Environment

Local:
- Build before changes: Passed
- Lint before changes: Passed
- Build after changes: Passed
- Lint after changes: Passed
- No-env build: Passed
- Supabase env: Verified locally through auth screen showing Supabase ready
- Signed-out redirect: Verified

Production:
- Vercel URL: `https://aura-fitness-kappa.vercel.app/`
- Prompt 37 production deployment tested: `a0f33e2` (`Harden auth and cloud sync error handling`)
- Production auth page: Verified
- Production immediate signup: Verified
- Production protected route refresh: Verified for `/routine`, `/session`, `/analytics`, and `/settings`
- Production cloud sync controls: Verified; blocked by Supabase table setup or policies
- Vercel dashboard env values: Not exposed by available tooling; verify names manually in Vercel

## Supabase

Table:
- `public.user_app_data`
- Local authenticated sync test reported: `Cloud sync is not ready yet. Check Supabase table setup.`
- Result: row creation/update not completed until the table and RLS policies are verified in Supabase Dashboard.

RLS:
- Expected to be enabled by documented SQL
- Dashboard verification pending

Policies:
- Read own data
- Insert own data
- Update own data
- Delete own data

Auth:
- Email provider: app behavior confirms email/password auth is active
- Confirm Email: effectively OFF for local MVP QA because a generated signup immediately returned an active session and unlocked the app
- Dashboard manual verification still recommended: Authentication -> Providers -> Email -> Confirm email OFF

## Auth QA

- Signed-out redirect tested locally
- Immediate signup tested locally with generated QA account
- Sign in with same generated QA account tested locally
- Sign out tested locally
- Immediate signup tested in production with generated QA account
- Duplicate signup tested locally
- Invalid login tested locally
- Short password tested locally
- Demo mode tested locally
- Exit demo mode tested locally
- Protected route refresh tested locally in demo mode for `/`, `/routine`, `/session`, `/analytics`, and `/settings`
- Protected route refresh tested in production for `/routine`, `/session`, `/analytics`, and `/settings`

## Cloud Sync QA

- Sync now UI state tested with authenticated user
- Upload local UI state tested with authenticated user
- Download cloud UI state tested with authenticated user
- Friendly setup/policy failure message verified
- Demo mode disables cloud controls
- Supabase row creation test: blocked by table setup or policies
- Supabase row update test: blocked by table setup or policies
- LocalStorage restore from cloud: blocked until row sync works

## Demo Mode QA

- Demo mode works
- Demo data remains LocalStorage-only
- Cloud controls are disabled in demo mode
- Exit demo returns to `/auth`

## Route Audit

- `/routine` remains the planner route
- `/session` alias still works
- No active invalid `/planner` links remain in `app/src`
- AI suggestion action routes point to valid routes

## Known Limitations

- Supabase table/dashboard setup must be verified before cloud row sync can pass
- Conflict resolution is timestamp-based only
- No row-level normalized fitness tables yet
- No automatic continuous sync after every edit yet
- Manual sync controls are used for MVP safety
- No password reset UI yet
- No social login yet

## Final Result

AuraFitness cloud-auth MVP is ready for real user testing after Supabase `user_app_data` table and RLS policies are corrected or verified.
