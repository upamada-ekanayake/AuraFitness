import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import AISuggestionList from '../components/cards/AISuggestionList';
import WorkoutSummaryCard from '../components/cards/WorkoutSummaryCard';
import TrackerCard from '../components/cards/TrackerCard';
import WeeklyGoalCard from '../components/cards/WeeklyGoalCard';
import HabitScoreCard from '../components/cards/HabitScoreCard';
import StreakCard from '../components/cards/StreakCard';
import WaterTrackerForm from '../components/forms/WaterTrackerForm';
import CalorieTrackerForm from '../components/forms/CalorieTrackerForm';
import BodyWeightForm from '../components/forms/BodyWeightForm';
import FastingTrackerForm from '../components/forms/FastingTrackerForm';
import { useAppData } from '../hooks/useAppData';
import { useAISuggestions } from '../hooks/useAISuggestions';
import { getTodayIsoDate } from '../services/appDataService';
import { getTodayDayName } from '../utils/date';
import {
  getTodayWaterLog,
  getTodayCalorieLog,
  getLatestBodyWeightLog,
  getTodayFastingLog,
  calculateProgress,
  calculateWeightChange,
  getCalorieStatus,
} from '../utils/tracker';
import { calculateAllStreaks, calculateHabitScore } from '../utils/streaks';
import type { WaterLog, CalorieLog, BodyWeightLog, FastingLog, FastingStatus } from '../types/app';
import { ArrowRight, Droplets, Dumbbell, Flame, Heart, Sparkles } from 'lucide-react';
import { useCloudSync } from '../hooks/useCloudSync';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { getRuntimePlatform, isNativeAndroidApp } from '../utils/platform';
import { Link } from 'react-router-dom';
import { useActiveWorkoutSession } from '../hooks/useActiveWorkoutSession';
import { getActiveSessionProgress } from '../services/activeWorkoutSessionService';

