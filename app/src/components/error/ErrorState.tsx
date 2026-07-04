import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <Card className="border-rose-500/20 bg-rose-950/20">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight">{title}</h2>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-400">{message}</p>
          </div>
        </div>

        {actionLabel && onAction && (
          <Button type="button" variant="secondary" onClick={onAction} className="self-start">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
