/**
 * Bank - Financial institution offering stock trading
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 *
 * The Bank allows players to trade stocks. No jobs are offered at the Bank (Java: addJobs() is empty).
 * Future enhancements will include savings accounts and loan management.
 */

import {
  IJob,
  IAction,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  IPosition,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { ExitBuildingAction } from '../actions/ExitBuildingAction';

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
 * Java Bank.java: No jobs offered (stock trading only)
 */
export class Bank extends Building {
  // Stock base values (from Java Bank.java)
  private static readonly T_BILLS_BASE_VALUE = 100;
  private static readonly GOLD_BASE_VALUE = 450;
  private static readonly SILVER_BASE_VALUE = 150;
  private static readonly PIG_BELLIES_BASE_VALUE = 15;
  private static readonly BLUE_CHIP_BASE_VALUE = 50;
  private static readonly PENNY_BASE_VALUE = 5;

  // Available stocks
  private stocks: StockInfo[];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.BANK,
      name,
      'Financial institution for stock trading (Java: no jobs at Bank)',
      position
    );
    this.stocks = this.createStockList();
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
   * Java Bank.java: addJobs() is empty - no jobs at Bank
   */
  getJobOfferings(): IJob[] {
    return []; // No jobs at Bank (matches Java)
  }

  /**
   * Get available actions for a player at this building
   * Bank offers stock trading (future) and exit
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Stock trading submenu (placeholder for future implementation)
      actions.push(this.createStockTradingSubmenu());

      // Exit action
      actions.push(new ExitBuildingAction());
    }

    return actions;
  }

  /**
   * Get the action tree for building interaction
   * Bank has stock trading and exit actions
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Fallback to exit action
      const exitAction = new ExitBuildingAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Create tree with all actions
    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Create a submenu action for stock trading
   * This is a placeholder - actual stock trading actions would be implemented
   * in a future task when Purchase/Sell actions are available
   */
  private createStockTradingSubmenu(): IAction {
    return Building.createSubmenuAction(
      `${this.id}-stock-trading`,
      'Stock Trading',
      'Buy and sell stocks (coming soon)'
    );
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
}
