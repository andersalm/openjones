/**
 * Restaurant - Expensive prepared food
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 *
 * The Restaurant allows players to buy expensive prepared food.
 * Prices are higher than the supermarket but food is convenient.
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
 * Food item menu definition
 */
interface MenuItem {
  name: string;
  price: number;
  nutrition: number;
  spoilTime?: number;
}

/**
 * Restaurant building - expensive prepared food
 */
export class Restaurant extends Building {
  // Premium food menu
  private static readonly MENU: MenuItem[] = [
    { name: 'Gourmet Burger', price: 35, nutrition: 25, spoilTime: 1 },
    { name: 'Lobster Dinner', price: 75, nutrition: 40, spoilTime: 1 },
    { name: 'Filet Mignon', price: 100, nutrition: 50, spoilTime: 1 },
    { name: 'Chef Special', price: 125, nutrition: 60, spoilTime: 1 },
    { name: 'Sushi Platter', price: 85, nutrition: 45, spoilTime: 1 },
  ];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.RESTAURANT,
      name,
      'Fine dining - expensive but convenient prepared meals',
      position
    );
  }

  /**
   * Get all job offerings at this Restaurant
   */
  getJobOfferings(): IJob[] {
    return []; // Restaurant offers no jobs (could add waiter/chef jobs in future)
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Create purchase actions for each menu item
      Restaurant.MENU.forEach((item) => {
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

    // Create tree with order food submenu at root
    const orderSubmenu = Building.createSubmenuAction(
      `${this.id}-order-menu`,
      'Order Food',
      'View the menu and order prepared meals'
    );

    const orderChildren: IActionTreeNode[] = Restaurant.MENU.map((item, index) =>
      Building.createActionTreeNode(this.createPurchaseAction(item), [], index)
    );

    // Add exit action as sibling
    const exitNode = Building.createActionTreeNode(
      this.createExitAction(),
      [],
      orderChildren.length
    );

    return {
      action: orderSubmenu,
      children: [...orderChildren, exitNode],
      index: 0,
    };
  }

  /**
   * Create action to purchase a food item
   */
  private createPurchaseAction(item: MenuItem): IAction {
    return {
      id: `${this.id}-order-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: ActionType.PURCHASE,
      displayName: `Order ${item.name}`,
      description: `Fine dining: ${item.name} ($${item.price}, +${item.nutrition} nutrition)`,
      timeCost: 10,

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
          message: `Ordered ${item.name} for $${item.price}. Enjoy your meal!`,
          timeSpent: 10,
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
      displayName: 'Exit Restaurant',
      description: 'Leave the restaurant and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, _game: IGame) => {
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

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the restaurant',
        },
      ],
    };
  }
}
