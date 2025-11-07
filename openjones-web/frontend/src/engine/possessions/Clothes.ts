/**
 * Clothes class - Represents clothing possessions with quality/formality levels
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

/**
 * Clothes possession with a level representing quality/formality (1-9)
 * Higher levels represent more formal/higher quality clothing
 */
export class Clothes extends Possession {
  public readonly clothesLevel: number;

  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    clothesLevel: number,
    effects: IPossessionEffect[]
  ) {
    if (clothesLevel < 1 || clothesLevel > 9) {
      throw new Error(`Clothes level must be between 1 and 9, got ${clothesLevel}`);
    }

    const id = `clothes-level-${clothesLevel}-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(id, PossessionType.CLOTHES, name, value, purchasePrice, effects);
    this.clothesLevel = clothesLevel;
  }

  /**
   * Get a description of the clothes quality based on level
   */
  getQualityDescription(): string {
    if (this.clothesLevel >= 8) return 'Luxury';
    if (this.clothesLevel >= 6) return 'Professional';
    if (this.clothesLevel >= 4) return 'Casual';
    if (this.clothesLevel >= 2) return 'Basic';
    return 'Poor';
  }
}
