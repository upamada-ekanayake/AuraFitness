import type { AuraFitnessData, WorkoutSessionLog, WaterLog, CalorieLog, FastingLog } from '../types/app';

export type StreakKind =
  | 'workout'
  | 'water'
  | 'calorie'
  | 'fasting'
  | 'restDay';

export interface StreakMetric {
  kind: StreakKind;
  label: string;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  helper: string;
}

export interface HabitScore {
  score: number;
  label: string;
  helper: string;
  tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

/**
 * Returns safe days since epoch for timezone-independent date arithmetic.
 */
function dateToEpochDays(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length < 3) return 0;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  // Create UTC date to avoid local timezone shifts
  const utcDate = Date.UTC(year, month, day);
  return Math.floor(utcDate / 86400000);
}

/**
 * Converts epoch days back to YYYY-MM-DD
 */
function epochDaysToDateStr(days: number): string {
  const date = new Date(days * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates current and best streaks for an array of YYYY-MM-DD strings.
 */
export function calculateBooleanStreak(
  dates: string[],
  todayIso: string
): { currentStreak: number; bestStreak: number; completedToday: boolean } {
  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, completedToday: false };
  }

  // Deduplicate and convert to sorted epoch days
  const uniqueDays = Array.from(new Set(dates.map(dateToEpochDays))).sort((a, b) => a - b);
  const todayDays = dateToEpochDays(todayIso);
  const completedToday = uniqueDays.includes(todayDays);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  if (completedToday) {
    currentStreak = 1;
    let checkDay = todayDays - 1;
    while (uniqueDays.includes(checkDay)) {
      currentStreak++;
      checkDay--;
    }
  } else {
    // If not completed today, check if it was completed yesterday
    const yesterdayDays = todayDays - 1;
    if (uniqueDays.includes(yesterdayDays)) {
      currentStreak = 1;
      let checkDay = yesterdayDays - 1;
      while (uniqueDays.includes(checkDay)) {
        currentStreak++;
        checkDay--;
      }
    }
  }

  // 2. Calculate Best Streak (longest consecutive sequence)
  let bestStreak = 0;
  let running = 0;
  let prev = -999999;

  for (const day of uniqueDays) {
    if (day === prev + 1) {
      running++;
    } else {
      running = 1;
    }
    if (running > bestStreak) {
      bestStreak = running;
    }
    prev = day;
  }

  return { currentStreak, bestStreak, completedToday };
}

export function calculateWorkoutStreak(
  workoutLogs: WorkoutSessionLog[],
  todayIso: string
): StreakMetric {
  const dates = workoutLogs
    .filter((log) => log.status === 'completed')
    .map((log) => log.date);

  const { currentStreak, bestStreak, completedToday } = calculateBooleanStreak(dates, todayIso);

  return {
    kind: 'workout',
    label: 'Workout Streak',
    currentStreak,
    bestStreak,
    completedToday,
    tone: currentStreak > 0 ? 'info' : 'neutral',
    helper: currentStreak > 0 ? `${currentStreak} active days training` : 'Log a workout split to start',
  };
}

export function calculateWaterStreak(
  waterLogs: WaterLog[],
  todayIso: string
): StreakMetric {
  const dates = waterLogs
    .filter((log) => log.liters >= log.goalLiters)
    .map((log) => log.date);

  const { currentStreak, bestStreak, completedToday } = calculateBooleanStreak(dates, todayIso);

  return {
    kind: 'water',
    label: 'Hydration Streak',
    currentStreak,
    bestStreak,
    completedToday,
    tone: currentStreak > 0 ? 'success' : 'neutral',
    helper: currentStreak > 0 ? `${currentStreak} days hitting water goal` : 'Hydrate to start your streak',
  };
}

export function calculateCalorieStreak(
  calorieLogs: CalorieLog[],
  todayIso: string
): StreakMetric {
  // A calorie day counts if calories are within 150 kcal limit bounds
  const dates = calorieLogs
    .filter((log) => Math.abs(log.calories - log.goalCalories) <= 150)
    .map((log) => log.date);

  const { currentStreak, bestStreak, completedToday } = calculateBooleanStreak(dates, todayIso);

  return {
    kind: 'calorie',
    label: 'Calorie Match Streak',
    currentStreak,
    bestStreak,
    completedToday,
    tone: currentStreak > 0 ? 'warning' : 'neutral',
    helper: currentStreak > 0 ? `${currentStreak} days keeping calorie targets` : 'Match daily calorie budget',
  };
}

