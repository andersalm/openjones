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
          bg-gradient-to-br from-slate-50 to-slate-100
          rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden
          transform transition-all duration-300
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${className}
        `}
        style={{
          border: '3px solid rgba(51, 65, 85, 0.3)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="building-modal"
      >
        {/* Modern Header with Gradient */}
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-5 flex items-center justify-between"
          style={{
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight" data-testid="building-name">
              {building.name}
            </h2>
            {building.description && (
              <p className="text-blue-100 text-sm mt-1.5 font-medium" data-testid="building-description">
                {building.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 hover:bg-white/10 transition-all text-4xl font-bold leading-none w-12 h-12 flex items-center justify-center rounded-lg"
            aria-label="Close modal"
            data-testid="close-button"
          >
            ×
          </button>
        </div>

        {/* Content with Better Spacing */}
        <div className="p-7 overflow-y-auto max-h-[65vh]">
          {actionResult ? (
            <ActionResultDisplay result={actionResult} onDismiss={() => onActionSelect('')} />
          ) : (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-5 tracking-tight">
                What would you like to do?
              </h3>
              <ActionMenu
                actions={(building as any).actions || []}
                onActionSelect={onActionSelect}
                keyboardEnabled={isOpen}
              />
            </div>
          )}
        </div>

        {/* Modern Footer with Keyboard Hints */}
        <div
          className="bg-gradient-to-br from-slate-100 to-slate-200 px-7 py-4 flex justify-between items-center text-sm text-slate-600 border-t-2 border-slate-300/50"
        >
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1.5 bg-white border-2 border-slate-300 rounded-lg shadow-sm font-mono text-xs font-semibold text-slate-700">
              ESC
            </kbd>
            <span className="font-medium">to close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1.5 bg-white border-2 border-slate-300 rounded-lg shadow-sm font-mono text-xs font-semibold text-slate-700">
              1-9
            </kbd>
            <span className="font-medium">quick select</span>
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
          p-4 rounded-lg border-2
          ${result.success
            ? 'bg-green-50 border-green-500 text-green-900'
            : 'bg-red-50 border-red-500 text-red-900'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {result.success ? '✓' : '✗'}
          </span>
          <span className="font-semibold text-lg" data-testid="result-message">
            {result.message}
          </span>
        </div>
      </div>

      {/* Effects Display */}
      {result.effects && (
        <div className="bg-gray-50 p-4 rounded-lg" data-testid="action-effects">
          <h4 className="font-semibold text-gray-800 mb-3">Effects:</h4>
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
                <span className="text-gray-700">Time Spent:</span>
                <span className="font-semibold text-blue-600">
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
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          data-testid="dismiss-button"
        >
          Continue
        </button>
      </div>

      {/* New Actions (if any) */}
      {result.newActions && result.newActions.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Next Actions:</h4>
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
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const sign = isPositive ? '+' : '-';
  const absoluteValue = Math.abs(value);

  return (
    <div className="flex items-center justify-between" data-testid={testId}>
      <span className="text-gray-700">{label}:</span>
      <span className={`font-semibold ${color}`}>
        {sign}{prefix}{absoluteValue}
      </span>
    </div>
  );
};
