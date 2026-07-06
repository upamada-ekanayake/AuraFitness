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
    success: 'text-violet-300',
    warning: 'text-[#ffc84a]',
    info: 'text-fuchsia-300',
    danger: 'text-[#ff8aa0]',
    neutral: 'text-stone-400',
  };

  const barTones = {
    success: 'from-violet-500 to-fuchsia-500',
    warning: 'from-[#ffb000] to-[#ff6b35]',
    info: 'from-fuchsia-500 to-indigo-500',
    danger: 'from-[#ff4d6d] to-[#fb7185]',
    neutral: 'from-stone-600 to-stone-700',
  };

  return (
    <Card className="border border-white/8 bg-[#10110d]/72 p-5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
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
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
            / 100 pts
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {/* Progress Bar background track */}
        <div className="w-full h-1.5 rounded-full bg-black/35 overflow-hidden">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out', barTones[tone])}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
          {helper}
        </p>
      </div>
    </Card>
  );
}
