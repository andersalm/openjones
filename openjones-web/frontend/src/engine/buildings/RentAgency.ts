/**
 * RentAgency - Building for renting apartments
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Housing System
 *
 * The Rent Agency allows players to rent different types of apartments
 * and manage their rent payments.
 */

import {
  IAction,
  IJob,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
  IPosition,
} from '../../../../shared/types/contracts';
import { Building } from './Building';

/**
 * Rent Agency building - manages apartment rentals
 */
export class RentAgency extends Building {
  // Rent prices (weekly)
  public static readonly LOW_COST_RENT = 305;
  public static readonly SECURITY_RENT = 445;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.RENT_AGENCY,
      name,
      'Rent an apartment here. Choose between affordable or secure housing.',
      position
    );
  }

  /**
   * Get all job offerings at this Rent Agency
   */
  getJobOfferings(): IJob[] {
    return []; // Rent agency offers no jobs
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Rent apartment submenu
      actions.push(this.createRentSubmenu());

      // Pay rent action (if player has rented home)
      if (player.rentedHome) {
        actions.push(this.createPayRentAction());
      }

      // Exit action
      actions.push(this.createExitAction());
    }

    return actions;
  }

  /**
   * Get the action tree for building interaction
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Create tree with rent submenu at root
    const rootAction = actions[0]; // Rent submenu
    const rentChildren: IActionTreeNode[] = [
      Building.createActionTreeNode(this.createRentLowCostAction(), [], 0),
      Building.createActionTreeNode(this.createRentSecurityAction(), [], 1),
    ];

    const rootNode = Building.createActionTreeNode(rootAction, rentChildren, 0);

    // Add other actions as siblings
    const otherNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return {
      action: rootNode.action,
      children: [...rentChildren, ...otherNodes],
      index: 0,
    };
  }

  /**
   * Create the rent apartments submenu action
   */
  private createRentSubmenu(): IAction {
    return Building.createSubmenuAction(
      `${this.id}-rent-menu`,
      'Rent Apartment',
      'View available apartments for rent'
    );
  }

  /**
   * Create action to rent low cost apartment
   */
  private createRentLowCostAction(): IAction {
    return {
      id: `${this.id}-rent-low-cost`,
      type: ActionType.RENT_HOME,
      displayName: 'Rent Low Cost Apartment',
      description: `Affordable housing at $${RentAgency.LOW_COST_RENT}/week`,
      timeCost: 10,

      canExecute: (player: IPlayerState, _game: IGame) => {
        if (player.cash < RentAgency.LOW_COST_RENT) {
          return false;
        }
        if (player.rentedHome && player.rentedHome.indexOf('low-cost') !== -1) {
          return false; // Already renting this type
        }
        return true;
      },

      execute: (player: IPlayerState, _game: IGame) => {
        if (player.cash < RentAgency.LOW_COST_RENT) {
          return {
            success: false,
            message: `Not enough cash. Need $${RentAgency.LOW_COST_RENT}, have $${player.cash}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }
        if (player.rentedHome && player.rentedHome.indexOf('low-cost') !== -1) {
          return {
            success: false,
            message: 'You already rent a low cost apartment',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: `Successfully rented Low Cost Apartment! Weekly rent: $${RentAgency.LOW_COST_RENT}. Apartment ID: low-cost-apt-1`,
          timeSpent: 10,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash - RentAgency.LOW_COST_RENT,
              description: `Paid first week rent: $${RentAgency.LOW_COST_RENT}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: RentAgency.LOW_COST_RENT,
          description: `Cash: $${RentAgency.LOW_COST_RENT} (first week)`,
        },
      ],
    };
  }

  /**
   * Create action to rent security apartment
   */
  private createRentSecurityAction(): IAction {
    return {
      id: `${this.id}-rent-security`,
      type: ActionType.RENT_HOME,
      displayName: 'Rent Security Apartment',
      description: `Secure housing with amenities at $${RentAgency.SECURITY_RENT}/week`,
      timeCost: 10,

      canExecute: (player: IPlayerState, _game: IGame) => {
        if (player.cash < RentAgency.SECURITY_RENT) {
          return false;
        }
        if (player.rentedHome && player.rentedHome.indexOf('security') !== -1) {
          return false; // Already renting this type
        }
        return true;
      },

      execute: (player: IPlayerState, _game: IGame) => {
        if (player.cash < RentAgency.SECURITY_RENT) {
          return {
            success: false,
            message: `Not enough cash. Need $${RentAgency.SECURITY_RENT}, have $${player.cash}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }
        if (player.rentedHome && player.rentedHome.indexOf('security') !== -1) {
          return {
            success: false,
            message: 'You already rent a security apartment',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: `Successfully rented Security Apartment! Weekly rent: $${RentAgency.SECURITY_RENT}. Apartment ID: security-apt-1`,
          timeSpent: 10,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash - RentAgency.SECURITY_RENT,
              description: `Paid first week rent: $${RentAgency.SECURITY_RENT}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: RentAgency.SECURITY_RENT,
          description: `Cash: $${RentAgency.SECURITY_RENT} (first week)`,
        },
      ],
    };
  }

  /**
   * Create action to pay rent
   */
  private createPayRentAction(): IAction {
    return {
      id: `${this.id}-pay-rent`,
      type: ActionType.PAY_RENT,
      displayName: 'Pay Rent',
      description: 'Pay your weekly rent',
      timeCost: 5,

      canExecute: (player: IPlayerState, _game: IGame) => {
        if (!player.rentedHome) {
          return false;
        }
        const rentAmount = this.getRentAmount(player);
        if (player.cash < rentAmount) {
          return false;
        }
        return true;
      },

      execute: (player: IPlayerState, _game: IGame) => {
        const rentAmount = this.getRentAmount(player);

        if (!player.rentedHome) {
          return {
            success: false,
            message: 'You do not rent an apartment',
            timeSpent: 0,
            stateChanges: [],
          };
        }
        if (player.cash < rentAmount) {
          return {
            success: false,
            message: `Not enough cash to pay rent. Need $${rentAmount}, have $${player.cash}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        const stateChanges: any[] = [
          {
            type: 'cash',
            value: player.cash - rentAmount,
            description: `Paid rent: $${rentAmount}`,
          },
        ];

        // If paying off debt, clear it
        if (player.rentDebt > 0) {
          stateChanges.push({
            type: 'rentDebt',
            value: 0,
            description: 'Rent debt cleared',
          });
        }

        return {
          success: true,
          message: `Paid rent of $${rentAmount}. Rent is now paid.`,
          timeSpent: 5,
          stateChanges,
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: 0,
          description: 'Enough cash to cover rent',
        },
      ],
    };
  }

  /**
   * Get the rent amount for the player based on their rented home
   */
  private getRentAmount(player: IPlayerState): number {
    if (player.rentDebt > 0) {
      return player.rentDebt;
    }
    if (player.rentedHome && player.rentedHome.indexOf('low-cost') !== -1) {
      return RentAgency.LOW_COST_RENT;
    } else if (player.rentedHome && player.rentedHome.indexOf('security') !== -1) {
      return RentAgency.SECURITY_RENT;
    }
    return 0;
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Rent Agency',
      description: 'Leave the rent agency and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the rent agency',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the rent agency',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to rent agency position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the rent agency',
        },
      ],
    };
  }
}
