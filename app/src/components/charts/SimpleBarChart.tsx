import { Card } from '../ui/Card';

export interface SimpleBarChartDatum {
  label: string;
  value: number;
  helper?: string;
}

export interface SimpleBarChartProps {
  title: string;
  data: SimpleBarChartDatum[];
  valueSuffix?: string;
  emptyMessage?: string;
}

export default function SimpleBarChart({
  title,
  data,
  valueSuffix = '',
  emptyMessage = 'No history records found.',
}: SimpleBarChartProps) {
  
  const hasData = data && data.length > 0;
  const values = hasData ? data.map((d) => d.value) : [];
  const maxVal = hasData ? Math.max(...values, 0) : 0;

  // Format short date label: e.g. "2026-07-04" -> "07/04" or "Sat"
  const getShortLabel = (label: string) => {
    if (label.includes('-')) {
      const parts = label.split('-');
      if (parts.length >= 3) {
        return `${parts[1]}/${parts[2]}`;
      }
    }
    return label;
  };

  return (
    <Card title={title} className="border border-violet-200/8 bg-zinc-950/30">
      {!hasData || maxVal === 0 ? (
        <div className="h-40 flex items-center justify-center border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/30 text-xs text-zinc-500 font-semibold leading-relaxed">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Chart Viewport */}
          <div className="h-44 flex items-end gap-3 px-2 pt-6 relative border-b border-zinc-800">
            {/* Grid references */}
            <div className="absolute left-0 top-2 text-[9px] font-bold text-zinc-600">
              {maxVal.toFixed(1)}{valueSuffix}
            </div>
            <div className="absolute left-0 bottom-2 text-[9px] font-bold text-zinc-600">
              0{valueSuffix}
            </div>

            {data.map((datum, idx) => {
              // Scale height relative to maxVal
              const heightPercent = maxVal > 0 ? (datum.value / maxVal) * 90 : 0;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer">
                  {/* Tooltip hover tag */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-violet-300/20 text-[10px] text-zinc-100 font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    {datum.value}
                    {valueSuffix}
                  </div>

                  {/* Vertical bar */}
                  <div
                    className="w-full bg-violet-500 hover:bg-violet-400 rounded-t-sm transition-[height,background-color] duration-300 relative"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />

                  {/* Horizontal line ticks indicator */}
                  <div className="w-1.5 h-1 bg-zinc-800 mt-0.5 shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Labels Row */}
          <div className="flex gap-3 px-2 text-[10px] text-zinc-500 font-bold justify-around">
            {data.map((datum, idx) => (
              <span key={idx} className="flex-1 text-center truncate select-none">
                {getShortLabel(datum.label)}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
