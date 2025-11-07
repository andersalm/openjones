/**
 * Bank - Financial institution offering banking jobs and stock trading
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 *
 * The Bank allows players to work as tellers and interact with the stock market.
 * Future enhancements will include savings accounts and loan management.
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
  IPossession,
  PossessionType,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { Stock } from '../possessions/Stock';

/**
 * Stock information for the bank
 */
interface StockInfo {
  id: string;
  name: string;
  baseValue: number;
}

/**
 * Bank building - financial services and stock trading
 * Offers bank teller jobs and stock market access
 */
export class Bank extends Building {
  // Job wage rates
  private static readonly TELLER_BASE_WAGE = 10;
  private static readonly LOAN_OFFICER_BASE_WAGE = 16;
  private static readonly BRANCH_MANAGER_BASE_WAGE = 22;

  // Stock base values (from Java Bank.java)
  private static readonly T_BILLS_BASE_VALUE = 100;
  private static readonly GOLD_BASE_VALUE = 450;
  private static readonly SILVER_BASE_VALUE = 150;
  private static readonly PIG_BELLIES_BASE_VALUE = 15;
  private static readonly BLUE_CHIP_BASE_VALUE = 50;
  private static readonly PENNY_BASE_VALUE = 5;

  // Available stocks
  private stocks: StockInfo[];

