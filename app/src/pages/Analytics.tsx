import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Badge } from '../components/ui/Badge';
import AISuggestionList from '../components/cards/AISuggestionList';
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
import { BarChart2, TrendingUp, RefreshCw, Dumbbell, Droplets, Flame, Calendar, Award } from 'lucide-react';

export default function Analytics() {
  const { data, profile, isReady } = useAppData();
  const { highPrioritySuggestions } = useAISuggestions();

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading Fitness Analytics...
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

  // Compute completed workouts this week/total
  const totalWorkoutsLogged = data.workoutLogs.length;
  const completedWorkoutsThisWeek = data.workoutLogs.filter((w) => w.status === 'completed').length;
  const weeklyWorkoutTarget = profile.weeklyWorkoutGoal;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fitness Analytics"
        subtitle="Visualize your performance progress, overload milestones, and consistency."
        actions={
          <div className="flex gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Live Updates Active
            </span>
          </div>
        }
      />

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Adherence Card */}
        <Card title="Weekly Target Adherence" subtitle="Goal completion percentage">
          <div className="flex justify-center items-center py-6">
            <ProgressRing value={completedWorkoutsThisWeek} max={weeklyWorkoutTarget} label="adherence" size={120} />
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">
            You completed {completedWorkoutsThisWeek} of {weeklyWorkoutTarget} planned sessions this week.
          </p>
        </Card>

        {/* Volume Progression placeholder */}
        <Card title="Volume Progression" subtitle="Total weight loaded over time">
          <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 mt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Volume chart placeholder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-semibold text-center leading-relaxed">
            * Interactive Recharts/ChartJS visualizations will populate this section later.
          </p>
        </Card>

        {/* Activity Split placeholder */}
        <Card title="Activity Split" subtitle="Volume by major muscle group">
          <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 mt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Split chart placeholder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-semibold text-center leading-relaxed">
            * Interactive Recharts/ChartJS visualizations will populate this section later.
          </p>
        </Card>

      </div>

      {/* AI insight summary section */}
      <AISuggestionList
        title="High Priority AI Insights"
        suggestions={highPrioritySuggestions}
        emptyMessage="No high-priority insights active. Keep tracking your parameters to populate insights!"
      />

      {/* Daily Tracker Metrics Summary Table */}
      <Card title="Biometric Tracking Summary" subtitle="Latest recorded parameters and daily compliance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-2">
          
          {/* Weight */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Award className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Weight Record</span>
            </div>
            <span className="text-lg font-bold text-slate-200 block">{latestWeightLog.weightKg} kg</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
              {hasPreviousWeight
                ? `Offset: ${weightChange > 0 ? `+${weightChange}` : weightChange} kg`
                : 'Initial reading'}
            </span>
          </div>

          {/* Water */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Droplets className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Hydration</span>
            </div>
            <span className="text-lg font-bold text-slate-200 block">{Math.round(waterLog.liters * 1000)} ml</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
              Progress: {waterProgress}% of target
            </span>
          </div>

          {/* Calories */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Energy intake</span>
            </div>
            <span className="text-lg font-bold text-slate-200 block">{calorieLog.calories} kcal</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold">
                Progress: {calorieProgress}%
              </span>
              <Badge variant={calorieStatus === 'over' ? 'danger' : calorieStatus === 'on' ? 'success' : 'warning'} className="text-[8px] py-0 px-1">
                {calorieStatus}
              </Badge>
            </div>
          </div>

          {/* Fasting */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Fasting Log</span>
            </div>
            <span className="text-lg font-bold text-slate-200 block">
              {fastingLog.status === 'not_started' ? '0 hrs' : `${fastingLog.fastingHours} hrs`}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
              Goal: {fastingLog.goalHours} hrs ({fastingProgress}%)
            </span>
          </div>

          {/* Total Workouts Logged */}
          <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Workout Volume</span>
            </div>
            <span className="text-lg font-bold text-slate-200 block">{totalWorkoutsLogged} logs</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
              Archived workouts in DB
            </span>
          </div>

        </div>
      </Card>
    </div>
  );
}
