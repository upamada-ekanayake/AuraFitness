import { Card } from '../ui/Card';

export interface WeeklyGoalCardProps {
  completed: number;
  goal: number;
  label?: string;
}

export default function WeeklyGoalCard({
  completed,
  goal,
  label = 'Weekly Workout Goal',
}: WeeklyGoalCardProps) {
  
  const percentage = goal > 0 ? Math.min(Math.round((completed / goal) * 100), 100) : 0;
  
  const getHelperText = (pct: number) => {
    if (pct >= 100) return 'Incredible work! Weekly workout targets fully satisfied.';
    if (pct >= 60) return 'Almost there! Just a couple more active splits remaining.';
    if (pct >= 20) return 'Good start. Maintain consistency to hit your weekly target.';
    return 'Plan and complete your first session of the week to activate progress.';
  };

  return (
    <Card className="border border-white/8 bg-[#10110d]/72 p-5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
            {label}
          </span>
          <span className="text-xs font-black text-stone-100 shrink-0">
            {completed} / {goal}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-violet-300 tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
            completed
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {/* Progress Bar background track */}
        <div className="w-full h-1.5 rounded-full bg-black/35 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
          {getHelperText(percentage)}
        </p>
      </div>
    </Card>
  );
}
