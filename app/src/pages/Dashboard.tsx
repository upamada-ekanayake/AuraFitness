import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import AISuggestionCard from '../components/cards/AISuggestionCard';
import WorkoutSummaryCard from '../components/cards/WorkoutSummaryCard';
import { Dumbbell, Droplets, Flame, Award } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Greeting and Header */}
      <PageHeader
        title="Welcome back, Athlete"
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
          value="4 / 5 sessions"
          helper="This week's target"
          icon={<Dumbbell className="w-5 h-5" />}
        />
        <StatCard
          label="Water Tracker"
          value="1,200 ml"
          helper="Goal: 2,500 ml"
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Calorie Burned"
          value="415 kcal"
          helper="Est. expenditure today"
          icon={<Flame className="w-5 h-5" />}
        />
        <StatCard
          label="Fitness Streak"
          value="12 days"
          helper="Your longest: 18 days"
          icon={<Award className="w-5 h-5" />}
        />
      </div>

      {/* Main Grid: Ring Placeholders, AI Suggestions, Workout Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Ring / Core Focus Column */}
        <div className="space-y-6">
          <Card title="Activity Rings" subtitle="Daily completion metrics">
            <div className="flex justify-around py-4">
              <ProgressRing value={48} max={100} label="water" size={100} />
              <ProgressRing value={65} max={100} label="calories" size={100} />
            </div>
            
            <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Weekly Hydration Score</span>
                <span className="text-slate-200 font-bold">82%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Active Calorie Consistency</span>
                <span className="text-slate-200 font-bold">Good</span>
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
