import type { WorkoutSessionLog } from '../../types/app';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Award, Calendar, Clock, CheckCircle2, Flame } from 'lucide-react';

export interface SessionSummaryCardProps {
  log: WorkoutSessionLog;
  className?: string;
}

export default function SessionSummaryCard({ log, className }: SessionSummaryCardProps) {
  const totalExercisesCount = log.exercises.length;
  const totalPlannedSets = log.exercises.reduce((acc, curr) => acc + curr.plannedSets, 0);
  const totalCompletedSets = log.exercises.reduce((acc, curr) => acc + curr.completedSets, 0);

  // Compute set compliance rate
  const complianceRate = totalPlannedSets > 0
    ? Math.round((totalCompletedSets / totalPlannedSets) * 100)
    : 0;
  const estimatedCalories = Math.max(Math.round(log.durationMinutes * 6.5), 25);

  return (
    <Card
      title="Workout Session Logged"
      subtitle="Your workout metrics have been safely archived to LocalStorage"
      className={`border border-emerald-500/20 bg-slate-900/10 ${className}`}
    >
      <div className="space-y-6">
        
        {/* Title splits */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100">{log.focus}</h4>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {log.date} ({log.dayName})
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Exercises</span>
            <span className="text-lg font-bold text-slate-200 block mt-1">{totalExercisesCount} completed</span>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Sets Finished</span>
            <span className="text-lg font-bold text-slate-200 block mt-1">
              {totalCompletedSets} / {totalPlannedSets}
            </span>
          </div>
        </div>

        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">Estimated Burn</span>
            <span className="text-lg font-bold text-slate-100 block mt-1 flex items-center gap-1">
              <Flame className="w-4 h-4 text-emerald-300 shrink-0" />
              {estimatedCalories} kcal
            </span>
          </div>
          <Badge variant="success">Logged</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Duration</span>
              <span className="text-lg font-bold text-slate-200 block mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                {log.durationMinutes} min
              </span>
            </div>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Compliance</span>
              <span className="text-lg font-bold text-slate-200 block mt-1 flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                {complianceRate}%
              </span>
            </div>
            <Badge variant={complianceRate >= 90 ? 'success' : complianceRate >= 60 ? 'info' : 'neutral'}>
              {complianceRate >= 90 ? 'Excellent' : complianceRate >= 60 ? 'Good' : 'Resting'}
            </Badge>
          </div>
        </div>

        {/* Detailed exercises check */}
        <div className="border-t border-slate-900 pt-4 space-y-2.5">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Movement Summary</span>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {log.exercises.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900 last:border-b-0">
                <span className="text-slate-300 font-semibold truncate pr-2">{ex.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 font-bold">{ex.completedSets} sets</span>
                  {ex.painReported && <Badge variant="danger">Pain Reported</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
