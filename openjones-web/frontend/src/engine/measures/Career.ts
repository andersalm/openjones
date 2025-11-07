/**
 * Career Measure - Represents player's career progress
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType } from '../../../../shared/types/contracts';
import { Measure } from './Measure';

/**
 * Career measure (0+, no upper limit)
 * - Increases through work experience
 * - Sum of experience across all job ranks
 * - Does not decay
 * - Used for victory conditions
 */
export class Career extends Measure {
  readonly type = MeasureType.CAREER;
  readonly name = 'Career';

  constructor(initialValue: number = 0) {
    super({
      initialValue,
      minValue: 0,
      maxValue: Number.POSITIVE_INFINITY, // No upper limit
      decayRate: 0, // Career experience does not decay
    });
  }

  getStatus(): string {
    const value = this._value;

    if (value >= 1000) return 'Industry Expert';
    if (value >= 500) return 'Senior Professional';
    if (value >= 250) return 'Experienced';
    if (value >= 100) return 'Intermediate';
    if (value >= 25) return 'Junior';
    return 'Entry Level';
  }

  /**
   * Get career level based on experience
   */
  getLevel(): number {
    return Math.floor(this._value / 100) + 1;
  }

  /**
   * Check if career meets a threshold
   */
  meetsThreshold(threshold: number): boolean {
    return this._value >= threshold;
  }

  /**
   * Override getPercentage since career has no max
   * Returns 0 to indicate percentage not applicable
   */
  getPercentage(): number {
    return 0; // Cannot calculate percentage for unbounded measure
  }

  clone(): Career {
    const cloned = new Career(this._value);
    return cloned;
  }
}
