import React from 'react';
import { Dumbbell, Calendar, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface WorkoutSummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  activeSession?: boolean;
}

export default function WorkoutSummaryCard({
  activeSession = false,
  className,
  ...props
}: WorkoutSummaryCardProps) {
  return (
    <Card
      title="Workout Session"
      subtitle={activeSession ? "Ongoing Workout Details" : "Your last workout summary"}
      className={cn('relative bg-slate-900/30 border border-slate-800/80', className)}
      {...props}
    >
      {activeSession ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Push Day (Aura Split)</span>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>42m elapsed</span>
            </div>
            <div>
              <span className="font-semibold text-slate-200">4</span> Exercises
            </div>
          </div>

          <Button size="sm" className="w-full mt-2">Resume Session</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Dumbbell className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-200 font-medium">Legs & Core Focus</span>
            </div>
            <Badge variant="neutral">Completed</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">58 minutes</span>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Energy Est.</span>
              <span className="text-sm font-bold text-rose-400 mt-1 block">415 kcal</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Yesterday at 18:30</span>
          </div>
        </div>
      )}
    </Card>
  );
}
