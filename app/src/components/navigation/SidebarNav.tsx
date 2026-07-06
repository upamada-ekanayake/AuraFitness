import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';
import UserMenu from '../auth/UserMenu';
import { loadActiveWorkoutSession } from '../../services/activeWorkoutSessionService';

export default function SidebarNav() {
  const location = useLocation();
  const hasActiveSession = loadActiveWorkoutSession() !== null;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0b0c09]/78 backdrop-blur-xl border-r border-white/8 p-6 shrink-0 h-screen sticky top-0 z-20">
      <div className="flex items-center gap-3 px-2 mb-8 select-none">
        <div className="w-10 h-10 rounded-xl bg-[#c6ff00] flex items-center justify-center text-[#11130b] font-black shadow-lg shadow-[#c6ff00]/15">
          A
        </div>
        <div>
          <span className="font-extrabold text-stone-100 text-lg tracking-tight">AuraFitness</span>
          <span className="block text-[10px] text-[#ffb000] font-bold tracking-wider uppercase">Training log</span>
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
                  ? 'bg-[#c6ff00]/10 text-[#d9ff55] border border-[#c6ff00]/15 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/6 border border-transparent'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive ? 'text-[#d9ff55]' : 'text-stone-500 group-hover:text-stone-400'
                  )}
                />
                {item.path === '/workout' && hasActiveSession && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c6ff00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c6ff00]"></span>
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
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">AI Core Status</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c6ff00] animate-pulse" />
            <span className="text-xs text-stone-300 font-semibold">Rule engine loaded</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
