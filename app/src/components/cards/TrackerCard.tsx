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
    <Card title={title} subtitle={subtitle} className="border border-white/8 bg-[#10110d]/72">
      <div className="space-y-4">
        
        {/* Metric Details */}
        <div className="flex justify-between items-end">
          <div className="min-w-0">
            <span className="text-2xl font-black text-stone-100 tracking-tight block">
              {value}
            </span>
            {helper && (
              <span className="text-xs text-stone-500 font-semibold mt-1 block">
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
          <div className="w-full bg-black/35 rounded-full h-1.5 border border-white/8 overflow-hidden">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                tone === 'success'
                  ? 'bg-[#c6ff00]'
                  : tone === 'info'
                  ? 'bg-[#14b8a6]'
                  : tone === 'warning'
                  ? 'bg-[#ffb000]'
                  : tone === 'danger'
                  ? 'bg-[#ff4d6d]'
                  : 'bg-stone-700'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Children details (quick inputs or buttons) */}
        {children && (
          <div className="pt-3 border-t border-white/8 mt-2">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}
