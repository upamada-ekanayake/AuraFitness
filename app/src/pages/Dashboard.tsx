import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import AISuggestionList from '../components/cards/AISuggestionList';
import WorkoutSummaryCard from '../components/cards/WorkoutSummaryCard';
import TrackerCard from '../components/cards/TrackerCard';
import WaterTrackerForm from '../components/forms/WaterTrackerForm';
import CalorieTrackerForm from '../components/forms/CalorieTrackerForm';
import BodyWeightForm from '../components/forms/BodyWeightForm';
import FastingTrackerForm from '../components/forms/FastingTrackerForm';
import { useAppData } from '../hooks/useAppData';
import { useAISuggestions } from '../hooks/useAISuggestions';
import { getTodayIsoDate } from '../services/appDataService';
import {
  getTodayWaterLog,
  getTodayCalorieLog,
  getLatestBodyWeightLog,
  getTodayFastingLog,
  calculateProgress,
  calculateWeightChange,
  getCalorieStatus,
} from '../utils/tracker';
import type { WaterLog, CalorieLog, BodyWeightLog, FastingLog, FastingStatus } from '../types/app';
import { Dumbbell, Heart } from 'lucide-react';

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

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading Athlete Dashboard...
      </div>
    );
  }

  const today = getTodayIsoDate();

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

  // Compute completed workouts this week
  const completedWorkoutsCount = data.workoutLogs.filter((w) => w.status === 'completed').length;

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
      {/* Greeting Header */}
      <PageHeader
        title={`Welcome back, ${profile.name}`}
        subtitle="Here is your daily fitness overview and biometric trackers."
        actions={
          <div className="flex gap-2">
            <Badge variant="success" className="animate-glow text-xs px-3 py-1 font-bold">
              Gym Streak Active
            </Badge>
          </div>
        }
      />

      {/* 4 Tracker Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
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

            <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 font-semibold">Workouts This Week</span>
                </div>
                <span className="text-slate-200 font-bold">{completedWorkoutsCount} / {profile.weeklyWorkoutGoal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-slate-400 font-semibold">Today's Fasting Progress</span>
                </div>
                <span className="text-slate-200 font-bold">{fastingLog.fastingHours} / {fastingLog.goalHours} hrs</span>
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
    </div>
  );
}
