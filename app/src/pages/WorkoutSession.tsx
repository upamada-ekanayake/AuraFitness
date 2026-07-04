import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Play, Dumbbell, Award } from 'lucide-react';

export default function WorkoutSession() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout Session"
        subtitle="Track your active sets, weight, reps, and overload criteria in real-time."
        actions={
          <Button variant="primary" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start today's workout
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Layout: Session Starter & Current Targets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Empty State / Session Ready Panel */}
          <Card className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 border border-slate-800">
            <div className="p-4 rounded-full bg-slate-950/60 text-slate-500 mb-4">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No session in progress</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-2">
              Ready to crush it? Load today's split, log your reps, and beat your personal records.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" className="flex items-center gap-2">
                <Play className="w-4 h-4" /> Start Push Day
              </Button>
              <Button variant="secondary">Browse splits</Button>
            </div>
          </Card>

          {/* Active Exercise Card Placeholder */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">Active Exercise Guide</h3>
            <Card className="opacity-50">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="info">Upcoming</Badge>
                  <h4 className="text-base font-bold text-slate-200 mt-2">Flat Barbell Bench Press</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Target Muscle: Chest | Equipment: Barbell</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block font-semibold">Suggested Goal</span>
                  <span className="text-sm font-bold text-indigo-400 mt-1 block">4 sets x 8 reps @ 80 kg</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Layout: Session Tools / Overload rules reminder */}
        <div className="space-y-6">
          <Card title="Session Utilities" subtitle="Safety and metrics guidelines">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Overload Target</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Maintain strict form. Add reps/weight only when completing all sets at matching RPE.
                </p>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rest Timer</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-slate-100">02:00</span>
                  <Button size="sm" variant="secondary" className="h-8 py-0">Reset</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
