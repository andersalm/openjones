/**
 * Appliance class - Represents household appliances
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

/**
 * Appliance possession (e.g., TV, refrigerator, washing machine)
 * Appliances provide effects like happiness bonuses
 */
export class Appliance extends Possession {
  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[]
  ) {
    const id = `appliance-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(id, PossessionType.APPLIANCE, name, value, purchasePrice, effects);
  }

  /**
   * Calculate the depreciation rate of this appliance
   * Appliances typically depreciate over time
   */
  getDepreciatedValue(weeksOwned: number, depreciationRate: number = 0.02): number {
    const depreciationFactor = Math.pow(1 - depreciationRate, weeksOwned);
    return Math.max(0, this.value * depreciationFactor);
  }
}
