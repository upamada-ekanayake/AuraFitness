import type { CalorieEntry, CalorieLog, WorkoutSessionLog } from '../types/app';

export function getCaloriesBurnedToday(workoutLogs: WorkoutSessionLog[], date: string): number {
  return workoutLogs
    .filter((log) => log.date === date && log.status === 'completed')
    .reduce((total, log) => total + Math.round(log.durationMinutes * 7), 0);
}

export function getCaloriesRemaining(log: CalorieLog, burnedCalories: number): number {
  return log.goalCalories + burnedCalories - log.calories;
}

export function getMacroTotals(entries: CalorieEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      proteinG: totals.proteinG + (entry.proteinG ?? 0),
      carbsG: totals.carbsG + (entry.carbsG ?? 0),
      fatG: totals.fatG + (entry.fatG ?? 0),
    }),
    { proteinG: 0, carbsG: 0, fatG: 0 }
  );
}
