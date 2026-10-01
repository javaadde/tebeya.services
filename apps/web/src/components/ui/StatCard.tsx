import React from 'react';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'emerald' | 'amber' | 'blue';
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  const iconVariants = {
    default: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      {Icon && (
        <div className={cn('p-2.5 rounded-lg', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
