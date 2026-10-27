import React from 'react';

interface FillBarProps {
  fillLevel: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  distanceCm?: number;
}

export const FillBar: React.FC<FillBarProps> = ({ 
  fillLevel, 
  showLabel = true, 
  size = 'md',
  distanceCm 
}) => {
  const clamped = Math.max(0, Math.min(100, fillLevel));

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700 dark:text-emerald-400';
  let badgeBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  if (clamped >= 92) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700 dark:text-rose-400 font-bold';
    badgeBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  } else if (clamped >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400 font-semibold';
    badgeBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  } else if (clamped >= 50) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-700 dark:text-yellow-400';
    badgeBg = 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            Fill Capacity
            {distanceCm !== undefined && (
              <span className="text-[10px] text-slate-400 font-mono">({distanceCm}cm left)</span>
            )}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${badgeBg}`}>
            {clamped}%
          </span>
        </div>
      )}
      <div 
        className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`${clamped}% full`}
      >
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
