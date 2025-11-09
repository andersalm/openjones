import React, { ReactNode } from 'react';
import { theme } from '../../theme';

export interface PanelProps {
  /** Panel title */
  title?: string;
  /** Panel content */
  children: ReactNode;
  /** Panel variant/style */
  variant?: 'default' | 'accent' | 'warning' | 'success';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Panel component with authentic Windows 95 / DOS retro aesthetic
 * Features:
 * - Classic title bar with gradient
 * - Thick black borders
 * - Beveled 3D edges
 * - System color palette
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
}) => {
  const variantColors = {
    default: {
      background: theme.colors.system.windowGray,
      titleBg: theme.colors.primary.background, // Teal like Windows 95
      titleColor: theme.colors.neutral.white,
      border: theme.colors.neutral.black,
    },
    accent: {
      background: theme.colors.retro.tan,
      titleBg: theme.colors.primary.dark,
      titleColor: theme.colors.neutral.white,
      border: theme.colors.neutral.black,
    },
    warning: {
      background: '#FFE066',
      titleBg: '#FF8C00',
      titleColor: theme.colors.neutral.black,
      border: theme.colors.neutral.black,
    },
    success: {
      background: '#A8E6CF',
      titleBg: '#51CF66',
      titleColor: theme.colors.neutral.black,
      border: theme.colors.neutral.black,
    },
  };

  const colors = variantColors[variant];

  const panelStyle: React.CSSProperties = {
    background: colors.background,
    border: `4px solid ${colors.border}`,
    boxShadow: theme.shadows.retro2,
    borderRadius: theme.borderRadius.none,
    fontFamily: theme.typography.fontFamily.primary,
    imageRendering: 'pixelated',
    overflow: 'hidden',
  };

  const titleBarStyle: React.CSSProperties = {
    background: colors.titleBg,
    color: colors.titleColor,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `3px solid ${colors.border}`,
    fontFamily: theme.typography.fontFamily.primary,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  const contentStyle: React.CSSProperties = {
    padding: theme.spacing.md,
  };

  return (
    <div style={panelStyle} className={className}>
      {title && (
        <div style={titleBarStyle}>
          {title}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};
