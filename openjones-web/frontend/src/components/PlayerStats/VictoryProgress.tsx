import React from 'react';
import { IVictoryCondition } from '../../../../shared/types';

export interface VictoryProgressProps {
  /** Array of victory conditions to display */
  victoryConditions: IVictoryCondition[];
  /** Optional className for customization */
  className?: string;
}

/**
 * VictoryProgress component - displays progress toward victory conditions
 */
export const VictoryProgress: React.FC<VictoryProgressProps> = ({
  victoryConditions,
  className = '',
}) => {
  const achievedCount = victoryConditions.filter((vc) => vc.isAchieved).length;
  const totalCount = victoryConditions.length;
  const allAchieved = achievedCount === totalCount && totalCount > 0;

  return (
    <div className={`victory-progress ${className}`} data-testid="victory-progress">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
          Victory Conditions
        </h3>
        <div className="text-xs text-gray-600">
          {achievedCount} of {totalCount} completed
          {allAchieved && (
            <span className="ml-2 text-green-600 font-bold" data-testid="victory-achieved">
              🎉 Victory!
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {victoryConditions.map((condition) => {
          const progress =
            condition.targetValue > 0
              ? Math.min(100, (condition.currentValue / condition.targetValue) * 100)
              : 0;

          return (
            <div
              key={condition.id}
              className={`
                border-2 rounded p-2 transition-all
                ${
                  condition.isAchieved
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                }
              `}
              data-testid={`victory-condition-${condition.id}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {condition.name}
                    </span>
                    {condition.isAchieved && (
                      <span
                        className="text-green-600 text-xs"
                        data-testid={`achieved-badge-${condition.id}`}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{condition.description}</div>
                </div>
                <div className="text-xs text-gray-600 ml-2" data-testid={`progress-${condition.id}`}>
                  {condition.currentValue.toLocaleString()}/
                  {condition.targetValue.toLocaleString()}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`
                    h-full transition-all duration-300
                    ${condition.isAchieved ? 'bg-green-500' : 'bg-blue-500'}
                  `}
                  style={{ width: `${progress}%` }}
                  data-testid={`progress-bar-${condition.id}`}
                  role="progressbar"
                  aria-valuenow={condition.currentValue}
                  aria-valuemin={0}
                  aria-valuemax={condition.targetValue}
                  aria-label={`${condition.name} progress`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
