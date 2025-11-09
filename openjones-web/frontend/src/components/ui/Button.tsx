import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { theme } from '../../theme';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: ReactNode;
  /** Button variant/style */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether button is in loading state */
  isLoading?: boolean;
}

/**
 * Button component with authentic Windows 95 / retro game aesthetic
 * Features:
 * - Raised 3D beveled edges
 * - Pressed state with inset shadow
 * - Pixel-perfect borders
 * - Retro color palette
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...props
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const variantStyles = {
    primary: {
      background: theme.colors.system.buttonFace,
      color: theme.colors.neutral.black,
      border: `2px solid ${theme.colors.neutral.black}`,
    },
    secondary: {
      background: theme.colors.neutral.lightGray,
      color: theme.colors.neutral.black,
      border: `2px solid ${theme.colors.neutral.black}`,
    },
    danger: {
      background: '#FF6B6B',
      color: theme.colors.neutral.white,
      border: `2px solid ${theme.colors.neutral.black}`,
    },
    success: {
      background: '#51CF66',
      color: theme.colors.neutral.black,
      border: `2px solid ${theme.colors.neutral.black}`,
    },
  };

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.md,
    },
  };

  const isDisabled = disabled || isLoading;
  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      setIsPressed(true);
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseUp?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseLeave?.(e);
  };

  const buttonStyle: React.CSSProperties = {
    ...currentVariant,
    ...currentSize,
    fontFamily: theme.typography.fontFamily.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    boxShadow: isPressed && !isDisabled
      ? theme.shadows.win95Pressed
      : theme.shadows.win95Button,
    transform: isPressed && !isDisabled ? 'translate(2px, 2px)' : 'none',
    transition: 'none', // No smooth transitions for retro feel
    borderRadius: theme.borderRadius.none,
    outline: 'none',
    position: 'relative',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    imageRendering: 'pixelated',
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={isDisabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {isLoading ? 'LOADING...' : children}
    </button>
  );
};
