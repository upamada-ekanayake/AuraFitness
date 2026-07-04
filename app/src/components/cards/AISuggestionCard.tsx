import React from 'react';
import { Sparkles, Zap, Moon, Flame, Award, Lightbulb } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface AISuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message: string;
  confidence?: number;
  type?: 'exercise' | 'overload' | 'rest' | 'calorie' | 'streak' | 'motivation';
}

export default function AISuggestionCard({
  title,
  message,
  confidence,
  type = 'motivation',
  className,
  ...props
}: AISuggestionCardProps) {
  
  // Icon and theme helper based on recommendation type
  const typeConfig = {
    exercise: {
      icon: Sparkles,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      label: 'Exercise Suggestion',
    },
    overload: {
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      label: 'Progressive Overload',
    },
    rest: {
      icon: Moon,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      label: 'Recovery Insight',
    },
    calorie: {
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      label: 'Energy Burned',
    },
    streak: {
      icon: Award,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      label: 'Streak Insight',
    },
    motivation: {
      icon: Lightbulb,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      label: 'Motivation Message',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border bg-gradient-to-r from-slate-900/60 to-slate-900/40 p-6',
        config.bg,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-2xl bg-slate-950/60 shrink-0', config.color)}>
          <Icon className="w-6 h-6 animate-glow" />
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-xs font-bold tracking-wide uppercase', config.color)}>
              {config.label}
            </span>
            {confidence && (
              <Badge variant="neutral" className="text-[10px] py-0 border-slate-800">
                {Math.round(confidence * 100)}% Confidence
              </Badge>
            )}
          </div>
          
          <h4 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
            {title}
          </h4>
          
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>
    </Card>
  );
}
