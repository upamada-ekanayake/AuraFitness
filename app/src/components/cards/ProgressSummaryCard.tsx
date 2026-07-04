import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface ProgressSummaryCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

export default function ProgressSummaryCard({
  label,
  value,
  helper,
  tone = 'neutral',
}: ProgressSummaryCardProps) {
  
  const textTones = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
    danger: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card className="border border-slate-900 bg-slate-950/20 p-5 flex flex-col justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
          {label}
        </span>
        <span className={cn('text-xl font-black tracking-tight block', textTones[tone])}>
          {value}
        </span>
      </div>

      {helper && (
        <div className="mt-2.5 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-semibold truncate leading-relaxed">
            {helper}
          </span>
          <Badge variant={tone} className="text-[8px] py-0 px-1 truncate max-w-full">
            {tone}
          </Badge>
        </div>
      )}
    </Card>
  );
}
