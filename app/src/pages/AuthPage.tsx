import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import { Activity, BarChart3, Bot, CalendarDays } from 'lucide-react';
import { isNativeAndroidApp } from '../utils/platform';

const highlights = [
  { label: 'Routine planner', icon: CalendarDays },
  { label: 'Workout tracking', icon: Activity },
  { label: 'Daily trackers', icon: BarChart3 },
  { label: 'AI suggestions', icon: Bot },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDemoMode, enableDemo } = useDemoMode();
  const isNative = isNativeAndroidApp();

  const state = location.state as { from?: { pathname?: string } } | null;
  const nextPath = state?.from?.pathname && state.from.pathname !== '/auth' ? state.from.pathname : '/';

  if (!isLoading && (isAuthenticated || isDemoMode)) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <div className="min-h-screen bg-[#080907] text-stone-100 overflow-hidden relative">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#ff6b35]/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-[#14b8a6]/10 blur-3xl pointer-events-none" />
      <main className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 max-w-6xl mx-auto px-5 py-8 pt-[calc(2rem+env(safe-area-inset-top))] lg:py-14 items-center">
        <section className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c6ff00] flex items-center justify-center text-[#11130b] font-black shadow-lg shadow-[#c6ff00]/15">
              A
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">AuraFitness</h1>
              <p className="text-xs text-[#ffb000] font-bold uppercase tracking-wider mt-1">Native-ready training log</p>
            </div>
          </div>

          <p className="text-4xl md:text-6xl text-stone-100 font-black leading-[0.95] tracking-tight mt-8">
            Every rep, meal, sip, and streak in one calm place.
          </p>
          <p className="text-base md:text-lg text-stone-400 font-semibold leading-relaxed mt-5 max-w-xl">
            Track routines, workouts, hydration, calories, fasting, and progress without turning your phone into a spreadsheet.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#d9ff55]" />
                  <span className="text-sm font-bold text-stone-200">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {isNative && <Badge variant="info">Native Android App</Badge>}
            <Badge variant="success">Cloud sync ready</Badge>
            <Badge variant="neutral">Demo mode available</Badge>
          </div>
        </section>

        <section>
          <AuthForm
            onAuthenticated={() => navigate(nextPath, { replace: true })}
            onDemoMode={() => {
              enableDemo();
              navigate(nextPath, { replace: true });
            }}
          />
        </section>
      </main>
    </div>
  );
}
