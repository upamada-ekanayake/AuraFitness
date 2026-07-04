# Prompt 35: LocalStorage to Supabase Cloud Sync

Goal:
Connect LocalStorage AuraFitness data to Supabase JSONB cloud sync.

Files created or edited:
- app/src/types/sync.ts
- app/src/services/syncService.ts
- app/src/hooks/useCloudSync.ts
- app/src/services/appDataService.ts
- app/src/hooks/useAppData.ts
- app/src/components/cards/CloudSyncCard.tsx
- app/src/pages/Settings.tsx
- app/src/pages/Dashboard.tsx
- docs/supabase-setup.md
- prompts/35-localstorage-supabase-cloud-sync.md
- docs/prompt-history.md
- docs/testing-checklist.md

Result:
Authenticated users can sync LocalStorage data to Supabase.
Settings includes manual sync controls.
Conflict resolution uses `updatedAt`.
Demo mode remains LocalStorage-only.
Build and lint passed.

Rules:
- No backend added.
- No Python AI engine changes.
- No normalized tables added.
- No secrets committed.

Next:
Final cloud QA, Vercel env check, and user account testing.
