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
   */
  private createRentHouseAction(building: any, game: IGame): IAction {
    // Get rent from economy model
    const rent = game.economyModel.getRent(building.type);

    return {
      id: `${this.id}-rent-${building.id}`,
      type: ActionType.RENT_HOME,
      displayName: `Rent ${building.name} ($${rent}/week)`,
      description: `Rent ${building.name} for $${rent} per week`,
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

        // Must be able to afford (first week rent)
        if (!player.canAfford(rent)) {
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

        if (!player.canAfford(rent)) {
          return {
            success: false,
            message: `You need $${rent} to rent ${building.name}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Pay first week rent
        const newCash = player.cash - rent;

        // If player had rent debt and can afford it, reduce debt
        let debtPayment = 0;
        if (player.rentDebt > 0 && newCash > rent) {
          debtPayment = Math.min(newCash - rent, player.rentDebt);
        }

        // Set the rented home directly on player state
        player.rentedHome = building.id;

        // Reduce rent debt
        if (debtPayment > 0) {
          player.rentDebt = Math.max(0, player.rentDebt - debtPayment);
        }

        return {
          success: true,
          message: `You rented ${building.name}! Paid $${rent} for first week.${debtPayment > 0 ? ` Reduced debt by $${debtPayment}.` : ''}`,
          timeSpent: 10,
          stateChanges: [
            {
              type: 'cash',
              value: newCash - debtPayment,
              description: `Paid $${rent} rent${debtPayment > 0 ? ` and $${debtPayment} debt` : ''}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: rent,
          description: `Need $${rent} for first week`,
        },
      ],
    };
  }
}
