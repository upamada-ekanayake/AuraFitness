import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from './useAppData';
import { useAuth } from './useAuth';
import { useDemoMode } from './useDemoMode';
import {
  getLastCloudSyncAt,
  setLastCloudSyncAt,
} from '../services/appDataService';
import {
  pullCloudDataToLocal,
  pushLocalDataToCloud,
  syncLocalAndCloudData,
} from '../services/syncService';
import type { CloudSyncResult, CloudSyncState } from '../types/sync';

function getDefaultState(isDemoMode: boolean, isAuthenticated: boolean): CloudSyncState {
  if (isDemoMode) {
    return {
      status: 'disabled',
      mode: 'demo_mode',
      lastSyncedAt: getLastCloudSyncAt(),
      error: null,
      message: 'Demo mode is local-only.',
    };
  }

  if (!isAuthenticated) {
    return {
      status: 'disabled',
      mode: 'local_only',
      lastSyncedAt: getLastCloudSyncAt(),
      error: null,
      message: 'Sign in to enable cloud sync.',
    };
  }

  return {
    status: 'idle',
    mode: 'cloud_enabled',
    lastSyncedAt: getLastCloudSyncAt(),
    error: null,
    message: 'Cloud sync is ready.',
  };
}

export function useCloudSync() {
  const { user, isAuthenticated, isLoading, isSupabaseReady } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { data, isReady, refreshData } = useAppData();
  const [syncState, setSyncState] = useState<CloudSyncState>(() =>
    getDefaultState(isDemoMode, isAuthenticated)
  );
  const initialSyncUserRef = useRef<string | null>(null);

  const canSync = Boolean(
    isSupabaseReady &&
    isAuthenticated &&
    user &&
    data &&
    isReady &&
    !isDemoMode
  );
  const isSyncing = syncState.status === 'syncing';

  const applyResult = useCallback((result: CloudSyncResult) => {
    const syncedAt = result.status === 'synced' ? new Date().toISOString() : getLastCloudSyncAt();

    if (syncedAt && result.status === 'synced') {
      setLastCloudSyncAt(syncedAt);
    }

    setSyncState({
      status: result.status,
      mode: isDemoMode ? 'demo_mode' : isAuthenticated ? 'cloud_enabled' : 'local_only',
      lastSyncedAt: syncedAt,
      error: result.status === 'error' ? result.message : null,
      message: result.message,
    });

    if (result.dataUpdated) {
      refreshData();
    }
  }, [isAuthenticated, isDemoMode, refreshData]);

  const syncNow = useCallback(async () => {
    if (!canSync || !user || !data) {
      setSyncState(getDefaultState(isDemoMode, isAuthenticated));
      return;
    }

    setSyncState((current) => ({
      ...current,
      status: 'syncing',
      mode: 'cloud_enabled',
      error: null,
      message: 'Syncing local and cloud data...',
    }));

    const { result } = await syncLocalAndCloudData(user.id, data);
    applyResult(result);
  }, [applyResult, canSync, data, isAuthenticated, isDemoMode, user]);

  const pushNow = useCallback(async () => {
    if (!canSync || !user || !data) {
      setSyncState(getDefaultState(isDemoMode, isAuthenticated));
      return;
    }

    setSyncState((current) => ({
      ...current,
      status: 'syncing',
      mode: 'cloud_enabled',
      error: null,
      message: 'Uploading local data to Supabase...',
    }));

    const result = await pushLocalDataToCloud(user.id, data);
    applyResult(result);
  }, [applyResult, canSync, data, isAuthenticated, isDemoMode, user]);

  const pullNow = useCallback(async () => {
    if (!canSync || !user) {
      setSyncState(getDefaultState(isDemoMode, isAuthenticated));
      return;
    }

    setSyncState((current) => ({
      ...current,
      status: 'syncing',
      mode: 'cloud_enabled',
      error: null,
      message: 'Downloading cloud data...',
    }));

    const { result } = await pullCloudDataToLocal(user.id);
    applyResult(result);
  }, [applyResult, canSync, isAuthenticated, isDemoMode, user]);

  useEffect(() => {
    setSyncState((current) => ({
      ...getDefaultState(isDemoMode, isAuthenticated),
      lastSyncedAt: current.lastSyncedAt ?? getLastCloudSyncAt(),
    }));
  }, [isAuthenticated, isDemoMode]);

  useEffect(() => {
    if (isLoading || !canSync || !user || !data) return;
    if (initialSyncUserRef.current === user.id) return;

    initialSyncUserRef.current = user.id;
    void syncNow();
  }, [canSync, data, isLoading, syncNow, user]);

  return useMemo(() => ({
    syncState,
    syncNow,
    pushNow,
    pullNow,
    canSync,
    isSyncing,
  }), [canSync, isSyncing, pullNow, pushNow, syncNow, syncState]);
}
