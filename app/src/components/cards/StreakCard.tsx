import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import type { StreakMetric } from '../../utils/streaks';

export interface StreakCardProps {
  metric: StreakMetric;
}

export default function StreakCard({ metric }: StreakCardProps) {
  

  const textTones = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
    danger: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card className="border border-slate-900 bg-slate-950/20 p-5 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block truncate">
            {metric.label}
          </span>
          {metric.completedToday && (
            <Badge variant="success" className="text-[8px] py-0.5 px-1.5 uppercase font-bold shrink-0">
              Today
            </Badge>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-black tracking-tight', textTones[metric.tone])}>
            {metric.currentStreak}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            day streak
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-semibold gap-2">
        <span className="truncate">{metric.helper}</span>
        <span className="shrink-0 text-slate-400">Best: {metric.bestStreak}d</span>
      </div>
    </Card>
  );
}
