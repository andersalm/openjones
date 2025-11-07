import React from 'react';
import { theme } from '../../theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Button component with retro game aesthetic
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  disabled = false,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      border: '2px solid',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: theme.typography.fontWeight.semibold,
      transition: theme.transitions.fast,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary.main,
          borderColor: theme.colors.primary.light,
          color: theme.colors.neutral.white,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.secondary.main,
          borderColor: theme.colors.secondary.light,
          color: theme.colors.neutral.white,
        };
      case 'accent':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.accent.gold,
          borderColor: theme.colors.accent.orange,
          color: theme.colors.primary.dark,
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.accent.red,
          borderColor: theme.colors.accent.orange,
          color: theme.colors.neutral.white,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderColor: theme.colors.neutral.lightGray,
          color: theme.colors.neutral.lightGray,
        };
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.xs,
          borderRadius: theme.borderRadius.sm,
        };
      case 'md':
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.typography.fontSize.sm,
          borderRadius: theme.borderRadius.md,
        };
      case 'lg':
        return {
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: theme.typography.fontSize.md,
          borderRadius: theme.borderRadius.md,
        };
      default:
        return {};
    }
  };

  const buttonStyles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    width: fullWidth ? '100%' : 'auto',
    boxShadow: disabled ? 'none' : theme.shadows.retro,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translate(2px, 2px)';
      e.currentTarget.style.boxShadow = theme.shadows.sm;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'translate(0, 0)';
      e.currentTarget.style.boxShadow = theme.shadows.retro;
    }
  };

  return (
    <button
      style={buttonStyles}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
