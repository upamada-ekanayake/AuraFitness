function readMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : null;
  }

  return null;
}

function includesAny(value: string, needles: string[]): boolean {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
}

export function getErrorMessage(error: unknown): string {
  return readMessage(error) || 'Something went wrong. Please try again.';
}

export function getFriendlyAuthError(error: unknown): string {
  const message = getErrorMessage(error);

  if (includesAny(message, ['invalid login credentials', 'invalid email or password'])) {
    return 'Invalid email or password.';
  }

  if (includesAny(message, ['already registered', 'user already exists', 'already been registered'])) {
    return 'This email is already registered. Try signing in instead.';
  }

  if (includesAny(message, ['password', 'at least 6', 'weak password'])) {
    return 'Password must be at least 6 characters.';
  }

  if (includesAny(message, ['supabase is not configured', 'failed to fetch', 'network', 'fetch'])) {
    return 'Cloud login is unavailable right now. You can continue in demo mode.';
  }

  if (includesAny(message, ['email rate limit', 'rate limit'])) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return 'Cloud login is unavailable right now. You can continue in demo mode.';
}

export function getFriendlySyncError(error: unknown): string {
  const message = getErrorMessage(error);

  if (includesAny(message, ['row-level security', 'violates row-level security', 'policy', 'permission denied', '42501'])) {
    return 'Cloud sync failed. Check Supabase table policies.';
  }

  if (includesAny(message, ['relation', 'does not exist', 'schema cache', 'user_app_data'])) {
    return 'Cloud sync is not ready yet. Check Supabase table setup.';
  }

  if (includesAny(message, ['supabase is not configured', 'failed to fetch', 'network', 'fetch'])) {
    return 'Cloud sync is unavailable right now. Your local data is still saved on this device.';
  }

  if (includesAny(message, ['jwt', 'session', 'auth', 'unauthorized'])) {
    return 'Please sign in again to continue cloud sync.';
  }

  return 'Cloud sync failed. Your local data is still saved on this device.';
}
