import React from 'react';
import { IPlayerState, IVictoryCondition } from '../../../../shared/types';
import { Panel } from '../ui/Panel';
import { StatBar } from './StatBar';
import { VictoryProgress } from './VictoryProgress';
import { theme } from '../../theme';

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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const cashDisplayStyle: React.CSSProperties = {
    marginBottom: theme.spacing.sm,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.neutral.black,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  };

  const cashAmountStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.status.wealth,
    fontWeight: 'bold',
  };

  const weeklyIncomeStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.tiny,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.neutral.darkGray,
    marginTop: '4px',
  };

  const jobDisplayStyle: React.CSSProperties = {
    marginBottom: theme.spacing.sm,
  };

  const jobTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.neutral.black,
  };

  const dividerStyle: React.CSSProperties = {
    borderTop: `2px solid ${theme.colors.neutral.black}`,
    margin: `${theme.spacing.sm} 0`,
  };

  const statsBarContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const timeInfoStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.xs,
  };

  const timeRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  };

  const timeItemStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
  };

  const timeLabelStyle: React.CSSProperties = {
    fontWeight: 'bold',
  };

  const timeValueStyle: React.CSSProperties = {
    marginLeft: theme.spacing.xs,
  };

  const timeUnitsStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.tiny,
    color: theme.colors.neutral.darkGray,
    marginTop: '2px',
  };

  return (
    <Panel title="Player Stats" variant="default" className={className}>
      <div style={containerStyle} data-testid="player-stats-hud">
        {/* Cash Display */}
        <div style={cashDisplayStyle} data-testid="cash-display">
          <div style={labelStyle}>
            Cash
          </div>
          <div style={cashAmountStyle} data-testid="cash-amount">
            {formatCash(playerState.cash)}
          </div>
          {playerState.job && (
            <div style={weeklyIncomeStyle} data-testid="weekly-income">
              Weekly Income: {formatCash(playerState.job.wagePerHour * 40)}
            </div>
          )}
        </div>

        {/* Job Display */}
        {playerState.job && (
          <div style={jobDisplayStyle} data-testid="job-display">
            <div style={labelStyle}>Current Job</div>
            <div style={jobTitleStyle} data-testid="current-job">
              {playerState.job.title}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Stat Bars */}
        <div style={statsBarContainerStyle} data-testid="stats-bars">
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
        <div style={dividerStyle} />

        {/* Time Info */}
        <div style={timeInfoStyle} data-testid="time-info">
          <div style={timeRowStyle}>
            <div style={timeItemStyle}>
              <span style={timeLabelStyle}>Week:</span>
              <span style={timeValueStyle} data-testid="current-week">
                {currentWeek}
              </span>
            </div>
            <div style={timeItemStyle}>
              <span style={timeLabelStyle}>Time:</span>
              <span style={timeValueStyle} data-testid="time-remaining">
                {hours}h {minutes}m
              </span>
            </div>
          </div>
          <div style={timeUnitsStyle}>
            {timeRemaining.toFixed(1)} units remaining
          </div>
        </div>

        {/* Victory Progress */}
        {showVictoryProgress && victoryConditions.length > 0 && (
          <>
            <div style={dividerStyle} />
            <VictoryProgress victoryConditions={victoryConditions} />
          </>
        )}
      </div>
    </Panel>
  );
};
