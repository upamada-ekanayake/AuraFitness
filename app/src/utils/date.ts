import type { WorkoutDayName } from '../types/app';

/**
 * Returns today's local date formatted as YYYY-MM-DD.
 */
export function getTodayIsoDate(): string {
  const local = new Date();
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Maps a Date object to a valid WorkoutDayName string.
 */
export function getDayNameFromDate(date: Date): WorkoutDayName {
  const days: WorkoutDayName[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

/**
 * Detects today's day name.
 */
export function getTodayDayName(): WorkoutDayName {
  return getDayNameFromDate(new Date());
}
