import type { WaterLog, CalorieLog, BodyWeightLog, FastingLog } from '../types/app';

export function getTodayWaterLog(logs: WaterLog[], date: string): WaterLog | undefined {
  return logs.find((w) => w.date === date);
}

export function getTodayCalorieLog(logs: CalorieLog[], date: string): CalorieLog | undefined {
  return logs.find((c) => c.date === date);
}

export function getLatestBodyWeightLog(logs: BodyWeightLog[]): BodyWeightLog | undefined {
  if (logs.length === 0) return undefined;
  // Sort logs by date descending to get the newest
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0];
}

export function getTodayFastingLog(logs: FastingLog[], date: string): FastingLog | undefined {
  return logs.find((f) => f.date === date);
}

export function calculateProgress(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((value / goal) * 100), 100);
}

export function calculateWeightChange(logs: BodyWeightLog[]): { change: number; hasPrevious: boolean } {
  if (logs.length < 2) return { change: 0, hasPrevious: false };
  // Sort logs by date descending
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0].weightKg;
  const previous = sorted[1].weightKg;
  return {
    change: parseFloat((latest - previous).toFixed(2)),
    hasPrevious: true,
  };
}

export function getCalorieStatus(value: number, goal: number): 'under' | 'on' | 'over' {
  if (goal <= 0) return 'under';
  // Allow a standard 100 kcal buffer window to define "on" goal
  const diff = value - goal;
  if (diff > 50) return 'over';
  if (diff < -150) return 'under';
  return 'on';
}
