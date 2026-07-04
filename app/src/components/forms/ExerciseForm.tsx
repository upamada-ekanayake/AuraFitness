import React, { useState, useEffect } from 'react';
import type { RoutineExercise, ExerciseMode } from '../../types/app';
import { Button } from '../ui/Button';

export interface ExerciseFormProps {
  initialValues?: RoutineExercise;
  onSubmit: (values: Omit<RoutineExercise, 'id'>) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ initialValues, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [mode, setMode] = useState<ExerciseMode>('reps');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [restSeconds, setRestSeconds] = useState(60);
  const [error, setError] = useState('');

  // Hydrate form if editing
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setBodyPart(initialValues.bodyPart);
      setTargetMuscle(initialValues.targetMuscle);
      setEquipment(initialValues.equipment);
      setMode(initialValues.mode);
      setSets(initialValues.sets);
      if (initialValues.reps !== undefined) setReps(initialValues.reps);
      if (initialValues.durationSeconds !== undefined) setDurationSeconds(initialValues.durationSeconds);
      setWeightKg(initialValues.weightKg !== undefined ? initialValues.weightKg : '');
      setRestSeconds(initialValues.restSeconds);
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!name.trim()) return setError('Exercise name is required.');
    if (!bodyPart.trim()) return setError('Body part target is required.');
    if (!targetMuscle.trim()) return setError('Target muscle is required.');
    if (!equipment.trim()) return setError('Equipment is required.');
    if (sets < 1) return setError('Sets must be at least 1.');
    if (mode === 'reps' && reps < 1) return setError('Reps must be at least 1.');
    if (mode === 'time' && durationSeconds < 1) return setError('Time must be at least 1 second.');
    if (typeof weightKg === 'number' && weightKg < 0) return setError('Weight cannot be negative.');
    if (restSeconds < 0) return setError('Rest time cannot be negative.');

    const exerciseData: Omit<RoutineExercise, 'id'> = {
      name: name.trim(),
      bodyPart: bodyPart.trim(),
      targetMuscle: targetMuscle.trim(),
      equipment: equipment.trim(),
      mode,
      sets,
      restSeconds,
      ...(mode === 'reps' ? { reps } : { durationSeconds }),
      ...(typeof weightKg === 'number' ? { weightKg } : {}),
    };

    onSubmit(exerciseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {error && (
        <div className="p-3 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Exercise Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bench Press, Squat, Plank"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Body Part</label>
            <input
              type="text"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              placeholder="e.g. Chest, Legs"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Target Muscle</label>
            <input
              type="text"
              value={targetMuscle}
              onChange={(e) => setTargetMuscle(e.target.value)}
              placeholder="e.g. Pectorals, Quads"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Equipment</label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g. Barbell, Bodyweight"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Exercise Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ExerciseMode)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="reps">Reps-based</option>
              <option value="time">Time-based</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Metrics */}
      <div className="border-t border-slate-900 pt-4 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Sets</label>
          <input
            type="number"
            min="1"
            max="15"
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 text-center"
          />
        </div>

        {mode === 'reps' ? (
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Reps</label>
            <input
              type="number"
              min="1"
              max="150"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 text-center"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Secs</label>
            <input
              type="number"
              min="1"
              max="3600"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 text-center"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Weight (kg)</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={weightKg}
            onChange={(e) => {
              if (e.target.value === '') {
                setWeightKg('');
                return;
              }
              setWeightKg(parseFloat(e.target.value));
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 text-center"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider font-bold mb-1.5">Rest Interval (sec)</label>
        <input
          type="number"
          min="0"
          value={restSeconds}
          onChange={(e) => setRestSeconds(parseInt(e.target.value) || 0)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialValues ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  );
}
