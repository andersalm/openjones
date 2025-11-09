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
 * Clean 2025 PlayerStatsHUD - Minimalist glassmorphism design
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
      {/* Cash & Income - Primary card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Cash</span>
          {playerState.job && (
            <span className="text-xs text-emerald-400 font-medium">
              +{formatCash(playerState.job.wagePerHour * 40)}/wk
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-white tracking-tight" data-testid="cash-amount">
          {formatCash(playerState.cash)}
        </div>
      </div>

      {/* Job */}
      {playerState.job && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
            Current Job
          </div>
          <div className="text-base font-semibold text-white" data-testid="current-job">
            {playerState.job.title}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-4">
          Stats
        </div>
        <div className="space-y-3.5" data-testid="stats-bars">
          <StatBar label="Health" value={playerState.health} maxValue={100} color="red" />
          <StatBar label="Happiness" value={playerState.happiness} maxValue={100} color="yellow" />
          <StatBar label="Education" value={playerState.education} maxValue={100} color="blue" />
          <StatBar label="Career" value={playerState.career} maxValue={100} color="purple" />
        </div>
      </div>

      {/* Time */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between" data-testid="time-info">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Week</div>
            <div className="text-2xl font-bold text-white" data-testid="current-week">
              {currentWeek}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Time Left</div>
            <div className="text-2xl font-bold text-white" data-testid="time-remaining">
              {hours}h
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
