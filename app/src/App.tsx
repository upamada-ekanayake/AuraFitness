import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Play, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import RoutinePlanner from './pages/RoutinePlanner';
import WorkoutSession from './pages/WorkoutSession';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Navigation layout wrapper to access useLocation
function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/routine', label: 'Planner', icon: Calendar },
    { path: '/workout', label: 'Workout', icon: Play },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
            A
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">AuraFitness</span>
            <span className="block text-xs text-indigo-600 font-semibold tracking-wider uppercase">AI Inside</span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-500 font-medium block">Active Engine</span>
          <span className="text-xs text-indigo-700 font-bold block mt-0.5">Rule-Based Recommendations</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routine" element={<RoutinePlanner />} />
          <Route path="/workout" element={<WorkoutSession />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Bottom Bar - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-4 z-50 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
