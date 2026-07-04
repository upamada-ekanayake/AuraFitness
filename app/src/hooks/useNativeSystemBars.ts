import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isNativeAndroidApp } from '../utils/platform';

const SYSTEM_BAR_COLOR = '#09090b';

export function useNativeSystemBars(): void {
  useEffect(() => {
    if (!isNativeAndroidApp()) return;

    async function applySystemBars() {
      try {
        await StatusBar.setBackgroundColor({ color: SYSTEM_BAR_COLOR });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // Native system bar styling is best-effort and should never block app startup.
      }
    }

    void applySystemBars();
  }, []);
}
