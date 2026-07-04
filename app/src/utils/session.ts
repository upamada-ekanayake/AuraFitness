import type { WeeklyRoutineDay, WorkoutSessionExerciseLog } from '../types/app';

/**
 * Maps planned routine exercises into dynamic in-progress session logs.
 * Prefills completed reps/times and weights for a user-friendly tracking workflow.
 */
export function createSessionExercisesFromRoutine(day: WeeklyRoutineDay): WorkoutSessionExerciseLog[] {
  return day.exercises.map((ex) => ({
    exerciseId: ex.id,
    name: ex.name,
    plannedSets: ex.sets,
    completedSets: 0, // Starts at 0, user increments as they complete sets
    plannedReps: ex.reps,
    completedReps: ex.reps ?? 10,
    plannedDurationSeconds: ex.durationSeconds,
    completedDurationSeconds: ex.durationSeconds ?? 60,
    weightKg: ex.weightKg ?? 0,
    rpe: 8, // Standard safe RPE defaults
    painReported: false,
  }));
}

/**
 * Calculates the percentage of completed sets across the session.
 */
export function calculateSessionProgress(exercises: WorkoutSessionExerciseLog[]): number {
  const planned = exercises.reduce((acc, curr) => acc + curr.plannedSets, 0);
  if (planned === 0) return 0;
  
  const completed = exercises.reduce((acc, curr) => acc + curr.completedSets, 0);
  return Math.min(Math.round((completed / planned) * 100), 100);
}

/**
 * Counts total planned sets inside a routine day.
 */
export function calculatePlannedSetCount(day: WeeklyRoutineDay): number {
  return day.exercises.reduce((acc, curr) => acc + curr.sets, 0);
}

/**
 * Counts total completed sets across in-progress logs.
 */
export function calculateCompletedSetCount(exercises: WorkoutSessionExerciseLog[]): number {
  return exercises.reduce((acc, curr) => acc + curr.completedSets, 0);
}

/**
 * Estimates planned workout duration in minutes based on sets and rest periods.
 */
export function estimatePlannedDurationMinutes(day: WeeklyRoutineDay): number {
  if (day.exercises.length === 0) return 0;

  // Assumes average 45 seconds work per set + rest interval + 5 minutes general overhead
  const totalSeconds = day.exercises.reduce((acc, curr) => {
    const setTime = curr.sets * (45 + curr.restSeconds);
    return acc + setTime;
  }, 0);

  return Math.max(Math.round(totalSeconds / 60) + 5, 15); // Min 15 mins
}
