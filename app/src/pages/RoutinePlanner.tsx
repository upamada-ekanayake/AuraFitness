
export default function RoutinePlanner() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Routine Planner</h1>
        <p className="mt-2 text-sm text-slate-600">
          Plan your weekly split, view recommendations, and assign exercises.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Weekly Split Planner</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create structured routines utilizing the loaded AuraFitness exercises.
        </p>
      </div>
    </div>
  );
}
