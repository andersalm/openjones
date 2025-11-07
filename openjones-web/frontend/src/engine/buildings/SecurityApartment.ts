/**
 * SecurityApartment - Premium housing building
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Housing System
 *
 * Security Apartment provides enhanced housing with better amenities at $445/week.
 * Players can relax here with improved bonuses and pay rent.
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
  MeasureType,
} from '../../../../shared/types/contracts';
import { Building } from './Building';

/**
 * Security Apartment building - premium housing
 */
export class SecurityApartment extends Building {
  public static readonly WEEKLY_RENT = 445;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.SECURITY_APARTMENT,
      name,
      'Secure apartment with amenities. Rent: $445/week. Enhanced comfort.',
      position
    );
  }

  /**
   * Get all job offerings at this apartment
   */
  getJobOfferings(): IJob[] {
    return []; // No jobs at apartment
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    // Only show actions if player actually rents THIS apartment
    if (player.rentedHome === this.id || player.rentedHome && player.rentedHome.indexOf('security') !== -1) {
      // Relax action - more effective at home with better bonuses
      actions.push(this.createRelaxAction());

      // Pay rent action
      actions.push(this.createPayRentAction());

      // Exit action
      actions.push(this.createExitAction());
    } else if (this.isPlayerInside(player)) {
      // Player is inside but doesn't rent here - only allow exit
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

    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Check if a player can enter this building
   * Only the renter can enter
   */
  canEnter(player: IPlayerState): boolean {
    if (!player.rentedHome) {
      return false;
    }
    return player.rentedHome === this.id || player.rentedHome.indexOf('security') !== -1;
  }

  /**
   * Create relax at home action with enhanced bonuses
   */
  private createRelaxAction(): IAction {
    return {
      id: `${this.id}-relax`,
      type: ActionType.RELAX,
      displayName: 'Relax at Home',
      description: 'Rest at your secure apartment (30 time units, enhanced bonus)',
      timeCost: 30,

      canExecute: (player: IPlayerState, _game: IGame) => {
        // Player must be inside and have rented this apartment
        return this.isPlayerInside(player) &&
               (player.rentedHome === this.id || player.rentedHome && player.rentedHome.indexOf('security') !== -1);
      },

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player) ||
            !(player.rentedHome === this.id || player.rentedHome && player.rentedHome.indexOf('security') !== -1)) {
          return {
            success: false,
            message: 'You cannot relax here',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Enhanced home bonus: 2x multiplier for security apartment
        const baseHappiness = 10;
        const baseHealth = 7;
        const happinessGain = Math.floor(baseHappiness * 2); // 20
        const actualHealthGain = 15; // Better bonus for security apartment

        return {
          success: true,
          message: `Relaxed at your secure apartment and restored ${actualHealthGain} health and ${happinessGain} happiness (enhanced home bonus)`,
          timeSpent: 30,
          stateChanges: [
            {
              type: 'measure',
              measure: MeasureType.HEALTH,
              value: Math.min(100, player.health + actualHealthGain),
              description: `Restored ${actualHealthGain} health (enhanced home bonus)`,
            },
            {
              type: 'measure',
              measure: MeasureType.HAPPINESS,
              value: Math.min(100, player.happiness + happinessGain),
              description: `Restored ${happinessGain} happiness (enhanced home bonus)`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be at your apartment',
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
      description: `Pay your weekly rent: $${SecurityApartment.WEEKLY_RENT}`,
      timeCost: 5,

      canExecute: (player: IPlayerState, _game: IGame) => {
        const rentAmount = player.rentDebt > 0 ? player.rentDebt : SecurityApartment.WEEKLY_RENT;
        return player.cash >= rentAmount;
      },

      execute: (player: IPlayerState, _game: IGame) => {
        const rentAmount = player.rentDebt > 0 ? player.rentDebt : SecurityApartment.WEEKLY_RENT;

        if (player.cash < rentAmount) {
          return {
            success: false,
            message: `Not enough cash. Need $${rentAmount}, have $${player.cash}`,
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

        if (player.rentDebt > 0) {
          stateChanges.push({
            type: 'rentDebt',
            value: 0,
            description: 'Rent debt cleared',
          });
        }

        return {
          success: true,
          message: `Paid rent of $${rentAmount}`,
          timeSpent: 5,
          stateChanges,
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: SecurityApartment.WEEKLY_RENT,
          description: `Cash: $${SecurityApartment.WEEKLY_RENT}`,
        },
      ],
    };
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Leave Apartment',
      description: 'Leave your apartment and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the apartment',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You leave your apartment',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to apartment position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the apartment',
        },
      ],
    };
  }
}
