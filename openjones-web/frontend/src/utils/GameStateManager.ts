/**
 * GameStateManager - Handles saving and loading game state to localStorage
 *
 * Allows players to refresh the page without losing progress
 */

import type { IPlayerState, IGame } from '@shared/types/contracts';

const STORAGE_KEY = 'openjones_game_state';

export interface SavedGameState {
  playerState: IPlayerState;
  currentWeek: number;
  timeRemaining: number;
  playerName: string;
  timestamp: number;
  victoryConditions: {
    targetWealth: number;
    targetHealth: number;
    targetHappiness: number;
    targetCareer: number;
    targetEducation: number;
  };
}

export class GameStateManager {
  /**
   * Save current game state to localStorage
   */
  static saveGame(game: IGame): void {
    try {
      const player = game.getCurrentPlayer();

      const savedState: SavedGameState = {
        playerState: player.state,
        currentWeek: game.currentWeek,
        timeRemaining: game.timeUnitsRemaining,
        playerName: player.name,
        timestamp: Date.now(),
        victoryConditions: game.victoryConditions,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Load saved game state from localStorage
   */
  static loadGame(): SavedGameState | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return null;
      }

      const state: SavedGameState = JSON.parse(saved);

      // Validate saved state has required fields
      if (!state.playerState || !state.playerName) {
        console.warn('Invalid saved state, clearing');
        GameStateManager.clearSave();
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if there's a saved game
   */
  static hasSavedGame(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Clear saved game from localStorage
   */
  static clearSave(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Saved game cleared');
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  /**
   * Get formatted info about saved game for display
   */
  static getSavedGameInfo(): string | null {
    const saved = GameStateManager.loadGame();
    if (!saved) {
      return null;
    }

    const date = new Date(saved.timestamp);
    const formattedDate = date.toLocaleString();

    return `${saved.playerName} - Week ${saved.currentWeek} - ${formattedDate}`;
  }
}
