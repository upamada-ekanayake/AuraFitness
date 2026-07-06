import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';
import { loadActiveWorkoutSession } from '../../services/activeWorkoutSessionService';

export default function MobileBottomNav() {
  const location = useLocation();
  const hasActiveSession = loadActiveWorkoutSession() !== null;
  const mobileItems = navItems.filter((item) => item.mobile);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08070b]/94 backdrop-blur-2xl border-t border-violet-300/10 flex justify-around items-center h-[calc(74px+env(safe-area-inset-bottom))] pb-[calc(env(safe-area-inset-bottom)+0.25rem)] px-2 z-50 shadow-2xl shadow-black/45">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path === '/workout' && (location.pathname === '/session' || location.pathname === '/workout')) ||
          (item.path === '/more' && ['/routine', '/analytics', '/settings', '/more'].includes(location.pathname));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex h-13 w-12 flex-col items-center justify-center rounded-2xl transition-colors duration-200 active:scale-95',
              isActive
                ? 'bg-violet-500/16 text-violet-100 font-semibold border border-violet-300/25 shadow-lg shadow-violet-950/30'
                : 'text-zinc-500 border border-transparent hover:text-zinc-300'
            )}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
              {item.path === '/workout' && hasActiveSession && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-300"></span>
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
