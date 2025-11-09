import React, { useEffect, useState } from 'react';
import { IAction, IBuilding } from '../../../../shared/types/contracts';
import { ActionMenu } from './ActionMenu';

export interface BuildingModalProps {
  /** The building being interacted with */
  building: IBuilding | null;
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
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !building) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
      data-testid="building-modal-overlay"
    >
      <div
        className={`
          bg-[#0f0f14] border border-white/[0.12]
          rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden
          transform transition-all duration-200
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${className}
        `}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="building-modal"
      >
        {/* Clean Header */}
        <div
          className="bg-white/[0.05] text-white px-6 py-4 flex items-center justify-between border-b border-white/[0.12]"
        >
          <div>
            <h2 className="text-2xl font-semibold" data-testid="building-name">
              {building.name}
            </h2>
            {building.description && (
              <p className="text-gray-400 text-sm mt-1" data-testid="building-description">
                {building.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded"
            aria-label="Close modal"
            data-testid="close-button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {actionResult ? (
            <ActionResultDisplay result={actionResult} onDismiss={() => onActionSelect('')} />
          ) : (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">
                Available Actions
              </h3>
              <ActionMenu
                actions={(building as any).actions || []}
                onActionSelect={onActionSelect}
                keyboardEnabled={isOpen}
              />
            </div>
          )}
        </div>

        {/* Clean Footer */}
        <div
          className="bg-white/[0.03] px-6 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-white/[0.08]"
        >
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/[0.08] border border-white/[0.12] rounded font-mono">
              ESC
            </kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/[0.08] border border-white/[0.12] rounded font-mono">
              1-9
            </kbd>
            <span>quick select</span>
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
  return (
    <div className="space-y-4" data-testid="action-result">
      {/* Result Status */}
      <div
        className={`
          p-4 rounded-lg border
          ${result.success
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {result.success ? '✓' : '✗'}
          </span>
          <span className="font-medium" data-testid="result-message">
            {result.message}
          </span>
        </div>
      </div>

      {/* Effects Display */}
      {result.effects && (
        <div className="bg-white/[0.05] p-4 rounded-lg border border-white/[0.08]" data-testid="action-effects">
          <h4 className="font-medium text-gray-400 mb-3 text-sm uppercase tracking-wide">Effects</h4>
          <div className="grid grid-cols-2 gap-3">
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
              <div className="flex items-center justify-between" data-testid="time-spent">
                <span className="text-gray-400 text-sm">Time Spent:</span>
                <span className="font-medium text-white text-sm">
                  {result.effects.timeSpent} units
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onDismiss}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm"
          data-testid="dismiss-button"
        >
          Continue
        </button>
      </div>

      {/* New Actions (if any) */}
      {result.newActions && result.newActions.length > 0 && (
        <div className="pt-4 border-t border-white/[0.08]">
          <h4 className="font-medium text-gray-400 mb-3 text-sm uppercase tracking-wide">Next Actions</h4>
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
  testId: string;
}

const EffectItem: React.FC<EffectItemProps> = ({ label, value, prefix = '', testId }) => {
  const isPositive = value > 0;
  const color = isPositive ? 'text-green-400' : 'text-red-400';
  const sign = isPositive ? '+' : '-';
  const absoluteValue = Math.abs(value);

  return (
    <div className="flex items-center justify-between" data-testid={testId}>
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className={`font-medium ${color} text-sm`}>
        {sign}{prefix}{absoluteValue}
      </span>
    </div>
  );
};
