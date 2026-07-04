# Prompt 33: Supabase Auth and Database Foundation

Goal:
Add Supabase client, auth service foundation, cloud data service foundation, env example, and SQL setup docs.

Files created or edited:
- app/src/lib/supabase.ts
- app/src/types/auth.ts
- app/src/services/authService.ts
- app/src/services/cloudDataService.ts
- app/src/hooks/useAuth.ts
- app/.env.example
- docs/supabase-setup.md
- app/src/pages/Settings.tsx
- prompts/33-supabase-auth-database-foundation.md
- docs/prompt-history.md
- docs/testing-checklist.md
- app/package.json

Result:
Supabase foundation added.
Auth service foundation added.
Cloud data service foundation added.
LocalStorage remains active.
Build passes without env vars.

Rules:
- No backend added.
- No Python AI engine changes.
- No login UI added yet.
- No secrets committed.

Next:
Build login/signup UI and protected cloud-sync flow.
