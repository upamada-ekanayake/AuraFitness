import { useCallback, useEffect, useState } from 'react';
import {
  AURA_DEMO_MODE_KEY,
  disableDemoMode,
  enableDemoMode,
  isDemoModeEnabled,
} from '../services/demoModeService';

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(isDemoModeEnabled());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AURA_DEMO_MODE_KEY) {
        setIsDemoMode(isDemoModeEnabled());
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const enableDemo = useCallback(() => {
    enableDemoMode();
    setIsDemoMode(true);
  }, []);

  const disableDemo = useCallback(() => {
    disableDemoMode();
    setIsDemoMode(false);
  }, []);

  return {
    isDemoMode,
    enableDemo,
    disableDemo,
  };
}
