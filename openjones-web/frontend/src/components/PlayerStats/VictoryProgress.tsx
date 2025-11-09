import React from 'react';
import { IVictoryCondition } from '../../../../shared/types';

export interface VictoryProgressProps {
  /** Array of victory conditions to display */
  victoryConditions: IVictoryCondition[];
  /** Optional className for customization */
  className?: string;
}

/**
 * Clean 2025 VictoryProgress - Minimal victory tracking
 */
export const VictoryProgress: React.FC<VictoryProgressProps> = ({
  victoryConditions,
  className = '',
}) => {
  const achievedCount = victoryConditions.filter((vc) => vc.isAchieved).length;
  const totalCount = victoryConditions.length;
  const allAchieved = achievedCount === totalCount && totalCount > 0;

  return (
    <div
      className={`victory-progress bg-zinc-900 border border-zinc-800 rounded-lg p-4 ${className}`}
      data-testid="victory-progress"
    >
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          Victory Goals
        </span>
        <span className="text-xs text-emerald-400 font-semibold">
          {achievedCount}/{totalCount}
        </span>
      </div>

      {allAchieved && (
        <div
          className="text-sm font-semibold text-emerald-400 mb-3"
          data-testid="victory-achieved"
        >
          All goals complete!
        </div>
      )}

      <div className="space-y-3">
        {victoryConditions.map((condition) => {
          const progress =
            condition.targetValue > 0
              ? Math.min(100, (condition.currentValue / condition.targetValue) * 100)
              : 0;

          return (
            <div
              key={condition.id}
              className="transition-all"
              data-testid={`victory-condition-${condition.id}`}
            >
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300 font-medium">
                    {condition.name}
                  </span>
                  {condition.isAchieved && (
                    <span
                      className="text-emerald-400 text-xs font-bold"
                      data-testid={`achieved-badge-${condition.id}`}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400 font-semibold tabular-nums" data-testid={`progress-${condition.id}`}>
                  {condition.currentValue.toLocaleString()}/
                  {condition.targetValue.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    condition.isAchieved ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
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
