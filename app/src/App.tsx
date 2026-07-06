import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AuthGate from './components/auth/AuthGate';
import AppErrorBoundary from './components/error/AppErrorBoundary';
import Dashboard from './pages/Dashboard';
import RoutinePlanner from './pages/RoutinePlanner';
import WorkoutSession from './pages/WorkoutSession';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import WaterIntake from './pages/WaterIntake';
import Calories from './pages/Calories';
import More from './pages/More';

function protectedPage(page: ReactNode) {
  return (
    <AuthGate>
      <AppErrorBoundary>
        <AppShell>{page}</AppShell>
      </AppErrorBoundary>
    </AuthGate>
  );
}

import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useNativeSystemBars } from './hooks/useNativeSystemBars';

function BackButtonHandler() {
  useAndroidBackButton();
  useNativeSystemBars();
  return null;
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <BackButtonHandler />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={protectedPage(<Dashboard />)} />
          <Route path="/routine" element={protectedPage(<RoutinePlanner />)} />
          <Route path="/session" element={protectedPage(<WorkoutSession />)} />
          <Route path="/workout" element={protectedPage(<WorkoutSession />)} />
          <Route path="/water" element={protectedPage(<WaterIntake />)} />
          <Route path="/calories" element={protectedPage(<Calories />)} />
          <Route path="/analytics" element={protectedPage(<Analytics />)} />
          <Route path="/settings" element={protectedPage(<Settings />)} />
          <Route path="/more" element={protectedPage(<More />)} />
        </Routes>
      </Router>
    </AppErrorBoundary>
  );
}
