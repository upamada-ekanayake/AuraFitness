import { PageHeader } from '../components/layout/PageHeader';
import AISuggestionList from '../components/cards/AISuggestionList';
import ProgressSummaryCard from '../components/cards/ProgressSummaryCard';
import HabitScoreCard from '../components/cards/HabitScoreCard';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import SimpleLineChart from '../components/charts/SimpleLineChart';
import WorkoutHistoryCard from '../components/cards/WorkoutHistoryCard';
import HistoryListCard from '../components/cards/HistoryListCard';
import { useAppData } from '../hooks/useAppData';
import { useAISuggestions } from '../hooks/useAISuggestions';
import {
  getWorkoutCountLastNDays,
  getWorkoutCompletionByDay,
  getWaterHistory,
  getCalorieHistory,
  getFastingHistory,
  getBodyWeightHistory,
  calculateAverageWater,
  calculateAverageCalories,
  calculateWeightChangeFromHistory,
  getRecentWorkoutLogs,
} from '../utils/analytics';
import { getLatestBodyWeightLog, getCalorieStatus } from '../utils/tracker';
import { calculateAllStreaks, calculateHabitScore } from '../utils/streaks';
import { RefreshCw } from 'lucide-react';
import type { HistoryListItem } from '../components/cards/HistoryListCard';

