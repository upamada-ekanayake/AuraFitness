import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface HabitScoreCardProps {
  score: number;
  label: string;
  helper: string;
  tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

export default function HabitScoreCard({
  score,
  label,
  helper,
  tone,
}: HabitScoreCardProps) {
  
  const textTones = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
    danger: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  const barTones = {
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    info: 'from-indigo-500 to-purple-500',
    danger: 'from-rose-500 to-pink-500',
    neutral: 'from-slate-600 to-slate-700',
  };

  return (
    <Card className="border border-slate-900 bg-slate-950/20 p-5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            Habit Consistency Score
          </span>
          <Badge variant={tone} className="text-[8px] py-0.5 px-1.5 uppercase font-bold shrink-0">
            {label}
          </Badge>
        </div>

        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-black tracking-tight', textTones[tone])}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            / 100 pts
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {/* Progress Bar background track */}
        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out', barTones[tone])}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          {helper}
        </p>
      </div>
    </Card>
  );
}
