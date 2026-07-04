import { Card } from '../ui/Card';

export interface SimpleLineChartDatum {
  label: string;
  value: number;
  helper?: string;
}

export interface SimpleLineChartProps {
  title: string;
  data: SimpleLineChartDatum[];
  valueSuffix?: string;
  emptyMessage?: string;
}

export default function SimpleLineChart({
  title,
  data,
  valueSuffix = '',
  emptyMessage = 'No trend records logged.',
}: SimpleLineChartProps) {
  
  const hasData = data && data.length > 0;
  const values = hasData ? data.map((d) => d.value) : [];
  
  // Calculate boundaries
  const maxVal = hasData ? Math.max(...values) : 0;
  const minVal = hasData ? Math.min(...values) : 0;
  const delta = maxVal - minVal;
  const range = delta === 0 ? 10 : delta;

  // Viewbox coordinates
  const svgWidth = 300;
  const svgHeight = 120;
  const paddingLeft = 25;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute coordinate points
  const points = data.map((datum, idx) => {
    const x =
      data.length > 1
        ? paddingLeft + (idx / (data.length - 1)) * chartWidth
        : svgWidth / 2;
    
    // Scale y coordinates inversely (0 is top, height is bottom)
    const normalizedY = range > 0 ? (datum.value - minVal) / range : 0.5;
    const y = svgHeight - paddingBottom - normalizedY * chartHeight;
    
    return { x, y, value: datum.value, label: datum.label };
  });

  // String formatting for polyline: "x,y x,y x,y"
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Shorten label helpers
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
    <Card title={title} className="border border-slate-900 bg-slate-900/10">
      {!hasData ? (
        <div className="h-40 flex items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20 text-xs text-slate-500 font-semibold leading-relaxed">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* SVG Viewport */}
          <div className="relative">
            {/* Legend indicators */}
            <div className="absolute left-1 top-1 text-[8px] font-bold text-slate-600">
              High: {maxVal.toFixed(1)}{valueSuffix}
            </div>
            <div className="absolute left-1 bottom-1 text-[8px] font-bold text-slate-600">
              Low: {minVal.toFixed(1)}{valueSuffix}
            </div>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-36 overflow-visible"
            >
              {/* Grid Lines */}
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={svgWidth - paddingRight}
                y2={paddingTop}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2"
              />
              <line
                x1={paddingLeft}
                y1={svgHeight - paddingBottom}
                x2={svgWidth - paddingRight}
                y2={svgHeight - paddingBottom}
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Polyline Path */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  points={pointsString}
                />
              )}

              {/* Circles at nodes */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#a5b4fc"
                    stroke="#4f46e5"
                    strokeWidth="1.5"
                  />
                  {/* Tooltip trigger details */}
                  <title>
                    {p.value} {valueSuffix} ({p.label})
                  </title>
                </g>
              ))}
            </svg>
          </div>

          {/* Labels Row */}
          <div className="flex gap-2 text-[9px] text-slate-500 font-bold justify-around">
            {points.map((p, idx) => (
              <span key={idx} className="text-center truncate w-8 select-none">
                {getShortLabel(p.label)}
              </span>
            ))}
          </div>

        </div>
      )}
    </Card>
  );
}
