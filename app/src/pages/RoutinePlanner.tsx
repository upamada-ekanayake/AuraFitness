import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import RoutineDayCard from '../components/cards/RoutineDayCard';
import ExerciseForm from '../components/forms/ExerciseForm';
import { useAppData } from '../hooks/useAppData';
import { createId } from '../utils/id';
import {
  toggleRestDay,
  updateRoutineDay,
  addExerciseToDay,
  updateExerciseInDay,
  deleteExerciseFromDay,
} from '../utils/routine';
import type { RoutineExercise, WeeklyRoutineDay } from '../types/app';
import { Sparkles } from 'lucide-react';

const quickTemplates: Record<string, Omit<RoutineExercise, 'id'>[]> = {
  'Push Day': [
    { name: 'Dumbbell Bench Press', bodyPart: 'Chest', targetMuscle: 'Pectorals', equipment: 'Dumbbells', mode: 'reps', sets: 3, reps: 10, weightKg: 20, restSeconds: 90 },
    { name: 'Seated Shoulder Press', bodyPart: 'Shoulders', targetMuscle: 'Deltoids', equipment: 'Dumbbells', mode: 'reps', sets: 3, reps: 10, weightKg: 14, restSeconds: 75 },
    { name: 'Cable Triceps Pushdown', bodyPart: 'Arms', targetMuscle: 'Triceps', equipment: 'Cable', mode: 'reps', sets: 3, reps: 12, restSeconds: 60 },
  ],
  'Pull Day': [
    { name: 'Lat Pulldown', bodyPart: 'Back', targetMuscle: 'Lats', equipment: 'Cable', mode: 'reps', sets: 4, reps: 10, restSeconds: 90 },
    { name: 'Seated Cable Row', bodyPart: 'Back', targetMuscle: 'Mid Back', equipment: 'Cable', mode: 'reps', sets: 3, reps: 10, restSeconds: 90 },
    { name: 'Dumbbell Curl', bodyPart: 'Arms', targetMuscle: 'Biceps', equipment: 'Dumbbells', mode: 'reps', sets: 3, reps: 12, restSeconds: 60 },
  ],
  'Leg Day': [
    { name: 'Goblet Squat', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Dumbbell', mode: 'reps', sets: 4, reps: 10, restSeconds: 90 },
    { name: 'Romanian Deadlift', bodyPart: 'Legs', targetMuscle: 'Hamstrings', equipment: 'Barbell', mode: 'reps', sets: 3, reps: 10, restSeconds: 120 },
    { name: 'Standing Calf Raise', bodyPart: 'Legs', targetMuscle: 'Calves', equipment: 'Machine', mode: 'reps', sets: 3, reps: 15, restSeconds: 60 },
  ],
  'Full Body': [
    { name: 'Squat', bodyPart: 'Legs', targetMuscle: 'Quads', equipment: 'Barbell', mode: 'reps', sets: 3, reps: 8, restSeconds: 120 },
    { name: 'Push Up', bodyPart: 'Chest', targetMuscle: 'Pectorals', equipment: 'Bodyweight', mode: 'reps', sets: 3, reps: 12, restSeconds: 60 },
    { name: 'Plank', bodyPart: 'Core', targetMuscle: 'Abs', equipment: 'Bodyweight', mode: 'time', sets: 3, durationSeconds: 45, restSeconds: 45 },
  ],
};

export default function RoutinePlanner() {
  const { data, isReady, updateRoutine, resetData } = useAppData();

  // Active form modal configurations
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<RoutineExercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isReady || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading planner logs...
      </div>
    );
  }

  // Open modal for Adding Exercise
  const handleOpenAddModal = (dayId: string) => {
    setActiveDayId(dayId);
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing Exercise
  const handleOpenEditModal = (dayId: string, exercise: RoutineExercise) => {
    setActiveDayId(dayId);
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add/Edit logic)
  const handleFormSubmit = (exerciseFields: Omit<RoutineExercise, 'id'>) => {
    if (!activeDayId) return;

    let updatedRoutine: WeeklyRoutineDay[];

    if (editingExercise) {
      // Edit mode
      const updatedExercise: RoutineExercise = {
        ...exerciseFields,
        id: editingExercise.id,
      };
      updatedRoutine = updateExerciseInDay(
        data.weeklyRoutine,
        activeDayId,
        editingExercise.id,
        updatedExercise
      );
    } else {
      // Add mode
      const newExercise: RoutineExercise = {
        ...exerciseFields,
        id: createId('ex'),
      };
      updatedRoutine = addExerciseToDay(data.weeklyRoutine, activeDayId, newExercise);
    }

    updateRoutine(updatedRoutine);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setActiveDayId(null);
    setEditingExercise(null);
    setIsModalOpen(false);
  };

  // Rest Day Toggle
  const handleToggleRest = (dayId: string, isRest: boolean) => {
    const updated = toggleRestDay(data.weeklyRoutine, dayId, isRest);
    updateRoutine(updated);
  };

  // Day Focus Title Update
  const handleUpdateFocus = (dayId: string, focusText: string) => {
    const updated = updateRoutineDay(data.weeklyRoutine, dayId, focusText);
    updateRoutine(updated);
  };

  // Exercise Deletion
  const handleDeleteExercise = (dayId: string, exerciseId: string) => {
    const updated = deleteExerciseFromDay(data.weeklyRoutine, dayId, exerciseId);
    updateRoutine(updated);
  };

  const handleApplyTemplate = (templateName: string) => {
    if (!activeDayId) return;
    const template = quickTemplates[templateName];
    if (!template) return;

    const updatedRoutine = template.reduce(
      (routine, exercise, index) =>
        addExerciseToDay(routine, activeDayId, {
          ...exercise,
          id: createId(`tpl-${index}`),
        }),
      data.weeklyRoutine
    );

    const focusedRoutine = updateRoutineDay(updatedRoutine, activeDayId, templateName);
    updateRoutine(focusedRoutine);
    handleCloseModal();
  };

  // Clear All Exercises for a day
  const handleClearExercises = (dayId: string) => {
    const dayToClear = data.weeklyRoutine.find((d) => d.id === dayId);
    if (!dayToClear) return;
    const updated = toggleRestDay(data.weeklyRoutine, dayId, dayToClear.isRestDay); // Passing same rest state resets exercises
    updateRoutine(updated);
  };

  const handleResetRoutine = () => {
    if (window.confirm('Revert weekly routine configuration back to seed template defaults? This clears current custom edits.')) {
      resetData();
    }
  };

  return (
    <div className="space-y-8 relative">
      <PageHeader
        title="Weekly Routine Planner"
        subtitle="Review your targeted focus schedule and manage your target movements."
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleResetRoutine} className="flex items-center gap-1.5">
              Reset defaults
            </Button>
            <Badge variant="info" className="text-xs px-3 py-1 font-bold">
              Active Routine Split
            </Badge>
          </div>
        }
      />

      {/* Routine Days Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.weeklyRoutine.map((day) => (
          <RoutineDayCard
            key={day.id}
            day={day}
            onToggleRestDay={handleToggleRest}
            onUpdateFocus={handleUpdateFocus}
            onAddExerciseClick={handleOpenAddModal}
            onEditExerciseClick={handleOpenEditModal}
            onDeleteExercise={handleDeleteExercise}
            onClearExercises={handleClearExercises}
          />
        ))}
      </div>

      {/* Modal Popup Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                {editingExercise ? 'Edit Exercise target' : 'Add New Exercise'}
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 font-semibold">
              Fill out targets for {data.weeklyRoutine.find((d) => d.id === activeDayId)?.dayName || 'day'} setup.
            </p>

            {!editingExercise && (
              <div className="mb-5">
                <span className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Quick templates</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(quickTemplates).map((templateName) => (
                    <Button
                      key={templateName}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleApplyTemplate(templateName)}
                      className="text-xs"
                    >
                      {templateName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <ExerciseForm
              initialValues={editingExercise ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
