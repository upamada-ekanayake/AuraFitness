import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { isNativeAndroidApp } from '../../utils/platform';

export default function InstallAppCard() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const isNative = isNativeAndroidApp();

  if (isNative) {
    return (
      <Card title="App status" subtitle="Native Android Application">
        <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-200">Running as Native Android App</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                You are using the Capacitor wrapper version of AuraFitness.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="App install" subtitle="Install AuraFitness as an app">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isInstalled ? 'success' : canInstall ? 'info' : 'neutral'}>
            {isInstalled ? 'Installed' : canInstall ? 'Ready to install' : 'Manual install'}
          </Badge>
          <Badge variant="success">Basic offline shell</Badge>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-200">AuraFitness works best installed from your browser.</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                Offline support loads the basic app shell. Cloud sync, login, and Supabase account features need internet.
              </p>
            </div>
          </div>
        </div>

        {canInstall && (
          <Button type="button" variant="primary" onClick={() => void promptInstall()} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Install AuraFitness
          </Button>
        )}

        {!isInstalled && !canInstall && (
          <div className="space-y-2 rounded-xl border border-slate-900 bg-slate-950/30 px-3 py-3 text-xs font-semibold text-slate-400 leading-relaxed">
            <p>Android Chrome: browser menu, then Add to Home screen or Install app.</p>
            <p>iPhone Safari: Share, then Add to Home Screen.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
