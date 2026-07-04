import type { AuraFitnessData } from '../types/app';
import type { CloudSyncResult } from '../types/sync';
import { fetchCloudAppData, saveCloudAppData } from './cloudDataService';
import {
  getAuraFitnessData,
  saveAuraFitnessData,
  setLastCloudSyncAt,
} from './appDataService';

type TimestampComparison = 'local_newer' | 'cloud_newer' | 'same_or_invalid';

function makeResult(
  action: CloudSyncResult['action'],
  message: string,
  dataUpdated: boolean,
  status: CloudSyncResult['status'] = action === 'error' ? 'error' : 'synced'
): CloudSyncResult {
  return {
    status,
    action,
    dataUpdated,
    message,
  };
}

function markSynced(): string {
  const syncedAt = new Date().toISOString();
  setLastCloudSyncAt(syncedAt);
  return syncedAt;
}

export function compareUpdatedAt(
  localUpdatedAt: string,
  cloudUpdatedAt: string
): TimestampComparison {
  const localTime = Date.parse(localUpdatedAt);
  const cloudTime = Date.parse(cloudUpdatedAt);

  if (Number.isNaN(localTime) || Number.isNaN(cloudTime) || localTime === cloudTime) {
    return 'same_or_invalid';
  }

  return localTime > cloudTime ? 'local_newer' : 'cloud_newer';
}

export async function syncLocalAndCloudData(
  userId: string,
  localData: AuraFitnessData
): Promise<{
  result: CloudSyncResult;
  data: AuraFitnessData;
}> {
  try {
    const cloudData = await fetchCloudAppData(userId);

    if (!cloudData) {
      const saved = await saveCloudAppData(userId, localData);
      markSynced();

      return {
        result: makeResult('uploaded_local', 'No cloud data found. Local data uploaded to Supabase.', true),
        data: saved,
      };
    }

    const comparison = compareUpdatedAt(localData.updatedAt, cloudData.updatedAt);

    if (comparison === 'cloud_newer') {
      const savedLocal = saveAuraFitnessData(cloudData, { preserveUpdatedAt: true });
      markSynced();

      return {
        result: makeResult('downloaded_cloud', 'Cloud data was newer and replaced local data.', true),
        data: savedLocal,
      };
    }

    if (comparison === 'local_newer' || comparison === 'same_or_invalid') {
      const saved = await saveCloudAppData(userId, localData);
      markSynced();

      return {
        result: makeResult(
          comparison === 'local_newer' ? 'uploaded_local' : 'already_synced',
          comparison === 'local_newer'
            ? 'Local data was newer and uploaded to Supabase.'
            : 'Timestamps matched or were invalid. Local data was preferred and uploaded.',
          comparison === 'local_newer'
        ),
        data: saved,
      };
    }

    return {
      result: makeResult('already_synced', 'Local and cloud data are already synced.', false),
      data: localData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloud sync failed.';

    return {
      result: makeResult('error', message, false, 'error'),
      data: localData,
    };
  }
}

export async function pushLocalDataToCloud(
  userId: string,
  localData: AuraFitnessData
): Promise<CloudSyncResult> {
  try {
    await saveCloudAppData(userId, localData);
    markSynced();

    return makeResult('uploaded_local', 'Local data uploaded to Supabase.', true);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloud upload failed.';
    return makeResult('error', message, false, 'error');
  }
}

export async function pullCloudDataToLocal(
  userId: string
): Promise<{
  result: CloudSyncResult;
  data: AuraFitnessData | null;
}> {
  try {
    const cloudData = await fetchCloudAppData(userId);

    if (!cloudData) {
      return {
        result: makeResult('already_synced', 'No cloud data exists yet.', false),
        data: null,
      };
    }

    const savedLocal = saveAuraFitnessData(cloudData, { preserveUpdatedAt: true });
    markSynced();

    return {
      result: makeResult('downloaded_cloud', 'Cloud data downloaded to this browser.', true),
      data: savedLocal,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloud download failed.';

    return {
      result: makeResult('error', message, false, 'error'),
      data: getAuraFitnessData(),
    };
  }
}
