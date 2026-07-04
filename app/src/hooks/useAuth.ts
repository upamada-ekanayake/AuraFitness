import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../services/authService';
import type { AuthSignUpResult, AuthState, AuthUserProfile } from '../types/auth';
import { getFriendlyAuthError } from '../utils/errors';

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
      const message = getFriendlyAuthError(error);
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
        const result = await signUpWithEmail(email, password);
        setUserState(result.user);
        return result;
      } catch (error) {
        const message = getFriendlyAuthError(error);
        setAuthState((current) => ({ ...current, isLoading: false, error: message }));
        return {
          user: null,
          requiresEmailConfirmation: false,
        } satisfies AuthSignUpResult;
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
        const message = getFriendlyAuthError(error);
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
      const message = getFriendlyAuthError(error);
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
