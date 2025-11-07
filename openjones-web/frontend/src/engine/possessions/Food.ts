/**
 * Food class - Represents food possessions with spoilage mechanics
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

/**
 * Food possession that can spoil after a certain number of weeks
 */
export class Food extends Possession {
  public readonly spoilTime?: number;

  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[],
    spoilTime?: number
  ) {
    const id = `food-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(id, PossessionType.FOOD, name, value, purchasePrice, effects);
    this.spoilTime = spoilTime;
  }

  /**
   * Check if this food has spoiled by the given week
   * @param currentWeek The current week number in the game
   * @returns true if the food has spoiled, false otherwise
   */
  isSpoiled(currentWeek: number): boolean {
    return this.spoilTime !== undefined && currentWeek >= this.spoilTime;
  }

  /**
   * Get the number of weeks until this food spoils
   * @param currentWeek The current week number in the game
   * @returns Number of weeks until spoilage, or undefined if food doesn't spoil
   */
  weeksUntilSpoiled(currentWeek: number): number | undefined {
    if (this.spoilTime === undefined) {
      return undefined;
    }
    const weeksRemaining = this.spoilTime - currentWeek;
    return Math.max(0, weeksRemaining);
  }
}
