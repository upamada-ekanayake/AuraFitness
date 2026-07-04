import { useState } from 'react';
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
import InstallAppCard from '../components/pwa/InstallAppCard';
import type { UserProfile } from '../types/app';

type ProfileFormState = {
  name: string;
  bodyWeightKg: string;
  fastingGoalHours: string;
  waterGoalMl: string;
  calorieGoal: string;
  weeklyWorkoutGoal: string;
  goal: UserProfile['goal'];
};

const goalLabels: Record<UserProfile['goal'], string> = {
  fat_loss: 'Fat loss',
  muscle_gain: 'Muscle gain',
  maintenance: 'Maintenance',
  strength: 'Strength',
};

function createProfileFormState(profile: UserProfile): ProfileFormState {
  return {
    name: profile.name,
    bodyWeightKg: String(profile.bodyWeightKg),
    fastingGoalHours: String(profile.fastingGoalHours),
    waterGoalMl: String(Math.round(profile.waterGoalLiters * 1000)),
    calorieGoal: String(profile.calorieGoal),
    weeklyWorkoutGoal: String(profile.weeklyWorkoutGoal),
    goal: profile.goal,
  };
}

export default function Settings() {
  const { data, profile, resetData, isReady, updateProfile } = useAppData();
  const { user, isAuthenticated } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { syncState, syncNow, pushNow, pullNow, canSync, isSyncing } = useCloudSync();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

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

  const handleStartEdit = () => {
    setProfileForm(createProfileFormState(profile));
    setProfileError(null);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setProfileForm(null);
    setProfileError(null);
    setIsEditingProfile(false);
  };

  const updateProfileForm = (field: keyof ProfileFormState, value: ProfileFormState[keyof ProfileFormState]) => {
    setProfileForm((current) => (current ? { ...current, [field]: value } : current));
    setProfileError(null);
  };

  const handleSaveProfile = () => {
    if (!profileForm) return;

    const name = profileForm.name.trim();
    const bodyWeightKg = Number(profileForm.bodyWeightKg);
    const fastingGoalHours = Number(profileForm.fastingGoalHours);
    const waterGoalMl = Number(profileForm.waterGoalMl);
    const calorieGoal = Number(profileForm.calorieGoal);
    const weeklyWorkoutGoal = Number(profileForm.weeklyWorkoutGoal);

    if (!name) return setProfileError('Please enter your name.');
    if (!Number.isFinite(bodyWeightKg) || bodyWeightKg < 25 || bodyWeightKg > 300) {
      return setProfileError('Body weight looks too low/high. Check the value.');
    }
    if (!Number.isFinite(fastingGoalHours) || fastingGoalHours < 0 || fastingGoalHours > 24) {
      return setProfileError('Fasting target must be between 0 and 24 hours.');
    }
    if (!Number.isFinite(waterGoalMl) || waterGoalMl < 500 || waterGoalMl > 10000) {
      return setProfileError('Daily water goal should be between 500 and 10000 ml.');
    }
    if (!Number.isFinite(calorieGoal) || calorieGoal < 800 || calorieGoal > 8000) {
      return setProfileError('Calorie target should be between 800 and 8000 kcal.');
    }
    if (!Number.isInteger(weeklyWorkoutGoal) || weeklyWorkoutGoal < 1 || weeklyWorkoutGoal > 14) {
      return setProfileError('Weekly workout target should be between 1 and 14 sessions.');
    }

    updateProfile({
      name,
      bodyWeightKg,
      fastingGoalHours,
      waterGoalLiters: waterGoalMl / 1000,
      calorieGoal,
      weeklyWorkoutGoal,
      goal: profileForm.goal,
    });
    handleCancelEdit();
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
                <span className="font-bold text-indigo-400 uppercase text-xs tracking-wider">{goalLabels[profile.goal]}</span>
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleStartEdit} className="mt-5 w-full">
              Edit profile
            </Button>
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
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Calorie Target</span>
                </div>
                <span className="text-slate-400 font-bold">{profile.calorieGoal} kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Fitness Goal</span>
                </div>
                <Badge variant="info">{goalLabels[profile.goal]}</Badge>
              </div>
            </div>
          </Card>

          {isEditingProfile && profileForm && (
            <Card title="Edit Profile" subtitle="Saved locally immediately after you tap Save">
              <div className="space-y-4">
                {profileError && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
                    {profileError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Name</span>
                    <input value={profileForm.name} onChange={(e) => updateProfileForm('name', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Goal</span>
                    <select value={profileForm.goal} onChange={(e) => updateProfileForm('goal', e.target.value as UserProfile['goal'])} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500">
                      {Object.entries(goalLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Body weight kg</span>
                    <input type="number" min="25" max="300" step="0.1" value={profileForm.bodyWeightKg} onChange={(e) => updateProfileForm('bodyWeightKg', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Fasting hours</span>
                    <input type="number" min="0" max="24" step="0.5" value={profileForm.fastingGoalHours} onChange={(e) => updateProfileForm('fastingGoalHours', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Water goal ml</span>
                    <input type="number" min="500" max="10000" step="50" value={profileForm.waterGoalMl} onChange={(e) => updateProfileForm('waterGoalMl', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Calorie target</span>
                    <input type="number" min="800" max="8000" step="50" value={profileForm.calorieGoal} onChange={(e) => updateProfileForm('calorieGoal', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Weekly workout target</span>
                    <input type="number" min="1" max="14" step="1" value={profileForm.weeklyWorkoutGoal} onChange={(e) => updateProfileForm('weeklyWorkoutGoal', e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="button" variant="primary" onClick={handleSaveProfile} className="w-full sm:w-auto">Save changes</Button>
                  <Button type="button" variant="ghost" onClick={handleCancelEdit} className="w-full sm:w-auto">Cancel</Button>
                </div>
                {isAuthenticated && (
                  <p className="text-[11px] text-slate-500 font-semibold">
                    After saving, use Upload local in Cloud Sync to copy these changes to your account.
                  </p>
                )}
              </div>
            </Card>
          )}

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

          <InstallAppCard />

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
