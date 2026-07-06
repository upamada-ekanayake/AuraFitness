import { useState } from 'react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import { useAppData } from '../hooks/useAppData';
import { getTodayIsoDate } from '../services/appDataService';
import { getCaloriesBurnedToday, getCaloriesRemaining, getMacroTotals } from '../services/nutritionService';
import { createId } from '../utils/id';
import { getCalorieHistory } from '../utils/analytics';
import { calculateProgress, getTodayCalorieLog } from '../utils/tracker';
import type { CalorieEntry } from '../types/app';

const quickCalories = [100, 250, 500];

export default function Calories() {
  const { data, profile, isReady, addMealEntry, deleteMealEntry } = useAppData();
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');

  if (!isReady || !data || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-zinc-400">
        Loading Calories…
      </div>
    );
  }

  const today = getTodayIsoDate();
  const calorieLog = getTodayCalorieLog(data.calorieLogs, today) ?? {
    date: today,
    calories: 0,
    goalCalories: profile.calorieGoal,
  };
  const burnedCalories = getCaloriesBurnedToday(data.workoutLogs, today);
  const remainingCalories = getCaloriesRemaining(calorieLog, burnedCalories);
  const progress = calculateProgress(calorieLog.calories, calorieLog.goalCalories);
  const todayEntries = data.calorieEntries
    .filter((entry) => entry.date === today)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const macros = getMacroTotals(todayEntries);
  const weeklyCalories = getCalorieHistory(data.calorieLogs, 7).map((item) => ({
    label: item.date,
    value: item.calories,
  }));

  const addEntry = (entryCalories: number, entryName = 'Quick Add') => {
    const entry: CalorieEntry = {
      id: createId('meal'),
      date: today,
      mealName: entryName,
      calories: entryCalories,
      proteinG: Number(proteinG) || undefined,
      carbsG: Number(carbsG) || undefined,
      fatG: Number(fatG) || undefined,
      createdAt: new Date().toISOString(),
    };
    addMealEntry(entry);
  };

  const submitMeal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const entryCalories = Math.round(Number(calories));
    if (!Number.isFinite(entryCalories) || entryCalories <= 0) return;
    addEntry(entryCalories, mealName.trim() || 'Meal');
    setMealName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Calories"
        subtitle="Track food, fuel training, and keep the remaining number clear."
        actions={<Badge variant={remainingCalories >= 0 ? 'info' : 'danger'}>{remainingCalories} kcal Left</Badge>}
      />

      <Card className="border-violet-400/20 bg-zinc-950/72">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-violet-200">
              <Flame className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">Today</span>
            </div>
            <p className="mt-3 text-4xl font-black tabular-nums text-white">{calorieLog.calories} kcal</p>
            <p className="mt-1 text-sm font-semibold text-zinc-400">
              Goal {calorieLog.goalCalories} kcal · Estimated burn {burnedCalories} kcal
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
            <span className="block text-[10px] font-bold uppercase text-zinc-500">Remaining</span>
            <span className="text-2xl font-black tabular-nums text-violet-200">{remainingCalories}</span>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/8 bg-white/5 p-2">
            <span className="block text-[10px] font-bold uppercase text-zinc-500">Protein</span>
            <span className="font-black text-white">{macros.proteinG}g</span>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/5 p-2">
            <span className="block text-[10px] font-bold uppercase text-zinc-500">Carbs</span>
            <span className="font-black text-white">{macros.carbsG}g</span>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/5 p-2">
            <span className="block text-[10px] font-bold uppercase text-zinc-500">Fat</span>
            <span className="font-black text-white">{macros.fatG}g</span>
          </div>
        </div>
      </Card>

      <Card title="Quick Add" subtitle="Fast logging for snacks and gym-day meals.">
        <div className="grid grid-cols-3 gap-2">
          {quickCalories.map((amount) => (
            <Button key={amount} type="button" variant="secondary" size="lg" onClick={() => addEntry(amount)}>
              +{amount}
            </Button>
          ))}
        </div>
      </Card>

      <Card title="Meal Entry" subtitle="Add food manually when you need more detail.">
        <form onSubmit={submitMeal} className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Meal Name</span>
            <input
              name="mealName"
              value={mealName}
              onChange={(event) => setMealName(event.target.value)}
              placeholder="Chicken rice…"
              autoComplete="off"
              className="mt-1 min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Calories</span>
              <input
                type="number"
                name="calories"
                inputMode="numeric"
                min="1"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="450…"
                autoComplete="off"
                className="mt-1 min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Protein</span>
              <input
                type="number"
                name="proteinG"
                inputMode="decimal"
                min="0"
                value={proteinG}
                onChange={(event) => setProteinG(event.target.value)}
                placeholder="30g…"
                autoComplete="off"
                className="mt-1 min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Carbs</span>
              <input
                type="number"
                name="carbsG"
                inputMode="decimal"
                min="0"
                value={carbsG}
                onChange={(event) => setCarbsG(event.target.value)}
                placeholder="45g…"
                autoComplete="off"
                className="mt-1 min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fat</span>
              <input
                type="number"
                name="fatG"
                inputMode="decimal"
                min="0"
                value={fatG}
                onChange={(event) => setFatG(event.target.value)}
                placeholder="12g…"
                autoComplete="off"
                className="mt-1 min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
              />
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Meal
          </Button>
        </form>
      </Card>

      <Card title="Today’s Entries" subtitle="Food logged for this date.">
        {todayEntries.length === 0 ? (
          <p className="text-sm font-semibold text-zinc-500">No meals logged today.</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/24 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{entry.mealName}</p>
                  <p className="text-xs font-semibold text-zinc-500">{entry.calories} kcal</p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${entry.mealName}`}
                  onClick={() => deleteMealEntry(entry.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-zinc-400 hover:border-rose-400/30 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <SimpleBarChart
        title="Calories Trend"
        data={weeklyCalories}
        valueSuffix=" kcal"
        emptyMessage="No calorie logs for this week."
      />
    </div>
  );
}
