import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0c09]/92 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-[calc(74px+env(safe-area-inset-bottom))] pb-[calc(env(safe-area-inset-bottom)+0.25rem)] px-3 z-50 shadow-2xl shadow-black/45">
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
                ? 'bg-[#c6ff00]/12 text-[#d9ff55] font-semibold border border-[#c6ff00]/25 shadow-lg shadow-[#c6ff00]/10'
                : 'text-stone-500 border border-transparent'
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
