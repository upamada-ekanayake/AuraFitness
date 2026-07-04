import { useState, useEffect, useCallback } from 'react';
import type { AuraFitnessData, UserProfile, WeeklyRoutineDay, WorkoutSessionLog } from '../types/app';
import {
  getAuraFitnessData,
  saveAuraFitnessData,
  resetAuraFitnessData,
  updateUserProfile,
  updateWeeklyRoutine,
  addWorkoutSessionLog,
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
  };
}
