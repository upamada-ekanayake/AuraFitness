import { useState } from 'react';
import { Button } from '../ui/Button';

export interface WaterTrackerFormProps {
  onAdd: (liters: number) => void;
  onSet: (liters: number) => void;
}

export default function WaterTrackerForm({ onAdd, onSet }: WaterTrackerFormProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 15) {
      setError('Please enter a valid water amount.');
      return;
    }

    setError(null);
    onSet(parsed);
    setInputValue('');
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={() => onAdd(0.25)} className="text-xs">
          +250 ml
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd(0.5)} className="text-xs">
          +500 ml
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd(1.0)} className="text-xs">
          +1.0 L
        </Button>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2 items-center">
        <input
          type="number"
          step="0.05"
          min="0"
          placeholder="Custom liters..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full"
        />
        <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs py-1.5 px-3">
          Set L
        </Button>
      </form>
      {error && <p className="text-[11px] font-semibold text-rose-300">{error}</p>}
    </div>
  );
}
