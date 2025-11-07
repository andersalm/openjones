/**
 * Clothes - Represents clothing items with quality levels
 *
 * Part of Task B5: Possessions System
 * Worker 2 - Track B (Domain Logic)
 *
 * This class represents clothing possessions which have quality levels.
 * Higher quality clothes are required for better job positions.
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

export class Clothes extends Possession {
  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    clothesLevel: number,
    effects: IPossessionEffect[]
  ) {
    const id = `clothes-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(
      id,
      PossessionType.CLOTHES,
      name,
      value,
      purchasePrice,
      effects,
      undefined, // No spoilTime for clothes
      clothesLevel
    );
  }

  /**
   * Get the quality level of these clothes
   * @returns The clothes level (1-9)
   */
  getLevel(): number {
    return this.clothesLevel || 0;
  }

  /**
   * Check if these clothes meet a required level
   * @param requiredLevel The minimum level required
   * @returns true if clothes meet or exceed requirement
   */
  meetsRequirement(requiredLevel: number): boolean {
    return this.getLevel() >= requiredLevel;
  }
}
