/**
 * Building - Abstract base class for all buildings in the game
 *
 * Part of Task B6: Building Base Class
 * Worker 3 - Track B (Domain Logic)
 *
 * This abstract class provides the foundation for all building types in the game.
 * Each specific building (Factory, Bank, College, etc.) extends this class and
 * implements its own action offerings and job listings.
 */

import {
  IBuilding,
  IPosition,
  IAction,
  IJob,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
} from '../../../../shared/types/contracts';

/**
 * Abstract Building class that all specific buildings must extend
 */
export abstract class Building implements IBuilding {
  public readonly id: string;
  public readonly type: BuildingType;
  public readonly name: string;
  public readonly description: string;
  public readonly position: IPosition;

  /**
   * Constructor for Building base class
   * @param id Unique identifier for this building instance
   * @param type Type of building (from BuildingType enum)
   * @param name Display name of the building
   * @param description Description shown to players
   * @param position Grid position of the building
   */
  constructor(
    id: string,
    type: BuildingType,
    name: string,
    description: string,
    position: IPosition
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.description = description;
    this.position = position;
  }

  /**
   * Get all available actions for a player at this building
   * Must be implemented by each specific building type
   */
  abstract getAvailableActions(player: IPlayerState, game: IGame): IAction[];

  /**
   * Get all job offerings available at this building
   * Must be implemented by each specific building type
   * @returns Array of jobs, empty array if no jobs are offered
   */
  abstract getJobOfferings(): IJob[];

  /**
   * Get the action tree for building interaction menus
   * Must be implemented by each specific building type
   */
  abstract getActionTree(player: IPlayerState, game: IGame): IActionTreeNode;

  /**
   * Check if a player can enter this building
   * Default implementation allows all players to enter
   * Can be overridden by specific buildings for access control
   *
   * @param player Player attempting to enter
   * @returns true if player can enter, false otherwise
   */
  canEnter(player: IPlayerState): boolean {
    // Default: all players can enter all buildings
    // Specific buildings can override this for special restrictions
    return true;
  }

  /**
   * Check if this building is a home/apartment
   * @returns true for apartment buildings, false for all others
   */
  isHome(): boolean {
    return (
      this.type === BuildingType.LOW_COST_APARTMENT ||
      this.type === BuildingType.SECURITY_APARTMENT
    );
  }

  /**
   * Helper method to check if player is currently in this building
   */
  isPlayerInside(player: IPlayerState): boolean {
    return player.currentBuilding === this.id;
  }

  /**
   * Helper method to check if player is at this building's position
   */
  isPlayerAtPosition(player: IPlayerState): boolean {
    return (
      player.position.x === this.position.x &&
      player.position.y === this.position.y
    );
  }

  /**
   * Get a string representation of this building for debugging
   */
  toString(): string {
    return `${this.name} [${this.type}] at ${this.position.toString()}`;
  }

  /**
   * Static helper to create an action tree node
   * Useful for building-specific implementations
   */
  protected static createActionTreeNode(
    action: IAction,
    children: IActionTreeNode[] = [],
    index: number = 0
  ): IActionTreeNode {
    return {
      action,
      children,
      index,
    };
  }

  /**
   * Static helper to create a submenu action placeholder
   * Used for organizing actions into hierarchical menus
   */
  protected static createSubmenuAction(
    id: string,
    displayName: string,
    description: string
  ): IAction {
    return {
      id,
      type: ActionType.SUBMENU,
      displayName,
      description,
      timeCost: 0,
      canExecute: () => true,
      execute: () => ({
        success: true,
        message: 'Submenu selected',
        timeSpent: 0,
        stateChanges: [],
      }),
      getRequirements: () => [],
    };
  }

  /**
   * Helper to filter actions based on player state
   * Only returns actions that can be executed
   */
  protected filterAvailableActions(
    actions: IAction[],
    player: IPlayerState,
    game: IGame
  ): IAction[] {
    return actions.filter((action) => action.canExecute(player, game));
  }

  /**
   * Helper to get jobs filtered by player qualifications
   * Returns jobs that the player meets requirements for
   */
  protected getQualifiedJobs(
    allJobs: IJob[],
    player: IPlayerState
  ): IJob[] {
    return allJobs.filter((job) => player.meetsJobRequirements(job));
  }

  /**
   * Helper to get jobs filtered by building type
   */
  protected getJobsByBuildingType(
    allJobs: IJob[],
    buildingType: BuildingType
  ): IJob[] {
    return allJobs.filter((job) => job.buildingType === buildingType);
  }
}
