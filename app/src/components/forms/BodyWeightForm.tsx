import { useState } from 'react';
import { Button } from '../ui/Button';

export interface BodyWeightFormProps {
  latestWeightKg: number;
  onSubmit: (weightKg: number) => void;
}

export default function BodyWeightForm({ latestWeightKg, onSubmit }: BodyWeightFormProps) {
  const [inputValue, setInputValue] = useState<string>(latestWeightKg ? latestWeightKg.toString() : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      onSubmit(parsed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="number"
        step="0.05"
        min="1"
        placeholder="Enter today's weight (kg)..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full"
      />
      <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs py-1.5 px-3">
        Log Weight
      </Button>
    </form>
  );
}
