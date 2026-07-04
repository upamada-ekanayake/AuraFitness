import React, { useState } from 'react';
import type { WeeklyRoutineDay, RoutineExercise } from '../../types/app';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';

export interface RoutineDayCardProps {
  day: WeeklyRoutineDay;
  onToggleRestDay: (dayId: string, isRestDay: boolean) => void;
  onUpdateFocus: (dayId: string, focus: string) => void;
  onAddExerciseClick: (dayId: string) => void;
  onEditExerciseClick: (dayId: string, exercise: RoutineExercise) => void;
  onDeleteExercise: (dayId: string, exerciseId: string) => void;
  onClearExercises: (dayId: string) => void;
}

export default function RoutineDayCard({
  day,
  onToggleRestDay,
  onUpdateFocus,
  onAddExerciseClick,
  onEditExerciseClick,
  onDeleteExercise,
  onClearExercises,
}: RoutineDayCardProps) {
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusInput, setFocusInput] = useState(day.focus);

  const handleSaveFocus = () => {
    onUpdateFocus(day.id, focusInput.trim() || 'No target focus');
    setIsEditingFocus(false);
  };

  const handleToggleRest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextRestState = e.target.checked;
    
    if (nextRestState && day.exercises.length > 0) {
      const confirmClear = window.confirm(
        `Make ${day.dayName} a recovery day? This clears ${day.exercises.length} planned exercises for that day.`
      );
      if (!confirmClear) return;
    }
    
    onToggleRestDay(day.id, nextRestState);
  };

  return (
    <Card className="flex flex-col justify-between border border-slate-900 bg-slate-900/10">
      <div>
        {/* Header: Day Name and Status Badge */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-100">{day.dayName}</h3>
          <Badge variant={day.isRestDay ? 'neutral' : 'info'}>
            {day.isRestDay ? 'Rest Day' : 'Workout Day'}
          </Badge>
        </div>

        {/* Focus Section */}
        <div className="mb-5 flex items-center justify-between gap-3 bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-900">
          {isEditingFocus ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
                placeholder="e.g. Legs Focus"
              />
              <button onClick={handleSaveFocus} className="text-emerald-400 hover:text-emerald-300">
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setFocusInput(day.focus);
                  setIsEditingFocus(false);
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-semibold text-slate-400 truncate pr-2">
                {day.isRestDay ? 'Recovery Focus' : day.focus || 'Active Focus'}
              </span>
              <button
                onClick={() => setIsEditingFocus(true)}
                className="text-slate-500 hover:text-slate-300 shrink-0 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Rest Day Switch Control */}
        <div className="flex items-center gap-2 mb-6 text-xs text-slate-400">
          <input
            type="checkbox"
            id={`rest-switch-${day.id}`}
            checked={day.isRestDay}
            onChange={handleToggleRest}
            className="w-4 h-4 accent-indigo-600 rounded-sm cursor-pointer border border-slate-700 bg-slate-950"
          />
          <label htmlFor={`rest-switch-${day.id}`} className="cursor-pointer font-semibold select-none">
            Mark as Rest Day
          </label>
        </div>

        {/* Exercises List */}
        {!day.isRestDay && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                Exercises ({day.exercises.length})
              </span>
              {day.exercises.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Clear all exercises for ${day.dayName}?`)) {
                      onClearExercises(day.id);
                    }
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {day.exercises.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
                <p className="text-sm font-bold text-slate-300">No exercises yet</p>
                <p className="text-xs text-slate-500 font-semibold mt-1 mb-4">Build this training day one movement at a time.</p>
                <Button variant="secondary" size="sm" onClick={() => onAddExerciseClick(day.id)} className="mx-auto flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add first exercise
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {day.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-slate-950/50 rounded-xl border border-slate-900/60 flex justify-between items-center group hover:border-slate-800 transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-indigo-400 transition-colors">
                        {ex.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block truncate">
                        {ex.sets} sets x {ex.mode === 'reps' ? `${ex.reps} reps` : `${ex.durationSeconds}s`}
                        {ex.weightKg ? ` @ ${ex.weightKg} kg` : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExerciseClick(day.id, ex)}
                        className="text-slate-500 hover:text-slate-200 p-1 cursor-pointer"
                        title={`Edit ${ex.name}`}
                        aria-label={`Edit ${ex.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExercise(day.id, ex.id)}
                        className="text-rose-500 hover:text-rose-300 p-1 cursor-pointer"
                        title={`Delete ${ex.name}`}
                        aria-label={`Delete ${ex.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      {!day.isRestDay && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddExerciseClick(day.id)}
          className="w-full flex items-center gap-1.5 mt-auto"
        >
          <Plus className="w-4 h-4" /> Add Exercise
        </Button>
      )}
    </Card>
  );
}
