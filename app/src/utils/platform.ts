import { Capacitor } from "@capacitor/core";

export function isNativeAndroidApp(): boolean {
  return Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();
}

export function isStandalonePwa(): boolean {
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function getRuntimePlatform(): "web" | "pwa" | "android" {
  if (isNativeAndroidApp()) {
    return "android";
  }
  if (isStandalonePwa()) {
    return "pwa";
  }
  return "web";
}