export default function Analytics() {
  const { data, profile, isReady } = useAppData();
  const { highPrioritySuggestions } = useAISuggestions();

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading Progress Analytics...
      </div>
    );
  }

  // 1. Gather historical data from last 7 days
  const streaks = calculateAllStreaks(data);
  const habitScore = calculateHabitScore(streaks);

  const waterHist7 = getWaterHistory(data.waterLogs, 7);
  const calorieHist7 = getCalorieHistory(data.calorieLogs, 7);
  const fastingHist7 = getFastingHistory(data.fastingLogs, 7);
  const weightHist7 = getBodyWeightHistory(data.bodyWeightLogs, 7);

  // 2. Calculate summary statistics
  const workoutsLast7 = getWorkoutCountLastNDays(data.workoutLogs, 7);
  
  const avgWaterLast7 = calculateAverageWater(waterHist7);
  const avgCaloriesLast7 = calculateAverageCalories(calorieHist7);
  
  const latestWeight = getLatestBodyWeightLog(data.bodyWeightLogs) ?? {
    date: new Date().toISOString().split('T')[0],
    weightKg: profile.bodyWeightKg,
  };
  const weightChange = calculateWeightChangeFromHistory(weightHist7);
  
  // Calculate average fasting hours
  const validFastingLogs = fastingHist7.filter((f) => f.fastingHours > 0);
  const avgFastingHours =
    validFastingLogs.length > 0
      ? parseFloat((validFastingLogs.reduce((acc, curr) => acc + curr.fastingHours, 0) / validFastingLogs.length).toFixed(1))
      : 0;

  // 3. Map charts data
  const workoutChartData = getWorkoutCompletionByDay(data.workoutLogs, 7).map((d) => ({
    label: d.date,
    value: d.count,
  }));

  const waterChartData = waterHist7.map((d) => ({
    label: d.date,
    value: d.liters,
  }));

  const calorieChartData = calorieHist7.map((d) => ({
    label: d.date,
    value: d.calories,
  }));

  const weightChartData = weightHist7.map((d) => ({
    label: d.date,
    value: d.weightKg,
  }));

  const fastingChartData = fastingHist7.map((d) => ({
    label: d.date,
    value: d.fastingHours,
  }));

  // 4. Map history lists data
  const recentWorkouts = getRecentWorkoutLogs(data.workoutLogs, 5);

  const waterListItems: HistoryListItem[] = [...data.waterLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((w) => ({
      id: `water-log-${w.date}`,
      title: w.date,
      subtitle: `Target: ${w.goalLiters} L`,
      value: `${w.liters.toFixed(2)} L`,
      tone: w.liters >= w.goalLiters ? 'success' : 'info',
    }));

  const calorieListItems: HistoryListItem[] = [...data.calorieLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((c) => {
      const status = getCalorieStatus(c.calories, c.goalCalories);
      return {
        id: `calorie-log-${c.date}`,
        title: c.date,
        subtitle: `Budget: ${c.goalCalories} kcal`,
        value: `${c.calories} kcal`,
        tone: status === 'over' ? 'danger' : status === 'on' ? 'success' : 'warning',
      };
    });

  const fastingListItems: HistoryListItem[] = [...data.fastingLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((f) => ({
      id: `fasting-log-${f.date}`,
      title: f.date,
      subtitle: `Status: ${f.status} (Goal: ${f.goalHours} hrs)`,
      value: `${f.fastingHours} hrs`,
      tone: f.status === 'completed' ? 'success' : f.status === 'active' ? 'info' : 'neutral',
    }));

  const weightListItems: HistoryListItem[] = [...data.bodyWeightLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((w) => ({
      id: `weight-log-${w.date}`,
      title: w.date,
      value: `${w.weightKg} kg`,
      tone: 'neutral',
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress Analytics"
        subtitle="Track your training, hydration, nutrition, fasting, and body weight progress."
        actions={
          <div className="flex gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Live Updates Active
            </span>
          </div>
        }
      />

      {/* AI Insight Summary */}
      <AISuggestionList
        title="High Priority AI Insights"
        suggestions={highPrioritySuggestions}
        emptyMessage="No high-priority insights active. Keep tracking your parameters to populate insights!"
      />

      {/* Progress Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <HabitScoreCard
          score={habitScore.score}
          label={habitScore.label}
          helper={habitScore.helper}
          tone={habitScore.tone}
        />
        <ProgressSummaryCard
          label="Workouts (7d)"
          value={`${workoutsLast7} sessions`}
          helper={`Weekly goal: ${profile.weeklyWorkoutGoal}`}
          tone={workoutsLast7 >= profile.weeklyWorkoutGoal ? 'success' : 'info'}
        />
        <ProgressSummaryCard
          label="Avg Water (7d)"
          value={`${avgWaterLast7} L`}
          helper={`Daily Goal: ${profile.waterGoalLiters} L`}
          tone={avgWaterLast7 >= profile.waterGoalLiters ? 'success' : 'info'}
        />
        <ProgressSummaryCard
          label="Avg Calories (7d)"
          value={`${avgCaloriesLast7} kcal`}
          helper={`Goal: ${profile.calorieGoal} kcal`}
          tone={avgCaloriesLast7 > profile.calorieGoal ? 'warning' : 'success'}
        />
        <ProgressSummaryCard
          label="Body Weight"
          value={`${latestWeight.weightKg} kg`}
          helper={
            weightChange !== null
              ? `7d change: ${weightChange > 0 ? `+${weightChange}` : weightChange} kg`
              : 'Initial weigh-in trend'
          }
          tone="neutral"
        />
        <ProgressSummaryCard
          label="Avg Fasting"
          value={`${avgFastingHours} hrs`}
          helper={`Goal: ${profile.fastingGoalHours} hrs`}
          tone={avgFastingHours >= profile.fastingGoalHours ? 'success' : 'neutral'}
        />
      </div>

      {/* Custom Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <SimpleBarChart
          title="Workout Completion (7d)"
          data={workoutChartData}
          valueSuffix=" sessions"
          emptyMessage="No completed workouts logged in the last 7 days."
        />
        <SimpleBarChart
          title="Hydration Intake (7d)"
          data={waterChartData}
          valueSuffix="L"
          emptyMessage="No water intake logged in the last 7 days."
        />
        <SimpleBarChart
          title="Calorie Intake (7d)"
          data={calorieChartData}
          valueSuffix=" kcal"
          emptyMessage="No calories logged in the last 7 days."
        />
        <SimpleLineChart
          title="Body Weight Trend (7d)"
          data={weightChartData}
          valueSuffix=" kg"
          emptyMessage="No weight records logged in the last 7 days."
        />
        <SimpleBarChart
          title="Fasting Hours (7d)"
          data={fastingChartData}
          valueSuffix=" hrs"
          emptyMessage="No fasting cycles logged in the last 7 days."
        />
      </div>

      {/* History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workout History Column */}
        <div className="lg:col-span-2 space-y-6">
          <WorkoutHistoryCard logs={recentWorkouts} />
        </div>

        {/* Biometrics Histories Lists */}
        <div className="space-y-6">
          <HistoryListCard
            title="Recent Water Logs"
            items={waterListItems}
            emptyMessage="No hydration history available."
          />
          <HistoryListCard
            title="Recent Calorie Logs"
            items={calorieListItems}
            emptyMessage="No nutrition history available."
          />
          <HistoryListCard
            title="Recent Fasting Logs"
            items={fastingListItems}
            emptyMessage="No fasting history available."
          />
          <HistoryListCard
            title="Recent Weight Logs"
            items={weightListItems}
            emptyMessage="No weight history available."
          />
        </div>

      </div>
    </div>
  );
}
