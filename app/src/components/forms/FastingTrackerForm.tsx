import type { FastingStatus } from '../../types/app';
import { Button } from '../ui/Button';

export interface FastingTrackerFormProps {
  currentStatus: FastingStatus;
  currentHours: number;
  onChangeStatus: (status: FastingStatus) => void;
  onChangeHours: (hours: number) => void;
}

export default function FastingTrackerForm({
  currentStatus,
  currentHours,
  onChangeStatus,
  onChangeHours,
}: FastingTrackerFormProps) {
  
  const handleHoursIncrement = (diff: number) => {
    const next = Math.max(currentHours + diff, 0);
    onChangeHours(parseFloat(next.toFixed(1)));
  };

  return (
    <div className="space-y-4">
      
      {/* Fasting Status Toggles */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900">
        {(['not_started', 'active', 'completed'] as FastingStatus[]).map((status) => {
          const isSelected = currentStatus === status;
          
          return (
            <button
              key={status}
              type="button"
              onClick={() => onChangeStatus(status)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center capitalize transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Adjust Duration Hours */}
      {currentStatus !== 'not_started' && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-[10px] text-slate-400 font-semibold">Elapsed Hours</span>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleHoursIncrement(-0.5)}
              disabled={currentHours <= 0}
              className="py-1 px-2.5 min-h-0 text-[10px]"
            >
              -0.5h
            </Button>
            <span className="text-xs text-slate-200 font-bold w-12 text-center">
              {currentHours}h
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleHoursIncrement(0.5)}
              disabled={currentHours >= 48}
              className="py-1 px-2.5 min-h-0 text-[10px]"
            >
              +0.5h
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
