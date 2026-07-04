import type { AuraFitnessData, UserProfile, WeeklyRoutineDay } from '../types/app';
import { AURA_STORAGE_KEY, readStorage, writeStorage } from './storage';
import { createSeedAuraFitnessData } from './seedData';

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
    return loaded;
  }
  // Initialize with seed data if storage is blank
  return resetAuraFitnessData();
}

/**
 * Persists the data object into local storage, updating the updatedAt timestamp.
 */
export function saveAuraFitnessData(data: AuraFitnessData): AuraFitnessData {
  const updatedData: AuraFitnessData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeStorage(AURA_STORAGE_KEY, updatedData);
  return updatedData;
}

/**
 * Overwrites storage with a fresh batch of demo seed data.
 */
export function resetAuraFitnessData(): AuraFitnessData {
  const freshSeed = createSeedAuraFitnessData();
  writeStorage(AURA_STORAGE_KEY, freshSeed);
  return freshSeed;
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
