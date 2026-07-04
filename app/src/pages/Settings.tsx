import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { User, Settings as SettingsIcon, Shield, Sliders, Database } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import UserMenu from '../components/auth/UserMenu';
import { useCloudSync } from '../hooks/useCloudSync';
import CloudSyncCard from '../components/cards/CloudSyncCard';

export default function Settings() {
  const { data, profile, resetData, isReady } = useAppData();
  const { user, isAuthenticated } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { syncState, syncNow, pushNow, pullNow, canSync, isSyncing } = useCloudSync();

  if (!isReady || !profile || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading Preferences...
      </div>
    );
  }

  const routineDaysCount = data.weeklyRoutine.length;
  const workoutLogsCount = data.workoutLogs.length;
  const trackerLogsCount =
    data.waterLogs.length +
    data.calorieLogs.length +
    data.fastingLogs.length +
    data.bodyWeightLogs.length;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data to default seed values? This will wipe your current log progress.')) {
      resetData();
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your fitness preferences, profile settings, and AI rules configuration."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card Placeholder */}
        <div className="space-y-6">
          <Card title="User Profile" subtitle="Manage your biometric properties">
            <div className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-200">{profile.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Joined July 2026</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Body weight</span>
                <span className="font-bold text-slate-200">{profile.bodyWeightKg} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Fasting target</span>
                <span className="font-bold text-slate-200">{profile.fastingGoalHours} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Daily Water Goal</span>
                <span className="font-bold text-slate-200">{Math.round(profile.waterGoalLiters * 1000)} ml</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Target Goal</span>
                <span className="font-bold text-indigo-400 uppercase text-xs tracking-wider">{profile.goal.replace('_', ' ')}</span>
              </div>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card title="App Preferences" subtitle="Customize themes and units">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Weight Unit</span>
                </div>
                <Badge variant="neutral">Kilograms (kg)</Badge>
              </div>

              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Weekly Target</span>
                </div>
                <span className="text-slate-400 font-bold">{profile.weeklyWorkoutGoal} sessions</span>
              </div>
            </div>
          </Card>

          {/* Data Health summary Card */}
          <Card title="Data Health Summary" subtitle="Local storage health and record stats">
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Routine days count</span>
                <span className="text-slate-200 font-bold">{routineDaysCount} days</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Workout logs count</span>
                <span className="text-slate-200 font-bold">{workoutLogsCount} sessions</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Tracker logs count</span>
                <span className="text-slate-200 font-bold">{trackerLogsCount} records</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Storage mode</span>
                <Badge variant="success">LocalStorage</Badge>
              </div>
            </div>
          </Card>

          <Card title="Cloud Sync Foundation" subtitle="Supabase auth and database readiness">
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Cloud sync</span>
                <Badge variant={syncState.mode === 'cloud_enabled' ? 'success' : 'neutral'}>
                  {syncState.mode === 'cloud_enabled' ? 'Cloud enabled' : 'Local only'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Supabase configured</span>
                <Badge variant={isSupabaseConfigured ? 'success' : 'neutral'}>
                  {isSupabaseConfigured ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                <span className="text-slate-400 font-semibold">Last synced</span>
                <span className="text-slate-300 font-bold">
                  {syncState.lastSyncedAt ? new Date(syncState.lastSyncedAt).toLocaleDateString() : 'Not yet'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Storage mode</span>
                <span className="text-slate-300 font-bold text-right">LocalStorage + manual cloud sync</span>
              </div>
            </div>
          </Card>

          <CloudSyncCard
            status={syncState}
            canSync={canSync}
            isSyncing={isSyncing}
            onSyncNow={syncNow}
            onPushLocal={pushNow}
            onPullCloud={pullNow}
          />

          {/* System Actions / Reset Section */}
          <Card title="Database Actions" subtitle="Reset and clear application state data">
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Clearing your cache resets workouts, hydration tables, fasting periods, and weight indicators to original demo states.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Reset demo data
              </Button>
            </div>
          </Card>
        </div>

        {/* AI Configuration Section */}
        <div className="space-y-6">
          <Card title="Account" subtitle="Authentication and access status">
            <div className="space-y-4">
              <UserMenu />
              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">Auth status</span>
                  <Badge variant={isAuthenticated ? 'success' : isDemoMode ? 'warning' : 'neutral'}>
                    {isAuthenticated ? 'Signed in' : isDemoMode ? 'Demo mode' : 'Signed out'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">User email</span>
                  <span className="text-slate-300 font-bold text-right truncate pl-4">
                    {user?.email ?? 'Not signed in'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">Demo mode</span>
                  <Badge variant={isDemoMode ? 'warning' : 'neutral'}>
                    {isDemoMode ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">Supabase configured</span>
                  <Badge variant={isSupabaseConfigured ? 'success' : 'neutral'}>
                    {isSupabaseConfigured ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Cloud sync</span>
                  <Badge variant={syncState.status === 'synced' ? 'success' : syncState.status === 'error' ? 'danger' : 'neutral'}>
                    {syncState.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card title="AI Status" subtitle="Check the status of loaded AI engine models">
            <div className="space-y-4">
              
              {/* Core AI Parameters list */}
              <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">AI mode</span>
                  <span className="text-indigo-400 font-bold">Rule-based MVP</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">ML enabled</span>
                  <span className="text-slate-400 font-bold">No</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-semibold">LLM enabled</span>
                  <span className="text-slate-400 font-bold">No</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Data source</span>
                  <span className="text-slate-300 font-bold text-right truncate pl-4">Local app data + exported AI rules</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Rule Engine Model</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Status: Loaded (1730 exercises)</span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>

              <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl flex items-start gap-2.5">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Local Privacy First</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                    Your workout logs and biometrics remain local to this device. AuraFitness does not transmit fitness logs to remote servers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
