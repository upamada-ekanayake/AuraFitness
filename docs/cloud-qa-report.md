# AuraFitness Cloud QA Report

## Status

Cloud QA completed for repo, build, routing, deployed auth gate, Supabase-ready frontend configuration, and demo-mode safeguards.

Authenticated row sync remains pending a confirmed Supabase test account or dashboard session.

## Environment

Local:
- Build: Passed
- Lint: Passed
- Supabase env: Verified locally through auth screen showing Supabase ready
- Signed-out redirect: Verified

Production:
- Vercel URL: `https://aura-fitness-kappa.vercel.app/`
- Latest production deployment: `7dc1d12` (`Add Supabase cloud sync`)
- Vercel env vars: Frontend behavior verified through production auth screen showing Supabase ready
- Vercel dashboard env values: Not exposed by available tooling; verify names manually in Vercel
- SPA routing: Verified in demo mode for `/routine`, `/session`, `/analytics`, and `/settings`
- Runtime errors: None found in Vercel runtime error check for the last 24 hours

## Supabase

Table:
- `public.user_app_data`

RLS:
- Expected to be enabled by documented SQL
- Dashboard verification pending

Policies:
- Read own data
- Insert own data
- Update own data
- Delete own data

Auth:
- Email auth screen tested
- Production signup reached email confirmation state
- Email confirmation setting: enabled or effectively required for the generated test account

## Auth QA

- Signed-out redirect tested locally
- Signed-out redirect tested in production
- Sign up tested in production through generated QA account
- Sign in with a confirmed account: pending user-provided confirmed test account
- Sign out with an authenticated account: pending user-provided confirmed test account
- Demo mode tested
- Protected routes tested

## Cloud Sync QA

- Sync now UI state tested
- Upload local UI state tested
- Download cloud UI state tested
- Demo mode disables cloud controls
- Supabase row creation test: pending confirmed authenticated account
- Supabase row update test: pending confirmed authenticated account
- LocalStorage restore from cloud: pending confirmed authenticated account

## Demo Mode QA

- Demo mode works
- Demo data remains LocalStorage-only
- Cloud controls are disabled in demo mode

## Known Limitations

- Conflict resolution is timestamp-based only
- No row-level normalized fitness tables yet
- No automatic continuous sync after every edit yet
- Manual sync controls are used for MVP safety
- No password reset UI yet
- No social login yet
- Authenticated row-sync proof requires a confirmed Supabase test account

## Final Result

AuraFitness cloud-auth MVP is ready for confirmed-account QA and user testing.
