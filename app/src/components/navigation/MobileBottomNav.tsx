import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 flex justify-around items-center h-[calc(72px+env(safe-area-inset-bottom))] pb-[calc(env(safe-area-inset-bottom)+0.25rem)] px-3 z-50 shadow-2xl shadow-black/40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-13 h-13 rounded-2xl transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-indigo-500/12 text-indigo-300 font-semibold border border-indigo-500/20 shadow-lg shadow-indigo-950/30'
                : 'text-slate-500 border border-transparent'
            )}
            aria-label={item.label}
          >
            <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
