import React from 'react';
import { theme } from '../../theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'dark';
  padding?: keyof typeof theme.spacing;
  children: React.ReactNode;
}

/**
 * Card component for containing content with retro game styling
 *
 * @example
 * <Card variant="default" padding="md">
 *   <h3>Player Stats</h3>
 *   <p>Health: 80</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      border: '4px solid',
      borderRadius: theme.borderRadius.none,
      boxShadow: theme.shadows.retro2,
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.game.panel,
          borderColor: theme.colors.game.border,
          color: theme.colors.game.text,
        };
      case 'highlight':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary.dark,
          borderColor: theme.colors.accent.gold,
          color: theme.colors.game.textLight,
        };
      case 'dark':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.game.background,
          borderColor: theme.colors.primary.dark,
          color: theme.colors.game.text,
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles: React.CSSProperties = {
    ...getVariantStyles(),
    padding: theme.spacing[padding],
    ...style,
  };

  return (
    <div style={cardStyles} {...props}>
      {children}
    </div>
  );
};

export default Card;
