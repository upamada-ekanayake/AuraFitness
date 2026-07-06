# AuraFitness Supabase Schema Plan

This is a planned offline-first schema. Do not apply it destructively to production without review.

Supabase notes checked July 2026:

- Public tables may require explicit `grant` statements to be exposed through the Data API.
- Enable RLS on every user-data table in `public`.
- Use `to authenticated` with `(select auth.uid()) = user_id` ownership checks.
- Update policies need both `using` and `with check`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the Vite client.

## Tables

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  body_weight_kg numeric(6,2),
  height_cm numeric(6,2),
  goal text not null check (goal in ('fat_loss', 'muscle_gain', 'maintenance', 'strength')),
  weekly_workout_goal integer not null default 5,
  water_goal_ml integer not null default 3000,
  calorie_goal integer not null default 2200,
  fasting_goal_hours numeric(4,1) not null default 16,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_name text not null,
  focus text not null,
  is_rest_day boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  name text not null,
  body_part text not null,
  target_muscle text not null,
  equipment text not null,
  mode text not null check (mode in ('reps', 'time')),
  sets integer not null,
  reps integer,
  duration_seconds integer,
  weight_kg numeric(6,2),
  rest_seconds integer not null default 60,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete set null,
  session_date date not null,
  status text not null check (status in ('planned', 'completed', 'skipped', 'cancelled')),
  focus text not null,
  duration_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  set_index integer not null,
  reps integer,
  duration_seconds integer,
  weight_kg numeric(6,2),
  rpe integer check (rpe between 1 and 10),
  pain_reported boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  amount_ml integer not null check (amount_ml >= 0),
  goal_ml integer not null default 3000,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.calorie_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  meal_name text not null,
  calories integer not null check (calories > 0),
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fat_g numeric(6,2),
  created_at timestamptz not null default now()
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_date date not null,
  type text not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  title text not null,
  message text not null,
  confidence numeric(3,2),
  reason_codes text[] not null default '{}',
  created_at timestamptz not null default now()
);
```

## Indexes

```sql
create index routines_user_day_idx on public.routines(user_id, day_name);
create index routine_exercises_user_routine_idx on public.routine_exercises(user_id, routine_id);
create index workout_sessions_user_date_idx on public.workout_sessions(user_id, session_date desc);
create index workout_sets_user_session_idx on public.workout_sets(user_id, workout_session_id);
create index water_logs_user_date_idx on public.water_logs(user_id, log_date desc);
create index calorie_entries_user_date_idx on public.calorie_entries(user_id, entry_date desc);
create index ai_insights_user_date_idx on public.ai_insights(user_id, insight_date desc);
```

## Grants And RLS Pattern

Apply this pattern for each user-owned table.

```sql
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.routines to authenticated;
grant select, insert, update, delete on public.routine_exercises to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.workout_sets to authenticated;
grant select, insert, update, delete on public.water_logs to authenticated;
grant select, insert, update, delete on public.calorie_entries to authenticated;
grant select, insert, update, delete on public.ai_insights to authenticated;

alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.water_logs enable row level security;
alter table public.calorie_entries enable row level security;
alter table public.ai_insights enable row level security;
```

For each table, create policies:

```sql
create policy "Users can read own rows"
on public.TABLE_NAME for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own rows"
on public.TABLE_NAME for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own rows"
on public.TABLE_NAME for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own rows"
on public.TABLE_NAME for delete
to authenticated
using ((select auth.uid()) = user_id);
```
