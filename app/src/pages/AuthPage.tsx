import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import { Activity, BarChart3, Bot, CalendarDays } from 'lucide-react';

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

  const state = location.state as { from?: { pathname?: string } } | null;
  const nextPath = state?.from?.pathname && state.from.pathname !== '/auth' ? state.from.pathname : '/';

  if (!isLoading && (isAuthenticated || isDemoMode)) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      <main className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 max-w-6xl mx-auto px-6 py-10 lg:py-16 items-center">
        <section className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
              A
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">AuraFitness</h1>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-1">AI Fitness OS</p>
            </div>
          </div>

          <p className="text-lg md:text-xl text-slate-300 font-semibold leading-relaxed mt-8">
            Sign in to prepare your cloud-ready fitness workspace, or continue in local demo mode to keep exploring the MVP.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="info">Cloud sync coming next</Badge>
            <Badge variant="neutral">LocalStorage fallback retained</Badge>
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
