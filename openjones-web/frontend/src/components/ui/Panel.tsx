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
 * Modern Panel component with polished design
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gradient-to-br from-white to-slate-50 border-slate-300',
    accent: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400',
    warning: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400',
  };

  const titleBgClasses = {
    default: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white',
    accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    warning: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
  };

  return (
    <div
      className={`border-3 rounded-2xl ${variantClasses[variant]} ${className}`}
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        borderWidth: '3px'
      }}
    >
      {title && (
        <div className={`${titleBgClasses[variant]} px-6 py-4 rounded-t-xl`}
          style={{
            borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <h2 className="font-extrabold text-2xl tracking-tight" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
