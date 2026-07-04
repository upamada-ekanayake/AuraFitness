import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface TrackerCardProps {
  title: string;
  subtitle?: string;
  value: string;
  helper?: string;
  progress?: number;
  tone?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  children?: React.ReactNode;
}

export default function TrackerCard({
  title,
  subtitle,
  value,
  helper,
  progress,
  tone = 'neutral',
  children,
}: TrackerCardProps) {
  
  // Resolve badge tone mappings
  const getBadgeVariant = () => {
    switch (tone) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'danger':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <Card title={title} subtitle={subtitle} className="border border-slate-900 bg-slate-900/10">
      <div className="space-y-4">
        
        {/* Metric Details */}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-black text-slate-100 tracking-tight block">
              {value}
            </span>
            {helper && (
              <span className="text-xs text-slate-500 font-semibold mt-1 block">
                {helper}
              </span>
            )}
          </div>

          {progress !== undefined && (
            <Badge variant={getBadgeVariant()} className="font-bold text-xs">
              {progress}%
            </Badge>
          )}
        </div>

        {/* Progress bar indication */}
        {progress !== undefined && (
          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                tone === 'success'
                  ? 'bg-emerald-500'
                  : tone === 'info'
                  ? 'bg-indigo-500'
                  : tone === 'warning'
                  ? 'bg-amber-500'
                  : tone === 'danger'
                  ? 'bg-rose-500'
                  : 'bg-slate-700'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Children details (quick inputs or buttons) */}
        {children && (
          <div className="pt-3 border-t border-slate-900/60 mt-2">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}
