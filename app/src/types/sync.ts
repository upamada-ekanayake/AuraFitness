export type CloudSyncStatus =
  | 'disabled'
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'error';

export type CloudSyncMode =
  | 'local_only'
  | 'cloud_enabled'
  | 'demo_mode';

export interface CloudSyncState {
  status: CloudSyncStatus;
  mode: CloudSyncMode;
  lastSyncedAt: string | null;
  error: string | null;
  message: string;
}

export interface CloudSyncResult {
  status: CloudSyncStatus;
  action:
    | 'uploaded_local'
    | 'downloaded_cloud'
    | 'already_synced'
    | 'local_only'
    | 'demo_mode'
    | 'error';
  dataUpdated: boolean;
  message: string;
}
