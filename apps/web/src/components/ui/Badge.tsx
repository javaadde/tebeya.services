import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'sky'
    | 'amber';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  className,
  dot = false,
}: BadgeProps) {
  const variants = {
    default: 'bg-[#f7f4ef] text-stone-700 border-[#dad0c3]',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-[#e6f0dc] text-[#487226] border-[#cee2be]',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    amber: 'bg-[#f4f0ea] text-[#8f7d67] border-[#dad0c3]',
  };

  const dotColors = {
    default: 'bg-stone-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-[#598A31]',
    purple: 'bg-purple-500',
    sky: 'bg-sky-500',
    amber: 'bg-[#ab9b84]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize select-none',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'published':
    case 'active':
    case 'present':
    case 'paid':
      return (
        <Badge variant="success" dot>
          {status.replace('_', ' ')}
        </Badge>
      );
    case 'pending_verification':
    case 'pending':
    case 'late':
      return (
        <Badge variant="warning" dot>
          {status.replace('_', ' ')}
        </Badge>
      );
    case 'cancelled':
    case 'suspended':
    case 'absent':
    case 'expired':
      return (
        <Badge variant="danger" dot>
          {status.replace('_', ' ')}
        </Badge>
      );
    case 'draft':
    case 'used':
    case 'revoked':
      return (
        <Badge variant="default" dot>
          {status.replace('_', ' ')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="info" dot>
          {status}
        </Badge>
      );
    default:
      return <Badge variant="default">{status.replace('_', ' ')}</Badge>;
  }
}

export function SlotBadge({ slot }: { slot: string }) {
  const styles: Record<string, 'amber' | 'sky' | 'purple' | 'info' | 'default'> = {
    breakfast: 'amber',
    lunch: 'sky',
    snacks: 'purple',
    dinner: 'info',
    custom: 'default',
  };
  return <Badge variant={styles[slot] || 'default'}>{slot}</Badge>;
}
