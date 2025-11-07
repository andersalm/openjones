/**
 * ApplianceStore - Retail store selling household appliances
 *
 * Part of Task B9: Shopping Buildings (Part 1)
 * Worker 3 - Track B (Domain Logic)
 *
 * The Appliance Store allows players to purchase household appliances
 * that provide various benefits like happiness, comfort, and quality of life improvements.
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
import { Appliance } from '../possessions/Appliance';
import { PurchaseApplianceAction } from '../actions/PurchaseApplianceAction';
import { IPurchasable } from '../actions/PurchaseAction';

/**
 * Appliance item configuration
 */
interface ApplianceItemConfig {
  name: string;
  price: number;
  happinessBonus: number;
  description: string;
}

/**
 * Appliance Store building - sells household appliances
 */
export class ApplianceStore extends Building {
  // Appliances available at the store
  private static readonly APPLIANCES: ApplianceItemConfig[] = [
    {
      name: 'Microwave',
      price: 150,
      happinessBonus: 3,
      description: 'Quick meal preparation',
    },
    {
      name: 'Television',
      price: 300,
      happinessBonus: 5,
      description: 'Entertainment and relaxation',
    },
    {
      name: 'Air Conditioner',
      price: 500,
      happinessBonus: 8,
      description: 'Comfort in all seasons',
    },
    {
      name: 'Computer',
      price: 800,
      happinessBonus: 10,
      description: 'Work and entertainment',
    },
    {
      name: 'Refrigerator',
      price: 600,
      happinessBonus: 7,
      description: 'Food preservation',
    },
    {
      name: 'Washing Machine',
      price: 450,
      happinessBonus: 6,
      description: 'Convenient laundry',
    },
  ];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.APPLIANCE_STORE,
      name,
      'Buy appliances for your home to increase happiness',
      position
    );
  }

  /**
   * Get available actions for a player at this building
   * Only shows affordable items to avoid clutter
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (!this.isPlayerInside(player)) {
      return actions;
    }

    // Add purchase actions for each appliance
    ApplianceStore.APPLIANCES.forEach((applianceConfig) => {
      const appliance = this.createApplianceItem(applianceConfig);
      const purchasable: IPurchasable = {
        id: appliance.id,
        name: appliance.name,
        price: applianceConfig.price,
      };
      const action = new PurchaseApplianceAction(
        purchasable,
        BuildingType.APPLIANCE_STORE
      );
      actions.push(action);
    });

    // Add exit action
    actions.push(this.createExitAction());

    return actions;
  }

  /**
   * Create an Appliance possession from configuration
   */
  private createApplianceItem(config: ApplianceItemConfig): Appliance {
    const effects = [
      {
        measure: MeasureType.HAPPINESS,
        delta: config.happinessBonus,
        duration: undefined, // Permanent bonus
      },
    ];

    return new Appliance(
      config.name,
      config.price, // value
      config.price, // purchasePrice
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

    // Group appliances by price range
    const budget = purchaseActions.filter((a) => {
      const price = ApplianceStore.APPLIANCES.find(
        (config) => a.displayName.includes(config.name)
      )?.price || 0;
      return price < 300;
    });

    const midRange = purchaseActions.filter((a) => {
      const price = ApplianceStore.APPLIANCES.find(
        (config) => a.displayName.includes(config.name)
      )?.price || 0;
      return price >= 300 && price < 600;
    });

    const premium = purchaseActions.filter((a) => {
      const price = ApplianceStore.APPLIANCES.find(
        (config) => a.displayName.includes(config.name)
      )?.price || 0;
      return price >= 600;
    });

    // Create submenus
    const budgetSubmenu = Building.createSubmenuAction(
      `${this.id}-budget`,
      'Budget Appliances (Under $300)',
      'Affordable home appliances'
    );
    const budgetNode = Building.createActionTreeNode(
      budgetSubmenu,
      budget.map((a, i) => Building.createActionTreeNode(a, [], i)),
      0
    );

    const midRangeSubmenu = Building.createSubmenuAction(
      `${this.id}-midrange`,
      'Mid-Range Appliances ($300-$599)',
      'Quality appliances for everyday use'
    );
    const midRangeNode = Building.createActionTreeNode(
      midRangeSubmenu,
      midRange.map((a, i) => Building.createActionTreeNode(a, [], i)),
      1
    );

    const premiumSubmenu = Building.createSubmenuAction(
      `${this.id}-premium`,
      'Premium Appliances ($600+)',
      'High-end appliances for maximum comfort'
    );
    const premiumNode = Building.createActionTreeNode(
      premiumSubmenu,
      premium.map((a, i) => Building.createActionTreeNode(a, [], i)),
      2
    );

    // Create root node
    const rootChildren = [budgetNode, midRangeNode, premiumNode];
    if (exitAction) {
      rootChildren.push(Building.createActionTreeNode(exitAction, [], 3));
    }

    return Building.createActionTreeNode(
      Building.createSubmenuAction(
        `${this.id}-root`,
        this.name,
        'Appliance Store menu'
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
      description: 'Leave the appliance store and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the appliance store',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the appliance store',
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
          description: 'Must be inside the appliance store',
        },
      ],
    };
  }
}
