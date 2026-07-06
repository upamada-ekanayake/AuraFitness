import { useState, useEffect, useCallback } from 'react';
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
import {
  AURA_DATA_UPDATED_EVENT,
  getAuraFitnessData,
  saveAuraFitnessData,
  resetAuraFitnessData,
  updateUserProfile,
  updateWeeklyRoutine,
  addWorkoutSessionLog,
  upsertWaterLog,
  upsertCalorieLog,
  addCalorieEntry,
  deleteCalorieEntry,
  upsertBodyWeightLog,
  upsertFastingLog,
} from '../services/appDataService';

export function useAppData() {
  const [data, setData] = useState<AuraFitnessData | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Loads current state from data service
  const refreshData = useCallback(() => {
    const current = getAuraFitnessData();
    setData(current);
    setIsReady(true);
  }, []);

  // On mount, pull latest local storage state
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.addEventListener(AURA_DATA_UPDATED_EVENT, refreshData);

    return () => window.removeEventListener(AURA_DATA_UPDATED_EVENT, refreshData);
  }, [refreshData]);

  // Saves data structure and updates local state
  const saveData = useCallback((newData: AuraFitnessData) => {
    const updated = saveAuraFitnessData(newData);
    setData(updated);
  }, []);

  // Completely resets state to initial seed structure
  const resetData = useCallback(() => {
    const fresh = resetAuraFitnessData();
    setData(fresh);
  }, []);

  // Update profile keys and update local state
  const updateProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    const updated = updateUserProfile(profileUpdates);
    setData(updated);
  }, []);

  // Update weekly routine configuration in storage and local state
  const updateRoutine = useCallback((newRoutine: WeeklyRoutineDay[]) => {
    const updated = updateWeeklyRoutine(newRoutine);
    setData(updated);
  }, []);

  // Append a completed session log in storage and update local state
  const addWorkoutLog = useCallback((log: WorkoutSessionLog) => {
    const updated = addWorkoutSessionLog(log);
    setData(updated);
  }, []);

  // Upsert a daily WaterLog entry
  const upsertWater = useCallback((log: WaterLog) => {
    const updated = upsertWaterLog(log);
    setData(updated);
  }, []);

  // Upsert a daily CalorieLog entry
  const upsertCalories = useCallback((log: CalorieLog) => {
    const updated = upsertCalorieLog(log);
    setData(updated);
  }, []);

  const addMealEntry = useCallback((entry: CalorieEntry) => {
    const updated = addCalorieEntry(entry);
    setData(updated);
  }, []);

  const deleteMealEntry = useCallback((entryId: string) => {
    const updated = deleteCalorieEntry(entryId);
    setData(updated);
  }, []);

  // Upsert a daily BodyWeightLog entry
  const upsertBodyWeight = useCallback((log: BodyWeightLog) => {
    const updated = upsertBodyWeightLog(log);
    setData(updated);
  }, []);

  // Upsert a daily FastingLog entry
  const upsertFasting = useCallback((log: FastingLog) => {
    const updated = upsertFastingLog(log);
    setData(updated);
  }, []);

  return {
    data,
    profile: data?.profile ?? null,
    isReady,
    refreshData,
    saveData,
    resetData,
    updateProfile,
    updateRoutine,
    addWorkoutLog,
    upsertWater,
    upsertCalories,
    addMealEntry,
    deleteMealEntry,
    upsertBodyWeight,
    upsertFasting,
  };
}
