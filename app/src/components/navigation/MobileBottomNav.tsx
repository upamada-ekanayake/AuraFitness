import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';
import { loadActiveWorkoutSession } from '../../services/activeWorkoutSessionService';

export default function MobileBottomNav() {
  const location = useLocation();
  const hasActiveSession = loadActiveWorkoutSession() !== null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0c09]/92 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-[calc(74px+env(safe-area-inset-bottom))] pb-[calc(env(safe-area-inset-bottom)+0.25rem)] px-3 z-50 shadow-2xl shadow-black/45">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/workout' && location.pathname === '/session');
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-13 h-13 rounded-2xl transition-all duration-200 active:scale-95',
              isActive
                ? 'bg-[#c6ff00]/12 text-[#d9ff55] font-semibold border border-[#c6ff00]/25 shadow-lg shadow-[#c6ff00]/10'
                : 'text-stone-500 border border-transparent'
            )}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
              {item.path === '/workout' && hasActiveSession && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c6ff00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c6ff00]"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
