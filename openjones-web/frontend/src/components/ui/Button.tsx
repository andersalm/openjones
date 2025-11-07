import React, { ButtonHTMLAttributes, ReactNode } from 'react';

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
 * Button component with retro game aesthetic
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-red-700',
    success: 'bg-green-500 hover:bg-green-600 text-white border-green-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        border-b-4
        font-bold
        uppercase
        tracking-wide
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        active:border-b-2
        active:translate-y-0.5
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
