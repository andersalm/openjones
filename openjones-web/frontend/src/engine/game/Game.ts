/**
 * Game - Main game state manager
 *
 * This is the central class that manages the entire game state including:
 * - Turn management and time tracking
 * - Player state and actions
 * - Victory condition checking
 * - Game serialization/deserialization
 *
 * Part of Task A2: Game State Management
 * Worker 1 - Track A (Core Engine)
 */

import {
  IGame,
  IPlayer,
  IPlayerState,
  IMap,
  IAction,
  IActionResponse,
  IEconomyModel,
  IVictoryConditions,
  IVictoryResult,
  IGameConfig,
  IStateChange,
  IPosition,
  IJob,
  IPossession,
  MeasureType,
  GAME_CONSTANTS,
} from '@shared/types/contracts';
import { Player } from './Player';
import { PlayerState } from './PlayerState';
import { Position } from '../types/Position';
import { EconomyModel } from '../economy/EconomyModel';
import { MockMap } from '@shared/mocks';

export class Game implements IGame {
  id: string;
  currentWeek: number;
  timeUnitsRemaining: number;
  currentPlayerIndex: number;
  players: IPlayer[];
  map: IMap;
  economyModel: IEconomyModel;
  victoryConditions: IVictoryConditions;
  isGameOver: boolean;

  constructor() {
    // Initialize with default values
    this.id = this.generateGameId();
    this.currentWeek = 1;
    this.timeUnitsRemaining = GAME_CONSTANTS.TIME_UNITS_PER_WEEK;
    this.currentPlayerIndex = 0;
    this.players = [];
    this.map = new MockMap(); // TODO: Replace with real Map when Task B2 is complete
    this.economyModel = new EconomyModel();
    this.victoryConditions = {
      targetWealth: 10000,
      targetHealth: 100,
      targetHappiness: 100,
      targetCareer: 850,
      targetEducation: 100,
    };
    this.isGameOver = false;
  }

  /**
   * Generate a unique game ID
   */
  private generateGameId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Initialize a new game with the given configuration
   */
  initialize(config: IGameConfig): void {
    // Reset game state
    this.id = this.generateGameId();
    this.currentWeek = 1;
    this.timeUnitsRemaining = GAME_CONSTANTS.TIME_UNITS_PER_WEEK;
    this.currentPlayerIndex = 0;
    this.isGameOver = false;

    // Create players from config
    this.players = config.players.map((playerConfig) => {
      // Create player state with starting values
      const state = new PlayerState({
        playerId: playerConfig.id,
        cash: config.startingCash,
        health: config.startingStats.health,
        happiness: config.startingStats.happiness,
        education: config.startingStats.education,
        career: 0,
        position: new Position(0, 0), // All players start at (0,0)
        currentBuilding: null,
        job: null,
        experience: [],
        possessions: [],
        rentedHome: null,
        rentDebt: 0,
      });

      // Create player
      return new Player({
        id: playerConfig.id,
        name: playerConfig.name,
        color: playerConfig.color,
        state,
        isAI: playerConfig.isAI,
      });
    });

    // Set victory conditions
    this.victoryConditions = { ...config.victoryConditions };

    // Initialize map (using MockMap for now)
    this.map = new MockMap();

    // Initialize economy model
    this.economyModel = new EconomyModel();
  }

