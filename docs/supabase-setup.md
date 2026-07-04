# AuraFitness Supabase Setup

## Required Vercel Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

`VITE_SUPABASE_ANON_KEY` is also supported as a fallback for older Supabase project settings.

## MVP Database Table

```sql
create table if not exists public.user_app_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.user_app_data enable row level security;

create policy "Users can read their own app data"
on public.user_app_data
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own app data"
on public.user_app_data
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own app data"
on public.user_app_data
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own app data"
on public.user_app_data
for delete
to authenticated
using (auth.uid() = user_id);
```

## Notes

- LocalStorage remains as offline/demo fallback.
- Cloud sync is connected through manual Settings controls.
- Do not expose the Supabase service role key in the frontend.
- Add the Vercel environment variables before enabling production cloud sync.
- For MVP testing, disable email confirmation in Supabase Dashboard.

## Supabase Auth Provider Settings

Use these values in Supabase Dashboard:

- Authentication -> Providers -> Email
- Enable Email provider: ON
- Confirm email: OFF for MVP testing

If Confirm email is turned ON later, AuraFitness will keep showing the fallback message:

`Account created. Please check your email to confirm your account.`

## Supabase Auth URL Settings

Use these values in Supabase Authentication URL settings:

- Site URL: `https://aura-fitness-kappa.vercel.app`
- Redirect URL: `https://aura-fitness-kappa.vercel.app/**`
- Redirect URL: `http://localhost:5173/**`

## Cloud Sync Behavior

AuraFitness uses an MVP JSONB sync model.

- LocalStorage remains the local cache.
- Authenticated users can sync their full `AuraFitnessData` object to Supabase.
- One row exists per user in `public.user_app_data`.
- Manual sync controls are available in Settings.
- Demo mode is always local-only.

## Conflict Resolution

- If no cloud row exists, local data uploads to cloud.
- If cloud `updatedAt` is newer, cloud data downloads to local.
- If local `updatedAt` is newer, local data uploads to cloud.
- If timestamps are equal or invalid, local data is preferred.

## Production QA Notes

Vercel environment variables required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`VITE_SUPABASE_PUBLISHABLE_KEY` is also supported by the current frontend as a fallback-compatible publishable key name.

Supabase Auth URL configuration:

- Site URL: `https://aura-fitness-kappa.vercel.app`
- Redirect URL: `https://aura-fitness-kappa.vercel.app/**`
- Redirect URL: `http://localhost:5173/**`

Cloud sync table:

- `public.user_app_data`

If authenticated sync shows `Cloud sync is not ready yet. Check Supabase table setup.`, verify that `public.user_app_data` exists and that the documented RLS policies are enabled.

Frontend key rule:

- Use anon/public key only.
- Never expose service role key.
