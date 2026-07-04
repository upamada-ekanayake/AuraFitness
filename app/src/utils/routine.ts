import type { WeeklyRoutineDay, RoutineExercise } from '../types/app';

/**
 * Updates a day's focus text.
 */
export function updateRoutineDay(
  routine: WeeklyRoutineDay[],
  dayId: string,
  focus: string
): WeeklyRoutineDay[] {
  return routine.map((day) => (day.id === dayId ? { ...day, focus } : day));
}

/**
 * Toggles a day's rest day status. 
 * If marked as a rest day, automatically empties the exercise list.
 */
export function toggleRestDay(
  routine: WeeklyRoutineDay[],
  dayId: string,
  isRestDay: boolean
): WeeklyRoutineDay[] {
  return routine.map((day) => {
    if (day.id === dayId) {
      return {
        ...day,
        isRestDay,
        exercises: isRestDay ? [] : day.exercises,
      };
    }
    return day;
  });
}

/**
 * Appends a new exercise to a specific day.
 */
export function addExerciseToDay(
  routine: WeeklyRoutineDay[],
  dayId: string,
  exercise: RoutineExercise
): WeeklyRoutineDay[] {
  return routine.map((day) => {
    if (day.id === dayId) {
      return {
        ...day,
        exercises: [...day.exercises, exercise],
      };
    }
    return day;
  });
}

/**
 * Edits/replaces a specific exercise in a day's list.
 */
export function updateExerciseInDay(
  routine: WeeklyRoutineDay[],
  dayId: string,
  exerciseId: string,
  updatedExercise: RoutineExercise
): WeeklyRoutineDay[] {
  return routine.map((day) => {
    if (day.id === dayId) {
      return {
        ...day,
        exercises: day.exercises.map((ex) => (ex.id === exerciseId ? updatedExercise : ex)),
      };
    }
    return day;
  });
}

/**
 * Removes an exercise from a specific day's list.
 */
export function deleteExerciseFromDay(
  routine: WeeklyRoutineDay[],
  dayId: string,
  exerciseId: string
): WeeklyRoutineDay[] {
  return routine.map((day) => {
    if (day.id === dayId) {
      return {
        ...day,
        exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
      };
    }
    return day;
  });
}
