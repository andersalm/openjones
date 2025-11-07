import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverScreen } from './GameOverScreen';
import type { GameStats } from './types';

describe('GameOverScreen', () => {
  const mockStats: GameStats = {
    finalWealth: 5000,
    finalHealth: 10,
    finalHappiness: 40,
    finalEducation: 3,
    finalCareer: 4,
    weeksPlayed: 30,
    goalsAchieved: ['Health Goal'],
    goalsMissed: ['Wealth Goal', 'Career Goal', 'Happiness Goal'],
  };

  const mockOnPlayAgain = vi.fn();
  const mockOnMainMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render game over message', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    });

    it('should render performance header', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Your Performance')).toBeInTheDocument();
    });
  });

  describe('Reason Messages', () => {
    it('should display timeout reason message', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/Time ran out/i)).toBeInTheDocument();
    });

    it('should display death reason message', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="death"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/health dropped to zero/i)).toBeInTheDocument();
    });

    it('should display bankruptcy reason message', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="bankruptcy"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/bankrupt with no way to recover/i)).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display wealth with proper formatting', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$5,000')).toBeInTheDocument();
    });

    it('should display weeks survived', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should display health percentage', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('should display happiness percentage', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should display education level', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Level 3')).toBeInTheDocument();
    });

    it('should display career level', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Level 4')).toBeInTheDocument();
    });

    it('should handle negative wealth', () => {
      const statsWithNegativeWealth = { ...mockStats, finalWealth: -1000 };
      render(
        <GameOverScreen
          stats={statsWithNegativeWealth}
          reason="bankruptcy"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$-1,000')).toBeInTheDocument();
    });

    it('should handle zero wealth', () => {
      const statsWithZeroWealth = { ...mockStats, finalWealth: 0 };
      render(
        <GameOverScreen
          stats={statsWithZeroWealth}
          reason="bankruptcy"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('Goals Display', () => {
    it('should display goals not achieved header when goals missed', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/Goals Not Achieved:/i)).toBeInTheDocument();
    });

    it('should display missed goals', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Wealth Goal')).toBeInTheDocument();
      expect(screen.getByText('Career Goal')).toBeInTheDocument();
      expect(screen.getByText('Happiness Goal')).toBeInTheDocument();
    });

    it('should display goals achieved header when goals exist', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/Goals Achieved:/i)).toBeInTheDocument();
    });

    it('should display achieved goals', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Health Goal')).toBeInTheDocument();
    });

    it('should not display missed goals section when empty', () => {
      const statsWithNoMissedGoals = { ...mockStats, goalsMissed: [] };
      render(
        <GameOverScreen
          stats={statsWithNoMissedGoals}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.queryByText(/Goals Not Achieved:/i)).not.toBeInTheDocument();
    });

    it('should not display achieved goals section when empty', () => {
      const statsWithNoAchievedGoals = { ...mockStats, goalsAchieved: [] };
      render(
        <GameOverScreen
          stats={statsWithNoAchievedGoals}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.queryByText(/Goals Achieved:/i)).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should render Try Again button', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should render Main Menu button', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Main Menu')).toBeInTheDocument();
    });

    it('should call onPlayAgain when Try Again clicked', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('should call onMainMenu when Main Menu clicked', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Main Menu'));
      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
    });

    it('should not call onMainMenu when Try Again clicked', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnMainMenu).not.toHaveBeenCalled();
    });

    it('should not call onPlayAgain when Main Menu clicked', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Main Menu'));
      expect(mockOnPlayAgain).not.toHaveBeenCalled();
    });

    it('should handle multiple Try Again clicks', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      fireEvent.click(tryAgainButton);

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on Try Again button', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const tryAgainButton = screen.getByLabelText('Try playing the game again');
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should have aria-label on Main Menu button', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const mainMenuButton = screen.getByLabelText('Return to main menu');
      expect(mainMenuButton).toBeInTheDocument();
    });
  });

  describe('Different Reasons', () => {
    it('should work correctly with timeout reason', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      expect(screen.getByText(/Time ran out/i)).toBeInTheDocument();
    });

    it('should work correctly with death reason', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="death"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      expect(screen.getByText(/health dropped to zero/i)).toBeInTheDocument();
    });

    it('should work correctly with bankruptcy reason', () => {
      render(
        <GameOverScreen
          stats={mockStats}
          reason="bankruptcy"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      expect(screen.getByText(/bankrupt/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all stats at zero', () => {
      const zeroStats: GameStats = {
        finalWealth: 0,
        finalHealth: 0,
        finalHappiness: 0,
        finalEducation: 0,
        finalCareer: 0,
        weeksPlayed: 0,
        goalsAchieved: [],
        goalsMissed: [],
      };

      render(
        <GameOverScreen
          stats={zeroStats}
          reason="death"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
      // Both health and happiness show 0%, so we check for at least one
      const zeroPercentElements = screen.getAllByText('0%');
      expect(zeroPercentElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty goal arrays', () => {
      const statsWithNoGoals = {
        ...mockStats,
        goalsAchieved: [],
        goalsMissed: [],
      };

      render(
        <GameOverScreen
          stats={statsWithNoGoals}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.queryByText(/Goals Achieved:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Goals Not Achieved:/i)).not.toBeInTheDocument();
    });

    it('should handle very large stats', () => {
      const largeStats: GameStats = {
        finalWealth: 999999999,
        finalHealth: 100,
        finalHappiness: 100,
        finalEducation: 99,
        finalCareer: 99,
        weeksPlayed: 9999,
        goalsAchieved: ['All Goals'],
        goalsMissed: [],
      };

      render(
        <GameOverScreen
          stats={largeStats}
          reason="timeout"
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$999,999,999')).toBeInTheDocument();
      expect(screen.getByText('9999')).toBeInTheDocument();
    });
  });
});
