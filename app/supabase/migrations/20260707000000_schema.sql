-- AuraFitness Supabase Migration Schema
-- Generated: 2026-07-07

-- Clean Reset Option: Drop all existing tables first
drop table if exists public.user_app_data cascade;
drop table if exists public.ai_insights cascade;
drop table if exists public.calorie_entries cascade;
drop table if exists public.water_logs cascade;
drop table if exists public.workout_sets cascade;
drop table if exists public.workout_sessions cascade;
drop table if exists public.routine_exercises cascade;
drop table if exists public.routines cascade;
drop table if exists public.profiles cascade;

-- Create Profiles Table
create table if not exists public.profiles (
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

-- Create Routines Table
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_name text not null,
  focus text not null,
  is_rest_day boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create Routine Exercises Table
create table if not exists public.routine_exercises (
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

-- Create Workout Sessions Table
create table if not exists public.workout_sessions (
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

-- Create Workout Sets Table
create table if not exists public.workout_sets (
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

-- Create Water Logs Table
create table if not exists public.water_logs (
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

-- Create Calorie Entries Table
create table if not exists public.calorie_entries (
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

-- Create AI/Coach Insights Table
create table if not exists public.ai_insights (
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

-- User App Data Table for full JSONB backup
create table if not exists public.user_app_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Create Indexes
create index if not exists routines_user_day_idx on public.routines(user_id, day_name);
create index if not exists routine_exercises_user_routine_idx on public.routine_exercises(user_id, routine_id);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions(user_id, session_date desc);
create index if not exists workout_sets_user_session_idx on public.workout_sets(user_id, workout_session_id);
create index if not exists water_logs_user_date_idx on public.water_logs(user_id, log_date desc);
create index if not exists calorie_entries_user_date_idx on public.calorie_entries(user_id, entry_date desc);
create index if not exists ai_insights_user_date_idx on public.ai_insights(user_id, insight_date desc);

-- RLS Enablement
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.water_logs enable row level security;
alter table public.calorie_entries enable row level security;
alter table public.ai_insights enable row level security;
alter table public.user_app_data enable row level security;

-- Authenticated Users Permissions
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.routines to authenticated;
grant select, insert, update, delete on public.routine_exercises to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.workout_sets to authenticated;
grant select, insert, update, delete on public.water_logs to authenticated;
grant select, insert, update, delete on public.calorie_entries to authenticated;
grant select, insert, update, delete on public.ai_insights to authenticated;
grant select, insert, update, delete on public.user_app_data to authenticated;

-- Policies Setup
-- Profiles Policies
create policy "Users can read own profiles" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own profiles" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own profiles" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own profiles" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

-- Routines Policies
create policy "Users can read own routines" on public.routines for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own routines" on public.routines for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own routines" on public.routines for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own routines" on public.routines for delete to authenticated using ((select auth.uid()) = user_id);

-- Routine Exercises Policies
create policy "Users can read own routine exercises" on public.routine_exercises for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own routine exercises" on public.routine_exercises for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own routine exercises" on public.routine_exercises for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own routine exercises" on public.routine_exercises for delete to authenticated using ((select auth.uid()) = user_id);

-- Workout Sessions Policies
create policy "Users can read own workout sessions" on public.workout_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own workout sessions" on public.workout_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own workout sessions" on public.workout_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own workout sessions" on public.workout_sessions for delete to authenticated using ((select auth.uid()) = user_id);

-- Workout Sets Policies
create policy "Users can read own workout sets" on public.workout_sets for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own workout sets" on public.workout_sets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own workout sets" on public.workout_sets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own workout sets" on public.workout_sets for delete to authenticated using ((select auth.uid()) = user_id);

-- Water Logs Policies
create policy "Users can read own water logs" on public.water_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own water logs" on public.water_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own water logs" on public.water_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own water logs" on public.water_logs for delete to authenticated using ((select auth.uid()) = user_id);

-- Calorie Entries Policies
create policy "Users can read own calorie entries" on public.calorie_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own calorie entries" on public.calorie_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own calorie entries" on public.calorie_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own calorie entries" on public.calorie_entries for delete to authenticated using ((select auth.uid()) = user_id);

-- AI Insights Policies
create policy "Users can read own ai insights" on public.ai_insights for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own ai insights" on public.ai_insights for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own ai insights" on public.ai_insights for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own ai insights" on public.ai_insights for delete to authenticated using ((select auth.uid()) = user_id);

-- User App Data Policies
create policy "Users can read own app data" on public.user_app_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own app data" on public.user_app_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own app data" on public.user_app_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own app data" on public.user_app_data for delete to authenticated using ((select auth.uid()) = user_id);
