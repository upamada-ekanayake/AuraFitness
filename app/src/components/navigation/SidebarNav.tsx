import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';
import UserMenu from '../auth/UserMenu';
import { loadActiveWorkoutSession } from '../../services/activeWorkoutSessionService';
import auraLogo from '../../assets/brand/aura-logo.png';

export default function SidebarNav() {
  const location = useLocation();
  const hasActiveSession = loadActiveWorkoutSession() !== null;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#08070b]/82 backdrop-blur-xl border-r border-violet-200/8 p-6 shrink-0 h-screen sticky top-0 z-20">
      <div className="flex items-center gap-3 px-2 mb-8 select-none">
        <img src={auraLogo} alt="AuraFitness" width={40} height={40} className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-violet-950/40" />
        <div>
          <span className="font-extrabold text-zinc-100 text-lg tracking-tight">AuraFitness</span>
          <span className="block text-[10px] text-violet-200 font-bold tracking-wider uppercase">Gym app</span>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/workout' && location.pathname === '/session');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group active:scale-98',
                isActive
                  ? 'bg-violet-500/14 text-violet-100 border border-violet-300/18 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/6 border border-transparent'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive ? 'text-violet-100' : 'text-zinc-500 group-hover:text-zinc-400'
                  )}
                />
                {item.path === '/workout' && hasActiveSession && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-300"></span>
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <UserMenu />
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Coach Status</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
            <span className="text-xs text-zinc-300 font-semibold">Rule engine ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
