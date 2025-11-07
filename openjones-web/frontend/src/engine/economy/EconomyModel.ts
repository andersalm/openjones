/**
 * EconomyModel - Manages all economic calculations in the game
 *
 * This is a constant economy model where prices, wages, and rents
 * remain fixed throughout the game. Ported from Java ConstantEconomyModel.
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { IEconomyModel, IJob, IPossession, BuildingType } from '@shared/types/contracts';

/**
 * Item price constants
 * These represent the base prices for various items in different buildings
 */
const ITEM_PRICES: Record<string, number> = {
  // Clothing items
  'casual-clothes': 50,
  'dress-clothes': 75,
  'business-suit': 150,

  // Food items (examples - adjust based on actual game data)
  'burger': 10,
  'groceries': 25,
  'prepared-meal': 15,

  // Appliances (examples - adjust based on actual game data)
  'refrigerator': 500,
  'tv': 300,
  'stove': 400,

  // Study costs
  'study-1hr': 15,
  'study-2hr': 30,
  'study-4hr': 60,
};

/**
 * Rent prices per week for different housing types
 */
const RENT_PRICES: Record<BuildingType, number> = {
  [BuildingType.LOW_COST_APARTMENT]: 305,
  [BuildingType.SECURITY_APARTMENT]: 445,

  // Non-housing buildings have no rent
  [BuildingType.EMPLOYMENT_AGENCY]: 0,
  [BuildingType.FACTORY]: 0,
  [BuildingType.BANK]: 0,
  [BuildingType.COLLEGE]: 0,
  [BuildingType.DEPARTMENT_STORE]: 0,
  [BuildingType.CLOTHES_STORE]: 0,
  [BuildingType.APPLIANCE_STORE]: 0,
  [BuildingType.PAWN_SHOP]: 0,
  [BuildingType.RESTAURANT]: 0,
  [BuildingType.SUPERMARKET]: 0,
  [BuildingType.RENT_AGENCY]: 0,
};

/**
 * Stock base prices
 */
const STOCK_PRICES: Record<string, number> = {
  't-bills': 100,
  'gold': 450,
  'silver': 150,
  'pig-bellies': 15,
  'blue-chip': 50,
  'penny': 5,
};

/**
 * Pawn shop sell price ratio (percentage of original value)
 */
const PAWN_SHOP_SELL_RATIO = 0.5;

/**
 * ConstantEconomyModel implementation
 *
 * In this model, all prices remain constant throughout the game.
 * This is the base implementation - more advanced models could introduce
 * dynamic pricing based on supply/demand, inflation, etc.
 */
export class EconomyModel implements IEconomyModel {
  /**
   * Get the price of an item at a specific building
   *
   * @param itemId - The identifier for the item (e.g., 'casual-clothes', 'burger')
   * @param buildingType - The type of building where the item is being purchased
   * @returns The price in dollars
   */
  getPrice(itemId: string, buildingType: BuildingType): number {
    // Check if we have a specific price for this item
    const basePrice = ITEM_PRICES[itemId];

    if (basePrice !== undefined) {
      // Could add building-specific markup here
      // For example, restaurants might charge more for food than supermarkets
      switch (buildingType) {
        case BuildingType.RESTAURANT:
          // Restaurant food is more expensive than grocery store
          if (itemId.includes('meal') || itemId.includes('burger')) {
            return Math.floor(basePrice * 1.5);
          }
          break;
        case BuildingType.SUPERMARKET:
          // Supermarket is the base price for food
          break;
        default:
          break;
      }

      return basePrice;
    }

    // Default price if item not found in our price list
    console.warn(`Price not found for item: ${itemId} at ${buildingType}, using default`);
    return 100;
  }

  /**
   * Calculate wage for a job based on hours worked
   *
   * @param job - The job being performed
   * @param hoursWorked - Number of hours worked
   * @returns Total wage earned in dollars
   */
  getWage(job: IJob, hoursWorked: number): number {
    return job.wagePerHour * hoursWorked;
  }

  /**
   * Get the weekly rent for a housing type
   *
   * @param homeType - The type of housing
   * @returns Weekly rent in dollars
   */
  getRent(homeType: BuildingType): number {
    return RENT_PRICES[homeType] || 0;
  }

  /**
   * Get stock price for a given week
   *
   * In the constant model, stock prices don't change with time.
   * A more advanced model could implement fluctuations.
   *
   * @param week - The current week number (unused in constant model)
   * @returns Stock price in dollars
   */
  getStockPrice(week: number): number {
    // In constant model, we return a default stock price
    // In a real implementation, this would track specific stocks by ID
    // For now, return blue chip stock price as default
    void week; // Unused in constant model
    return STOCK_PRICES['blue-chip'];
  }

  /**
   * Calculate sell price for a possession at the pawn shop
   *
   * Pawn shops buy items at 50% of their original value
   *
   * @param possession - The possession being sold
   * @returns Sell price in dollars
   */
  calculateSellPrice(possession: IPossession): number {
    return Math.floor(possession.value * PAWN_SHOP_SELL_RATIO);
  }

  /**
   * Get the price for a specific stock by ID
   *
   * @param stockId - The stock identifier
   * @returns Stock price in dollars
   */
  getStockPriceById(stockId: string): number {
    return STOCK_PRICES[stockId.toLowerCase()] || STOCK_PRICES['blue-chip'];
  }

  /**
   * Get all available stock prices
   *
   * @returns Map of stock IDs to prices
   */
  getAllStockPrices(): Record<string, number> {
    return { ...STOCK_PRICES };
  }

  /**
   * Get the rent for a specific housing type (convenience method)
   *
   * @param homeType - The type of housing
   * @returns Monthly rent in dollars (4 weeks)
   */
  getMonthlyRent(homeType: BuildingType): number {
    const weeklyRent = this.getRent(homeType);
    return weeklyRent * 4; // 4 weeks in a game "month"
  }
}

/**
 * Default export for easy importing
 */
export default EconomyModel;
