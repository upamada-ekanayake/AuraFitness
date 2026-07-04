import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Plus, ChevronRight } from 'lucide-react';

export default function RoutinePlanner() {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Routine Planner"
        subtitle="Schedule your workouts, construct weekly split templates, and target muscles."
        actions={
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create weekly routine
          </Button>
        }
      />

      {/* Empty State Card */}
      <Card className="flex flex-col items-center justify-center text-center p-10 bg-slate-900/20 border border-dashed border-slate-800">
        <div className="p-4 rounded-full bg-slate-950/60 text-slate-500 mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No active weekly routine</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-2">
          Weekly plans help you maintain gym streaks. Establish your targeted days and exercises to begin.
        </p>
        <Button variant="secondary" className="mt-6">
          Set up Weekly Split
        </Button>
      </Card>

      {/* Weekly Days Grid Placeholders */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 tracking-tight">Weekly Planner Slots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weekDays.map((day) => (
            <Card
              key={day}
              className="flex justify-between items-center p-4 hover:border-slate-700/60 cursor-pointer transition-all duration-200 group"
            >
              <div>
                <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {day}
                </span>
                <span className="block text-xs text-slate-500 mt-1 font-semibold">Unplanned</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