  /**
   * Process a turn for a player executing an action
   */
  processTurn(playerId: string, action: IAction): IActionResponse {
    // Validate player exists
    const player = this.getPlayerById(playerId);
    if (!player) {
      return {
        success: false,
        message: `Player with ID ${playerId} not found`,
        timeSpent: 0,
        stateChanges: [],
      };
    }

    // Validate it's this player's turn
    if (this.getCurrentPlayer().id !== playerId) {
      return {
        success: false,
        message: "It's not your turn",
        timeSpent: 0,
        stateChanges: [],
      };
    }

    // Check if game is over
    if (this.isGameOver) {
      return {
        success: false,
        message: 'Game is over',
        timeSpent: 0,
        stateChanges: [],
      };
    }

    // Check if action can be executed
    if (!action.canExecute(player.state, this)) {
      return {
        success: false,
        message: `Cannot execute action: ${action.displayName}`,
        timeSpent: 0,
        stateChanges: [],
      };
    }

    // Check if player has enough time remaining
    if (action.timeCost > this.timeUnitsRemaining) {
      return {
        success: false,
        message: `Not enough time remaining. Action requires ${action.timeCost} units, but only ${this.timeUnitsRemaining} remaining`,
        timeSpent: 0,
        stateChanges: [],
      };
    }

    // Execute the action
    const response = action.execute(player.state, this);

    // If action was successful, apply state changes and advance time
    if (response.success) {
      this.applyStateChanges(player, response.stateChanges);
      this.advanceTime(response.timeSpent);

      // Check for victory after each successful action
      const victoryResults = this.checkVictory();
      const anyVictory = victoryResults.some((result) => result.isVictory);
      if (anyVictory) {
        this.isGameOver = true;
      }
    }

    return response;
  }

  /**
   * Advance time by the specified number of units
   * Handles week transitions and weekly events (rent, etc.)
   */
  advanceTime(units: number): void {
    this.timeUnitsRemaining -= units;

    // Check if week has ended
    while (this.timeUnitsRemaining <= 0) {
      // Process end-of-week events
      this.processEndOfWeek();

      // Start new week
      this.currentWeek++;
      this.timeUnitsRemaining += GAME_CONSTANTS.TIME_UNITS_PER_WEEK;
    }
  }

  /**
   * Process end-of-week events (rent payment, etc.)
   */
  private processEndOfWeek(): void {
    // Process rent for all players
    for (const player of this.players) {
      if (player.state.rentedHome) {
        const building = this.map.getBuildingById(player.state.rentedHome);
        if (building && building.isHome()) {
          const rent = this.economyModel.getRent(building.type);

          if (player.state.canAfford(rent)) {
            // Player can pay rent
            player.state.cash -= rent;
          } else {
            // Player cannot afford rent - add to debt
            const shortage = rent - player.state.cash;
            player.state.cash = 0;
            player.state.rentDebt += shortage;

            // Apply penalties for debt (health and happiness reduction)
            player.state.updateMeasure(MeasureType.HEALTH, -5);
            player.state.updateMeasure(MeasureType.HAPPINESS, -10);
          }
        }
      }
    }
  }

  /**
   * Move to the next player's turn
   */
  nextPlayer(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  /**
   * Get the current player whose turn it is
   */
  getCurrentPlayer(): IPlayer {
    if (this.players.length === 0) {
      throw new Error('No players in game');
    }
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Check victory conditions for all players
   */
  checkVictory(): IVictoryResult[] {
    return this.players.map((player) => {
      const state = player.state;

      // Check each victory condition
      const conditionsMet = {
        wealth: state.cash >= this.victoryConditions.targetWealth,
        health: state.health >= this.victoryConditions.targetHealth,
        happiness: state.happiness >= this.victoryConditions.targetHappiness,
        career: state.career >= this.victoryConditions.targetCareer,
        education: state.education >= this.victoryConditions.targetEducation,
      };

      // Player wins if ALL conditions are met
      const isVictory = Object.values(conditionsMet).every((met) => met);

      return {
        playerId: player.id,
        playerName: player.name,
        week: this.currentWeek,
        conditionsMet,
        isVictory,
      };
    });
  }

  /**
   * Serialize the game state to a JSON string
   */
  serialize(): string {
    const gameState = {
      id: this.id,
      currentWeek: this.currentWeek,
      timeUnitsRemaining: this.timeUnitsRemaining,
      currentPlayerIndex: this.currentPlayerIndex,
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        color: player.color,
        isAI: player.isAI,
        state: {
          playerId: player.state.playerId,
          cash: player.state.cash,
          health: player.state.health,
          happiness: player.state.happiness,
          education: player.state.education,
          career: player.state.career,
          position: { x: player.state.position.x, y: player.state.position.y },
          currentBuilding: player.state.currentBuilding,
          job: player.state.job,
          experience: player.state.experience,
          possessions: player.state.possessions,
          rentedHome: player.state.rentedHome,
          rentDebt: player.state.rentDebt,
        },
      })),
      victoryConditions: this.victoryConditions,
      isGameOver: this.isGameOver,
    };

