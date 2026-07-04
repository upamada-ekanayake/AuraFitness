import type {
  WorkoutSessionLog,
  WaterLog,
  CalorieLog,
  BodyWeightLog,
  FastingLog,
} from '../types/app';

/**
 * Returns an array of the last N dates formatted as YYYY-MM-DD (chronological order).
 */
export function getLastNDaysIso(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export function getWorkoutCountLastNDays(
  workoutLogs: WorkoutSessionLog[],
  days: number
): number {
  const cutoffDates = getLastNDaysIso(days);
  return workoutLogs.filter(
    (log) => log.status === 'completed' && cutoffDates.includes(log.date)
  ).length;
}

export function getWorkoutCompletionByDay(
  workoutLogs: WorkoutSessionLog[],
  days: number
): Array<{ date: string; count: number }> {
  const targetDates = getLastNDaysIso(days);
  return targetDates.map((date) => {
    const count = workoutLogs.filter((log) => log.date === date && log.status === 'completed').length;
    return { date, count };
  });
}

export function getWaterHistory(
  waterLogs: WaterLog[],
  days: number
): Array<{ date: string; liters: number; goalLiters: number }> {
  const targetDates = getLastNDaysIso(days);
  return targetDates.map((date) => {
    const log = waterLogs.find((w) => w.date === date);
    return {
      date,
      liters: log ? log.liters : 0,
      goalLiters: log ? log.goalLiters : 3.0,
    };
  });
}

export function getCalorieHistory(
  calorieLogs: CalorieLog[],
  days: number
): Array<{ date: string; calories: number; goalCalories: number }> {
  const targetDates = getLastNDaysIso(days);
  return targetDates.map((date) => {
    const log = calorieLogs.find((c) => c.date === date);
    return {
      date,
      calories: log ? log.calories : 0,
      goalCalories: log ? log.goalCalories : 2200,
    };
  });
}

export function getFastingHistory(
  fastingLogs: FastingLog[],
  days: number
): Array<{ date: string; fastingHours: number; goalHours: number }> {
  const targetDates = getLastNDaysIso(days);
  return targetDates.map((date) => {
    const log = fastingLogs.find((f) => f.date === date);
    return {
      date,
      fastingHours: log ? log.fastingHours : 0,
      goalHours: log ? log.goalHours : 16,
    };
  });
}

export function getBodyWeightHistory(
  bodyWeightLogs: BodyWeightLog[],
  limit: number
): Array<{ date: string; weightKg: number }> {
  // Return limit newest records in chronological order
  const sorted = [...bodyWeightLogs].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.slice(0, limit).reverse().map((w) => ({
    date: w.date,
    weightKg: w.weightKg,
  }));
}

export function calculateAverageWater(
  waterHistory: Array<{ liters: number }>
): number {
  if (waterHistory.length === 0) return 0;
  const sum = waterHistory.reduce((acc, curr) => acc + curr.liters, 0);
  return parseFloat((sum / waterHistory.length).toFixed(2));
}

export function calculateAverageCalories(
  calorieHistory: Array<{ calories: number }>
): number {
  if (calorieHistory.length === 0) return 0;
  const sum = calorieHistory.reduce((acc, curr) => acc + curr.calories, 0);
  return Math.round(sum / calorieHistory.length);
}

export function calculateWeightChangeFromHistory(
  weightHistory: Array<{ weightKg: number }>
): number | null {
  if (weightHistory.length < 2) return null;
  const oldest = weightHistory[0].weightKg;
  const newest = weightHistory[weightHistory.length - 1].weightKg;
  return parseFloat((newest - oldest).toFixed(2));
}

export function getRecentWorkoutLogs(
  workoutLogs: WorkoutSessionLog[],
  limit: number
): WorkoutSessionLog[] {
  return [...workoutLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
