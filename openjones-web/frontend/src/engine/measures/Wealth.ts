/**
 * Wealth Measure - Represents player's financial status
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType } from '../../../../shared/types/contracts';
import { Measure } from './Measure';

/**
 * Wealth measure (no limits, can be negative)
 * - Represents cash on hand
 * - Can be negative (debt)
 * - No upper limit
 * - Does not decay naturally
 */
export class Wealth extends Measure {
  readonly type = MeasureType.WEALTH;
  readonly name = 'Wealth';

  constructor(initialValue: number = 0) {
    super({
      initialValue,
      minValue: Number.NEGATIVE_INFINITY, // Can go into debt
      maxValue: Number.POSITIVE_INFINITY, // No upper limit
      decayRate: 0, // Money doesn't decay (though rent is separate)
    });
  }

  getStatus(): string {
    const value = this._value;

    if (value >= 10000) return 'Wealthy';
    if (value >= 5000) return 'Prosperous';
    if (value >= 1000) return 'Comfortable';
    if (value >= 0) return 'Modest';
    if (value >= -500) return 'In Debt';
    return 'Deep in Debt';
  }

  /**
   * Check if player is in debt
   */
  isInDebt(): boolean {
    return this._value < 0;
  }

  /**
   * Check if player can afford a cost
   */
  canAfford(cost: number): boolean {
    return this._value >= cost;
  }

  /**
   * Get debt amount (returns 0 if not in debt)
   */
  getDebtAmount(): number {
    return this._value < 0 ? Math.abs(this._value) : 0;
  }

  /**
   * Get wealth tier
   */
  getTier(): number {
    if (this._value >= 10000) return 5;
    if (this._value >= 5000) return 4;
    if (this._value >= 1000) return 3;
    if (this._value >= 0) return 2;
    return 1; // In debt
  }

  /**
   * Override getPercentage since wealth has no bounds
   * Returns 0 to indicate percentage not applicable
   */
  getPercentage(): number {
    return 0; // Cannot calculate percentage for unbounded measure
  }

  clone(): Wealth {
    const cloned = new Wealth(this._value);
    return cloned;
  }
}
