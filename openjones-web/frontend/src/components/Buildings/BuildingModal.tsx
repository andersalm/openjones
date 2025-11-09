import React, { useEffect, useState } from 'react';
import { IAction, IBuilding } from '../../../../shared/types/contracts';
import { ActionMenu } from './ActionMenu';
import { theme } from '../../theme';
import { Button } from '../ui/Button';

export interface BuildingModalProps {
  /** The building being interacted with */
  building: IBuilding | null;
  /** Available actions for this building */
  actions: IAction[];
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when action is selected */
  onActionSelect: (actionId: string) => void;
  /** Current action result to display (optional) */
  actionResult?: ActionResult;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Optional className for customization */
  className?: string;
}

export interface ActionResult {
  /** Whether the action succeeded */
  success: boolean;
  /** Message to display */
  message: string;
  /** Effects of the action */
  effects?: {
    cashChange?: number;
    healthChange?: number;
    happinessChange?: number;
    educationChange?: number;
    careerChange?: number;
    timeSpent?: number;
  };
  /** New actions to display (after action) */
  newActions?: IAction[];
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  actions,
  onClose,
  onActionSelect,
  actionResult,
  isOpen,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !building) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modalBackdrop,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(2px)',
  };

  const modalStyle: React.CSSProperties = {
    background: theme.colors.system.windowGray,
    border: `4px solid ${theme.colors.neutral.black}`,
    boxShadow: theme.shadows.retro3,
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    transform: isAnimating ? 'scale(0.9)' : 'scale(1)',
    opacity: isAnimating ? 0 : 1,
    transition: isAnimating ? 'none' : 'transform 0.1s steps(3), opacity 0.1s steps(3)',
    fontFamily: theme.typography.fontFamily.primary,
    imageRendering: 'pixelated',
  };

  const headerStyle: React.CSSProperties = {
    background: theme.colors.primary.background,
    color: theme.colors.neutral.white,
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `4px solid ${theme.colors.neutral.black}`,
  };

  const titleContainerStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.md,
    textTransform: 'uppercase',
    marginBottom: '4px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.tiny,
    opacity: 0.9,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: theme.colors.system.buttonFace,
    color: theme.colors.neutral.black,
    border: `3px solid ${theme.colors.neutral.black}`,
    width: '32px',
    height: '32px',
    fontSize: theme.typography.fontSize.md,
    cursor: 'pointer',
    boxShadow: theme.shadows.win95Button,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
  };

  const contentStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    overflowY: 'auto',
    flex: 1,
  };

  const promptStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.black,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  };

  const footerStyle: React.CSSProperties = {
    background: theme.colors.neutral.lightGray,
    padding: theme.spacing.sm,
    borderTop: `3px solid ${theme.colors.neutral.black}`,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.fontSize.tiny,
    color: theme.colors.neutral.black,
  };

  const kbdStyle: React.CSSProperties = {
    background: theme.colors.neutral.white,
    border: `2px solid ${theme.colors.neutral.black}`,
    padding: '2px 6px',
    marginRight: '4px',
    fontFamily: theme.typography.fontFamily.primary,
  };

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
      data-testid="building-modal-overlay"
    >
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        className={className}
        data-testid="building-modal"
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleContainerStyle}>
            <div style={titleStyle} data-testid="building-name">
              {building.name}
            </div>
            {building.description && (
              <div style={subtitleStyle} data-testid="building-description">
                {building.description}
              </div>
            )}
          </div>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Close modal"
            data-testid="close-button"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {actionResult ? (
            <ActionResultDisplay result={actionResult} onDismiss={() => onActionSelect('')} />
          ) : (
            <div>
              <div style={promptStyle}>
                WHAT WOULD YOU LIKE TO DO?
              </div>
              <ActionMenu
                actions={actions}
                onActionSelect={onActionSelect}
                keyboardEnabled={isOpen}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div>
            <span style={kbdStyle}>ESC</span>
            <span>TO CLOSE</span>
          </div>
          <div>
            <span style={kbdStyle}>1-9</span>
            <span>SELECT ACTION</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionResultDisplayProps {
  result: ActionResult;
  onDismiss: () => void;
}

const ActionResultDisplay: React.FC<ActionResultDisplayProps> = ({ result, onDismiss }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const resultBoxStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    border: `4px solid ${theme.colors.neutral.black}`,
    background: result.success ? '#A8E6CF' : '#FFB6B6',
    boxShadow: 'inset 2px 2px 0px rgba(255, 255, 255, 0.5)',
  };

  const resultHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '24px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.black,
    textTransform: 'uppercase',
  };

  const effectsBoxStyle: React.CSSProperties = {
    background: theme.colors.neutral.paleGray,
    padding: theme.spacing.md,
    border: `3px solid ${theme.colors.neutral.black}`,
    boxShadow: 'inset 1px 1px 0px #FFFFFF, inset -1px -1px 0px #808080',
  };

  const effectsTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.black,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  };

  const effectsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing.sm,
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  };

  return (
    <div style={containerStyle} data-testid="action-result">
      {/* Result Status */}
      <div style={resultBoxStyle}>
        <div style={resultHeaderStyle}>
          <span style={iconStyle}>
            {result.success ? '✓' : '✗'}
          </span>
          <span style={messageStyle} data-testid="result-message">
            {result.message}
          </span>
        </div>
      </div>

      {/* Effects Display */}
      {result.effects && (
        <div style={effectsBoxStyle} data-testid="action-effects">
          <div style={effectsTitleStyle}>EFFECTS:</div>
          <div style={effectsGridStyle}>
            {result.effects.cashChange !== undefined && result.effects.cashChange !== 0 && (
              <EffectItem
                label="Cash"
                value={result.effects.cashChange}
                prefix="$"
                testId="cash-change"
              />
            )}
            {result.effects.healthChange !== undefined && result.effects.healthChange !== 0 && (
              <EffectItem
                label="Health"
                value={result.effects.healthChange}
                testId="health-change"
              />
            )}
            {result.effects.happinessChange !== undefined && result.effects.happinessChange !== 0 && (
              <EffectItem
                label="Happiness"
                value={result.effects.happinessChange}
                testId="happiness-change"
              />
            )}
            {result.effects.educationChange !== undefined && result.effects.educationChange !== 0 && (
              <EffectItem
                label="Education"
                value={result.effects.educationChange}
                testId="education-change"
              />
            )}
            {result.effects.careerChange !== undefined && result.effects.careerChange !== 0 && (
              <EffectItem
                label="Career"
                value={result.effects.careerChange}
                testId="career-change"
              />
            )}
            {result.effects.timeSpent !== undefined && result.effects.timeSpent > 0 && (
              <EffectItem
                label="Time"
                value={-result.effects.timeSpent}
                suffix="H"
                testId="time-spent"
              />
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div style={buttonContainerStyle}>
        <Button onClick={onDismiss} variant="primary" data-testid="dismiss-button">
          Continue
        </Button>
      </div>

      {/* New Actions (if any) */}
      {result.newActions && result.newActions.length > 0 && (
        <div>
          <div style={effectsTitleStyle}>NEXT ACTIONS:</div>
          <ActionMenu
            actions={result.newActions}
            onActionSelect={() => {}}
            keyboardEnabled={false}
          />
        </div>
      )}
    </div>
  );
};

interface EffectItemProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  testId: string;
}

const EffectItem: React.FC<EffectItemProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  testId
}) => {
  const isPositive = value > 0;
  const color = isPositive ? theme.colors.accent.green : theme.colors.accent.red;
  const sign = isPositive ? '+' : '';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: theme.typography.fontSize.xs,
  };

  const labelStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
  };

  const valueStyle: React.CSSProperties = {
    color: color,
  };

  return (
    <div style={containerStyle} data-testid={testId}>
      <span style={labelStyle}>{label}:</span>
      <span style={valueStyle}>
        {sign}{prefix}{value}{suffix}
      </span>
    </div>
  );
};
