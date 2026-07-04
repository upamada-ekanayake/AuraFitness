import { useState } from 'react';
import { Button } from '../ui/Button';

export interface CalorieTrackerFormProps {
  onAdd: (calories: number) => void;
  onSet: (calories: number) => void;
}

export default function CalorieTrackerForm({
  onAdd,
  onSet,
}: CalorieTrackerFormProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 10000) {
      setError('Please enter a valid calorie amount.');
      return;
    }

    setError(null);
    onSet(parsed);
    setInputValue('');
  };

  return (
    <div className="space-y-4">
      {/* Quick adds */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={() => onAdd(100)} className="text-xs">
          +100 kcal
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd(250)} className="text-xs">
          +250 kcal
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdd(500)} className="text-xs">
          +500 kcal
        </Button>
      </div>

      {/* Manual set form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2 items-center">
        <input
          type="number"
          min="0"
          placeholder="Set total kcal..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full"
        />
        <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs py-1.5 px-3">
          Set kcal
        </Button>
      </form>
      {error && <p className="text-[11px] font-semibold text-rose-300">{error}</p>}
    </div>
  );
}
