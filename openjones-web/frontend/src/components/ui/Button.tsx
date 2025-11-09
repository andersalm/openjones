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
 * Clean 2025 Button component
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
    primary: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm hover:shadow',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm hover:shadow',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm hover:shadow',
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Loading...</span>
        </span>
      ) : children}
    </button>
  );
};
