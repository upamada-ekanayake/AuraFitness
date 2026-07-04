import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/authService';
import type { AuthState, AuthUserProfile } from '../types/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setUserState = useCallback((user: AuthUserProfile | null, error: string | null = null) => {
    setAuthState({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      error,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    setAuthState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const user = await getCurrentUser();
      setUserState(user);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh auth session.';
      setUserState(null, message);
      return null;
    }
  }, [setUserState]);

  useEffect(() => {
    void refreshUser();

    const unsubscribe = onAuthStateChange((user) => {
      setUserState(user);
    });

    return unsubscribe;
  }, [refreshUser, setUserState]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      setAuthState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const user = await signUpWithEmail(email, password);
        setUserState(user);
        return user;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create account.';
        setAuthState((current) => ({ ...current, isLoading: false, error: message }));
        return null;
      }
    },
    [setUserState]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const user = await signInWithEmail(email, password);
        setUserState(user);
        return user;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign in.';
        setAuthState((current) => ({ ...current, isLoading: false, error: message }));
        return null;
      }
    },
    [setUserState]
  );

  const signOut = useCallback(async () => {
    setAuthState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      await signOutUser();
      setUserState(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      setAuthState((current) => ({ ...current, isLoading: false, error: message }));
    }
  }, [setUserState]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isSupabaseReady: isSupabaseConfigured,
  };
}
