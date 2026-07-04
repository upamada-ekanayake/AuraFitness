import { useState } from 'react';
import { Button } from '../ui/Button';

export interface BodyWeightFormProps {
  latestWeightKg: number;
  onSubmit: (weightKg: number) => void;
}

export default function BodyWeightForm({ latestWeightKg, onSubmit }: BodyWeightFormProps) {
  const [inputValue, setInputValue] = useState<string>(latestWeightKg ? latestWeightKg.toString() : '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed) || parsed < 25 || parsed > 300) {
      setError('Body weight looks too low/high. Check the value.');
      return;
    }

    setError(null);
    onSubmit(parsed);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="number"
          step="0.05"
          min="25"
          max="300"
          placeholder="Enter today's weight (kg)..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full"
        />
        <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs py-1.5 px-3">
          Log Weight
        </Button>
      </form>
      {error && <p className="text-[11px] font-semibold text-rose-300">{error}</p>}
    </div>
  );
}
