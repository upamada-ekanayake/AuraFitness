import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import AISuggestionCard from '../components/cards/AISuggestionCard';
import WorkoutSummaryCard from '../components/cards/WorkoutSummaryCard';
import { Dumbbell, Droplets, Flame, Award } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { getTodayIsoDate } from '../services/appDataService';

export default function Dashboard() {
  const { data, profile, isReady } = useAppData();

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading Athlete Profile...
      </div>
    );
  }

  const today = getTodayIsoDate();

  // Retrieve today's logs with defaults
  const todayWaterLog = data.waterLogs.find((w) => w.date === today);
  const waterVolumeMl = todayWaterLog ? Math.round(todayWaterLog.liters * 1000) : 0;
  const waterGoalMl = Math.round(profile.waterGoalLiters * 1000);

  const todayCalorieLog = data.calorieLogs.find((c) => c.date === today);
  const consumedCalories = todayCalorieLog ? todayCalorieLog.calories : 0;

  const todayFastingLog = data.fastingLogs.find((f) => f.date === today);
  const fastingHours = todayFastingLog ? todayFastingLog.fastingHours : 0;

  // Compute completed workouts this week (all logs in system since seed contains past week logs)
  const completedWorkoutsCount = data.workoutLogs.filter((w) => w.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Greeting and Header */}
      <PageHeader
        title={`Welcome back, ${profile.name}`}
        subtitle="Here is your daily fitness overview and AI suggestion cards."
        actions={
          <div className="flex gap-2">
            <Badge variant="success" className="animate-glow text-xs px-3 py-1 font-bold">
              Gym Streak Active
            </Badge>
          </div>
        }
      />

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Workouts"
          value={`${completedWorkoutsCount} / ${profile.weeklyWorkoutGoal} sessions`}
          helper="This week's progress"
          icon={<Dumbbell className="w-5 h-5" />}
        />
        <StatCard
          label="Water Tracker"
          value={`${waterVolumeMl} ml`}
          helper={`Goal: ${waterGoalMl} ml`}
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Calorie Burned"
          value={`${consumedCalories} kcal`}
          helper={`Limit: ${profile.calorieGoal} kcal`}
          icon={<Flame className="w-5 h-5" />}
        />
        <StatCard
          label="Body Weight"
          value={`${profile.bodyWeightKg} kg`}
          helper="Goal: fat loss"
          icon={<Award className="w-5 h-5" />}
        />
      </div>

      {/* Main Grid: Ring Placeholders, AI Suggestions, Workout Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Ring / Core Focus Column */}
        <div className="space-y-6">
          <Card title="Activity Rings" subtitle="Daily completion metrics">
            <div className="flex justify-around py-4">
              <ProgressRing value={waterVolumeMl} max={waterGoalMl} label="water" size={100} />
              <ProgressRing value={consumedCalories} max={profile.calorieGoal} label="calories" size={100} />
            </div>
            
            <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Active Fasting Duration</span>
                <span className="text-slate-200 font-bold">{fastingHours} / {profile.fastingGoalHours} hours</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Calorie Budget Remainder</span>
                <span className="text-slate-200 font-bold">{Math.max(profile.calorieGoal - consumedCalories, 0)} kcal</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Recommendations Column */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">AI Insights</h3>
            
            <AISuggestionCard
              type="overload"
              title="Time to progress: Bench Press weight increase"
              message="You successfully hit all 12 reps at RPE 8 on your last workout. We suggest adding 2.5 kg to your next session for progressive overload."
              confidence={0.85}
            />

            <AISuggestionCard
              type="rest"
              title="Avoid shoulder training today"
              message="Your shoulders have had high workout volume over the last 48 hours. Focus on lower body training or active rest for recovery."
              confidence={0.92}
            />
          </div>

          {/* Workout Summary Card integrated in layout */}
          <WorkoutSummaryCard className="mt-4 lg:mt-0" />
        </div>
      </div>
    </div>
  );
}