type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export default function Dashboard() {
  const {
    data,
    profile,
    isReady,
    upsertWater,
    upsertCalories,
    upsertBodyWeight,
    upsertFasting,
  } = useAppData();

  const { topSuggestions } = useAISuggestions();
  const { syncState } = useCloudSync();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const { session } = useActiveWorkoutSession();
  const isNative = isNativeAndroidApp();

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-stone-400 font-semibold">
        Loading training log...
      </div>
    );
  }

  const today = getTodayIsoDate();
  const todayName = getTodayDayName();
  const todayRoutine = data.weeklyRoutine.find((day) => day.dayName === todayName);
  const isWorkoutDay = Boolean(todayRoutine && !todayRoutine.isRestDay && todayRoutine.exercises.length > 0);
  const platform = getRuntimePlatform();
  const syncBadgeVariant: BadgeVariant =
    syncState.status === 'synced'
      ? 'success'
      : syncState.status === 'error'
      ? 'danger'
      : syncState.mode === 'demo_mode'
      ? 'warning'
      : 'neutral';
  const syncBadgeText =
    syncState.status === 'synced'
      ? 'Cloud synced'
      : syncState.status === 'error'
      ? 'Sync error'
      : syncState.mode === 'demo_mode'
      ? 'Demo mode'
      : 'Local only';
  const modeBadges: { text: string; variant: BadgeVariant }[] = [
    { text: syncBadgeText, variant: syncBadgeVariant },
    ...(isNative ? [{ text: 'Native Android', variant: 'info' as const }] : []),
    ...(platform === 'pwa' ? [{ text: 'Installed PWA', variant: 'info' as const }] : []),
  ];

  const streaks = calculateAllStreaks(data);
  const habitScore = calculateHabitScore(streaks);

  // Retrieve today's hydration logs
  const waterLog = getTodayWaterLog(data.waterLogs, today) ?? {
    date: today,
    liters: 0,
    goalLiters: profile.waterGoalLiters,
  };
  const waterVolumeMl = Math.round(waterLog.liters * 1000);
  const waterGoalMl = Math.round(waterLog.goalLiters * 1000);
  const waterProgress = calculateProgress(waterLog.liters, waterLog.goalLiters);

  // Retrieve today's calorie logs
  const calorieLog = getTodayCalorieLog(data.calorieLogs, today) ?? {
    date: today,
    calories: 0,
    goalCalories: profile.calorieGoal,
  };
  const calorieProgress = calculateProgress(calorieLog.calories, calorieLog.goalCalories);
  const calorieStatus = getCalorieStatus(calorieLog.calories, calorieLog.goalCalories);

  // Retrieve latest weight log & change offsets
  const latestWeightLog = getLatestBodyWeightLog(data.bodyWeightLogs) ?? {
    date: today,
    weightKg: profile.bodyWeightKg,
  };
  const { change: weightChange, hasPrevious: hasPreviousWeight } = calculateWeightChange(data.bodyWeightLogs);

  // Retrieve today's fasting logs
  const fastingLog = getTodayFastingLog(data.fastingLogs, today) ?? {
    date: today,
    status: 'not_started' as const,
    fastingHours: 0,
    goalHours: profile.fastingGoalHours,
  };
  const fastingProgress = calculateProgress(fastingLog.fastingHours, fastingLog.goalHours);

  const activeProgress = session ? getActiveSessionProgress(session) : 0;

  // Compute completed workouts this week
  const completedWorkoutsCount = data.workoutLogs.filter((w) => w.status === 'completed').length;
  const nextBestAction = session
    ? {
        title: 'Resume active workout',
        helper: `Active session of ${session.focus} is at ${activeProgress}% progress.`,
        cta: 'Resume Workout',
        to: '/session',
        icon: Dumbbell,
      }
    : isWorkoutDay
    ? { title: 'Start today strong', helper: `${todayRoutine?.focus} is ready.`, cta: 'Start Workout', to: '/session', icon: Dumbbell }
    : waterProgress < 70
    ? { title: 'Hydration is the next win', helper: `Drink ${Math.max(waterGoalMl - waterVolumeMl, 0)} ml more today.`, cta: 'Log Water', to: '/', icon: Droplets }
    : syncState.mode === 'cloud_enabled' && syncState.status !== 'synced'
    ? { title: 'Keep your cloud copy fresh', helper: 'Open Settings to sync this device.', cta: 'Sync Data', to: '/settings', icon: Sparkles }
    : { title: 'Tune your plan', helper: 'Review your weekly split and keep it current.', cta: 'Go Planner', to: '/routine', icon: Flame };
  const NextActionIcon = nextBestAction.icon;

  // Dispatch Handlers
  const handleWaterAdd = (liters: number) => {
    const newLog: WaterLog = {
      ...waterLog,
      liters: parseFloat((waterLog.liters + liters).toFixed(2)),
    };
    upsertWater(newLog);
  };

  const handleWaterSet = (liters: number) => {
    const newLog: WaterLog = {
      ...waterLog,
      liters,
    };
    upsertWater(newLog);
  };

  const handleCalorieAdd = (calories: number) => {
    const newLog: CalorieLog = {
      ...calorieLog,
      calories: calorieLog.calories + calories,
    };
    upsertCalories(newLog);
  };

  const handleCalorieSet = (calories: number) => {
    const newLog: CalorieLog = {
      ...calorieLog,
      calories,
    };
    upsertCalories(newLog);
  };

  const handleWeightSubmit = (weightKg: number) => {
    const newLog: BodyWeightLog = {
      date: today,
      weightKg,
    };
    upsertBodyWeight(newLog);
  };

  const handleFastingStatusChange = (status: FastingStatus) => {
    const newLog: FastingLog = {
      ...fastingLog,
      status,
      // Reset hours to 0 if canceling, or set to goal if completed
      fastingHours: status === 'not_started' ? 0 : status === 'completed' ? fastingLog.goalHours : fastingLog.fastingHours,
    };
    upsertFasting(newLog);
  };

  const handleFastingHoursChange = (fastingHours: number) => {
    const newLog: FastingLog = {
      ...fastingLog,
      fastingHours,
    };
    upsertFasting(newLog);
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10110d]/88 p-5 sm:p-7 shadow-2xl shadow-black/25">
        <div className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full bg-[#ff6b35]/18 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-48 w-48 rounded-full bg-[#c6ff00]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {modeBadges.map((badge) => (
                <Badge key={badge.text} variant={badge.variant} className="text-xs px-3 py-1 font-bold">
                  {badge.text}
                </Badge>
              ))}
              <Badge variant={isWorkoutDay ? 'success' : 'neutral'} className="text-xs px-3 py-1 font-bold">
                {isWorkoutDay ? 'Workout day' : 'Recovery day'}
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-100 tracking-tight leading-[0.95]">
              {isWorkoutDay ? 'Today has a clear lane.' : 'Recovery still counts.'}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-400 font-medium max-w-2xl leading-relaxed">
              Welcome back, <span className="text-stone-100 font-bold">{profile.name}</span>.{' '}
              {isWorkoutDay
                ? `${todayName} is set for ${todayRoutine?.focus}.`
                : `${todayName} is lighter today. Keep recovery, hydration, and nutrition steady.`}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[340px]">
            <div className="rounded-2xl border border-white/10 bg-black/24 px-3 py-3">
              <span className="block text-[10px] font-bold uppercase text-stone-500">Water</span>
              <span className="text-lg font-black text-[#d9ff55]">{waterProgress}%</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/24 px-3 py-3">
              <span className="block text-[10px] font-bold uppercase text-stone-500">Fasting</span>
              <span className="text-lg font-black text-stone-100">{fastingProgress}%</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/24 px-3 py-3">
              <span className="block text-[10px] font-bold uppercase text-stone-500">Week</span>
              <span className="text-lg font-black text-[#5eead4]">{completedWorkoutsCount}/{profile.weeklyWorkoutGoal}</span>
            </div>
          </div>
        </div>
      </section>

      {session && (
        <div className="relative overflow-hidden rounded-[2rem] border border-[#c6ff00]/25 bg-[#c6ff00]/8 p-5 sm:p-7 shadow-xl shadow-black/15 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#c6ff00]/10 blur-2xl" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c6ff00]/12 px-3 py-1 text-xs font-bold text-[#d9ff55] border border-[#c6ff00]/20 animate-pulse">
              Active Workout Session
            </span>
            <h2 className="text-2xl font-black text-stone-100 mt-3 tracking-tight">{session.focus}</h2>
            <p className="text-sm font-semibold text-stone-400 mt-1">
              You are currently at exercise {session.currentExerciseIndex + 1} of {session.exercises.length} · {activeProgress}% complete
            </p>
            <div className="mt-3 max-w-xs h-1.5 rounded-full bg-black/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#c6ff00] to-[#14b8a6]" style={{ width: `${activeProgress}%` }} />
            </div>
          </div>
          <Link to="/session" className="shrink-0 z-10">
            <Button variant="primary" className="shadow-lg shadow-[#c6ff00]/10 w-full sm:w-auto">
              Resume Workout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {canInstall && !isInstalled && !isNative && (
        <Card className="border-[#c6ff00]/20 bg-[#c6ff00]/6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-stone-100 tracking-tight">Install AuraFitness</h2>
              <p className="text-xs font-semibold text-stone-400 mt-1">
                Install AuraFitness for a better mobile experience.
              </p>
            </div>
            <Button type="button" variant="primary" size="sm" onClick={() => void promptInstall()} className="shrink-0">
              Install app
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-[#c6ff00]/18 bg-[#c6ff00]/6">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-28 bg-gradient-to-l from-[#c6ff00]/8 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant={session ? 'success' : isWorkoutDay ? 'success' : 'neutral'} className="mb-3">
                {session ? 'Workout in progress' : 'Today plan'}
              </Badge>
              <h2 className="text-xl font-black text-stone-100 tracking-tight">
                {session ? session.focus : todayRoutine?.focus ?? 'Plan your first routine'}
              </h2>
              <p className="text-sm text-stone-400 font-semibold mt-2">
                {session
                  ? `Active session: ${session.exercises.length} exercises · ${activeProgress}% complete`
                  : todayRoutine
                  ? `${todayRoutine.exercises.length} exercises planned for ${todayName}.`
                  : 'Create a weekly split to unlock session tracking.'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-black/35 border border-white/10 flex items-center justify-center text-[#d9ff55] shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <Link to={session || isWorkoutDay ? '/session' : '/routine'}>
              <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2">
                {session ? 'Resume Workout' : isWorkoutDay ? 'Start Workout' : 'Go Planner'} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-[#14b8a6]/18 bg-[#14b8a6]/6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#5eead4] shrink-0">
              <NextActionIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <Badge variant="info" className="mb-3">Next best action</Badge>
              <h2 className="text-xl font-black text-stone-100 tracking-tight">{nextBestAction.title}</h2>
              <p className="text-sm text-stone-400 font-semibold mt-2">{nextBestAction.helper}</p>
            </div>
          </div>
          <div className="mt-5">
            <Link to={nextBestAction.to}>
              <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-2">
                {nextBestAction.cta} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Habit Score & Weekly Goal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeeklyGoalCard
          completed={completedWorkoutsCount}
          goal={profile.weeklyWorkoutGoal}
        />
        <HabitScoreCard
          score={habitScore.score}
          label={habitScore.label}
          helper={habitScore.helper}
          tone={habitScore.tone}
        />
      </div>

      {/* 4 Tracker Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Hydration Tracker */}
        <TrackerCard
          title="Water Intake"
          subtitle="Daily Hydration Progress"
          value={`${waterVolumeMl} ml`}
          helper={`Goal: ${waterGoalMl} ml`}
          progress={waterProgress}
          tone={waterProgress >= 100 ? 'success' : 'info'}
        >
          <WaterTrackerForm
            onAdd={handleWaterAdd}
            onSet={handleWaterSet}
          />
        </TrackerCard>

        {/* Calories Tracker */}
        <TrackerCard
          title="Calorie Intake"
          subtitle="Daily Calorie Budget"
          value={`${calorieLog.calories} kcal`}
          helper={`Limit: ${calorieLog.goalCalories} kcal`}
          progress={calorieProgress}
          tone={calorieStatus === 'over' ? 'danger' : calorieStatus === 'on' ? 'success' : 'warning'}
        >
          <CalorieTrackerForm
            onAdd={handleCalorieAdd}
            onSet={handleCalorieSet}
          />
        </TrackerCard>

        {/* Weight Tracker */}
        <TrackerCard
          title="Body Weight"
          subtitle="Daily Weight Logger"
          value={`${latestWeightLog.weightKg} kg`}
          helper={
            hasPreviousWeight
              ? `Change: ${weightChange > 0 ? `+${weightChange}` : weightChange} kg`
              : 'Initial logging record'
          }
          progress={latestWeightLog.weightKg > 0 ? 100 : 0}
          tone="neutral"
        >
          <BodyWeightForm
            latestWeightKg={latestWeightLog.weightKg}
            onSubmit={handleWeightSubmit}
          />
        </TrackerCard>

        {/* Fasting Tracker */}
        <TrackerCard
          title="Fasting Tracker"
          subtitle="Fasting Status Overview"
          value={
            fastingLog.status === 'not_started'
              ? 'Not Started'
              : `${fastingLog.fastingHours} hours`
          }
          helper={
            fastingLog.status === 'active'
              ? 'Fasting is currently active'
              : fastingLog.status === 'completed'
              ? 'Fasting target completed'
              : 'Start fasting timer below'
          }
          progress={fastingProgress}
          tone={fastingLog.status === 'completed' ? 'success' : fastingLog.status === 'active' ? 'info' : 'neutral'}
        >
          <FastingTrackerForm
            currentStatus={fastingLog.status}
            currentHours={fastingLog.fastingHours}
            onChangeStatus={handleFastingStatusChange}
            onChangeHours={handleFastingHoursChange}
          />
        </TrackerCard>

      </div>

      {/* Main Grid: Activity Rings, Recommendations, and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Rings summary Card */}
        <div className="space-y-6">
          <Card title="Activity Overview" subtitle="Daily completion metrics">
            <div className="flex justify-around py-4">
              <ProgressRing value={waterVolumeMl} max={waterGoalMl} label="water" size={100} />
              <ProgressRing value={calorieLog.calories} max={calorieLog.goalCalories} label="calories" size={100} />
            </div>

            <div className="border-t border-white/8 pt-4 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-stone-400 font-semibold">Workouts This Week</span>
                </div>
                <span className="text-stone-200 font-bold">{completedWorkoutsCount} / {profile.weeklyWorkoutGoal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#ff4d6d]" />
                  <span className="text-stone-400 font-semibold">Today's Fasting Progress</span>
                </div>
                <span className="text-stone-200 font-bold">{fastingLog.fastingHours} / {fastingLog.goalHours} hrs</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Recommendations Column */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <AISuggestionList title="AI Insights" suggestions={topSuggestions} />
          <WorkoutSummaryCard className="mt-4 lg:mt-0" />
        </div>

      </div>

      {/* Active Streak Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-100 tracking-tight">Active habit streaks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {streaks.map((str) => (
            <StreakCard key={str.kind} metric={str} />
          ))}
        </div>
      </div>
    </div>
  );
}
