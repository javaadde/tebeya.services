import React from 'react';
import { cn } from '../../utils/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className={cn('w-full text-left text-sm text-stone-700', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <thead className={cn('bg-[#f7f4ef] text-xs font-semibold uppercase text-stone-500 border-b border-stone-100', className)}>{children}</thead>;
}

export function TableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-stone-100/80 last:border-none transition-colors',
        onClick && 'cursor-pointer hover:bg-[#faf8f5]',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3.5 align-middle', className)}>{children}</td>;
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 align-middle', className)}>{children}</th>;
}

export function TableEmpty({ message = 'No data available' }: { message?: string }) {
  return (
    <tbody>
      <tr>
        <td colSpan={100} className="px-4 py-8 text-center text-sm text-gray-400">
          {message}
        </td>
      </tr>
    </tbody>
  );
}
