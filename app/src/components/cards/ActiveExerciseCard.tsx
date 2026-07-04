import type { WorkoutSessionExerciseLog } from '../../types/app';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, Activity, Plus, Minus, AlertTriangle } from 'lucide-react';

export interface ActiveExerciseCardProps {
  exercise: WorkoutSessionExerciseLog;
  index: number;
  total: number;
  onChange: (updated: WorkoutSessionExerciseLog) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function ActiveExerciseCard({
  exercise,
  index,
  total,
  onChange,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: ActiveExerciseCardProps) {
  
  // Handlers to trigger onChange updates upwards
  const updateField = <K extends keyof WorkoutSessionExerciseLog>(
    field: K,
    value: WorkoutSessionExerciseLog[K]
  ) => {
    onChange({
      ...exercise,
      [field]: value,
    });
  };

  const handleIncrementSets = () => {
    if (exercise.completedSets < exercise.plannedSets) {
      updateField('completedSets', exercise.completedSets + 1);
    }
  };

  const handleDecrementSets = () => {
    if (exercise.completedSets > 0) {
      updateField('completedSets', exercise.completedSets - 1);
    }
  };

  const isRepsMode = exercise.plannedReps !== undefined;

  return (
    <Card
      title={`Exercise ${index + 1} of ${total}`}
      subtitle="Track your sets, weights, and exertion scale"
      className="border border-slate-900 bg-slate-900/10"
    >
      <div className="space-y-6">
        
        {/* Exercise Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">{exercise.name}</h3>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">
              Target Split Presets: {exercise.plannedSets} sets x {isRepsMode ? `${exercise.plannedReps} reps` : `${exercise.plannedDurationSeconds}s`}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Set Progress Incrementer */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Set Completion</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">
              {exercise.completedSets} / {exercise.plannedSets} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrementSets}
              disabled={exercise.completedSets === 0}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleIncrementSets}
              disabled={exercise.completedSets === exercise.plannedSets}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:hover:text-indigo-400 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Target Reps/Secs Input */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              {isRepsMode ? 'Completed Reps' : 'Completed Secs'}
            </label>
            <input
              type="number"
              min="0"
              value={isRepsMode ? exercise.completedReps ?? '' : exercise.completedDurationSeconds ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                updateField(isRepsMode ? 'completedReps' : 'completedDurationSeconds', val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              Used Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={exercise.weightKg ?? ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateField('weightKg', val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          
          {/* RPE Input */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              Exertion (RPE 1-10)
            </label>
            <select
              value={exercise.rpe ?? 8}
              onChange={(e) => updateField('rpe', parseInt(e.target.value) || 8)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  RPE {num} - {num === 10 ? 'Max effort' : num >= 8 ? 'Hard' : num >= 5 ? 'Moderate' : 'Easy'}
                </option>
              ))}
            </select>
          </div>

          {/* Pain reported check */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2.5 py-3 border border-slate-900/80 bg-slate-950/20 px-3 rounded-xl">
              <input
                type="checkbox"
                id="pain-checkbox"
                checked={exercise.painReported ?? false}
                onChange={(e) => updateField('painReported', e.target.checked)}
                className="w-4.5 h-4.5 accent-rose-500 rounded-sm cursor-pointer border border-slate-850 bg-slate-950"
              />
              <label htmlFor="pain-checkbox" className="text-xs text-rose-400 font-bold flex items-center gap-1 select-none cursor-pointer">
                <AlertTriangle className="w-3.5 h-3.5" />
                Report Joint Pain
              </label>
            </div>
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-900">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          <Button
            variant="secondary"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-1.5"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
