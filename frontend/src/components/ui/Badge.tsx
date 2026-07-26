import React from 'react';

type BadgeVariant = 'emerald' | 'indigo' | 'amber' | 'red' | 'slate' | 'teal' | 'purple';

const variantMap: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'emerald', className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        variantMap[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

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
  color = 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  showValue = false,
  height = 'h-2.5',
  animated = true,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
          {showValue && <span className="text-xs font-bold text-emerald-700">{value}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${color} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
