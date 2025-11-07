import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStatsHUD } from './PlayerStatsHUD';
import {
  createMockPlayerState,
  createMockVictoryConditions,
  createCriticalPlayerState,
  createWinningPlayerState,
} from '../../../../shared/mocks/MockGameStore';

describe('PlayerStatsHUD', () => {
  const defaultProps = {
    playerState: createMockPlayerState(),
    currentWeek: 1,
    timeRemaining: 168,
    victoryConditions: createMockVictoryConditions(),
  };

  describe('Basic Rendering', () => {
    it('should render the component', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('player-stats-hud')).toBeInTheDocument();
    });

    it('should render within a Panel with title', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByText('Player Stats')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<PlayerStatsHUD {...defaultProps} className="custom-class" />);

      const panel = container.querySelector('.custom-class');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Cash Display', () => {
    it('should display formatted cash amount', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('$1,000.00');
    });

    it('should display weekly income when provided', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('weekly-income')).toBeInTheDocument();
      expect(screen.getByText(/Weekly Income: \$500.00/)).toBeInTheDocument();
    });

    it('should not display weekly income when not provided', () => {
      const playerState = createMockPlayerState({ weeklyIncome: undefined });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.queryByTestId('weekly-income')).not.toBeInTheDocument();
    });

    it('should format large cash amounts correctly', () => {
      const playerState = createMockPlayerState({ cash: 123456.78 });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('$123,456.78');
    });

    it('should format negative cash amounts correctly', () => {
      const playerState = createMockPlayerState({ cash: -500.50 });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('-$500.50');
    });

    it('should format zero cash correctly', () => {
      const playerState = createMockPlayerState({ cash: 0 });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('$0.00');
    });
  });

  describe('Job Display', () => {
    it('should display current job when provided', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('job-display')).toBeInTheDocument();
      expect(screen.getByTestId('current-job')).toHaveTextContent('Entry Level Developer');
    });

    it('should not display job section when currentJob is not provided', () => {
      const playerState = createMockPlayerState({ currentJob: undefined });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.queryByTestId('job-display')).not.toBeInTheDocument();
    });

    it('should display different job titles', () => {
      const playerState = createMockPlayerState({ currentJob: 'Senior Engineer' });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('current-job')).toHaveTextContent('Senior Engineer');
    });
  });

  describe('Stats Bars', () => {
    it('should render all four stat bars', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('stat-bar-health')).toBeInTheDocument();
      expect(screen.getByTestId('stat-bar-happiness')).toBeInTheDocument();
      expect(screen.getByTestId('stat-bar-education')).toBeInTheDocument();
      expect(screen.getByTestId('stat-bar-career')).toBeInTheDocument();
    });

    it('should display correct health value', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('75/100');
    });

    it('should display correct happiness value', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('stat-value-happiness')).toHaveTextContent('60/100');
    });

    it('should display correct education value', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('stat-value-education')).toHaveTextContent('50/100');
    });

    it('should display correct career value', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('stat-value-career')).toHaveTextContent('40/100');
    });

    it('should update stats when playerState changes', () => {
      const { rerender } = render(<PlayerStatsHUD {...defaultProps} />);

      const newPlayerState = createMockPlayerState({
        health: 90,
        happiness: 85,
        education: 70,
        career: 65,
      });

      rerender(<PlayerStatsHUD {...defaultProps} playerState={newPlayerState} />);

      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('90/100');
      expect(screen.getByTestId('stat-value-happiness')).toHaveTextContent('85/100');
    });
  });

  describe('Time Display', () => {
    it('should display current week', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('current-week')).toHaveTextContent('1');
    });

    it('should display time in hours and minutes', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('time-remaining')).toHaveTextContent('168h 0m');
    });

    it('should calculate hours and minutes correctly for fractional time', () => {
      render(<PlayerStatsHUD {...defaultProps} timeRemaining={2.5} />);

      expect(screen.getByTestId('time-remaining')).toHaveTextContent('2h 30m');
    });

    it('should handle zero time remaining', () => {
      render(<PlayerStatsHUD {...defaultProps} timeRemaining={0} />);

      expect(screen.getByTestId('time-remaining')).toHaveTextContent('0h 0m');
    });

    it('should display different week numbers', () => {
      render(<PlayerStatsHUD {...defaultProps} currentWeek={52} />);

      expect(screen.getByTestId('current-week')).toHaveTextContent('52');
    });

    it('should round minutes correctly', () => {
      render(<PlayerStatsHUD {...defaultProps} timeRemaining={1.75} />);

      expect(screen.getByTestId('time-remaining')).toHaveTextContent('1h 45m');
    });
  });

  describe('Victory Progress', () => {
    it('should display victory progress by default', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByTestId('victory-progress')).toBeInTheDocument();
    });

    it('should hide victory progress when showVictoryProgress is false', () => {
      render(<PlayerStatsHUD {...defaultProps} showVictoryProgress={false} />);

      expect(screen.queryByTestId('victory-progress')).not.toBeInTheDocument();
    });

    it('should not display victory progress when victoryConditions is empty', () => {
      render(<PlayerStatsHUD {...defaultProps} victoryConditions={[]} />);

      expect(screen.queryByTestId('victory-progress')).not.toBeInTheDocument();
    });

    it('should display victory conditions', () => {
      render(<PlayerStatsHUD {...defaultProps} />);

      expect(screen.getByText('Victory Conditions')).toBeInTheDocument();
    });
  });

  describe('Integration with Mock States', () => {
    it('should render critical player state correctly', () => {
      const criticalState = createCriticalPlayerState();
      render(
        <PlayerStatsHUD
          {...defaultProps}
          playerState={criticalState}
        />
      );

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('$50.00');
      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('15/100');
      expect(screen.getByTestId('current-job')).toHaveTextContent('Unemployed');
    });

    it('should render winning player state correctly', () => {
      const winningState = createWinningPlayerState();
      render(
        <PlayerStatsHUD
          {...defaultProps}
          playerState={winningState}
        />
      );

      expect(screen.getByTestId('cash-amount')).toHaveTextContent('$9,500.00');
      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('95/100');
      expect(screen.getByTestId('current-job')).toHaveTextContent('Senior Developer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle stats at 0', () => {
      const playerState = createMockPlayerState({
        health: 0,
        happiness: 0,
        education: 0,
        career: 0,
      });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('0/100');
      expect(screen.getByTestId('stat-value-happiness')).toHaveTextContent('0/100');
    });

    it('should handle stats at 100', () => {
      const playerState = createMockPlayerState({
        health: 100,
        happiness: 100,
        education: 100,
        career: 100,
      });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('100/100');
      expect(screen.getByTestId('stat-value-career')).toHaveTextContent('100/100');
    });

    it('should handle very long job titles', () => {
      const playerState = createMockPlayerState({
        currentJob: 'Very Long Job Title That Should Still Display Correctly',
      });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('current-job')).toHaveTextContent(
        'Very Long Job Title That Should Still Display Correctly'
      );
    });

    it('should handle large week numbers', () => {
      render(<PlayerStatsHUD {...defaultProps} currentWeek={999} />);

      expect(screen.getByTestId('current-week')).toHaveTextContent('999');
    });

    it('should handle fractional stats', () => {
      const playerState = createMockPlayerState({
        health: 75.7,
        happiness: 60.3,
        education: 50.9,
        career: 40.1,
      });
      render(<PlayerStatsHUD {...defaultProps} playerState={playerState} />);

      expect(screen.getByTestId('stat-value-health')).toHaveTextContent('76/100');
      expect(screen.getByTestId('stat-value-happiness')).toHaveTextContent('60/100');
    });
  });

  describe('Component Structure', () => {
    it('should have proper section spacing', () => {
      const { container } = render(<PlayerStatsHUD {...defaultProps} />);

      const mainContainer = container.querySelector('.space-y-4');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have dividers between sections', () => {
      const { container } = render(<PlayerStatsHUD {...defaultProps} />);

      const dividers = container.querySelectorAll('.border-t-2');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });
});
