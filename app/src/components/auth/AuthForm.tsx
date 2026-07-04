import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { isNativeAndroidApp } from '../../utils/platform';

interface AuthFormProps {
  onDemoMode: () => void;
  onAuthenticated: () => void;
}

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthForm({ onDemoMode, onAuthenticated }: AuthFormProps) {
  const { signIn, signUp, isLoading, error, isSupabaseReady } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isNative = isNativeAndroidApp();

  const isSignUp = mode === 'sign-up';
  const title = isSignUp ? 'Create your account' : 'Welcome back';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setMessage(null);

    if (!isSupabaseReady) {
      setLocalError('Cloud login is unavailable right now. You can continue in demo mode.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (isSignUp) {
      const result = await signUp(email, password);

      if (result.user) {
        setMessage('Account created. You are signed in.');
        onAuthenticated();
        return;
      }

      if (result.requiresEmailConfirmation) {
        setMessage('Account created. Please check your email to confirm your account.');
      }
      return;
    }

    const user = await signIn(email, password);

    if (user) {
      onAuthenticated();
    }
  };

  const visibleError = localError ?? error;

  return (
    <Card className="border-slate-800/80 bg-slate-950/70 shadow-2xl shadow-indigo-950/20">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Badge variant={isSupabaseReady ? 'success' : 'warning'}>
            {isSupabaseReady ? 'Supabase ready' : 'Local demo available'}
          </Badge>
          {isNative && (
            <Badge variant="info" className="ml-2">
              <Smartphone className="w-3 h-3 mr-1" /> Android
            </Badge>
          )}
          <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-3">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp ? 'Create a profile you can sync to cloud.' : 'Sign in to restore or sync your fitness data.'}
          </p>
        </div>
        <ShieldCheck className="w-7 h-7 text-indigo-400 shrink-0" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</span>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</span>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
            />
          </div>
        </label>

        {isSignUp && (
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</span>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
          </label>
        )}

        {visibleError && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {visibleError}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
            {message}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? 'Working...' : isSignUp ? 'Sign up' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-3">
        <Button type="button" variant="secondary" onClick={onDemoMode} className="w-full">
          Continue in demo mode
        </Button>
        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? 'sign-in' : 'sign-up');
            setLocalError(null);
            setMessage(null);
          }}
          className="text-xs text-slate-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mt-5">
        Demo mode stores data only on this device. Sign in when you want cloud backup and restore.
      </p>
    </Card>
  );
}
