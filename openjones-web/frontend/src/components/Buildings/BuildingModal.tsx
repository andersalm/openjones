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
          bg-zinc-900 border border-zinc-800
          rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden
          transform transition-all duration-200
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${className}
        `}
        style={{
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="building-modal"
      >
        {/* Header */}
        <div
          className="bg-zinc-800/50 text-white px-6 py-5 flex items-center justify-between border-b border-zinc-800"
        >
          <div>
            <h2 className="text-2xl font-bold" data-testid="building-name">
              {building.name}
            </h2>
            {building.description && (
              <p className="text-zinc-400 text-sm mt-1.5" data-testid="building-description">
                {building.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-lg"
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
              <h3 className="text-xs font-semibold text-zinc-500 mb-4 uppercase tracking-wider">
                Select Action
              </h3>
              <ActionMenu
                actions={(building as any).actions || []}
                onActionSelect={onActionSelect}
                keyboardEnabled={isOpen}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="bg-zinc-800/30 px-6 py-3.5 flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded font-mono text-zinc-400">
              ESC
            </kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded font-mono text-zinc-400">
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
    <div className="space-y-5" data-testid="action-result">
      {/* Result Status */}
      <div
        className={`
          p-5 rounded-lg border-2
          ${result.success
            ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
            : 'bg-red-950/50 border-red-800 text-red-300'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            {result.success ? '✓' : '✗'}
          </span>
          <span className="font-semibold text-base" data-testid="result-message">
            {result.message}
          </span>
        </div>
      </div>

      {/* Effects Display */}
      {result.effects && (
        <div className="bg-zinc-800/50 p-5 rounded-lg border border-zinc-700" data-testid="action-effects">
          <h4 className="font-semibold text-zinc-400 mb-4 text-sm uppercase tracking-wider">Effects</h4>
          <div className="grid grid-cols-2 gap-4">
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
                <span className="text-zinc-400 text-sm font-medium">Time Spent:</span>
                <span className="font-bold text-white text-sm">
                  {result.effects.timeSpent} units
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onDismiss}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm hover:shadow"
          data-testid="dismiss-button"
        >
          Continue
        </button>
      </div>

      {/* New Actions (if any) */}
      {result.newActions && result.newActions.length > 0 && (
        <div className="pt-4 border-t border-zinc-800">
          <h4 className="font-semibold text-zinc-400 mb-3 text-sm uppercase tracking-wider">Next Actions</h4>
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
  const color = isPositive ? 'text-emerald-400' : 'text-red-400';
  const sign = isPositive ? '+' : '-';
  const absoluteValue = Math.abs(value);

  return (
    <div className="flex items-center justify-between" data-testid={testId}>
      <span className="text-zinc-400 text-sm font-medium">{label}:</span>
      <span className={`font-bold ${color} text-sm`}>
        {sign}{prefix}{absoluteValue}
      </span>
    </div>
  );
};
