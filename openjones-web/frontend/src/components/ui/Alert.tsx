import React, { ReactNode, useEffect, useState } from 'react';
import { theme } from '../../theme';

export interface AlertProps {
  /** Alert content */
  children: ReactNode;
  /** Alert type/severity */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Alert/notification component with authentic Windows 95 aesthetic
 *
 * Features:
 * - Raised 3D beveled edges like Win95 dialogs
 * - Hard-edged retro shadows
 * - DOS-era color palette
 * - Pixel-perfect borders
 * - Optional auto-dismiss
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  type = 'info',
  dismissible = false,
  onDismiss,
  autoDismiss = 0,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handle auto-dismiss
  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  // Type styles using retro theme
  const typeStyles: Record<string, React.CSSProperties> = {
    info: {
      backgroundColor: theme.colors.primary.background,
      color: theme.colors.neutral.white,
      borderColor: theme.colors.neutral.black,
    },
    success: {
      backgroundColor: theme.colors.accent.green,
      color: theme.colors.neutral.black,
      borderColor: theme.colors.neutral.black,
    },
    warning: {
      backgroundColor: theme.colors.accent.gold,
      color: theme.colors.neutral.black,
      borderColor: theme.colors.neutral.black,
    },
    error: {
      backgroundColor: theme.colors.accent.red,
      color: theme.colors.neutral.white,
      borderColor: theme.colors.neutral.black,
    },
  };

  // Icon for alert type (retro ASCII-style)
  const icons: Record<string, string> = {
    info: '[i]',
    success: '[✓]',
    warning: '[!]',
    error: '[X]',
  };

  // Base alert style with Win95 beveled look
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    fontFamily: theme.typography.fontFamily.retro,
    fontSize: theme.typography.fontSize.sm,
    padding: theme.spacing.md,
    border: `2px solid`,
    borderRadius: theme.borderRadius.none,
    boxShadow: theme.shadows.win95Raised, // Win95 3D effect
    margin: `${theme.spacing.sm} 0`,
    display: isVisible ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    transition: 'none', // Retro: no smooth transitions
    imageRendering: 'pixelated',
    lineHeight: theme.typography.lineHeight.normal,
    ...typeStyles[type],
    ...style,
  };

  // Close button style with Win95 button appearance
  const closeButtonStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.retro,
    fontSize: theme.typography.fontSize.sm,
    background: theme.colors.system.buttonFace,
    border: `2px solid ${theme.colors.neutral.black}`,
    boxShadow: theme.shadows.win95Button,
    color: theme.colors.neutral.black,
    cursor: 'pointer',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    marginLeft: theme.spacing.sm,
    transition: 'none',
    borderRadius: theme.borderRadius.none,
    minWidth: '60px',
    textTransform: 'uppercase',
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={baseStyle} role="alert" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
        <span style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.normal,
          lineHeight: 1
        }}>
          {icons[type]}
        </span>
        <div style={{ flex: 1, lineHeight: theme.typography.lineHeight.normal }}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          style={closeButtonStyle}
          onClick={handleDismiss}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = theme.shadows.win95Pressed;
            e.currentTarget.style.transform = 'translate(1px, 1px)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = theme.shadows.win95Button;
            e.currentTarget.style.transform = 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = theme.shadows.win95Button;
            e.currentTarget.style.transform = 'none';
          }}
          aria-label="Dismiss alert"
        >
          OK
        </button>
      )}
    </div>
  );
};

/**
 * Alert container for stacking multiple alerts
 * Positioned fixed in top-right corner like Win95 notifications
 */
export const AlertContainer: React.FC<{ children: ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 9999,
    maxWidth: '400px',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    pointerEvents: 'none', // Allow clicks through container
    ...style,
  };

  return (
    <div style={containerStyle}>
      <div style={{ pointerEvents: 'auto' }}>{children}</div>
    </div>
  );
};
