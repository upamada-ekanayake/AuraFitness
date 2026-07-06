import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import { Activity, BarChart3, Droplets, Flame } from 'lucide-react';
import { isNativeAndroidApp } from '../utils/platform';
import auraLogo from '../assets/brand/aura-logo.png';

const highlights = [
  { label: 'Workout', icon: Activity },
  { label: 'Water', icon: Droplets },
  { label: 'Calories', icon: Flame },
  { label: 'Progress', icon: BarChart3 },
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
    <div className="min-h-screen bg-[#08070b] text-zinc-100 overflow-hidden relative">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-700/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-fuchsia-700/10 blur-3xl pointer-events-none" />
      <main className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_440px] gap-6 max-w-5xl mx-auto px-5 py-6 pt-[calc(1.5rem+env(safe-area-inset-top))] lg:py-10 items-center">
        <section className="max-w-xl">
          <div className="flex items-center gap-3">
            <img src={auraLogo} alt="AuraFitness" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover shadow-xl shadow-violet-950/50" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">AuraFitness</h1>
              <p className="text-xs text-violet-200 font-bold uppercase tracking-wider mt-1">Gym App</p>
            </div>
          </div>

          <p className="text-3xl md:text-4xl text-zinc-100 font-black leading-tight tracking-tight mt-7 text-pretty">
            Open your training log and get to work.
          </p>
          <p className="text-sm md:text-base text-zinc-400 font-semibold leading-relaxed mt-4 max-w-lg">
            Sign in or use demo mode to track today’s workout, water, calories, and progress.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-7">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-violet-200" aria-hidden="true" />
                  <span className="text-sm font-bold text-zinc-200">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {isNative && <Badge variant="info">Native Android App</Badge>}
            <Badge variant="success">Cloud Sync Ready</Badge>
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
