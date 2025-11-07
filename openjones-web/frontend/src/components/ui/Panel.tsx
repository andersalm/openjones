import React from 'react';
import { theme } from '../../theme';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  padding?: keyof typeof theme.spacing;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Panel component for game UI sections with optional header
 *
 * @example
 * <Panel title="Player Stats" variant="default" padding="lg">
 *   <p>Cash: $500</p>
 *   <p>Health: 80</p>
 * </Panel>
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  variant = 'default',
  padding = 'md',
  headerContent,
  children,
  style,
  ...props
}) => {
  const getVariantStyles = (): {
    container: React.CSSProperties;
    header: React.CSSProperties;
  } => {
    const baseContainer: React.CSSProperties = {
      border: '3px solid',
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.lg,
      overflow: 'hidden',
    };

    const baseHeader: React.CSSProperties = {
      padding: theme.spacing.sm,
      borderBottom: '2px solid',
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.md,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    };

    switch (variant) {
      case 'success':
        return {
          container: {
            ...baseContainer,
            backgroundColor: theme.colors.game.panel,
            borderColor: theme.colors.accent.green,
          },
          header: {
            ...baseHeader,
            backgroundColor: theme.colors.accent.green,
            borderBottomColor: theme.colors.accent.green,
            color: theme.colors.neutral.white,
          },
        };
      case 'warning':
        return {
          container: {
            ...baseContainer,
            backgroundColor: theme.colors.game.panel,
            borderColor: theme.colors.accent.orange,
          },
          header: {
            ...baseHeader,
            backgroundColor: theme.colors.accent.orange,
            borderBottomColor: theme.colors.accent.orange,
            color: theme.colors.neutral.white,
          },
        };
      case 'danger':
        return {
          container: {
            ...baseContainer,
            backgroundColor: theme.colors.game.panel,
            borderColor: theme.colors.accent.red,
          },
          header: {
            ...baseHeader,
            backgroundColor: theme.colors.accent.red,
            borderBottomColor: theme.colors.accent.red,
            color: theme.colors.neutral.white,
          },
        };
      default:
        return {
          container: {
            ...baseContainer,
            backgroundColor: theme.colors.game.panel,
            borderColor: theme.colors.game.border,
          },
          header: {
            ...baseHeader,
            backgroundColor: theme.colors.primary.main,
            borderBottomColor: theme.colors.primary.light,
            color: theme.colors.neutral.white,
          },
        };
    }
  };

  const { container: containerStyles, header: headerStyles } = getVariantStyles();

  const panelStyles: React.CSSProperties = {
    ...containerStyles,
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    padding: theme.spacing[padding],
    color: theme.colors.game.text,
  };

  return (
    <div style={panelStyles} {...props}>
      {(title || headerContent) && (
        <div style={headerStyles}>
          {title && <div>{title}</div>}
          {headerContent && <div>{headerContent}</div>}
        </div>
      )}
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default Panel;
