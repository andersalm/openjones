/**
 * Factory - Industrial building offering low to mid-tier jobs
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 *
 * The Factory is one of the primary employment buildings in the game,
 * offering a wide range of jobs from entry-level positions (Janitor, Assembly Worker)
 * to management roles (General Manager, Engineer).
 */

import {
  IJob,
  IAction,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
  IPosition,
} from '../../../../shared/types/contracts';
import { Building } from './Building';

/**
 * Factory building - offers manufacturing and industrial jobs
 * Job ranks: 1-8 (9 different positions)
 */
export class Factory extends Building {
  // Wage rates per hour (from Java reference)
  private static readonly JANITOR_BASE_WAGE = 6;
  private static readonly ASSEMBLY_WORKER_BASE_WAGE = 7;
  private static readonly SECRETARY_BASE_WAGE = 8;
  private static readonly MACHINIST_HELPER_BASE_WAGE = 9;
  private static readonly EXECUTIVE_SECRETARY_BASE_WAGE = 18;
  private static readonly MACHINIST_BASE_WAGE = 19;
  private static readonly DEPARTMENT_MANAGER_BASE_WAGE = 21;
  private static readonly ENGINEER_BASE_WAGE = 23;
  private static readonly GENERAL_MANAGER_BASE_WAGE = 25;

  // Job offerings for this building
  private jobs: IJob[];

  constructor(id: string, name: string, position: IPosition) {
    super(id, BuildingType.FACTORY, name, 'Industrial factory offering various manufacturing and office jobs', position);
    this.jobs = this.createFactoryJobs();
  }

  /**
   * Create all job offerings for the Factory
   * Based on Java reference: Factory.java
   */
  private createFactoryJobs(): IJob[] {
    return [
      // Rank 1 - Entry level jobs (no education required)
      {
        id: `${this.id}-job-janitor`,
        title: 'Janitor',
        rank: 1,
        requiredEducation: 5, // rank * 5
        requiredExperience: 10, // rank * 10
        requiredClothesLevel: 1,
        wagePerHour: Factory.JANITOR_BASE_WAGE,
        experienceGainPerHour: 5, // 1 experience per time unit (5 units per hour)
        buildingType: BuildingType.FACTORY,
      },
      {
        id: `${this.id}-job-assembly-worker`,
        title: 'Assembly Worker',
        rank: 1,
        requiredEducation: 5,
        requiredExperience: 10,
        requiredClothesLevel: 1,
        wagePerHour: Factory.ASSEMBLY_WORKER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 2 - Secretary
      {
        id: `${this.id}-job-secretary`,
        title: 'Secretary',
        rank: 2,
        requiredEducation: 10, // rank * 5
        requiredExperience: 20, // rank * 10
        requiredClothesLevel: 2,
        wagePerHour: Factory.SECRETARY_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 3 - Machinist Helper
      {
        id: `${this.id}-job-machinist-helper`,
        title: 'Machinist Helper',
        rank: 3,
        requiredEducation: 15, // rank * 5
        requiredExperience: 30, // rank * 10
        requiredClothesLevel: 1,
        wagePerHour: Factory.MACHINIST_HELPER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 4 - Executive Secretary
      {
        id: `${this.id}-job-executive-secretary`,
        title: 'Executive Secretary',
        rank: 4,
        requiredEducation: 20, // rank * 5
        requiredExperience: 40, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: Factory.EXECUTIVE_SECRETARY_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 5 - Machinist
      {
        id: `${this.id}-job-machinist`,
        title: 'Machinist',
        rank: 5,
        requiredEducation: 25, // rank * 5
        requiredExperience: 50, // rank * 10
        requiredClothesLevel: 1,
        wagePerHour: Factory.MACHINIST_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 6 - Department Manager
      {
        id: `${this.id}-job-department-manager`,
        title: 'Department Manager',
        rank: 6,
        requiredEducation: 30, // rank * 5
        requiredExperience: 60, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: Factory.DEPARTMENT_MANAGER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 7 - Engineer
      {
        id: `${this.id}-job-engineer`,
        title: 'Engineer',
        rank: 7,
        requiredEducation: 35, // rank * 5
        requiredExperience: 70, // rank * 10
        requiredClothesLevel: 2,
        wagePerHour: Factory.ENGINEER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },

      // Rank 8 - General Manager
      {
        id: `${this.id}-job-general-manager`,
        title: 'General Manager',
        rank: 8,
        requiredEducation: 40, // rank * 5
        requiredExperience: 80, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: Factory.GENERAL_MANAGER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      },
    ];
  }

  /**
   * Get all job offerings at this Factory
   */
  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions for a player at this building
   * Factory only offers the exit action (no special building-specific actions)
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    // Exit action (always available when inside)
    if (this.isPlayerInside(player)) {
      actions.push(this.createExitAction());
    }

    return actions;
  }

  /**
   * Get the action tree for building interaction
   * Factory has a simple tree - just exit action
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    // Create root node with exit action
    const rootAction = actions.length > 0 ? actions[0] : this.createExitAction();

    return Building.createActionTreeNode(rootAction, [], 0);
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Factory',
      description: 'Leave the factory and return to the street',
      timeCost: 0,
      canExecute: (player: IPlayerState) => this.isPlayerInside(player),
      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the factory',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the factory',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to factory position',
            },
          ],
        };
      },
      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the factory',
        },
      ],
    };
  }
}