  // Job offerings for this building
  private jobs: IJob[];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.BANK,
      name,
      'Financial institution offering banking jobs and stock market access',
      position
    );
    this.jobs = this.createBankJobs();
    this.stocks = this.createStockList();
  }

  /**
   * Create all job offerings for the Bank
   */
  private createBankJobs(): IJob[] {
    return [
      // Rank 2 - Bank Teller
      {
        id: `${this.id}-job-teller`,
        title: 'Bank Teller',
        rank: 2,
        requiredEducation: 10, // rank * 5
        requiredExperience: 20, // rank * 10
        requiredClothesLevel: 2,
        wagePerHour: Bank.TELLER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.BANK,
      },

      // Rank 5 - Loan Officer
      {
        id: `${this.id}-job-loan-officer`,
        title: 'Loan Officer',
        rank: 5,
        requiredEducation: 25, // rank * 5
        requiredExperience: 50, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: Bank.LOAN_OFFICER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.BANK,
      },

      // Rank 7 - Branch Manager
      {
        id: `${this.id}-job-branch-manager`,
        title: 'Branch Manager',
        rank: 7,
        requiredEducation: 35, // rank * 5
        requiredExperience: 70, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: Bank.BRANCH_MANAGER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.BANK,
      },
    ];
  }

  /**
   * Create the list of available stocks
   * Based on Java Bank.java
   */
  private createStockList(): StockInfo[] {
    return [
      { id: 'stock-tbills', name: 'T-Bills', baseValue: Bank.T_BILLS_BASE_VALUE },
      { id: 'stock-gold', name: 'Gold', baseValue: Bank.GOLD_BASE_VALUE },
      { id: 'stock-silver', name: 'Silver', baseValue: Bank.SILVER_BASE_VALUE },
      { id: 'stock-pig-bellies', name: 'Pig Bellies', baseValue: Bank.PIG_BELLIES_BASE_VALUE },
      { id: 'stock-blue-chip', name: 'Blue Chip', baseValue: Bank.BLUE_CHIP_BASE_VALUE },
      { id: 'stock-penny', name: 'Penny', baseValue: Bank.PENNY_BASE_VALUE },
    ];
  }

  /**
   * Get all job offerings at this Bank
   */
  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions for a player at this building
   * Bank offers stock trading (buy/sell) and exit
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Add buy actions for all available stocks
      this.stocks.forEach((stock) => {
        actions.push(this.createBuyStockAction(stock, game));
      });

      // Add sell actions for stocks the player owns
      const playerStocks = player.possessions.filter((p) => p.type === PossessionType.STOCK);
      playerStocks.forEach((possession) => {
        actions.push(this.createSellStockAction(possession as Stock, game));
      });

      // Exit action
      actions.push(this.createExitAction());
    }

    return actions;
  }

  /**
   * Get the action tree for building interaction
   * Bank has buy/sell stock submenus and exit actions
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Fallback to exit action
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Separate buy, sell, and exit actions
    const buyActions = actions.filter((a) => a.type === ActionType.PURCHASE);
    const sellActions = actions.filter((a) => a.type === ActionType.SELL);
    const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

    // Create buy submenu
    const buySubmenu = Building.createSubmenuAction(
      `${this.id}-buy-stocks`,
      'Buy Stocks',
      'Purchase stocks from available options'
    );
    const buyChildren = buyActions.map((action, index) =>
      Building.createActionTreeNode(action, [], index)
    );

    // Create sell submenu (only if player owns stocks)
    const sellSubmenu = Building.createSubmenuAction(
      `${this.id}-sell-stocks`,
      'Sell Stocks',
      sellActions.length > 0 ? 'Sell your stock holdings' : 'You own no stocks'
    );
    const sellChildren = sellActions.map((action, index) =>
      Building.createActionTreeNode(action, [], index)
    );

    // Build tree structure
    const buyNode = Building.createActionTreeNode(buySubmenu, buyChildren, 0);
    const sellNode = Building.createActionTreeNode(sellSubmenu, sellChildren, 1);
    const exitNode = Building.createActionTreeNode(
      exitAction || this.createExitAction(),
      [],
      2
    );

    // Root is a trading menu with buy/sell/exit as children
    const tradingMenu = Building.createSubmenuAction(
      `${this.id}-stock-trading`,
      'Stock Trading',
      'Buy and sell stocks'
    );

    return {
      action: tradingMenu,
      children: [buyNode, sellNode, exitNode],
      index: 0,
    };
  }

  /**
   * Create a buy stock action for a specific stock
   */
  private createBuyStockAction(stock: StockInfo, game: IGame): IAction {
    const currentPrice = game.economyModel.getStockPrice(game.currentWeek);
    const shares = 1; // Buy 1 share at a time

    return {
      id: `${this.id}-buy-${stock.id}`,
      type: ActionType.PURCHASE,
      displayName: `Buy ${stock.name}`,
      description: `Purchase 1 share of ${stock.name} for $${currentPrice}`,
      timeCost: 5,

      canExecute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return false;
        }
        if (!player.canAfford(currentPrice)) {
          return false;
        }
        if (game.timeUnitsRemaining < 5) {
          return false;
        }
        return true;
      },

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the bank to buy stocks',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (!player.canAfford(currentPrice)) {
          return {
            success: false,
            message: `Not enough cash for ${stock.name}. Need $${currentPrice}, have $${player.cash}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (game.timeUnitsRemaining < 5) {
          return {
            success: false,
            message: 'Not enough time remaining this week',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Create stock possession
        const stockPossession = new Stock(stock.name, shares, currentPrice);

        return {
          success: true,
          message: `Purchased ${shares} share of ${stock.name} for $${currentPrice}`,
          timeSpent: 5,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash - currentPrice,
              description: `Paid $${currentPrice} for ${stock.name}`,
            },
            {
              type: 'possession_add',
              value: stockPossession,
              description: `Acquired ${shares} share of ${stock.name}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the bank',
        },
        {
          type: 'cash',
          value: currentPrice,
          comparison: 'gte',
          description: `Need $${currentPrice}`,
        },
      ],
    };
  }

  /**
   * Create a sell stock action for a stock the player owns
   */
  private createSellStockAction(stock: Stock, game: IGame): IAction {
    const currentPrice = game.economyModel.getStockPrice(game.currentWeek);
    const currentValue = stock.getCurrentValue(currentPrice);
    const profitLoss = stock.getProfitLoss(currentPrice);
    const profitLossText = profitLoss >= 0 ? `+$${profitLoss}` : `-$${Math.abs(profitLoss)}`;

    return {
      id: `${this.id}-sell-${stock.id}`,
      type: ActionType.SELL,
      displayName: `Sell ${stock.name}`,
      description: `Sell ${stock.shares} share(s) of ${stock.companyName} for $${currentValue} (${profitLossText})`,
      timeCost: 5,

      canExecute: (player: IPlayerState, _game: IGame) => {
        return player.possessions.some((p) => p.id === stock.id);
      },

      execute: (player: IPlayerState, _game: IGame) => {
        if (!player.possessions.some((p) => p.id === stock.id)) {
          return {
            success: false,
            message: `You don't own ${stock.companyName} stock`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: `Sold ${stock.shares} share(s) of ${stock.companyName} for $${currentValue} (${profitLossText})`,
          timeSpent: 5,
          stateChanges: [
            {
              type: 'cash',
              value: player.cash + currentValue,
              description: `Received $${currentValue} for ${stock.companyName}`,
            },
            {
              type: 'possession_remove',
              value: stock.id,
              description: `Sold ${stock.companyName} stock`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'possession',
          value: stock.id,
          description: `Must own ${stock.companyName} stock`,
        },
      ],
    };
  }

  /**
   * Get current stock price
   * Uses the economy model to get dynamic pricing based on game week
   */
  getStockPrice(stockId: string, game: IGame): number {
    const stock = this.stocks.find((s) => s.id === stockId);
    if (!stock) {
      return 0;
    }

    // Use economy model to get current stock price
    return game.economyModel.getStockPrice(game.currentWeek);
  }

  /**
   * Get all available stocks
   */
  getAvailableStocks(): StockInfo[] {
    return [...this.stocks];
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit Bank',
      description: 'Leave the bank and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the bank',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the bank',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to bank position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the bank',
        },
      ],
    };
  }
}
