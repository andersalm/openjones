/**
 * Unit tests for gameStore
 *
 * Part of Task A8: Zustand Game Store
 * Worker 4 - Track D (Frontend/UI)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useGameStore,
  useCurrentPlayer,
  useTimeRemaining,
  useCurrentWeek,
  useIsGameOver,
} from './gameStore';
import {
  IGameConfig,
  IAction,
  ActionType,
  GAME_CONSTANTS,
} from '@shared/types/contracts';
import { MockAction } from '@shared/mocks';

describe('gameStore', () => {
  let basicConfig: IGameConfig;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Clear the store
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });

    // Basic game configuration for testing
    basicConfig = {
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          color: '#FF0000',
          isAI: false,
        },
      ],
      victoryConditions: {
        targetWealth: 1000,
        targetHealth: 80,
        targetHappiness: 80,
        targetCareer: 50,
        targetEducation: 50,
      },
      startingCash: 500,
      startingStats: {
        health: 70,
        happiness: 70,
        education: 20,
      },
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with null game', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.game).toBeNull();
      expect(result.current.isGameActive).toBe(false);
      expect(result.current.lastActionResult).toBeNull();
      expect(result.current.victoryResults).toEqual([]);
    });

    it('should have all required actions', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.startNewGame).toBeDefined();
      expect(result.current.processTurn).toBeDefined();
      expect(result.current.advanceTime).toBeDefined();
      expect(result.current.nextPlayer).toBeDefined();
      expect(result.current.saveGame).toBeDefined();
      expect(result.current.loadGame).toBeDefined();
      expect(result.current.resetGame).toBeDefined();
      expect(result.current.checkVictory).toBeDefined();
    });

    it('should have all required selectors', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.getCurrentPlayer).toBeDefined();
      expect(result.current.getTimeRemaining).toBeDefined();
      expect(result.current.getCurrentWeek).toBeDefined();
      expect(result.current.isGameOver).toBeDefined();
    });
  });

  describe('Starting a new game', () => {
    it('should start a new game with valid config', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      expect(result.current.game).not.toBeNull();
      expect(result.current.isGameActive).toBe(true);
      expect(result.current.game?.players).toHaveLength(1);
      expect(result.current.game?.players[0].name).toBe('Player 1');
    });

    it('should initialize game with correct starting values', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      expect(result.current.game?.currentWeek).toBe(1);
      expect(result.current.game?.timeUnitsRemaining).toBe(
        GAME_CONSTANTS.TIME_UNITS_PER_WEEK
      );
      expect(result.current.game?.currentPlayerIndex).toBe(0);
      expect(result.current.game?.isGameOver).toBe(false);
    });

    it('should start a new game with multiple players', () => {
      const { result } = renderHook(() => useGameStore());

      const multiPlayerConfig: IGameConfig = {
        ...basicConfig,
        players: [
          { id: 'p1', name: 'Player 1', color: '#0000FF', isAI: false },
          { id: 'p2', name: 'Player 2', color: '#FF0000', isAI: true },
        ],
      };

      act(() => {
        result.current.startNewGame(multiPlayerConfig);
      });

      expect(result.current.game?.players).toHaveLength(2);
      expect(result.current.game?.players[0].name).toBe('Player 1');
      expect(result.current.game?.players[1].name).toBe('Player 2');
    });

    it('should reset previous game state when starting new game', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const firstGameId = result.current.game?.id;

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const secondGameId = result.current.game?.id;

      expect(firstGameId).not.toBe(secondGameId);
      expect(result.current.lastActionResult).toBeNull();
      expect(result.current.victoryResults).toEqual([]);
    });
  });

  describe('Selectors', () => {
    it('should get current player', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const player = result.current.getCurrentPlayer();
      expect(player).not.toBeNull();
      expect(player?.name).toBe('Player 1');
      expect(player?.id).toBe('player-1');
    });

    it('should return null for current player when no game', () => {
      const { result } = renderHook(() => useGameStore());

      const player = result.current.getCurrentPlayer();
      expect(player).toBeNull();
    });

    it('should get time remaining', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const timeRemaining = result.current.getTimeRemaining();
      expect(timeRemaining).toBe(GAME_CONSTANTS.TIME_UNITS_PER_WEEK);
    });

    it('should return 0 for time remaining when no game', () => {
      const { result } = renderHook(() => useGameStore());

      const timeRemaining = result.current.getTimeRemaining();
      expect(timeRemaining).toBe(0);
    });

    it('should get current week', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const week = result.current.getCurrentWeek();
      expect(week).toBe(1);
    });

    it('should return 0 for current week when no game', () => {
      const { result } = renderHook(() => useGameStore());

      const week = result.current.getCurrentWeek();
      expect(week).toBe(0);
    });

    it('should check if game is over', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      const isOver = result.current.isGameOver();
      expect(isOver).toBe(false);
    });

    it('should return false for isGameOver when no game', () => {
      const { result } = renderHook(() => useGameStore());

      const isOver = result.current.isGameOver();
      expect(isOver).toBe(false);
    });
  });

  describe('Time management', () => {
    it('should advance time', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
        result.current.advanceTime(50);
      });

      expect(result.current.getTimeRemaining()).toBe(
        GAME_CONSTANTS.TIME_UNITS_PER_WEEK - 50
      );
    });

    it('should advance to next week when time runs out', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
        result.current.advanceTime(GAME_CONSTANTS.TIME_UNITS_PER_WEEK + 50);
      });

      expect(result.current.getCurrentWeek()).toBe(2);
      expect(result.current.getTimeRemaining()).toBe(
        GAME_CONSTANTS.TIME_UNITS_PER_WEEK - 50
      );
    });

    it('should handle advancing time when no game exists', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.advanceTime(50);
      });

      // Should not throw, just do nothing
      expect(result.current.game).toBeNull();
    });
  });

  describe('Player management', () => {
    it('should switch to next player', () => {
      const { result } = renderHook(() => useGameStore());

      const multiPlayerConfig: IGameConfig = {
        ...basicConfig,
        players: [
          { id: 'p1', name: 'Player 1', color: '#0000FF', isAI: false },
          { id: 'p2', name: 'Player 2', color: '#FF0000', isAI: false },
        ],
      };

      act(() => {
        result.current.startNewGame(multiPlayerConfig);
      });

      const firstPlayer = result.current.getCurrentPlayer();
      expect(firstPlayer?.id).toBe('p1');

      act(() => {
        result.current.nextPlayer();
      });

      const secondPlayer = result.current.getCurrentPlayer();
      expect(secondPlayer?.id).toBe('p2');
    });

    it('should wrap around to first player after last player', () => {
      const { result } = renderHook(() => useGameStore());

      const multiPlayerConfig: IGameConfig = {
        ...basicConfig,
        players: [
          { id: 'p1', name: 'Player 1', color: '#0000FF', isAI: false },
          { id: 'p2', name: 'Player 2', color: '#FF0000', isAI: false },
        ],
      };

      act(() => {
        result.current.startNewGame(multiPlayerConfig);
        result.current.nextPlayer();
        result.current.nextPlayer();
      });

      const player = result.current.getCurrentPlayer();
      expect(player?.id).toBe('p1');
    });

    it('should handle nextPlayer when no game exists', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.nextPlayer();
      });

      // Should not throw, just do nothing
      expect(result.current.game).toBeNull();
    });
  });

  describe('Turn processing', () => {
    it('should process a valid turn', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      // Create a simple action that always succeeds
      const mockAction: IAction = {
        id: 'test-action',
        type: ActionType.RELAX,
        displayName: 'Test Action',
        description: 'A test action',
        timeCost: 50,
        canExecute: () => true,
        execute: () => ({
          success: true,
          message: 'Success',
          timeSpent: 50,
          stateChanges: [],
        }),
        getRequirements: () => [],
      };

      act(() => {
        const response = result.current.processTurn('player-1', mockAction);
        expect(response.success).toBe(true);
      });

      expect(result.current.lastActionResult).not.toBeNull();
      expect(result.current.lastActionResult?.success).toBe(true);
    });

    it('should throw error when processing turn with no game', () => {
      const { result } = renderHook(() => useGameStore());

      const mockAction = new MockAction({
        id: 'test-action',
        type: ActionType.RELAX,
        displayName: 'Test Action',
        timeCost: 50,
      });

      expect(() => {
        act(() => {
          result.current.processTurn('player-1', mockAction);
        });
      }).toThrow('No active game');
    });
  });

  describe('Victory checking', () => {
    it('should check victory conditions', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      act(() => {
        const victoryResults = result.current.checkVictory();
        expect(victoryResults).toHaveLength(1);
        expect(victoryResults[0].playerId).toBe('player-1');
        expect(victoryResults[0].isVictory).toBe(false);
      });
    });

    it('should return empty array when checking victory with no game', () => {
      const { result } = renderHook(() => useGameStore());

      const victoryResults = result.current.checkVictory();
      expect(victoryResults).toEqual([]);
    });
  });

  describe('Reset game', () => {
    it('should reset game state', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
        result.current.resetGame();
      });

      expect(result.current.game).toBeNull();
      expect(result.current.isGameActive).toBe(false);
      expect(result.current.lastActionResult).toBeNull();
      expect(result.current.victoryResults).toEqual([]);
    });

    it('should clear localStorage when resetting', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
        result.current.saveGame();
        result.current.resetGame();
      });

      const saved = localStorage.getItem('openjones-save');
      expect(saved).toBeNull();
    });
  });

  describe('Save and load', () => {
    it('should save game to localStorage via saveGame', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
        result.current.saveGame();
      });

      const saved = localStorage.getItem('openjones-save');
      expect(saved).not.toBeNull();
      expect(saved).toContain('player-1');
    });

    it('should persist game state to localStorage automatically', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame(basicConfig);
      });

      // Wait for persist middleware to save
      const stored = localStorage.getItem('openjones-game-store');
      expect(stored).not.toBeNull();
    });

    it('should load game from serialized data', () => {
      const { result } = renderHook(() => useGameStore());

      // Start a new game
      act(() => {
        result.current.startNewGame(basicConfig);
      });

      // Get the serialized data
      const savedData = result.current.game!.serialize();
      expect(savedData).not.toBeNull();

      // Reset the game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.game).toBeNull();

      // Load the game from serialized data
      act(() => {
        result.current.loadGame(savedData);
      });

      expect(result.current.game).not.toBeNull();
      expect(result.current.isGameActive).toBe(true);
      expect(result.current.game?.players[0].name).toBe('Player 1');
    });

    it('should handle saveGame when no game exists', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.saveGame();
      });

      const saved = localStorage.getItem('openjones-save');
      expect(saved).toBeNull();
    });
  });

  describe('Convenience hooks', () => {
    it('useCurrentPlayer should return current player', () => {
      renderHook(() => useGameStore.getState().startNewGame(basicConfig));
      const { result } = renderHook(() => useCurrentPlayer());

      expect(result.current).not.toBeNull();
      expect(result.current?.name).toBe('Player 1');
    });

    it('useTimeRemaining should return time remaining', () => {
      renderHook(() => useGameStore.getState().startNewGame(basicConfig));
      const { result } = renderHook(() => useTimeRemaining());

      expect(result.current).toBe(GAME_CONSTANTS.TIME_UNITS_PER_WEEK);
    });

    it('useCurrentWeek should return current week', () => {
      renderHook(() => useGameStore.getState().startNewGame(basicConfig));
      const { result } = renderHook(() => useCurrentWeek());

      expect(result.current).toBe(1);
    });

    it('useIsGameOver should return game over status', () => {
      renderHook(() => useGameStore.getState().startNewGame(basicConfig));
      const { result } = renderHook(() => useIsGameOver());

      expect(result.current).toBe(false);
    });
  });
});
