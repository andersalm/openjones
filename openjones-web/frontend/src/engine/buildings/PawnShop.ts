/**
 * PawnShop - Sell possessions for cash
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 *
 * The Pawn Shop allows players to sell their possessions for cash.
 * Sell prices are typically 50% of the item's original value.
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
  IPossession,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Pawn Shop building - sell possessions for cash
 */
export class PawnShop extends Building {
  private economy: EconomyModel;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.PAWN_SHOP,
      name,
      'Sell your possessions for cash. We buy at 50% of original value.',
      position
    );
    this.economy = new EconomyModel();
  }

  /**
   * Get all job offerings at this Pawn Shop
   */
  getJobOfferings(): IJob[] {
    return []; // Pawn shop offers no jobs
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Create sell actions for each possession player owns
      if (player.possessions && player.possessions.length > 0) {
        player.possessions.forEach((possession: IPossession) => {
          actions.push(this.createSellAction(possession));
        });
      } else {
        // If player has no possessions, show a message action
        actions.push(this.createNoItemsAction());
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

    // If player has no items, just show the no items action and exit
    if (!player.possessions || player.possessions.length === 0) {
      return Building.createActionTreeNode(actions[0], [], 0);
    }

    // Create tree with sell items submenu at root
    const sellSubmenu = Building.createSubmenuAction(
      `${this.id}-sell-menu`,
      'Sell Items',
      'View your possessions and sell them for cash'
    );

    const sellChildren: IActionTreeNode[] = player.possessions.map((possession, index) =>
      Building.createActionTreeNode(this.createSellAction(possession), [], index)
    );

    // Add exit action as sibling
    const exitNode = Building.createActionTreeNode(
      this.createExitAction(),
      [],
      sellChildren.length
    );

    return {
      action: sellSubmenu,
      children: [...sellChildren, exitNode],
      index: 0,
    };
  }

  /**
   * Create action to sell a possession
   */
  private createSellAction(possession: IPossession): IAction {
    const sellPrice = this.calculateSellPrice(possession);

    return {
      id: `${this.id}-sell-${possession.id}`,
      type: ActionType.SELL,
      displayName: `Sell ${possession.name}`,
      description: `Sell ${possession.name} for $${sellPrice}`,
      timeCost: 5,

      canExecute: (player: IPlayerState, _game: IGame) => {
        // Check if player still owns this possession
        return player.possessions.some((p) => p.id === possession.id);
      },

      execute: (player: IPlayerState, _game: IGame) => {
        // Double-check player owns this possession
        if (!player.possessions.some((p) => p.id === possession.id)) {
          return {
            success: false,
            message: `You don't own ${possession.name}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: `Sold ${possession.name} for $${sellPrice}`,
          timeSpent: 5,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash + sellPrice,
              description: `Received $${sellPrice} for ${possession.name}`,
            },
            {
              type: 'possession_remove',
              value: possession.id,
              description: `Sold ${possession.name}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'possession',
          value: possession.id,
          description: `Must own ${possession.name}`,
        },
      ],
    };
  }

  /**
   * Create action when player has no items to sell
   */
  private createNoItemsAction(): IAction {
    return {
      id: `${this.id}-no-items`,
      type: ActionType.SUBMENU,
      displayName: 'No items to sell',
      description: 'You have no possessions to sell',
      timeCost: 0,

      canExecute: () => true,

      execute: (_player: IPlayerState, _game: IGame) => {
        return {
          success: false,
          message: 'You have no possessions to sell',
          timeSpent: 0,
          stateChanges: [],
        };
      },

      getRequirements: () => [],
    };
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Pawn Shop',
      description: 'Leave the pawn shop and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the pawn shop',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the pawn shop',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to pawn shop position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the pawn shop',
        },
      ],
    };
  }

  /**
   * Calculate sell price for a possession (50% of original value)
   */
  private calculateSellPrice(possession: IPossession): number {
    return this.economy.calculateSellPrice(possession);
  }
}
