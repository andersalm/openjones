import React, { ReactNode } from 'react';

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
 * Clean 2025 Panel component
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-zinc-900 border-zinc-800',
    accent: 'bg-blue-950 border-blue-900',
    warning: 'bg-amber-950 border-amber-900',
    success: 'bg-emerald-950 border-emerald-900',
  };

  return (
    <div
      className={`border rounded-lg ${variantClasses[variant]} ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-lg text-white">
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
