import React from 'react';
import { IPlayerState, IVictoryCondition } from '../../../../shared/types';
import { Panel } from '../ui/Panel';
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
 * PlayerStatsHUD component - Main HUD for displaying player stats
 *
 * Displays:
 * - Cash
 * - Health, Happiness, Education, Career stats as bars
 * - Current week number
 * - Time remaining (converted to hours and minutes)
 * - Victory condition progress
 */
export const PlayerStatsHUD: React.FC<PlayerStatsHUDProps> = ({
  playerState,
  currentWeek,
  timeRemaining,
  victoryConditions = [],
  className = '',
  showVictoryProgress = true,
}) => {
  // Convert time remaining to hours and minutes
  // Assuming 1 game unit = 1 hour for simplicity
  const hours = Math.floor(timeRemaining);
  const minutes = Math.round((timeRemaining % 1) * 60);

  // Format cash with proper currency formatting
  const formatCash = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Panel title="Player Stats" variant="default" className={className}>
      <div className="space-y-4" data-testid="player-stats-hud">
        {/* Cash Display */}
        <div className="cash-display" data-testid="cash-display">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Cash
          </div>
          <div className="text-3xl font-bold text-green-600" data-testid="cash-amount">
            {formatCash(playerState.cash)}
          </div>
          {playerState.weeklyIncome !== undefined && (
            <div className="text-xs text-gray-500 mt-1" data-testid="weekly-income">
              Weekly Income: {formatCash(playerState.weeklyIncome)}
            </div>
          )}
        </div>

        {/* Job Display */}
        {playerState.currentJob && (
          <div className="job-display" data-testid="job-display">
            <div className="text-sm font-semibold text-gray-600">Current Job</div>
            <div className="text-base text-gray-800" data-testid="current-job">
              {playerState.currentJob}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-gray-300" />

        {/* Stat Bars */}
        <div className="stats-bars space-y-3" data-testid="stats-bars">
          <StatBar
            label="Health"
            value={playerState.health}
            maxValue={100}
            color="red"
          />
          <StatBar
            label="Happiness"
            value={playerState.happiness}
            maxValue={100}
            color="yellow"
          />
          <StatBar
            label="Education"
            value={playerState.education}
            maxValue={100}
            color="blue"
          />
          <StatBar
            label="Career"
            value={playerState.career}
            maxValue={100}
            color="purple"
          />
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300" />

        {/* Time Info */}
        <div className="time-info" data-testid="time-info">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-gray-700">Week:</span>
              <span className="ml-2 text-gray-800" data-testid="current-week">
                {currentWeek}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Time:</span>
              <span className="ml-2 text-gray-800" data-testid="time-remaining">
                {hours}h {minutes}m
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {timeRemaining.toFixed(1)} units remaining
          </div>
        </div>

        {/* Victory Progress */}
        {showVictoryProgress && victoryConditions.length > 0 && (
          <>
            <div className="border-t-2 border-gray-300" />
            <VictoryProgress victoryConditions={victoryConditions} />
          </>
        )}
      </div>
    </Panel>
  );
};
