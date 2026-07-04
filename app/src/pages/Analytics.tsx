
export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Visualize workout performance, consistency, streaks, and hydration logs.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Performance Trends</h2>
        <p className="mt-2 text-sm text-slate-600">
          View interactive graphs tracking your progress over time.
        </p>
      </div>
    </div>
  );
}
