/**
 * DepartmentStore - Retail store selling food and general goods
 *
 * Part of Task B9: Shopping Buildings (Part 1)
 * Worker 3 - Track B (Domain Logic)
 *
 * The Department Store allows players to purchase food items to maintain their health.
 * Offers various food options at different price points and nutritional values.
 */

import {
  IAction,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
  IPosition,
  IJob,
  MeasureType,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { Food } from '../possessions/Food';
import { PurchaseFoodAction } from '../actions/PurchaseFoodAction';
import { IPurchasable } from '../actions/PurchaseAction';

/**
 * Food item configuration
 */
interface FoodItemConfig {
  name: string;
  price: number;
  nutritionValue: number;
  healthBonus: number;
  spoilWeeks?: number;
}

/**
 * Department Store building - sells food and general goods
 */
export class DepartmentStore extends Building {
  // Food items available at the department store
  private static readonly FOOD_ITEMS: FoodItemConfig[] = [
    { name: 'Hamburger', price: 10, nutritionValue: 15, healthBonus: 5 },
    { name: 'Pizza', price: 15, nutritionValue: 20, healthBonus: 8 },
    { name: 'Steak', price: 25, nutritionValue: 30, healthBonus: 12 },
    { name: 'Salad', price: 8, nutritionValue: 10, healthBonus: 6 },
    { name: 'Sandwich', price: 12, nutritionValue: 18, healthBonus: 7 },
  ];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.DEPARTMENT_STORE,
      name,
      'Buy food and general goods to maintain your health',
      position
    );
  }

  /**
   * Get available actions for a player at this building
   * Only shows actions when player is inside the store
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (!this.isPlayerInside(player)) {
      return actions;
    }

    // Add purchase actions for each food item
    DepartmentStore.FOOD_ITEMS.forEach((foodItem) => {
      const food = this.createFoodItem(foodItem, game);
      const purchasable: IPurchasable = {
        id: food.id,
        name: food.name,
        price: foodItem.price,
      };
      const action = new PurchaseFoodAction(purchasable, BuildingType.DEPARTMENT_STORE);
      actions.push(action);
    });

    // Add exit action
    actions.push(this.createExitAction());

    return actions;
  }

  /**
   * Create a Food possession from configuration
   */
  private createFoodItem(config: FoodItemConfig, game: IGame): Food {
    const effects = [
      {
        measure: MeasureType.HEALTH,
        delta: config.healthBonus,
        duration: undefined, // Immediate effect
      },
    ];

    const spoilTime = config.spoilWeeks
      ? game.currentWeek + config.spoilWeeks
      : undefined;

    return new Food(
      config.name,
      config.price, // value
      config.price, // purchasePrice
      effects,
      spoilTime
    );
  }

  /**
   * Get the action tree for building interaction menus
   * Organizes food items into a hierarchical menu structure
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Fallback if player is not inside
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Create submenu for food purchases
    const foodActions = actions.filter((a) => a.type === ActionType.PURCHASE);
    const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

    const foodSubmenu = Building.createSubmenuAction(
      `${this.id}-food-menu`,
      'Buy Food',
      'Purchase food items'
    );

    const foodChildren = foodActions.map((action, index) =>
      Building.createActionTreeNode(action, [], index)
    );

    const foodNode = Building.createActionTreeNode(foodSubmenu, foodChildren, 0);

    // Create root node with food submenu and exit
    const rootChildren = exitAction
      ? [foodNode, Building.createActionTreeNode(exitAction, [], 1)]
      : [foodNode];

    return Building.createActionTreeNode(
      Building.createSubmenuAction(
        `${this.id}-root`,
        this.name,
        'Department Store menu'
      ),
      rootChildren,
      0
    );
  }

  /**
   * Get job offerings at this building
   * Department stores don't offer jobs in the current implementation
   */
  getJobOfferings(): IJob[] {
    return [];
  }

  /**
   * Check if this building is a home
   */
  isHome(): boolean {
    return false;
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Store',
      description: 'Leave the department store and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the department store',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the department store',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to store position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the department store',
        },
      ],
    };
  }
}
