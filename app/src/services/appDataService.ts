import type {
  AuraFitnessData,
  UserProfile,
  WeeklyRoutineDay,
  WorkoutSessionLog,
  WaterLog,
  CalorieLog,
  CalorieEntry,
  BodyWeightLog,
  FastingLog,
} from '../types/app';
import { AURA_STORAGE_KEY, readStorage, removeStorage, writeStorage } from './storage';
import { createSeedAuraFitnessData } from './seedData';

export const AURA_LAST_SYNC_KEY = 'aurafitness:last-cloud-sync:v1';
export const AURA_DATA_UPDATED_EVENT = 'aurafitness:data-updated';

function notifyDataUpdated(): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(AURA_DATA_UPDATED_EVENT));
}

function normalizeAuraFitnessData(data: AuraFitnessData): AuraFitnessData {
  return {
    ...data,
    calorieEntries: Array.isArray(data.calorieEntries) ? data.calorieEntries : [],
  };
}

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
 * Retrieves the data structure from storage. 
 * If it doesn't exist, initializes it with seed data.
 */
export function getAuraFitnessData(): AuraFitnessData {
  const loaded = readStorage<AuraFitnessData>(AURA_STORAGE_KEY);
  if (loaded !== null) {
    const normalized = normalizeAuraFitnessData(loaded);
    if (!Array.isArray(loaded.calorieEntries)) {
      return saveAuraFitnessData(normalized, { preserveUpdatedAt: true });
    }
    return normalized;
  }
  // Initialize with seed data if storage is blank
  return resetAuraFitnessData();
}

/**
 * Persists the data object into local storage, updating the updatedAt timestamp.
 */
export function saveAuraFitnessData(
  data: AuraFitnessData,
  options: { preserveUpdatedAt?: boolean } = {}
): AuraFitnessData {
  const updatedData: AuraFitnessData = {
    ...data,
    updatedAt: options.preserveUpdatedAt ? data.updatedAt : new Date().toISOString(),
  };
  writeStorage(AURA_STORAGE_KEY, updatedData);
  notifyDataUpdated();
  return updatedData;
}

/**
 * Overwrites storage with a fresh batch of demo seed data.
 */
export function resetAuraFitnessData(): AuraFitnessData {
  const freshSeed = createSeedAuraFitnessData();
  writeStorage(AURA_STORAGE_KEY, freshSeed);
  notifyDataUpdated();
  return freshSeed;
}

export function getLastCloudSyncAt(): string | null {
  return readStorage<string>(AURA_LAST_SYNC_KEY);
}

export function setLastCloudSyncAt(value: string): void {
  writeStorage(AURA_LAST_SYNC_KEY, value);
}

export function clearLastCloudSyncAt(): void {
  removeStorage(AURA_LAST_SYNC_KEY);
}

/**
 * Quick helper to update user profile parameters while leaving other values untouched.
 */
export function updateUserProfile(profileUpdates: Partial<UserProfile>): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const updatedProfile: UserProfile = {
    ...currentData.profile,
    ...profileUpdates,
  };
  const updatedData: AuraFitnessData = {
    ...currentData,
    profile: updatedProfile,
  };
  return saveAuraFitnessData(updatedData);
}

/**
 * Replaces the weekly routine configuration in storage.
 */
export function updateWeeklyRoutine(routine: WeeklyRoutineDay[]): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const updatedData: AuraFitnessData = {
    ...currentData,
    weeklyRoutine: routine,
  };
  return saveAuraFitnessData(updatedData);
}

/**
 * Appends a completed workout log entry to the log array in storage.
 */
export function addWorkoutSessionLog(log: WorkoutSessionLog): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const updatedData: AuraFitnessData = {
    ...currentData,
    workoutLogs: [...currentData.workoutLogs, log],
  };
  return saveAuraFitnessData(updatedData);
}

/**
 * Upserts a WaterLog into storage by matching date keys.
 */
export function upsertWaterLog(log: WaterLog): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const filtered = currentData.waterLogs.filter((w) => w.date !== log.date);
  const updatedData: AuraFitnessData = {
    ...currentData,
    waterLogs: [...filtered, log],
  };
  return saveAuraFitnessData(updatedData);
}

/**
 * Upserts a CalorieLog into storage by matching date keys.
 */
export function upsertCalorieLog(log: CalorieLog): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const filtered = currentData.calorieLogs.filter((c) => c.date !== log.date);
  const updatedData: AuraFitnessData = {
    ...currentData,
    calorieLogs: [...filtered, log],
  };
  return saveAuraFitnessData(updatedData);
}

export function addCalorieEntry(entry: CalorieEntry): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const entries = [...currentData.calorieEntries, entry];
  const caloriesForDate = entries
    .filter((item) => item.date === entry.date)
    .reduce((total, item) => total + item.calories, 0);
  const currentLog = currentData.calorieLogs.find((log) => log.date === entry.date);
  const filteredLogs = currentData.calorieLogs.filter((log) => log.date !== entry.date);

  return saveAuraFitnessData({
    ...currentData,
    calorieEntries: entries,
    calorieLogs: [
      ...filteredLogs,
      {
        date: entry.date,
        calories: caloriesForDate,
        goalCalories: currentLog?.goalCalories ?? currentData.profile.calorieGoal,
      },
    ],
  });
}

export function deleteCalorieEntry(entryId: string): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const entry = currentData.calorieEntries.find((item) => item.id === entryId);
  if (!entry) return currentData;

  const entries = currentData.calorieEntries.filter((item) => item.id !== entryId);
  const caloriesForDate = entries
    .filter((item) => item.date === entry.date)
    .reduce((total, item) => total + item.calories, 0);
  const currentLog = currentData.calorieLogs.find((log) => log.date === entry.date);
  const filteredLogs = currentData.calorieLogs.filter((log) => log.date !== entry.date);

  return saveAuraFitnessData({
    ...currentData,
    calorieEntries: entries,
    calorieLogs: [
      ...filteredLogs,
      {
        date: entry.date,
        calories: caloriesForDate,
        goalCalories: currentLog?.goalCalories ?? currentData.profile.calorieGoal,
      },
    ],
  });
}

/**
 * Upserts a BodyWeightLog into storage by matching date keys.
 */
export function upsertBodyWeightLog(log: BodyWeightLog): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const filtered = currentData.bodyWeightLogs.filter((w) => w.date !== log.date);
  const updatedData: AuraFitnessData = {
    ...currentData,
    bodyWeightLogs: [...filtered, log],
  };
  // Also update the core profile bodyWeightKg configuration so forms are in sync
  const updatedProfile: UserProfile = {
    ...currentData.profile,
    bodyWeightKg: log.weightKg,
  };
  const updatedDataWithProfile: AuraFitnessData = {
    ...updatedData,
    profile: updatedProfile,
  };
  return saveAuraFitnessData(updatedDataWithProfile);
}

/**
 * Upserts a FastingLog into storage by matching date keys.
 */
export function upsertFastingLog(log: FastingLog): AuraFitnessData {
  const currentData = getAuraFitnessData();
  const filtered = currentData.fastingLogs.filter((f) => f.date !== log.date);
  const updatedData: AuraFitnessData = {
    ...currentData,
    fastingLogs: [...filtered, log],
  };
  return saveAuraFitnessData(updatedData);
}
