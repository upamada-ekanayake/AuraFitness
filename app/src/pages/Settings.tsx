
export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your fitness goals, weights, rest durations, and rules parameters.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">User Configuration</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tailor variables for water goals, target weights, and routine preferences.
        </p>
      </div>
    </div>
  );
}
