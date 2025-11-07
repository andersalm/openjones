/**
 * GameController - Orchestrates the main game loop
 *
 * This is the heart of the game that coordinates:
 * - Turn management and time tracking
 * - Action execution pipeline
 * - State synchronization across systems
 * - Observer notifications for state changes
 *
 * Part of Task I1: Game Loop Controller
 * Worker 1 - Session 5 (Integration)
 */

import {
  IGame,
  IPlayer,
  IAction,
  IActionResponse,
  IGameConfig,
  ActionType,
} from '@shared/types/contracts';
import { Game } from './game/Game';
import {
  ActionRegistry,
  MovementAction,
  EnterBuildingAction,
  ExitBuildingAction,
  WorkAction,
  StudyAction,
  RelaxAction,
  PurchaseClothesAction,
  ApplyForJobAction,
  PayRentAction,
  RentHouseAction,
} from './actions';

/**
 * Configuration for GameController
 */
export interface GameControllerConfig {
  game?: Game;
  autoSave?: boolean;
  tickRate?: number; // ms per game tick (default: 60fps = 16ms)
}

/**
 * Result of executing a turn/action
 */
export interface TurnResult {
  success: boolean;
  message: string;
  stateChanged: boolean;
  timeAdvanced: number; // time units advanced
}

/**
 * Observer callback type
 */
export type GameObserver = (game: IGame) => void;

/**
 * GameController - Main game loop orchestrator
 *
 * This class integrates all existing game systems:
 * - Game state management (Game class)
 * - Action execution (Action classes)
 * - Player state updates (Player/PlayerState classes)
 * - Time progression
 * - Observer pattern for UI updates
 */
export class GameController {
  private game: Game;
  private actionRegistry: ActionRegistry;
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private observers: Set<GameObserver> = new Set();
  private autoSave: boolean;

  constructor(config: GameControllerConfig = {}) {
    this.game = config.game || Game.create();
    this.actionRegistry = ActionRegistry.getInstance();
    this.autoSave = config.autoSave || false;
    this.registerAllActions();
  }

  /**
   * Register all available action types in the ActionRegistry
   * This makes actions discoverable and creatable via the registry
   */
  private registerAllActions(): void {
    const registry = this.actionRegistry;

    // Helper function to safely register (skip if already registered)
    const safeRegister = (id: string, type: ActionType, ctor: any, desc: string) => {
      if (!registry.has(id)) {
        registry.registerClass(id, type, ctor, desc);
      }
    };

    // Movement actions
    safeRegister('movement', ActionType.MOVE, MovementAction, 'Move from one position to another');
    safeRegister('enter-building', ActionType.ENTER_BUILDING, EnterBuildingAction, 'Enter a building');
    safeRegister('exit-building', ActionType.EXIT_BUILDING, ExitBuildingAction, 'Exit current building');

    // Work & Study actions
    safeRegister('work', ActionType.WORK, WorkAction, 'Work at current job');
    safeRegister('study', ActionType.STUDY, StudyAction, 'Study to improve education');
    safeRegister('relax', ActionType.RELAX, RelaxAction, 'Relax to restore energy');

    // Economic actions
    safeRegister('purchase-clothes', ActionType.PURCHASE, PurchaseClothesAction, 'Purchase clothes');
    safeRegister('apply-for-job', ActionType.APPLY_JOB, ApplyForJobAction, 'Apply for a job');
    safeRegister('pay-rent', ActionType.PAY_RENT, PayRentAction, 'Pay rent for current home');
    safeRegister('rent-house', ActionType.RENT_HOME, RentHouseAction, 'Rent a house/apartment');
  }

  /**
   * Initialize a new game with configuration
   */
  initialize(config: IGameConfig): void {
    this.game.initialize(config);
    this.currentTick = 0;
    this.isRunning = false;
    this.notifyObservers();
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.notifyObservers();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.notifyObservers();
  }

