import React from 'react';
import { IVictoryCondition } from '../../../../shared/types';

export interface VictoryProgressProps {
  /** Array of victory conditions to display */
  victoryConditions: IVictoryCondition[];
  /** Optional className for customization */
  className?: string;
}

/**
 * Modern VictoryProgress - shows victory goals with style
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
      className={`victory-progress bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-xl ${className}`}
      data-testid="victory-progress"
      style={{
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
      }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider" style={{textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'}}>
              Victory Goals
            </h3>
          </div>
          <div className="text-amber-100 text-xs font-bold">
            {achievedCount}/{totalCount}
          </div>
        </div>
        {allAchieved && (
          <div
            className="mt-2 text-white font-black text-sm"
            data-testid="victory-achieved"
            style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'}}
          >
            🎉 All Goals Complete!
          </div>
        )}
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
                rounded-lg p-3 transition-all backdrop-blur-sm
                ${
                  condition.isAchieved
                    ? 'bg-white/30'
                    : 'bg-white/10'
                }
              `}
              style={{
                boxShadow: condition.isAchieved ? '0 0 12px rgba(255, 255, 255, 0.3)' : 'none'
              }}
              data-testid={`victory-condition-${condition.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-white">
                    {condition.name}
                  </span>
                  {condition.isAchieved && (
                    <span
                      className="text-white text-base"
                      data-testid={`achieved-badge-${condition.id}`}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-100 font-semibold ml-2" data-testid={`progress-${condition.id}`}>
                  {condition.currentValue.toLocaleString()}/
                  {condition.targetValue.toLocaleString()}
                </div>
              </div>

              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`
                    h-full transition-all duration-500 rounded-full
                    ${condition.isAchieved ? 'bg-white' : 'bg-amber-200'}
                  `}
                  style={{
                    width: `${progress}%`,
                    boxShadow: progress > 0 ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
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
