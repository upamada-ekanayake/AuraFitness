export const AURA_STORAGE_KEY = "aurafitness:data:v1";

/**
 * Checks if window and localStorage are available on the current platform.
 * Safe for server/build environments where 'window' might be undefined.
 */
export function isStorageAvailable(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
}

/**
 * Safely reads a value from local storage and returns parsed JSON.
 * Returns null if storage is unavailable or on parse failures.
 */
export function readStorage<T>(key: string): T | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`AuraFitness Storage parse error for key "${key}":`, error);
    return null;
  }
}

/**
 * Safely writes a value to local storage.
 * Does nothing if storage is unavailable or on stringify errors.
 */
export function writeStorage<T>(key: string, value: T): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`AuraFitness Storage stringify error for key "${key}":`, error);
  }
}

/**
 * Safely removes a key from local storage.
 */
export function removeStorage(key: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`AuraFitness Storage remove error for key "${key}":`, error);
  }
}
