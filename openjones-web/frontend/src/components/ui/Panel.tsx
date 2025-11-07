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
 * Panel component with retro game aesthetic
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gray-100 border-gray-400',
    accent: 'bg-blue-50 border-blue-400',
    warning: 'bg-yellow-50 border-yellow-400',
    success: 'bg-green-50 border-green-400',
  };

  const titleBgClasses = {
    default: 'bg-gray-300',
    accent: 'bg-blue-300',
    warning: 'bg-yellow-300',
    success: 'bg-green-300',
  };

  return (
    <div
      className={`border-4 ${variantClasses[variant]} shadow-lg ${className}`}
      style={{
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.25)',
      }}
    >
      {title && (
        <div className={`${titleBgClasses[variant]} px-4 py-2 border-b-4 border-gray-400`}>
          <h2 className="font-bold text-lg uppercase tracking-wide">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
