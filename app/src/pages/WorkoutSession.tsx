
export default function WorkoutSession() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Workout</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track sets, reps, weights, and rest intervals.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Workout Tracker</h2>
        <p className="mt-2 text-sm text-slate-600">
          Begin your workout session to track active progress and receive progressive overload cues.
        </p>
      </div>
    </div>
  );
}
