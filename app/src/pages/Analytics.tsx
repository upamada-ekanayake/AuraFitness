import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { BarChart2, TrendingUp, RefreshCw } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Fitness Analytics"
        subtitle="Visualize your performance progress, overload milestones, and consistency."
        actions={
          <div className="flex gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              Live Updates Active
            </span>
          </div>
        }
      />

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Volume Progression" subtitle="Total weight loaded over time">
          <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 mt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Volume chart placeholder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-semibold text-center">
            * Interactive Recharts/ChartJS visualizations will populate this section later.
          </p>
        </Card>

        <Card title="Weekly Target Adherence" subtitle="Goal completion percentage">
          <div className="flex justify-center items-center py-6">
            <ProgressRing value={80} max={100} label="adherence" size={120} />
          </div>
          <p className="text-xs text-slate-500 text-center font-semibold">
            You completed 4 of 5 planned sessions this week.
          </p>
        </Card>

        <Card title="Activity Split" subtitle="Volume by major muscle group">
          <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 mt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Muscle split chart placeholder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-semibold text-center">
            * Bar charts showing chest vs leg volume splits will load here.
          </p>
        </Card>
      </div>

      {/* Progress rings details */}
      <Card title="Consistency Insights" subtitle="Monthly progress overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
          <ProgressRing value={90} max={100} label="workout" size={85} />
          <ProgressRing value={75} max={100} label="water" size={85} />
          <ProgressRing value={60} max={100} label="calories" size={85} />
          <ProgressRing value={100} max={100} label="rest discipline" size={85} />
        </div>
      </Card>
    </div>
  );
}
