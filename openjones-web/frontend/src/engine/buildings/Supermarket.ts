/**
 * Supermarket - Affordable groceries
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 *
 * The Supermarket allows players to buy affordable groceries.
 * Prices are much lower than the restaurant but require more preparation.
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
  IPossessionEffect,
  MeasureType,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { Food } from '../possessions/Food';

/**
 * Grocery item definition
 */
interface GroceryItem {
  name: string;
  price: number;
  nutrition: number;
  spoilTime?: number;
}

/**
 * Supermarket building - affordable groceries
 */
export class Supermarket extends Building {
  // Budget-friendly grocery items
  private static readonly GROCERIES: GroceryItem[] = [
    { name: 'Bread', price: 3, nutrition: 5, spoilTime: 2 },
    { name: 'Milk', price: 4, nutrition: 6, spoilTime: 1 },
    { name: 'Eggs', price: 5, nutrition: 8, spoilTime: 2 },
    { name: 'Chicken', price: 8, nutrition: 12, spoilTime: 1 },
    { name: 'Rice', price: 6, nutrition: 10, spoilTime: 10 },
    { name: 'Vegetables', price: 7, nutrition: 9, spoilTime: 1 },
    { name: 'Pasta', price: 5, nutrition: 8, spoilTime: 10 },
    { name: 'Cheese', price: 6, nutrition: 7, spoilTime: 2 },
  ];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.SUPERMARKET,
      name,
      'Buy affordable groceries - budget-friendly shopping',
      position
    );
  }

  /**
   * Get all job offerings at this Supermarket
   */
  getJobOfferings(): IJob[] {
    return []; // Supermarket offers no jobs (could add cashier/stocker jobs in future)
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Create purchase actions for each grocery item
      Supermarket.GROCERIES.forEach((item) => {
        actions.push(this.createPurchaseAction(item));
      });

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

    // Create tree with buy groceries submenu at root
    const buySubmenu = Building.createSubmenuAction(
      `${this.id}-buy-menu`,
      'Buy Groceries',
      'Shop for affordable groceries'
    );

    const buyChildren: IActionTreeNode[] = Supermarket.GROCERIES.map((item, index) =>
      Building.createActionTreeNode(this.createPurchaseAction(item), [], index)
    );

    // Add exit action as sibling
    const exitNode = Building.createActionTreeNode(
      this.createExitAction(),
      [],
      buyChildren.length
    );

    return {
      action: buySubmenu,
      children: [...buyChildren, exitNode],
      index: 0,
    };
  }

  /**
   * Create action to purchase a grocery item
   */
  private createPurchaseAction(item: GroceryItem): IAction {
    return {
      id: `${this.id}-buy-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: ActionType.PURCHASE,
      displayName: `Buy ${item.name}`,
      description: `Grocery shopping: ${item.name} ($${item.price}, +${item.nutrition} nutrition)`,
      timeCost: 5,

      canExecute: (player: IPlayerState, _game: IGame) => {
        return player.cash >= item.price;
      },

      execute: (player: IPlayerState, game: IGame) => {
        if (player.cash < item.price) {
          return {
            success: false,
            message: `Not enough cash. Need $${item.price}, have $${player.cash}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Create the food item
        const effects: IPossessionEffect[] = [
          {
            measure: MeasureType.HEALTH,
            delta: item.nutrition,
          },
        ];

        const spoilTime = item.spoilTime !== undefined
          ? game.currentWeek + item.spoilTime
          : undefined;

        const food = new Food(
          item.name,
          item.price,
          item.price,
          effects,
          spoilTime
        );

        return {
          success: true,
          message: `Purchased ${item.name} for $${item.price}. Added to inventory.`,
          timeSpent: 5,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash - item.price,
              description: `Purchased ${item.name}`,
            },
            {
              type: 'possession_add',
              value: food.id,
              description: `Added ${item.name} to inventory`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: item.price,
          description: `Cash: $${item.price}`,
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
      displayName: 'Exit Supermarket',
      description: 'Leave the supermarket and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the supermarket',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the supermarket',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to supermarket position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the supermarket',
        },
      ],
    };
  }
}
