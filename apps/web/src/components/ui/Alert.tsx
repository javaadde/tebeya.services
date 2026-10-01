import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm',
        variants[variant],
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
