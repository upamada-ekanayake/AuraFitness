import { useNavigate } from 'react-router-dom';
import { Cloud, LogOut, Monitor, UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDemoMode } from '../../hooks/useDemoMode';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface UserMenuProps {
  compact?: boolean;
}

export default function UserMenu({ compact = false }: UserMenuProps) {
  const { user, isAuthenticated, signOut, isSupabaseReady } = useAuth();
  const { isDemoMode, disableDemo } = useDemoMode();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    disableDemo();
    navigate('/auth', { replace: true });
  };

  const handleExitDemo = () => {
    disableDemo();
    navigate('/auth', { replace: true });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3">
        <div className="min-w-0">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account</span>
          <span className="block text-xs text-slate-200 font-bold truncate">
            {isAuthenticated ? user?.email ?? 'Signed in' : isDemoMode || !isSupabaseReady ? 'Demo mode' : 'Signed out'}
          </span>
        </div>
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleExitDemo}>Exit</Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
          <UserCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Account Mode</span>
          <span className="text-xs text-slate-200 font-bold block truncate mt-1">
            {isAuthenticated ? user?.email ?? 'Signed in' : isDemoMode || !isSupabaseReady ? 'Demo mode' : 'Signed out'}
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {isAuthenticated && <Badge variant="success">Signed in</Badge>}
            {(isDemoMode || !isSupabaseReady) && <Badge variant="warning">Demo mode</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-[11px] text-slate-400 font-semibold">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> LocalStorage</span>
          <span className="text-slate-200">Active</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5" /> Cloud status</span>
          <span className={isAuthenticated ? 'text-emerald-300' : 'text-slate-300'}>
            {isAuthenticated ? 'Connected' : 'Local-only'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {isAuthenticated ? (
          <Button variant="secondary" size="sm" onClick={handleSignOut} className="w-full flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleExitDemo} className="w-full">
            Exit demo mode
          </Button>
        )}
      </div>
    </div>
  );
}
