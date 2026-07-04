export const AURA_DEMO_MODE_KEY = 'aurafitness:demo-mode:v1';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function isDemoModeEnabled(): boolean {
  if (!canUseStorage()) return false;

  return window.localStorage.getItem(AURA_DEMO_MODE_KEY) === 'true';
}

export function enableDemoMode(): void {
  if (!canUseStorage()) return;

  window.localStorage.setItem(AURA_DEMO_MODE_KEY, 'true');
}

export function disableDemoMode(): void {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(AURA_DEMO_MODE_KEY);
}
