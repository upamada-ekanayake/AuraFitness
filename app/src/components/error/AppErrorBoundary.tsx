import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AuraFitness render error:', error, info);
  }

  private reloadApp = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
          <div className="mb-6 h-1.5 w-16 rounded-full bg-indigo-500" />
          <h1 className="text-2xl font-black tracking-tight">AuraFitness needs a quick refresh</h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-400">
            Your local workout data is still saved in this browser. Reload the app and continue.
          </p>
          <Button type="button" variant="primary" onClick={this.reloadApp} className="mt-6 gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reload app
          </Button>
        </section>
      </main>
    );
  }
}
