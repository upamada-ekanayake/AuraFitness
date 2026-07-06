import type { WaterLog } from '../types/app';

export function toLiters(amountMl: number): number {
  return Number((amountMl / 1000).toFixed(2));
}

export function toMilliliters(amountLiters: number): number {
  return Math.round(amountLiters * 1000);
}

export function getRemainingWaterMl(log: WaterLog): number {
  return Math.max(toMilliliters(log.goalLiters - log.liters), 0);
}

export function createUpdatedWaterLog(log: WaterLog, amountMl: number): WaterLog {
  return {
    ...log,
    liters: toLiters(Math.max(toMilliliters(log.liters) + amountMl, 0)),
  };
}