export function calculateFastingStreak(
  fastingLogs: FastingLog[],
  todayIso: string
): StreakMetric {
  const dates = fastingLogs
    .filter((log) => log.status === 'completed' || log.fastingHours >= log.goalHours)
    .map((log) => log.date);

  const { currentStreak, bestStreak, completedToday } = calculateBooleanStreak(dates, todayIso);

  return {
    kind: 'fasting',
    label: 'Fasting Streak',
    currentStreak,
    bestStreak,
    completedToday,
    tone: currentStreak > 0 ? 'danger' : 'neutral',
    helper: currentStreak > 0 ? `${currentStreak} days completing fasting periods` : 'Complete a fast cycle to start',
  };
}

export function calculateRestDayDisciplineStreak(
  workoutLogs: WorkoutSessionLog[],
  weeklyRoutine: AuraFitnessData['weeklyRoutine'],
  todayIso: string
): StreakMetric {
  const datesWithDiscipline: string[] = [];
  const todayDays = dateToEpochDays(todayIso);

  // Analyze last 30 days
  for (let i = 0; i < 30; i++) {
    const checkDays = todayDays - i;
    const dateStr = epochDaysToDateStr(checkDays);
    
    // Find day name
    const dateObj = new Date(checkDays * 86400000);
    const dayNames: Array<WorkoutSessionLog['dayName']> = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = dayNames[dateObj.getUTCDay()];

    const routineDay = weeklyRoutine.find((r) => r.dayName === dayName);
    
    if (routineDay) {
      const loggedWorkouts = workoutLogs.filter((w) => w.date === dateStr && w.status === 'completed');
      
      if (routineDay.isRestDay) {
        // Did they avoid completed workouts on rest day?
        if (loggedWorkouts.length === 0) {
          datesWithDiscipline.push(dateStr);
        }
      } else {
        // Workout day: did they log training or rest discipline?
        if (loggedWorkouts.length > 0) {
          datesWithDiscipline.push(dateStr);
        }
      }
    }
  }

  const { currentStreak, bestStreak, completedToday } = calculateBooleanStreak(
    datesWithDiscipline,
    todayIso
  );

  return {
    kind: 'restDay',
    label: 'Split Discipline',
    currentStreak,
    bestStreak,
    completedToday,
    tone: currentStreak > 0 ? 'success' : 'neutral',
    helper: currentStreak > 0 ? `${currentStreak} days following planned splits` : 'Stick to rest/workout split goals',
  };
}

export function calculateAllStreaks(data: AuraFitnessData): StreakMetric[] {
  const todayIso = new Date().toISOString().split('T')[0];
  
  return [
    calculateWorkoutStreak(data.workoutLogs, todayIso),
    calculateWaterStreak(data.waterLogs, todayIso),
    calculateCalorieStreak(data.calorieLogs, todayIso),
    calculateFastingStreak(data.fastingLogs, todayIso),
    calculateRestDayDisciplineStreak(data.workoutLogs, data.weeklyRoutine, todayIso),
  ];
}

export function calculateHabitScore(streaks: StreakMetric[]): HabitScore {
  if (streaks.length === 0) {
    return {
      score: 0,
      label: 'Getting Started',
      helper: 'Complete habits daily to raise your score.',
      tone: 'neutral',
    };
  }

  // Calculate score based on active streaks
  // Each category contributes up to 20 points (capped at current streak size, scaling to 5 days)
  let scoreSum = 0;
  streaks.forEach((str) => {
    // Current streak contributes weight (1 day = 10pts, 2 days = 15pts, 3+ days = 20pts)
    const points = str.currentStreak === 0 ? 0 : str.currentStreak === 1 ? 10 : str.currentStreak === 2 ? 15 : 20;
    scoreSum += points;
  });

  const finalScore = Math.min(scoreSum, 100);

  let label = 'Balanced Habits';
  let tone: HabitScore['tone'] = 'info';
  let helper = 'Steady habit consistency. Keep hitting daily targets.';

  if (finalScore >= 90) {
    label = 'Elite Fitness Habit';
    tone = 'success';
    helper = 'Phenomenal consistency! You are dominating all biometrics.';
  } else if (finalScore >= 60) {
    label = 'Active Consistent Split';
    tone = 'info';
    helper = 'Great work maintaining streaks. Keep building momentum.';
  } else if (finalScore >= 30) {
    label = 'Habits Growing';
    tone = 'warning';
    helper = 'Consistency is improving. Focus on completing 2-3 streaks daily.';
  } else {
    label = 'Habit Seed Stage';
    tone = 'neutral';
    helper = 'Score rises as you log workouts, water, weight, and calories.';
  }

  return {
    score: finalScore,
    label,
    helper,
    tone,
  };
}
