import React from 'react';
import { theme } from '../../theme';

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
 * StatBar component - Retro pixel-perfect progress bar
 * Features:
 * - Chunky pixel borders
 * - Bright retro colors from DOS palette
 * - Stepped fill animation
 * - High contrast design
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

  // Retro color palette - Bright DOS colors
  const colorMap = {
    red: theme.colors.status.health,       // #FF0000
    yellow: theme.colors.status.happiness, // #FFFF00
    blue: theme.colors.status.education,   // #0000FF
    purple: theme.colors.status.career,    // #800080
    green: theme.colors.status.wealth,     // #00FF00
  };

  const barColor = colorMap[color];

  const containerStyle: React.CSSProperties = {
    marginBottom: theme.spacing.sm,
  };

  const labelRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.xs,
  };

  const labelStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
    textTransform: 'uppercase',
  };

  const valueStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
  };

  const barBackgroundStyle: React.CSSProperties = {
    width: '100%',
    height: '16px',
    background: theme.colors.neutral.white,
    border: `3px solid ${theme.colors.neutral.black}`,
    borderRadius: theme.borderRadius.none,
    overflow: 'hidden',
    boxShadow: 'inset 2px 2px 0px #808080',
    position: 'relative',
    imageRendering: 'pixelated',
  };

  const barFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    background: barColor,
    transition: 'none', // No smooth transitions - retro!
    imageRendering: 'pixelated',
    position: 'relative',
    // Add chunky pixel pattern to the fill
    backgroundImage: percentage > 0 ? `
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.1) 0px,
        rgba(255, 255, 255, 0.1) 2px,
        transparent 2px,
        transparent 4px
      )
    ` : 'none',
  };

  return (
    <div style={containerStyle} className={className} data-testid={`stat-bar-${label.toLowerCase()}`}>
      <div style={labelRowStyle}>
        <span style={labelStyle}>{label}</span>
        {showValue && (
          <span style={valueStyle} data-testid={`stat-value-${label.toLowerCase()}`}>
            {Math.round(clampedValue)}/{maxValue}
          </span>
        )}
      </div>
      <div style={barBackgroundStyle}>
        <div
          style={barFillStyle}
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
