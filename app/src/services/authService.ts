import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { AuthUserProfile } from '../types/auth';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add Vite Supabase environment variables to enable auth.');
  }

  return supabase;
}

function toAuthUserProfile(user: User | null): AuthUserProfile | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at,
  };
}

function getFriendlyAuthError(error: unknown): Error {
  if (error instanceof Error) {
    return new Error(error.message || 'Supabase auth request failed.');
  }

  return new Error('Supabase auth request failed.');
}

export async function getCurrentUser(): Promise<AuthUserProfile | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.getUser();

    if (error) throw error;

    return toAuthUserProfile(data.user);
  } catch (error) {
    if (!isSupabaseConfigured) return null;
    throw getFriendlyAuthError(error);
  }
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthUserProfile | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({ email, password });

    if (error) throw error;

    return toAuthUserProfile(data.user);
  } catch (error) {
    throw getFriendlyAuthError(error);
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUserProfile | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) throw error;

    return toAuthUserProfile(data.user);
  } catch (error) {
    throw getFriendlyAuthError(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();

    if (error) throw error;
  } catch (error) {
    throw getFriendlyAuthError(error);
  }
}

export function onAuthStateChange(
  callback: (user: AuthUserProfile | null) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    callback(null);
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAuthUserProfile(session?.user ?? null));
  });

  return () => data.subscription.unsubscribe();
}
