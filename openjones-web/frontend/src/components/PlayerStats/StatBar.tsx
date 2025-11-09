import React from 'react';

export interface StatBarProps {
  /** Label for the stat */
  label: string;
  /** Current value of the stat */
  value: number;
  /** Maximum value of the stat */
  maxValue: number;
  /** Color theme for the bar */
  color: 'red' | 'yellow' | 'blue' | 'purple' | 'green';
  /** Optional icon emoji */
  icon?: string;
  /** Optional className for customization */
  className?: string;
  /** Whether to show the numeric value */
  showValue?: boolean;
}

/**
 * Clean 2025 StatBar - Minimal progress bars
 */
export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color,
  icon: _icon,
  className = '',
  showValue = true,
}) => {
  // Clamp value between 0 and maxValue
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const percentage = maxValue > 0 ? (clampedValue / maxValue) * 100 : 0;

  // Clean single color for each bar - no gradients
  const barColors = {
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-emerald-500',
  };

  const barColor = barColors[color];

  return (
    <div className={`stat-bar ${className}`} data-testid={`stat-bar-${label.toLowerCase()}`}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-zinc-300 font-medium">{label}</span>
        {showValue && (
          <span className="text-sm text-zinc-400 font-semibold tabular-nums" data-testid={`stat-value-${label.toLowerCase()}`}>
            {Math.round(clampedValue)}
          </span>
        )}
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className={`${barColor} h-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          data-testid={`stat-bar-fill-${label.toLowerCase()}`}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label} progress`}
        />
      </div>
    </div>
  );
};
