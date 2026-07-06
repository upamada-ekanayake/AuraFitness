import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import type { ActiveWorkoutSession, WeeklyRoutineDay } from '../types/app';
import {
  clearActiveWorkoutSession,
  createActiveWorkoutSession,
  loadActiveWorkoutSession,
  saveActiveWorkoutSession,
} from '../services/activeWorkoutSessionService';

type SessionUpdater = ActiveWorkoutSession | ((current: ActiveWorkoutSession) => ActiveWorkoutSession);

export function useActiveWorkoutSession() {
  const [session, setSessionState] = useState<ActiveWorkoutSession | null>(() => loadActiveWorkoutSession());
  const sessionRef = useRef<ActiveWorkoutSession | null>(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const persistSession = useCallback((nextSession: ActiveWorkoutSession) => {
    const saved = saveActiveWorkoutSession(nextSession);
    sessionRef.current = saved;
    setSessionState(saved);
    return saved;
  }, []);

  const startSession = useCallback(
    (day: WeeklyRoutineDay) => {
      const created = createActiveWorkoutSession(day);
      return persistSession(created);
    },
    [persistSession]
  );

  const updateSession = useCallback(
    (updater: SessionUpdater) => {
      const current = sessionRef.current;
      if (!current) return null;

      const nextSession = typeof updater === 'function' ? updater(current) : updater;
      return persistSession(nextSession);
    },
    [persistSession]
  );

  const clearSession = useCallback(() => {
    clearActiveWorkoutSession();
    sessionRef.current = null;
    setSessionState(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const flushSession = () => {
      if (sessionRef.current) {
        saveActiveWorkoutSession(sessionRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushSession);
    window.addEventListener('beforeunload', flushSession);

    let removeCapacitorListener: (() => void) | undefined;
    void CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        flushSession();
      }
    }).then((handle) => {
      removeCapacitorListener = () => {
        void handle.remove();
      };
    }).catch(() => {
      removeCapacitorListener = undefined;
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushSession);
      window.removeEventListener('beforeunload', flushSession);
      removeCapacitorListener?.();
    };
  }, []);

  return {
    session,
    startSession,
    updateSession,
    clearSession,
  };
}
