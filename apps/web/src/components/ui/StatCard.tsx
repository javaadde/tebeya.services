import React from 'react';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'emerald' | 'amber' | 'blue' | 'terracotta' | 'featured';
  layout?: 'vertical' | 'horizontal';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  layout = 'vertical',
  onClick,
}: StatCardProps) {
  const isFeatured = variant === 'featured' || variant === 'terracotta';

  if (layout === 'vertical') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative p-5 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between text-center select-none min-h-[140px]',
          isFeatured
            ? 'bg-[#598A31] text-white shadow-lg shadow-[#598A31]/25 hover:bg-[#487226]'
            : 'bg-white text-stone-900 shadow-sm hover:shadow-md',
          onClick && 'cursor-pointer hover:-translate-y-0.5'
        )}
      >
        {Icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              isFeatured
                ? 'bg-white/20 text-white'
                : 'bg-[#f7f4ef] text-stone-700'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        <div className="my-2.5">
          <div
            className={cn(
              'text-2xl font-black tracking-tight leading-none',
              isFeatured ? 'text-white' : 'text-stone-900'
            )}
          >
            {value}
          </div>
          <div
            className={cn(
              'text-xs font-semibold mt-1 leading-tight',
              isFeatured ? 'text-white/90' : 'text-stone-500'
            )}
          >
            {label}
          </div>
        </div>

        {subtext && (
          <div
            className={cn(
              'text-[11px] leading-tight',
              isFeatured ? 'text-white/80' : 'text-stone-400'
            )}
          >
            {subtext}
          </div>
        )}

        {isFeatured && (
          <div className="absolute -bottom-2.5 w-6 h-6 rounded-full bg-white text-[#598A31] shadow-md flex items-center justify-center text-[10px] font-bold">
            ↗
          </div>
        )}
      </div>
    );
  }

  const iconVariants = {
    default: 'bg-[#f7f4ef] text-stone-700',
    emerald: 'bg-emerald-50 text-emerald-800',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-sky-50 text-sky-800',
    terracotta: 'bg-[#e6f0dc] text-[#487226]',
    featured: 'bg-[#598A31] text-white',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white p-5 rounded-2xl shadow-sm flex items-start justify-between transition-all',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </p>
        <p className="text-2xl font-black text-stone-900 mt-2">{value}</p>
        {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
      </div>
      {Icon && (
        <div className={cn('p-2.5 rounded-xl', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
