import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDemoMode } from '../../hooks/useDemoMode';
import { Badge } from '../ui/Badge';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading, isSupabaseReady } = useAuth();
  const { isDemoMode } = useDemoMode();
  const location = useLocation();

  if (!isSupabaseReady) {
    return (
      <>
        <div className="mb-4">
          <Badge variant="warning">Local demo mode active</Badge>
        </div>
        {children}
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-semibold">
        Checking account session...
      </div>
    );
  }

  if (isAuthenticated || isDemoMode) {
    return <>{children}</>;
  }

  return <Navigate to="/auth" replace state={{ from: location }} />;
}