  /**
   * Execute a player action
   *
   * This is the main entry point for player input.
   * It validates the action, executes it via the Game class,
   * and notifies observers of state changes.
   */
  async executeAction(playerId: string, action: IAction): Promise<TurnResult> {
    // Validate player exists
    const player = this.game.getPlayerById(playerId);
    if (!player) {
      return {
        success: false,
        message: `Player with ID ${playerId} not found`,
        stateChanged: false,
        timeAdvanced: 0,
      };
    }

    // Execute action via Game class (which handles all validation and state changes)
    const response: IActionResponse = this.game.processTurn(playerId, action);

    // Build result
    const result: TurnResult = {
      success: response.success,
      message: response.message,
      stateChanged: response.success,
      timeAdvanced: response.timeSpent,
    };

    // Notify observers if state changed
    if (response.success) {
      this.notifyObservers();

      // Auto-save if enabled
      if (this.autoSave) {
        this.save();
      }
    }

    return result;
  }

  /**
   * Advance game time by one tick
   * This can be used for passive time progression or automated events
   */
  tick(): void {
    if (!this.isRunning) {
      return;
    }

    this.currentTick++;

    // Check for game-over conditions
    if (this.game.isGameOver) {
      this.stop();
    }

    this.notifyObservers();
  }

  /**
   * Subscribe to game state changes
   *
   * @param observer Callback function that receives the game state
   * @returns Unsubscribe function
   */
  subscribe(observer: GameObserver): () => void {
    this.observers.add(observer);

    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Notify all observers of state changes
   */
  private notifyObservers(): void {
    this.observers.forEach((observer) => {
      try {
        observer(this.game);
      } catch (error) {
        console.error('Error in game observer:', error);
      }
    });
  }

  /**
   * Get current game state (read-only access)
   */
  getGameState(): IGame {
    return this.game;
  }

  /**
   * Get the underlying Game instance
   */
  getGame(): Game {
    return this.game;
  }

  /**
   * Get current player whose turn it is
   */
  getCurrentPlayer(): IPlayer {
    return this.game.getCurrentPlayer();
  }

  /**
   * Move to next player's turn
   */
  nextPlayer(): void {
    this.game.nextPlayer();
    this.notifyObservers();
  }

  /**
   * Check if game is currently running
   */
  isGameRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.game.isGameOver;
  }

  /**
   * Get current tick number
   */
  getCurrentTick(): number {
    return this.currentTick;
  }

  /**
   * Get current week
   */
  getCurrentWeek(): number {
    return this.game.currentWeek;
  }

  /**
   * Get time units remaining in current week
   */
  getTimeRemaining(): number {
    return this.game.timeUnitsRemaining;
  }

  /**
   * Check victory conditions for all players
   */
  checkVictory() {
    return this.game.checkVictory();
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.game = Game.create();
    this.currentTick = 0;
    this.isRunning = false;
    this.notifyObservers();
  }

  /**
   * Save game state to a string
   */
  save(): string {
    return this.game.serialize();
  }

  /**
   * Load game state from a string
   */
  load(data: string): void {
    this.game.deserialize(data);
    this.currentTick = 0;
    this.isRunning = false;
    this.notifyObservers();
  }

  /**
   * Get the action registry
   */
  getActionRegistry(): ActionRegistry {
    return this.actionRegistry;
  }

  /**
   * Get number of registered observers
   */
  getObserverCount(): number {
    return this.observers.size;
  }

  /**
   * Static factory method to create a new GameController
   */
  static create(config?: GameControllerConfig): GameController {
    return new GameController(config);
  }

  /**
   * Static factory method to create a GameController with initialized game
   */
  static createWithGame(gameConfig: IGameConfig, controllerConfig?: Omit<GameControllerConfig, 'game'>): GameController {
    const game = Game.createWithConfig(gameConfig);
    const controller = new GameController({
      ...controllerConfig,
      game,
    });
    return controller;
  }
}

export default GameController;
