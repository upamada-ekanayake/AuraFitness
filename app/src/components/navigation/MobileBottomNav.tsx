import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 flex justify-around items-center h-16 px-4 z-50 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 active:scale-95',
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-500'
            )}
          >
            <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
