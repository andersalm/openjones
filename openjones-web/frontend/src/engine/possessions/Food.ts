/**
 * Food - Represents food items that can spoil
 *
 * Part of Task B5: Possessions System
 * Worker 2 - Track B (Domain Logic)
 *
 * This class represents food possessions which can spoil after a certain time.
 * Spoiled food becomes worthless and may need to be discarded.
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

export class Food extends Possession {
  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[],
    spoilTime?: number
  ) {
    const id = `food-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(id, PossessionType.FOOD, name, value, purchasePrice, effects, spoilTime);
  }

  /**
   * Check if this food has spoiled by the given week
   * @param currentWeek The current game week
   * @returns true if food has spoiled, false otherwise
   */
  isSpoiled(currentWeek: number): boolean {
    if (this.spoilTime === undefined) {
      return false; // Food without spoilTime never spoils (e.g., canned goods)
    }
    return currentWeek >= this.spoilTime;
  }

  /**
   * Get weeks until spoilage
   * @param currentWeek The current game week
   * @returns Number of weeks until spoilage, or Infinity if never spoils
   */
  weeksUntilSpoilage(currentWeek: number): number {
    if (this.spoilTime === undefined) {
      return Infinity;
    }
    const remaining = this.spoilTime - currentWeek;
    return Math.max(0, remaining);
  }
}
