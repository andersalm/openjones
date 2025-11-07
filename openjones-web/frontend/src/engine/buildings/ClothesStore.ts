/**
 * ClothesStore - Retail store selling clothing by quality level
 *
 * Part of Task B9: Shopping Buildings (Part 1)
 * Worker 3 - Track B (Domain Logic)
 *
 * The Clothes Store allows players to purchase clothing of different quality levels (1-9).
 * Higher level clothes are required for higher-paying jobs and provide happiness bonuses.
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
import { Clothes } from '../possessions/Clothes';
import { PurchaseAction, IPurchasable } from '../actions/PurchaseAction';

/**
 * Concrete PurchaseAction for buying clothes
 */
class PurchaseClothesActionImpl extends PurchaseAction {
  constructor(
    private clothes: IPurchasable,
    private buildingType: BuildingType
  ) {
    super(
      `purchase-clothes-${clothes.id}`,
      ActionType.PURCHASE,
      `Buy ${clothes.name}`,
      `Purchase ${clothes.name} for $${clothes.price}`,
      clothes,
      5
    );
  }

  protected canPurchaseAtLocation(player: IPlayerState, game: IGame): boolean {
    const currentBuilding = game.map?.getBuildingById(player.currentBuilding || '');
    return currentBuilding?.type === this.buildingType;
  }

  protected getFailureMessage(player: IPlayerState): string {
    if (!this.hasEnoughCash(player, this.item.price)) {
      return `Not enough cash for ${this.clothes.name}. Need $${this.clothes.price}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to purchase clothes. Need ${this.timeCost} time units`;
    }
    return `Must be inside a ${this.buildingType} to purchase ${this.clothes.name}`;
  }
}

/**
 * Clothes Store building - sells clothing by level (1-9)
 */
export class ClothesStore extends Building {
  // Base price for level 1 clothes, increases with level
  private static readonly BASE_PRICE = 50;
  private static readonly PRICE_MULTIPLIER = 15;

  // Minimum and maximum clothes levels
  private static readonly MIN_LEVEL = 1;
  private static readonly MAX_LEVEL = 9;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.CLOTHES_STORE,
      name,
      'Buy clothes for different job levels (1-9)',
      position
    );
  }

  /**
   * Calculate price for clothes of a given level
   */
  private static getPriceForLevel(level: number): number {
    return ClothesStore.BASE_PRICE + (level * ClothesStore.PRICE_MULTIPLIER);
  }

  /**
   * Get available actions for a player at this building
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (!this.isPlayerInside(player)) {
      return actions;
    }

    // Add purchase actions for each clothes level (1-9)
    for (let level = ClothesStore.MIN_LEVEL; level <= ClothesStore.MAX_LEVEL; level++) {
      const price = ClothesStore.getPriceForLevel(level);
      const clothes = this.createClothesItem(level, price, game);
      const purchasable: IPurchasable = {
        id: clothes.id,
        name: clothes.name,
        price: price,
      };
      const action = new PurchaseClothesActionImpl(purchasable, BuildingType.CLOTHES_STORE);
      actions.push(action);
    }

    // Add exit action
    actions.push(this.createExitAction());

    return actions;
  }

  /**
   * Create a Clothes possession for a given level
   */
  private createClothesItem(level: number, price: number, game: IGame): Clothes {
    const effects = [
      {
        measure: MeasureType.HAPPINESS,
        delta: level * 2, // Higher level clothes provide more happiness
        duration: undefined,
      },
    ];

    return new Clothes(
      `Level ${level} Clothes`,
      price, // value
      price, // purchasePrice
      level,
      effects
    );
  }

  /**
   * Get the action tree for building interaction menus
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Separate purchase actions from exit
    const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
    const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

    // Create submenu for clothes by category (budget, standard, professional, luxury)
    const budgetClothes = purchaseActions.slice(0, 3); // Levels 1-3
    const standardClothes = purchaseActions.slice(3, 6); // Levels 4-6
    const professionalClothes = purchaseActions.slice(6, 9); // Levels 7-9

    const budgetSubmenu = Building.createSubmenuAction(
      `${this.id}-budget`,
      'Budget Clothes (Levels 1-3)',
      'Basic clothing for entry-level jobs'
    );
    const budgetNode = Building.createActionTreeNode(
      budgetSubmenu,
      budgetClothes.map((a, i) => Building.createActionTreeNode(a, [], i)),
      0
    );

    const standardSubmenu = Building.createSubmenuAction(
      `${this.id}-standard`,
      'Standard Clothes (Levels 4-6)',
      'Quality clothing for mid-level jobs'
    );
    const standardNode = Building.createActionTreeNode(
      standardSubmenu,
      standardClothes.map((a, i) => Building.createActionTreeNode(a, [], i)),
      1
    );

    const professionalSubmenu = Building.createSubmenuAction(
      `${this.id}-professional`,
      'Professional Clothes (Levels 7-9)',
      'Premium clothing for high-level jobs'
    );
    const professionalNode = Building.createActionTreeNode(
      professionalSubmenu,
      professionalClothes.map((a, i) => Building.createActionTreeNode(a, [], i)),
      2
    );

    // Create root node
    const rootChildren = [budgetNode, standardNode, professionalNode];
    if (exitAction) {
      rootChildren.push(Building.createActionTreeNode(exitAction, [], 3));
    }

    return Building.createActionTreeNode(
      Building.createSubmenuAction(
        `${this.id}-root`,
        this.name,
        'Clothes Store menu'
      ),
      rootChildren,
      0
    );
  }

  /**
   * Get job offerings at this building
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
      description: 'Leave the clothes store and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the clothes store',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the clothes store',
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
          description: 'Must be inside the clothes store',
        },
      ],
    };
  }
}
