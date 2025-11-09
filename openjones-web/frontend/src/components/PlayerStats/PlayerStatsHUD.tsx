import React from 'react';
import { IPlayerState, IVictoryCondition } from '../../../../shared/types';
import { StatBar } from './StatBar';
import { VictoryProgress } from './VictoryProgress';

export interface PlayerStatsHUDProps {
  /** Current player state */
  playerState: IPlayerState;
  /** Current week number in the game */
  currentWeek: number;
  /** Time remaining in the current turn (in game units) */
  timeRemaining: number;
  /** Victory conditions for the game */
  victoryConditions?: IVictoryCondition[];
  /** Optional className for customization */
  className?: string;
  /** Whether to show victory progress section */
  showVictoryProgress?: boolean;
}

/**
 * Modern PlayerStatsHUD - Game-style HUD with cards and gradients
 */
export const PlayerStatsHUD: React.FC<PlayerStatsHUDProps> = ({
  playerState,
  currentWeek,
  timeRemaining,
  victoryConditions = [],
  className = '',
  showVictoryProgress = true,
}) => {
  // Convert time remaining to hours (5 units = 1 hour per Java)
  const hours = Math.floor(timeRemaining / 5);

  // Format cash with proper currency formatting
  const formatCash = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`space-y-3 ${className}`} data-testid="player-stats-hud">
      {/* Cash Card - Eye-catching green gradient */}
      <div
        className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 shadow-xl"
        style={{
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
              💰 Cash
            </div>
            <div
              className="text-3xl font-black text-white"
              data-testid="cash-amount"
              style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
            >
              {formatCash(playerState.cash)}
            </div>
          </div>
          {playerState.job && (
            <div className="text-right">
              <div className="text-emerald-100 text-xs font-semibold">Weekly</div>
              <div
                className="text-lg font-bold text-white"
                data-testid="weekly-income"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' }}
              >
                +{formatCash(playerState.job.wagePerHour * 40)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Card - if employed */}
      {playerState.job && (
        <div
          className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 shadow-lg"
          style={{
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">💼</div>
            <div>
              <div className="text-slate-300 text-xs font-semibold">Current Job</div>
              <div
                className="text-white font-bold text-base"
                data-testid="current-job"
                style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
              >
                {playerState.job.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Card - dark background with colorful bars */}
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-xl"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
        }}
      >
        <div className="space-y-3" data-testid="stats-bars">
          <StatBar
            label="Health"
            value={playerState.health}
            maxValue={100}
            color="red"
            icon="❤️"
          />
          <StatBar
            label="Happiness"
            value={playerState.happiness}
            maxValue={100}
            color="yellow"
            icon="😊"
          />
          <StatBar
            label="Education"
            value={playerState.education}
            maxValue={100}
            color="blue"
            icon="📚"
          />
          <StatBar
            label="Career"
            value={playerState.career}
            maxValue={100}
            color="purple"
            icon="📈"
          />
        </div>
      </div>

      {/* Time Info Card - purple gradient */}
      <div
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg"
        style={{
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}
      >
        <div className="flex justify-between items-center" data-testid="time-info">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-indigo-200 text-xs font-semibold">Week</div>
              <div
                className="text-white text-xl font-black"
                data-testid="current-week"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}
              >
                {currentWeek}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <div className="text-right">
              <div className="text-indigo-200 text-xs font-semibold">Time Left</div>
              <div
                className="text-white text-xl font-black"
                data-testid="time-remaining"
                style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}
              >
                {hours}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Progress */}
      {showVictoryProgress && victoryConditions.length > 0 && (
        <VictoryProgress victoryConditions={victoryConditions} />
      )}
    </div>
  );
};
