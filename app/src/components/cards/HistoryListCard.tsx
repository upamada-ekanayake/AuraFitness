import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface HistoryListItem {
  id: string;
  title: string;
  subtitle?: string;
  value: string;
  tone?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

export interface HistoryListCardProps {
  title: string;
  items: HistoryListItem[];
  emptyMessage?: string;
}

export default function HistoryListCard({
  title,
  items,
  emptyMessage = 'No history logs recorded.',
}: HistoryListCardProps) {
  return (
    <Card title={title} className="border border-slate-900 bg-slate-950/20">
      {items.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/10 text-xs text-slate-500 font-semibold leading-relaxed">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 -my-2">
          {items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center gap-4">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block truncate">
                    {item.subtitle}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-slate-100">
                  {item.value}
                </span>
                {item.tone && (
                  <Badge variant={item.tone} className="text-[8px] py-0 px-1">
                    {item.tone}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
