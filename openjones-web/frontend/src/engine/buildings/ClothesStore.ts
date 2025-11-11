/**
 * ClothesStore - Purchase clothing for better jobs
 *
 * The Clothes Store ("QT clothing") allows players to purchase clothes
 * at different levels. Higher-level clothes are required for better jobs.
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
  PossessionType,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { ExitBuildingAction } from '../actions/ExitBuildingAction';

export class ClothesStore extends Building {
  // Job wages (from Java reference)
  private static readonly SALESPERSON_WAGE = 6;
  private static readonly ASSISTANT_MANAGER_WAGE = 9;
  private static readonly MANAGER_WAGE = 11;

  // Clothes prices (from Java reference)
  private static readonly CASUAL_CLOTHES_PRICE = 50;
  private static readonly DRESS_CLOTHES_PRICE = 100;
  private static readonly BUSINESS_SUIT_PRICE = 200;

  private jobs: IJob[];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.CLOTHES_STORE,
      name,
      'Buy clothes to qualify for better jobs',
      position
    );
    this.jobs = this.createClothesStoreJobs();
  }

  /**
   * Create job offerings for clothes store
   */
  private createClothesStoreJobs(): IJob[] {
    return [
      // Rank 2 - Salesperson
      {
        id: `${this.id}-job-salesperson`,
        title: 'Salesperson',
        rank: 2,
        requiredEducation: 10,
        requiredExperience: 20,
        requiredClothesLevel: 2,
        wagePerHour: ClothesStore.SALESPERSON_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.CLOTHES_STORE,
      },

      // Rank 3 - Assistant Manager
      {
        id: `${this.id}-job-assistant-manager`,
        title: 'Assistant Manager',
        rank: 3,
        requiredEducation: 15,
        requiredExperience: 30,
        requiredClothesLevel: 2,
        wagePerHour: ClothesStore.ASSISTANT_MANAGER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.CLOTHES_STORE,
      },

      // Rank 4 - Manager
      {
        id: `${this.id}-job-manager`,
        title: 'Manager',
        rank: 4,
        requiredEducation: 20,
        requiredExperience: 40,
        requiredClothesLevel: 3,
        wagePerHour: ClothesStore.MANAGER_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.CLOTHES_STORE,
      },
    ];
  }

  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Purchase clothes actions
      actions.push(this.createPurchaseClothesAction('casual', 1));
      actions.push(this.createPurchaseClothesAction('dress', 2));
      actions.push(this.createPurchaseClothesAction('business', 3));

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
   * Create purchase clothes action
   */
  private createPurchaseClothesAction(
    type: 'casual' | 'dress' | 'business',
    level: number
  ): IAction {
    const prices = {
      casual: ClothesStore.CASUAL_CLOTHES_PRICE,
      dress: ClothesStore.DRESS_CLOTHES_PRICE,
      business: ClothesStore.BUSINESS_SUIT_PRICE,
    };

    const names = {
      casual: 'Casual Clothes',
      dress: 'Dress Clothes',
      business: 'Business Suit',
    };

    const price = prices[type];
    const name = names[type];

    return {
      id: `${this.id}-purchase-${type}`,
      type: ActionType.PURCHASE,
      displayName: `Buy ${name} ($${price})`,
      description: `Purchase ${name} (Level ${level} clothes)`,
      timeCost: 0,

      canExecute: (player: IPlayerState, _game: IGame) => {
        // Must be inside
        if (!this.isPlayerInside(player)) {
          return false;
        }

        // Must have enough cash
        if (!player.canAfford(price)) {
          return false;
        }

        // Check if player already has this level or higher
        if (player.getClothesLevel() >= level) {
          return false;
        }

        return true;
      },

      execute: (player: IPlayerState, _game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the clothes store',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (!player.canAfford(price)) {
          return {
            success: false,
            message: `You need $${price} to purchase ${name}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (player.getClothesLevel() >= level) {
          return {
            success: false,
            message: 'You already have clothes of this level or better',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        const newCash = player.cash - price;

        return {
          success: true,
          message: `Purchased ${name}. Looking good!`,
          timeSpent: 0,
          stateChanges: [
            {
              type: 'cash',
              value: newCash,
              description: `Paid $${price} for ${name}`,
            },
            {
              type: 'possession_add',
              value: {
                id: `clothes-${type}-${Date.now()}`,
                type: PossessionType.CLOTHES,
                name,
                value: price,
                purchasePrice: price,
                effects: [],
                clothesLevel: level,
              },
              description: `Added ${name} to inventory`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'cash',
          value: price,
          description: `Need $${price}`,
        },
      ],
    };
  }
}
