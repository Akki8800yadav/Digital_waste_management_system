import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'default' | 'critical' | 'warning' | 'success';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  onClick
}) => {
  const borderVariants = {
    default: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
    critical: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20',
    warning: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20',
    success: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20'
  };

  const iconVariants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    critical: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 ${borderVariants[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-ecogreen/40 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconVariants[variant]}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>
          )}
          {trend && (
            <span className={`inline-flex items-center gap-1 font-medium ml-auto ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {trend.value} <span className="text-[10px] text-slate-400">{trend.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
