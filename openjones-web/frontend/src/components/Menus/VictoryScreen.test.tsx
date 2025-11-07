import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryScreen } from './VictoryScreen';
import type { GameStats } from './types';

describe('VictoryScreen', () => {
  const mockStats: GameStats = {
    finalWealth: 15000,
    finalHealth: 85,
    finalHappiness: 90,
    finalEducation: 7,
    finalCareer: 8,
    weeksPlayed: 52,
    goalsAchieved: ['Wealth Goal', 'Career Goal'],
    goalsMissed: [],
  };

  const mockOnPlayAgain = vi.fn();
  const mockOnMainMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render victory message', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/VICTORY!/i)).toBeInTheDocument();
    });

    it('should render congratulations message', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/made it in the fast lane/i)).toBeInTheDocument();
    });

    it('should render final statistics header', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Final Statistics')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display wealth with proper formatting', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });

    it('should display health percentage', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should display happiness percentage', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('should display weeks played', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('52')).toBeInTheDocument();
    });

    it('should display education level', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Level 7')).toBeInTheDocument();
    });

    it('should display career level', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Level 8')).toBeInTheDocument();
    });

    it('should handle zero wealth', () => {
      const statsWithZeroWealth = { ...mockStats, finalWealth: 0 };
      render(
        <VictoryScreen
          stats={statsWithZeroWealth}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle large wealth values', () => {
      const statsWithLargeWealth = { ...mockStats, finalWealth: 1000000 };
      render(
        <VictoryScreen
          stats={statsWithLargeWealth}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });
  });

  describe('Goals Achieved Section', () => {
    it('should display goals achieved header when goals exist', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText(/Goals Achieved:/i)).toBeInTheDocument();
    });

    it('should display first goal achieved', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Wealth Goal')).toBeInTheDocument();
    });

    it('should display second goal achieved', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Career Goal')).toBeInTheDocument();
    });

    it('should not display goals section when no goals achieved', () => {
      const statsWithNoGoals = { ...mockStats, goalsAchieved: [] };
      render(
        <VictoryScreen
          stats={statsWithNoGoals}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.queryByText(/Goals Achieved:/i)).not.toBeInTheDocument();
    });

    it('should handle multiple goals achieved', () => {
      const statsWithManyGoals = {
        ...mockStats,
        goalsAchieved: ['Goal 1', 'Goal 2', 'Goal 3', 'Goal 4'],
      };
      render(
        <VictoryScreen
          stats={statsWithManyGoals}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Goal 1')).toBeInTheDocument();
      expect(screen.getByText('Goal 2')).toBeInTheDocument();
      expect(screen.getByText('Goal 3')).toBeInTheDocument();
      expect(screen.getByText('Goal 4')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should render Play Again button', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });

    it('should render Main Menu button', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('Main Menu')).toBeInTheDocument();
    });

    it('should call onPlayAgain when Play Again clicked', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Play Again'));
      expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('should call onMainMenu when Main Menu clicked', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Main Menu'));
      expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
    });

    it('should not call onMainMenu when Play Again clicked', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Play Again'));
      expect(mockOnMainMenu).not.toHaveBeenCalled();
    });

    it('should not call onPlayAgain when Main Menu clicked', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      fireEvent.click(screen.getByText('Main Menu'));
      expect(mockOnPlayAgain).not.toHaveBeenCalled();
    });

    it('should handle multiple Play Again clicks', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const playAgainButton = screen.getByText('Play Again');
      fireEvent.click(playAgainButton);
      fireEvent.click(playAgainButton);
      fireEvent.click(playAgainButton);

      expect(mockOnPlayAgain).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on Play Again button', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const playAgainButton = screen.getByLabelText('Play the game again');
      expect(playAgainButton).toBeInTheDocument();
    });

    it('should have aria-label on Main Menu button', () => {
      render(
        <VictoryScreen
          stats={mockStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      const mainMenuButton = screen.getByLabelText('Return to main menu');
      expect(mainMenuButton).toBeInTheDocument();
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
        <VictoryScreen
          stats={zeroStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
      // Both health and happiness show 0%, so we check for at least one
      const zeroPercentElements = screen.getAllByText('0%');
      expect(zeroPercentElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle all stats at maximum', () => {
      const maxStats: GameStats = {
        finalWealth: 999999999,
        finalHealth: 100,
        finalHappiness: 100,
        finalEducation: 10,
        finalCareer: 10,
        weeksPlayed: 999,
        goalsAchieved: ['All Goals'],
        goalsMissed: [],
      };

      render(
        <VictoryScreen
          stats={maxStats}
          onPlayAgain={mockOnPlayAgain}
          onMainMenu={mockOnMainMenu}
        />
      );

      expect(screen.getByText('$999,999,999')).toBeInTheDocument();
      // Both health and happiness show 100%, so we check for at least one
      const hundredPercentElements = screen.getAllByText('100%');
      expect(hundredPercentElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });
});
