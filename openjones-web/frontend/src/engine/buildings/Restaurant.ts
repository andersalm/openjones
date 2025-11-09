/**
 * Restaurant - "Monolith Burgers"
 *
 * Restaurant offering 4 jobs at different ranks.
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

export class Restaurant extends Building {
  // Job wages from Java reference
  private static readonly COOK_WAGE = 3;
  private static readonly CLERK_WAGE = 5;
  private static readonly ASSISTANT_MANAGER_WAGE = 7;
  private static readonly MANAGER_WAGE = 9;

  private jobs: IJob[];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.RESTAURANT,
      name,
      'Fast food restaurant offering entry-level to mid-level jobs',
      position
    );
    this.jobs = this.createRestaurantJobs();
  }

  /**
   * Create job offerings for restaurant
   */
  private createRestaurantJobs(): IJob[] {
    return [
      // Rank 1 - Cook
      {
        id: `${this.id}-job-cook`,
        title: 'Cook',
        rank: 1,
        requiredEducation: 5,
        requiredExperience: 10,
        requiredClothesLevel: 1,
        wagePerHour: Restaurant.COOK_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RESTAURANT,
      },

      // Rank 2 - Clerk
      {
        id: `${this.id}-job-clerk`,
        title: 'Clerk',
        rank: 2,
        requiredEducation: 10,
        requiredExperience: 20,
        requiredClothesLevel: 1,
        wagePerHour: Restaurant.CLERK_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RESTAURANT,
      },

      // Rank 3 - Assistant Manager
      {
        id: `${this.id}-job-assistant-manager`,
        title: 'Assistant Manager',
        rank: 3,
        requiredEducation: 15,
        requiredExperience: 30,
        requiredClothesLevel: 2,
        wagePerHour: Restaurant.ASSISTANT_MANAGER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RESTAURANT,
      },

      // Rank 4 - Manager
      {
        id: `${this.id}-job-manager`,
        title: 'Manager',
        rank: 4,
        requiredEducation: 20,
        requiredExperience: 40,
        requiredClothesLevel: 2,
        wagePerHour: Restaurant.MANAGER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RESTAURANT,
      },
    ];
  }

  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions - currently just exit
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Exit action
      actions.push(this.createExitAction());
    }

    return actions;
  }

  /**
   * Get action tree
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    const rootAction = actions[0];
    return Building.createActionTreeNode(rootAction, [], 0);
  }

  /**
   * Create exit action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Restaurant',
      description: 'Leave the restaurant',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the restaurant',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the restaurant',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to restaurant position',
            },
          ],
        };
      },

      getRequirements: () => [],
    };
  }
}
