import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'slate' | 'amber' | 'indigo' | 'purple' | 'orange';

const variantMap: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  success: 'bg-success-100 text-success-700 border-success-200',
  danger: 'bg-danger-100 text-danger-700 border-danger-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'primary', className, dot = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
          variantMap[variant],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  color?: string;
  showValue?: boolean;
  height?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  label,
  color = 'bg-gradient-to-r from-primary-400 to-primary-600',
  showValue = false,
  height = 'h-2.5',
  animated = true,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
          {showValue && <span className="text-xs font-bold text-primary-700">{value}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", height)}>
        <div
          className={cn(
            height,
            color,
            "rounded-full",
            animated && "transition-all duration-700 ease-out"
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
