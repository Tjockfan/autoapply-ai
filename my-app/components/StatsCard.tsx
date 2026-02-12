'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconClassName,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                changeType === 'positive' && 'text-success-500',
                changeType === 'negative' && 'text-error-500',
                changeType === 'neutral' && 'text-gray-400'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-lg',
            iconClassName || 'bg-ocean-100 text-ocean-500'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
