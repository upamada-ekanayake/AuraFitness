import { useState } from 'react';
import { Droplets, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import { useAppData } from '../hooks/useAppData';
import { getTodayIsoDate } from '../services/appDataService';
import { createUpdatedWaterLog, getRemainingWaterMl, toLiters, toMilliliters } from '../services/hydrationService';
import { getWaterHistory } from '../utils/analytics';
import { calculateProgress, getTodayWaterLog } from '../utils/tracker';

const quickAmounts = [100, 250, 500];

export default function WaterIntake() {
  const { data, profile, isReady, upsertWater } = useAppData();
  const [customMl, setCustomMl] = useState('');

  if (!isReady || !data || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold text-zinc-400">
        Loading Water…
      </div>
    );
  }

  const today = getTodayIsoDate();
  const waterLog = getTodayWaterLog(data.waterLogs, today) ?? {
    date: today,
    liters: 0,
    goalLiters: profile.waterGoalLiters || 3,
  };
  const currentMl = toMilliliters(waterLog.liters);
  const goalMl = toMilliliters(waterLog.goalLiters);
  const remainingMl = getRemainingWaterMl(waterLog);
  const progress = calculateProgress(waterLog.liters, waterLog.goalLiters);
  const weeklyWater = getWaterHistory(data.waterLogs, 7).map((item) => ({
    label: item.date,
    value: toMilliliters(item.liters),
  }));

  const addWater = (amountMl: number) => {
    upsertWater(createUpdatedWaterLog(waterLog, amountMl));
  };

  const setWater = (amountMl: number) => {
    upsertWater({
      ...waterLog,
      liters: toLiters(Math.max(amountMl, 0)),
    });
  };

  const submitCustom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(customMl);
    if (!Number.isFinite(amount) || amount <= 0) return;
    addWater(Math.round(amount));
    setCustomMl('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Water Intake"
        subtitle="Log hydration quickly during training and keep today’s target visible."
        actions={<Badge variant={progress >= 100 ? 'success' : 'info'}>{progress}% Today</Badge>}
      />

      <Card className="border-violet-400/20 bg-zinc-950/72">
        <div className="grid grid-cols-[120px_1fr] gap-5 sm:grid-cols-[150px_1fr]">
          <ProgressRing value={currentMl} max={goalMl} label="Water" size={116} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-violet-200">
              <Droplets className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">Today</span>
            </div>
            <p className="mt-3 text-4xl font-black tabular-nums text-white">{currentMl} ml</p>
            <p className="mt-1 text-sm font-semibold text-zinc-400">
              {remainingMl > 0 ? `${remainingMl} ml remaining` : 'Daily goal complete'}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Quick Add" subtitle="Use one tap between sets.">
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button key={amount} type="button" variant="secondary" size="lg" onClick={() => addWater(amount)}>
              +{amount} ml
            </Button>
          ))}
        </div>
        <form onSubmit={submitCustom} className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <label className="min-w-0">
            <span className="sr-only">Custom water amount in milliliters</span>
            <input
              type="number"
              name="customWaterMl"
              inputMode="numeric"
              min="1"
              value={customMl}
              onChange={(event) => setCustomMl(event.target.value)}
              placeholder="Custom ml…"
              autoComplete="off"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-semibold text-white placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/35"
            />
          </label>
          <Button type="submit" variant="primary">Add</Button>
        </form>
      </Card>

      <Card title="Edit Today" subtitle="Correct the total if you logged the wrong amount.">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={() => setWater(Math.max(currentMl - 250, 0))}>
            -250 ml
          </Button>
          <Button type="button" variant="ghost" onClick={() => setWater(0)} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset Today
          </Button>
        </div>
      </Card>

      <SimpleBarChart
        title="Water Trend"
        data={weeklyWater}
        valueSuffix=" ml"
        emptyMessage="No water logs for this week."
      />
    </div>
  );
}
