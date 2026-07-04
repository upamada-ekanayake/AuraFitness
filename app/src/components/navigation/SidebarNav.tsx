import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';
import UserMenu from '../auth/UserMenu';

export default function SidebarNav() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950/60 backdrop-blur-xl border-r border-slate-900 p-6 shrink-0 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2 mb-8 select-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
          A
        </div>
        <div>
          <span className="font-extrabold text-slate-100 text-lg tracking-tight">AuraFitness</span>
          <span className="block text-[10px] text-indigo-400 font-bold tracking-wider uppercase">AI Fitness OS</span>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group active:scale-98',
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <UserMenu />
        <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Core Status</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-semibold">Rule Engine Loaded</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
