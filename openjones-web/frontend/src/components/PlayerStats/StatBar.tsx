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
 * Modern StatBar - displays stats with gradients and icons
 */
export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue,
  color,
  icon,
  className = '',
  showValue = true,
}) => {
  // Clamp value between 0 and maxValue
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const percentage = maxValue > 0 ? (clampedValue / maxValue) * 100 : 0;

  // Gradient color styles for the bar
  const colorGradients = {
    red: 'bg-gradient-to-r from-red-500 to-rose-600',
    yellow: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    green: 'bg-gradient-to-r from-emerald-500 to-green-600',
  };

  // Shadow colors for glow effect
  const shadowColors = {
    red: 'rgba(239, 68, 68, 0.4)',
    yellow: 'rgba(251, 191, 36, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    purple: 'rgba(168, 85, 247, 0.4)',
    green: 'rgba(16, 185, 129, 0.4)',
  };

  const barGradient = colorGradients[color];
  const shadowColor = shadowColors[color];

  return (
    <div className={`stat-bar ${className}`} data-testid={`stat-bar-${label.toLowerCase()}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="font-bold text-white text-sm">{label}</span>
        </div>
        {showValue && (
          <span className="text-slate-300 text-sm font-semibold" data-testid={`stat-value-${label.toLowerCase()}`}>
            {Math.round(clampedValue)}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
        <div
          className={`${barGradient} h-full transition-all duration-500 ease-out rounded-full`}
          style={{
            width: `${percentage}%`,
            boxShadow: percentage > 0 ? `0 0 12px ${shadowColor}` : 'none'
          }}
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
