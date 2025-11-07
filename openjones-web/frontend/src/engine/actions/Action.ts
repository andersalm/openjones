/**
 * Action - Abstract base class for all player actions
 *
 * This abstract class provides the foundation for all actions that players
 * can take in the game. It implements the IAction interface and provides
 * common functionality like requirement checking and validation.
 *
 * Part of Task A4: Base Action Classes
 * Worker 1 - Track A (Core Engine)
 */

import {
  IAction,
  IActionResponse,
  IActionRequirement,
  IPlayerState,
  IGame,
  ActionType,
  MeasureType,
} from '@shared/types/contracts';

/**
 * Abstract base class for all actions
 *
 * Subclasses must implement:
 * - canExecute(player, game): Check if action can be performed
 * - execute(player, game): Perform the action and return result
 *
 * The base class provides:
 * - Requirement definition and validation
 * - Common validation helpers
 * - Type safety for action properties
 */
export abstract class Action implements IAction {
  readonly id: string;
  readonly type: ActionType;
  readonly displayName: string;
  readonly description: string;
  readonly timeCost: number;

  constructor(
    id: string,
    type: ActionType,
    displayName: string,
    description: string,
    timeCost: number
  ) {
    this.id = id;
    this.type = type;
    this.displayName = displayName;
    this.description = description;
    this.timeCost = timeCost;
  }

  /**
   * Check if this action can be executed by the player
   * Must be implemented by subclasses
   */
  abstract canExecute(player: IPlayerState, game: IGame): boolean;

  /**
   * Execute this action and return the result
   * Must be implemented by subclasses
   */
  abstract execute(player: IPlayerState, game: IGame): IActionResponse;

  /**
   * Get the requirements for this action
   * Can be overridden by subclasses to provide specific requirements
   */
  getRequirements(): IActionRequirement[] {
    return [];
  }

  /**
   * Helper method to validate cash requirement
   */
  protected requiresCash(player: IPlayerState, amount: number): boolean {
    return player.canAfford(amount);
  }

  /**
   * Helper method to validate measure requirement
   */
  protected requiresMeasure(
    player: IPlayerState,
    measure: MeasureType,
    value: number,
    comparison: 'gte' | 'lte' | 'eq' = 'gte'
  ): boolean {
    let currentValue: number;

    switch (measure) {
      case MeasureType.HEALTH:
        currentValue = player.health;
        break;
      case MeasureType.HAPPINESS:
        currentValue = player.happiness;
        break;
      case MeasureType.EDUCATION:
        currentValue = player.education;
        break;
      case MeasureType.CAREER:
        currentValue = player.career;
        break;
      case MeasureType.WEALTH:
        currentValue = player.cash;
        break;
      default:
        return false;
    }

    switch (comparison) {
      case 'gte':
        return currentValue >= value;
      case 'lte':
        return currentValue <= value;
      case 'eq':
        return currentValue === value;
      default:
        return false;
    }
  }

  /**
   * Helper method to validate job requirement
   */
  protected requiresJob(player: IPlayerState): boolean {
    return player.job !== null;
  }

  /**
   * Helper method to validate building requirement
   */
  protected requiresBuilding(
    player: IPlayerState,
    buildingId?: string
  ): boolean {
    if (buildingId) {
      return player.currentBuilding === buildingId;
    }
    // Just check if player is in any building
    return player.currentBuilding !== null;
  }

  /**
   * Helper method to check if player is NOT in a building (on the street)
   */
  protected requiresStreet(player: IPlayerState): boolean {
    return player.currentBuilding === null;
  }

  /**
   * Helper method to check if player has enough time for this action
   * Note: timeRemaining property not currently in IPlayerState interface
   */
  protected hasEnoughTime(_player: IPlayerState): boolean {
    // return player.timeRemaining >= this.timeCost;
    return true; // Temporarily always true until timeRemaining is added to IPlayerState
  }

  /**
   * Get the action name (alias for displayName for compatibility)
   */
  get name(): string {
    return this.displayName;
  }

  /**
   * Helper method to validate possession requirement
   */
  protected requiresPossession(
    player: IPlayerState,
    possessionId: string
  ): boolean {
    return player.possessions.some((p) => p.id === possessionId);
  }

  /**
   * Helper method to check if player has a specific type of possession
   */
  protected hasPossessionType(
    player: IPlayerState,
    type: string
  ): boolean {
    return player.possessions.some((p) => p.type === type);
  }

  /**
   * Helper method to get time cost in hours (for display)
   */
  getTimeInHours(): number {
    return this.timeCost / 5; // 5 time units = 1 hour
  }

  /**
   * Helper method to create a human-readable time description
   */
  getTimeDescription(): string {
    const hours = this.getTimeInHours();
    if (hours === 1) {
      return '1 hour';
    }
    return `${hours} hours`;
  }
}

export default Action;
