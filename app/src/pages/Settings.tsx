import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User, Settings as SettingsIcon, Shield, Sliders } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your fitness preferences, profile settings, and AI rules configuration."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card Placeholder */}
        <div className="space-y-6">
          <Card title="User Profile" subtitle="Manage your biometric properties">
            <div className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-200">AuraFitness User</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Joined July 2026</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-850 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Body weight</span>
                <span className="font-semibold text-slate-200">75.0 kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fasting target</span>
                <span className="font-semibold text-slate-200">16 hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Daily Water Goal</span>
                <span className="font-semibold text-slate-200">2,500 ml</span>
              </div>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card title="App Preferences" subtitle="Customize themes and units">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Weight Unit</span>
                </div>
                <Badge variant="neutral">Kilograms (kg)</Badge>
              </div>

              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-semibold">Weekly Target</span>
                </div>
                <span className="text-slate-400 font-bold">5 sessions</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Configuration Section */}
        <div className="space-y-6">
          <Card title="AI Status" subtitle="Check the status of loaded AI engine models">
            <div className="space-y-4">
              
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Rule Engine Model</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Status: Loaded (1730 exercises)</span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Machine Learning (ML)</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Status: Not initialized for MVP</span>
                </div>
                <Badge variant="neutral">Disabled</Badge>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Large Language Model (LLM)</span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Status: Disabled by privacy policy</span>
                </div>
                <Badge variant="neutral">Offline</Badge>
              </div>

              <div className="p-4 bg-slate-950/20 border border-slate-850 rounded-xl flex items-start gap-2.5">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Local Privacy First</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                    Your workout logs and biometrics remain local to this device. AuraFitness does not transmit fitness logs to remote servers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
