import type { CloudSyncState } from '../../types/sync';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Cloud, Download, RefreshCcw, Upload } from 'lucide-react';

interface CloudSyncCardProps {
  status: CloudSyncState;
  canSync: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  onPushLocal: () => void;
  onPullCloud: () => void;
}

function getStatusVariant(status: CloudSyncState['status']) {
  if (status === 'synced') return 'success';
  if (status === 'syncing') return 'info';
  if (status === 'error') return 'danger';
  if (status === 'disabled') return 'neutral';
  return 'warning';
}

function getModeLabel(mode: CloudSyncState['mode']) {
  if (mode === 'cloud_enabled') return 'Cloud enabled';
  if (mode === 'demo_mode') return 'Demo mode';
  return 'Local only';
}

function formatSyncedAt(value: string | null) {
  if (!value) return 'Not synced yet';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  return parsed.toLocaleString();
}

export default function CloudSyncCard({
  status,
  canSync,
  isSyncing,
  onSyncNow,
  onPushLocal,
  onPullCloud,
}: CloudSyncCardProps) {
  const controlsDisabled = !canSync || isSyncing;

  return (
    <Card title="Cloud Sync" subtitle="Manual Supabase sync for this account">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant(status.status)}>
            {isSyncing ? 'Syncing' : status.status}
          </Badge>
          <Badge variant={status.mode === 'cloud_enabled' ? 'success' : 'neutral'}>
            {getModeLabel(status.mode)}
          </Badge>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
            <span className="text-slate-400 font-semibold">Last synced</span>
            <span className="text-slate-200 font-bold text-right pl-4">{formatSyncedAt(status.lastSyncedAt)}</span>
          </div>
          <div className="flex justify-between items-start gap-4 text-xs">
            <span className="text-slate-400 font-semibold">Status</span>
            <span className="text-slate-300 font-bold text-right leading-relaxed">{status.message}</span>
          </div>
        </div>

        {status.error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {status.error}
          </div>
        )}

        {status.mode === 'demo_mode' && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
            Demo mode is always local-only. Sign in to use cloud sync.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSyncNow}
            disabled={controlsDisabled}
            className="flex items-center gap-1.5"
          >
            <RefreshCcw className="w-4 h-4" /> Sync now
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPushLocal}
            disabled={controlsDisabled}
            className="flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> Upload local
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPullCloud}
            disabled={controlsDisabled}
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download cloud
          </Button>
        </div>

        <div className="flex items-start gap-2.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
          <Cloud className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Sync now compares local and cloud timestamps. Upload local overwrites cloud with this browser data.
            Download cloud overwrites this browser with the Supabase copy.
          </p>
        </div>
      </div>
    </Card>
  );
}
