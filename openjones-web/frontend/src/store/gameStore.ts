/**
 * Game Store - Zustand state management for OpenJones
 *
 * Provides centralized state management for the game using Zustand.
 * Wraps the Game class and provides:
 * - State management with actions
 * - Persistence to localStorage
 * - Selectors for UI components
 *
 * Part of Task A8: Zustand Game Store
 * Worker 4 - Track D (Frontend/UI)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  IGame,
  IGameConfig,
  IPlayer,
  IAction,
  IActionResponse,
  IVictoryResult,
} from '@shared/types/contracts';
import { Game } from '../engine/game/Game';

interface GameStoreState {
  // State
  game: IGame | null;
  isGameActive: boolean;
  lastActionResult: IActionResponse | null;
  victoryResults: IVictoryResult[];

  // Actions
  startNewGame: (config: IGameConfig) => void;
  processTurn: (playerId: string, action: IAction) => IActionResponse;
  advanceTime: (units: number) => void;
  nextPlayer: () => void;
  saveGame: () => void;
  loadGame: (gameData: string) => void;
  resetGame: () => void;
  checkVictory: () => IVictoryResult[];

  // Selectors (computed values)
  getCurrentPlayer: () => IPlayer | null;
  getTimeRemaining: () => number;
  getCurrentWeek: () => number;
  isGameOver: () => boolean;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set: any, get: any) => ({
      // Initial state
      game: null,
      isGameActive: false,
      lastActionResult: null,
      victoryResults: [],

      // Start a new game
      startNewGame: (config: IGameConfig) => {
        const game = new Game();
        game.initialize(config);
        set({
          game,
          isGameActive: true,
          lastActionResult: null,
          victoryResults: [],
        });
      },

      // Process a player's turn
      processTurn: (playerId: string, action: IAction) => {
        const { game } = get();
        if (!game) {
          throw new Error('No active game');
        }

        const result = game.processTurn(playerId, action);

        // Check for victory after processing turn
        const victoryResults = game.checkVictory();

        set({
          game, // Keep the Game instance
          lastActionResult: result,
          victoryResults,
          isGameActive: !game.isGameOver,
        });

        return result;
      },

      // Advance game time
      advanceTime: (units: number) => {
        const { game } = get();
        if (!game) return;

        game.advanceTime(units);
        set({ game }); // Keep the Game instance
      },

      // Move to next player
      nextPlayer: () => {
        const { game } = get();
        if (!game) return;

        game.nextPlayer();
        set({ game }); // Keep the Game instance
      },

      // Save game state to localStorage
      saveGame: () => {
        const { game } = get();
        if (!game) return;

        const serialized = game.serialize();
        localStorage.setItem('openjones-save', serialized);
      },

      // Load game state from serialized data
      loadGame: (gameData: string) => {
        const game = new Game();
        game.deserialize(gameData);
        const victoryResults = game.checkVictory();
        set({
          game,
          isGameActive: !game.isGameOver,
          lastActionResult: null,
          victoryResults,
        });
      },

      // Reset/clear game
      resetGame: () => {
        set({
          game: null,
          isGameActive: false,
          lastActionResult: null,
          victoryResults: [],
        });
        localStorage.removeItem('openjones-save');
      },

      // Check victory conditions
      checkVictory: () => {
        const { game } = get();
        if (!game) return [];

        const results = game.checkVictory();
        const anyVictory = results.some((result) => result.isVictory);
        if (anyVictory) {
          set({ victoryResults: results, isGameActive: false });
        }
        return results;
      },

      // Selectors
      getCurrentPlayer: () => {
        const { game } = get();
        if (!game || game.players.length === 0) return null;
        try {
          return game.getCurrentPlayer();
        } catch {
          return null;
        }
      },

      getTimeRemaining: () => {
        const { game } = get();
        return game ? game.timeUnitsRemaining : 0;
      },

      getCurrentWeek: () => {
        const { game } = get();
        return game ? game.currentWeek : 0;
      },

      isGameOver: () => {
        const { game } = get();
        return game ? game.isGameOver : false;
      },
    }),
    {
      name: 'openjones-game-store', // localStorage key
      partialize: (state: GameStoreState) => ({
        // Only persist game state, not UI state
        game: state.game ? state.game.serialize() : null,
        isGameActive: state.isGameActive,
      }),
      merge: (persistedState: any, currentState: GameStoreState) => {
        // Handle deserialization when loading from localStorage
        if (persistedState?.game && typeof persistedState.game === 'string') {
          try {
            const game = new Game();
            game.deserialize(persistedState.game);
            return {
              ...currentState,
              game,
              isGameActive: persistedState.isGameActive ?? false,
            };
          } catch (error) {
            console.error('Failed to deserialize game state:', error);
            return currentState;
          }
        }
        return { ...currentState, ...persistedState };
      },
    }
  )
);

// Convenience hooks for specific values
export const useCurrentPlayer = () =>
  useGameStore((state: GameStoreState) => state.getCurrentPlayer());
export const useTimeRemaining = () =>
  useGameStore((state: GameStoreState) => state.getTimeRemaining());
export const useCurrentWeek = () =>
  useGameStore((state: GameStoreState) => state.getCurrentWeek());
export const useIsGameOver = () =>
  useGameStore((state: GameStoreState) => state.isGameOver());