    return JSON.stringify(gameState);
  }

  /**
   * Deserialize game state from a JSON string
   */
  deserialize(data: string): void {
    try {
      const gameState = JSON.parse(data);

      // Restore basic properties
      this.id = gameState.id;
      this.currentWeek = gameState.currentWeek;
      this.timeUnitsRemaining = gameState.timeUnitsRemaining;
      this.currentPlayerIndex = gameState.currentPlayerIndex;
      this.victoryConditions = gameState.victoryConditions;
      this.isGameOver = gameState.isGameOver || false;

      // Restore players
      this.players = gameState.players.map((playerData: any) => {
        const state = new PlayerState({
          playerId: playerData.state.playerId,
          cash: playerData.state.cash,
          health: playerData.state.health,
          happiness: playerData.state.happiness,
          education: playerData.state.education,
          career: playerData.state.career,
          position: new Position(
            playerData.state.position.x,
            playerData.state.position.y
          ),
          currentBuilding: playerData.state.currentBuilding,
          job: playerData.state.job,
          experience: playerData.state.experience,
          possessions: playerData.state.possessions,
          rentedHome: playerData.state.rentedHome,
          rentDebt: playerData.state.rentDebt,
        });

        return new Player({
          id: playerData.id,
          name: playerData.name,
          color: playerData.color,
          state,
          isAI: playerData.isAI,
        });
      });

      // Reinitialize map and economy model
      // (These are stateless in the current implementation)
      this.map = new MockMap();
      this.economyModel = new EconomyModel();
    } catch (error) {
      throw new Error(`Failed to deserialize game state: ${error}`);
    }
  }

  /**
   * Get a player by their ID
   */
  getPlayerById(playerId: string): IPlayer | null {
    return this.players.find((p) => p.id === playerId) || null;
  }

  /**
   * Apply state changes to a player
   */
  applyStateChanges(player: IPlayer, changes: IStateChange[]): void {
    for (const change of changes) {
      switch (change.type) {
        case 'cash':
          player.state.cash = change.value as number;
          break;

        case 'measure':
          if (change.measure) {
            // Extract the actual delta value
            // If value is the new value, calculate delta
            // If value is already a delta, apply it
            const currentValue = this.getMeasureValue(player.state, change.measure);
            const targetValue = change.value as number;

            // Assume the value in stateChange is the new absolute value
            const delta = targetValue - currentValue;
            player.state.updateMeasure(change.measure, delta);
          }
          break;

        case 'possession_add':
          player.state.addPossession(change.value as IPossession);
          break;

        case 'possession_remove':
          {
            const possession = change.value as IPossession;
            player.state.removePossession(possession.id);
          }
          break;

        case 'job':
          player.state.job = (change.value as IJob) || null;
          break;

        case 'position':
          player.state.position = change.value as IPosition;
          break;

        default:
          console.warn(`Unknown state change type: ${change.type}`);
      }
    }
  }

  /**
   * Helper method to get current measure value
   */
  private getMeasureValue(state: IPlayerState, measure: MeasureType): number {
    switch (measure) {
      case MeasureType.HEALTH:
        return state.health;
      case MeasureType.HAPPINESS:
        return state.happiness;
      case MeasureType.EDUCATION:
        return state.education;
      case MeasureType.CAREER:
        return state.career;
      case MeasureType.WEALTH:
        return state.cash;
      default:
        return 0;
    }
  }

  /**
   * Static factory method to create a new game
   */
  static create(): Game {
    return new Game();
  }

  /**
   * Static factory method to create and initialize a game
   */
  static createWithConfig(config: IGameConfig): Game {
    const game = new Game();
    game.initialize(config);
    return game;
  }
}

export default Game;
