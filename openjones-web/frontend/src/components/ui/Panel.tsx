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
    default: 'bg-white/[0.03] border-white/[0.08]',
    accent: 'bg-blue-500/[0.08] border-blue-500/20',
    warning: 'bg-amber-500/[0.08] border-amber-500/20',
    success: 'bg-green-500/[0.08] border-green-500/20',
  };

  return (
    <div
      className={`border rounded-lg ${variantClasses[variant]} ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {title && (
        <div className="px-6 py-4 border-b border-white/[0.08]">
          <h2 className="font-semibold text-lg text-white">
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
