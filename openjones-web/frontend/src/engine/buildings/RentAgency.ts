/**
 * RentAgency - Rent houses and manage housing
 *
 * The Rent Agency allows players to rent different apartments
 * and pay rent. Also offers groundskeeper and management jobs.
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
import { ExitBuildingAction } from '../actions/ExitBuildingAction';
import { WorkAction } from '../actions/WorkAction';

export class RentAgency extends Building {
  // Job wages from Java reference
  private static readonly GROUNDSKEEPER_WAGE = 5;
  private static readonly APARTMENT_MANAGER_WAGE = 7;

  private jobs: IJob[];
  private availableHomes: string[]; // IDs of available homes for rent

  constructor(id: string, name: string, position: IPosition, availableHomes: string[] = []) {
    super(
      id,
      BuildingType.RENT_AGENCY,
      name,
      'Rent apartments and manage your housing',
      position
    );
    this.jobs = this.createRentAgencyJobs();
    this.availableHomes = availableHomes;
  }

  /**
   * Set available homes for rent
   */
  setAvailableHomes(homeIds: string[]): void {
    this.availableHomes = homeIds;
  }

  /**
   * Create job offerings for rent agency
   */
  private createRentAgencyJobs(): IJob[] {
    return [
      // Rank 1 - Groundskeeper
      {
        id: `${this.id}-job-groundskeeper`,
        title: 'Groundskeeper',
        rank: 1,
        requiredEducation: 5,
        requiredExperience: 10,
        requiredClothesLevel: 1,
        wagePerHour: RentAgency.GROUNDSKEEPER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RENT_AGENCY,
      },

      // Rank 2 - Apartment Manager
      {
        id: `${this.id}-job-apartment-manager`,
        title: 'Apartment Manager',
        rank: 2,
        requiredEducation: 10,
        requiredExperience: 20,
        requiredClothesLevel: 2,
        wagePerHour: RentAgency.APARTMENT_MANAGER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.RENT_AGENCY,
      },
    ];
  }

  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Work actions - if player has a job at this Rent Agency
      if (player.job && player.job.buildingType === BuildingType.RENT_AGENCY) {
        // Add work options for different hour durations
        actions.push(new WorkAction(player.job, 1)); // Work 1 hour
        actions.push(new WorkAction(player.job, 4)); // Work 4 hours
        actions.push(new WorkAction(player.job, 8)); // Work 8 hours
        actions.push(new WorkAction(player.job)); // Work max available time
      }

      // Pay rent action (if player has rent debt)
      if (player.rentDebt > 0) {
        actions.push(this.createPayRentAction());
      }

      // Rent different apartments
      for (const homeId of this.availableHomes) {
        const building = game.map.getBuildingById(homeId);
        if (building && building.isHome()) {
          actions.push(this.createRentHouseAction(building, game));
        }
      }

      // Exit action
      actions.push(new ExitBuildingAction());
    }

    return actions;
  }

  /**
   * Get action tree
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = new ExitBuildingAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Create pay rent action
   */
  private createPayRentAction(): IAction {
    return {
      id: `${this.id}-pay-rent`,
      type: ActionType.PAY_RENT,
      displayName: 'Pay Rent Debt',
      description: 'Pay off rent debt',
      timeCost: 0,

      canExecute: (player: IPlayerState) => {
        return this.isPlayerInside(player) && player.rentDebt > 0 && player.cash > 0;
      },

      execute: (player: IPlayerState) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the rent agency',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (player.rentDebt <= 0) {
          return {
            success: false,
            message: 'You have no rent debt',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Pay as much as player can afford
        const payment = Math.min(player.cash, player.rentDebt);
        const newCash = player.cash - payment;
        const newDebt = player.rentDebt - payment;

        return {
          success: true,
          message: `Paid $${payment} towards rent debt. Remaining debt: $${newDebt}`,
          timeSpent: 0,
          stateChanges: [
            {
              type: 'cash',
              value: newCash,
              description: `Paid $${payment} rent`,
            },
            {
              type: 'rentDebt',
              value: newDebt,
              description: `Reduced rent debt by $${payment}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: 1,
          description: 'Need cash to pay rent',
        },
      ],
    };
  }

  /**
   * Create rent house action
   * Java behavior: Purchase 4 weeks of rent at a time (WEEKS_OF_RENT_IN_A_MONTH = 4)
   */
  private createRentHouseAction(building: any, game: IGame): IAction {
    // Get weekly rent from economy model
    const weeklyRent = game.economyModel.getRent(building.type);
    // Java: Purchase 4 weeks of rent at a time
    const WEEKS_OF_RENT_IN_A_MONTH = 4;
    const totalCost = weeklyRent * WEEKS_OF_RENT_IN_A_MONTH;

    return {
      id: `${this.id}-rent-${building.id}`,
      type: ActionType.RENT_HOME,
      displayName: `Rent ${building.name} ($${totalCost} for ${WEEKS_OF_RENT_IN_A_MONTH} weeks)`,
      description: `Rent ${building.name} for $${weeklyRent}/week (pay ${WEEKS_OF_RENT_IN_A_MONTH} weeks in advance)`,
      timeCost: 10,

      canExecute: (player: IPlayerState) => {
        // Must be inside rent agency
        if (!this.isPlayerInside(player)) {
          return false;
        }

        // Can't rent same house twice
        if (player.rentedHome === building.id) {
          return false;
        }

        // Must be able to afford 4 weeks of rent
        if (!player.canAfford(totalCost)) {
          return false;
        }

        return true;
      },

      execute: (player: IPlayerState) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the rent agency',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (player.rentedHome === building.id) {
          return {
            success: false,
            message: 'You already rent this apartment',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (!player.canAfford(totalCost)) {
          return {
            success: false,
            message: `You need $${totalCost} to rent ${building.name} (${WEEKS_OF_RENT_IN_A_MONTH} weeks)`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Java behavior: Pay for 4 weeks of rent, clear old rent, handle debt
        const newCash = player.cash - totalCost;

        // Calculate new rent debt (Java: calculateNewRentDebt)
        // If player had existing rent debt, it reduces the value of the new rent
        let newRentDebt = 0;
        if (player.rentDebt > 0) {
          newRentDebt = Math.max(0, player.rentDebt - totalCost);
        }

        return {
          success: true,
          message: `You rented ${building.name}! Paid $${totalCost} for ${WEEKS_OF_RENT_IN_A_MONTH} weeks.${player.rentDebt > 0 ? ` Rent debt reduced to $${newRentDebt}.` : ''}`,
          timeSpent: 10,
          stateChanges: [
            {
              type: 'cash',
              value: newCash,
              description: `Paid $${totalCost} for ${WEEKS_OF_RENT_IN_A_MONTH} weeks rent`,
            },
            {
              type: 'rentedHome',
              value: building.id,
              description: `Rented ${building.name}`,
            },
            {
              type: 'weeksOfRent',
              value: WEEKS_OF_RENT_IN_A_MONTH,
              description: `Prepaid ${WEEKS_OF_RENT_IN_A_MONTH} weeks of rent`,
            },
            {
              type: 'rentDebt',
              value: newRentDebt,
              description: player.rentDebt > 0 ? `Reduced rent debt to $${newRentDebt}` : '',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: totalCost,
          description: `Need $${totalCost} for ${WEEKS_OF_RENT_IN_A_MONTH} weeks`,
        },
      ],
    };
  }
}
