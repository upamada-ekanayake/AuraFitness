import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { WorkoutSessionLog } from '../../types/app';

export interface WorkoutHistoryCardProps {
  logs: WorkoutSessionLog[];
}

export default function WorkoutHistoryCard({ logs }: WorkoutHistoryCardProps) {
  
  const getCompletedSetsCount = (log: WorkoutSessionLog) => {
    return log.exercises.reduce((acc, curr) => acc + curr.completedSets, 0);
  };

  const hasPainReported = (log: WorkoutSessionLog) => {
    return log.exercises.some((ex) => ex.painReported === true);
  };

  return (
    <Card
      title="Workout Session Logs"
      subtitle="History of training splits logged"
      className="border border-slate-900 bg-slate-950/20"
    >
      {logs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/10 text-xs text-slate-500 font-semibold leading-relaxed">
          No workout sessions logged yet. Complete a routine workout to populate your history.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const minutes = log.durationMinutes;
            const setsCount = getCompletedSetsCount(log);
            const isCompleted = log.status === 'completed';
            const pain = hasPainReported(log);
            
            return (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-950/60 transition-all duration-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-100">
                      {log.focus}
                    </span>
                    <Badge variant={isCompleted ? 'success' : 'danger'} className="text-[8px] py-0 px-1.5 uppercase font-bold">
                      {log.status}
                    </Badge>
                    {pain && (
                      <Badge variant="danger" className="text-[8px] py-0 px-1.5 uppercase font-bold">
                        Pain Reported
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {log.dayName} • {log.date}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Exercises</span>
                    <span className="text-slate-200 font-bold">{log.exercises.length} movements</span>
                  </div>
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sets</span>
                    <span className="text-slate-200 font-bold">{setsCount} tracked</span>
                  </div>
                  {isCompleted && minutes > 0 && (
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Duration</span>
                      <span className="text-indigo-400 font-bold">{minutes} mins</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
