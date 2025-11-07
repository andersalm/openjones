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
  /** Optional className for customization */
  className?: string;
  /** Whether to show the numeric value */
  showValue?: boolean;
}

/**
 * StatBar component - displays a labeled progress bar with color coding
 */
export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color,
  className = '',
  showValue = true,
}) => {
  // Clamp value between 0 and maxValue
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const percentage = maxValue > 0 ? (clampedValue / maxValue) * 100 : 0;

  // Color classes for the bar
  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  // Determine bar color based on percentage for health-like stats
  const getStatusColor = (): string => {
    if (percentage >= 70) return colorClasses.green;
    if (percentage >= 40) return colorClasses.yellow;
    return colorClasses.red;
  };

  // Use status color for red/yellow/green, otherwise use specified color
  const barColor = color === 'red' && percentage > 30 ? getStatusColor() : colorClasses[color];

  return (
    <div className={`stat-bar ${className}`} data-testid={`stat-bar-${label.toLowerCase()}`}>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-semibold text-gray-700">{label}</span>
        {showValue && (
          <span className="text-gray-600" data-testid={`stat-value-${label.toLowerCase()}`}>
            {Math.round(clampedValue)}/{maxValue}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-400">
        <div
          className={`${barColor} h-full transition-all duration-300 ease-out`}
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
