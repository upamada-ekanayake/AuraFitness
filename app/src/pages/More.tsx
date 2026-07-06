import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BarChart2, 
  Settings as SettingsIcon, 
  Calendar, 
  Database,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAISuggestions } from '../hooks/useAISuggestions';
import { PageHeader } from '../components/layout/PageHeader';

export default function More() {
  const { data, profile, isReady } = useAppData();
  const { syncState } = useCloudSync();
  const { topSuggestions } = useAISuggestions();

  if (!isReady || !data || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading...
      </div>
    );
  }

  const activeSuggestionsCount = topSuggestions.length;
  
  const menuItems = [
    {
      title: 'Workout Planner',
      description: 'Customize splits, add exercises, and configure recovery timer.',
      icon: Calendar,
      to: '/routine',
      badge: `${data.weeklyRoutine.length} days active`
    },
    {
      title: 'Progress Analytics',
      description: 'Track calorie averages, water history, and weight trends.',
      icon: BarChart2,
      to: '/analytics',
      badge: '7-day trend'
    },
    {
      title: 'Preferences & Config',
      description: 'Manage targets, biometric goals, and rule engine status.',
      icon: SettingsIcon,
      to: '/settings'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="More Actions" 
        subtitle="Manage settings, review coach insights, and view progress history." 
      />

      {/* User profile summary */}
      <Card className="border-violet-400/20 bg-zinc-950/72">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-950/30">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-white">{profile.name || 'Athlete'}</h3>
            <p className="text-xs font-semibold text-zinc-400 mt-0.5">
              Goal: <span className="text-violet-300 font-bold uppercase">{profile.goal.replace('_', ' ')}</span> · Weight: <span className="text-zinc-200 font-bold">{profile.bodyWeightKg} kg</span>
            </p>
          </div>
          <Badge variant={syncState.status === 'synced' ? 'success' : 'neutral'} className="text-[10px] py-1 font-bold shrink-0">
            {syncState.status === 'synced' ? 'Synced' : 'Local'}
          </Badge>
        </div>
      </Card>

      {/* Navigation menu list */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.to} 
              to={item.to} 
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/8 bg-zinc-950/40 hover:bg-white/5 hover:border-white/12 transition-all duration-200 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/18 text-violet-300 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white">{item.title}</h4>
                  <p className="text-xs font-semibold text-zinc-500 truncate mt-0.5">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <Badge variant="neutral" className="text-[9px] py-0.5 font-bold">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick coach insight preview card */}
      <Card title="Coach Insight Preview" subtitle="Latest advice from the local rule engine.">
        {activeSuggestionsCount > 0 ? (
          <div className="p-3 border border-violet-500/14 bg-violet-500/5 rounded-2xl flex items-start gap-3">
            <BrainCircuit className="h-5 w-5 text-violet-300 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white">{topSuggestions[0].title}</h4>
              <p className="text-[11px] font-semibold text-zinc-400 mt-1 leading-relaxed">
                {topSuggestions[0].message}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold text-zinc-500">
            No dynamic coach recommendations active right now.
          </p>
        )}
      </Card>

      {/* Database/Sync info card */}
      <Card title="Storage & Cloud Status">
        <div className="flex items-center gap-3 text-xs justify-between">
          <div className="flex items-center gap-2 text-zinc-400 font-semibold">
            <Database className="h-4 w-4 text-zinc-500" />
            <span>Sync Mode</span>
          </div>
          <Badge variant={syncState.mode === 'cloud_enabled' ? 'success' : 'neutral'}>
            {syncState.mode === 'cloud_enabled' ? 'Cloud Sync Ready' : 'Local Only'}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
