
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back! Here is your daily fitness overview and AI suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Daily Workouts</h2>
          <p className="mt-2 text-3xl font-bold text-slate-950">Active Streak</p>
          <div className="mt-4 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block font-medium">
            Streak Insight Loaded
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Water Intake</h2>
          <p className="mt-2 text-3xl font-bold text-slate-950">0 / 2500 ml</p>
          <div className="mt-4 text-xs text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md inline-block font-medium">
            Track daily hydration
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Calorie Balance</h2>
          <p className="mt-2 text-3xl font-bold text-slate-950">0 kcal</p>
          <div className="mt-4 text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md inline-block font-medium">
            Active calorie estimation
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">AI Daily Suggestion</h2>
        <p className="mt-2 text-sm text-slate-600">
          The recommendation engine rules will show tailored workout and overload insights here.
        </p>
      </div>
    </div>
  );
}
