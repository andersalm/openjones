/**
 * Education Measure - Represents player's educational attainment
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { Measure } from './Measure';

/**
 * Education measure (0-100)
 * - Increases through studying
 * - Does not decay
 * - Required for higher-level jobs
 * - Permanent investment
 */
export class Education extends Measure {
  readonly type = MeasureType.EDUCATION;
  readonly name = 'Education';

  constructor(initialValue: number = 0) {
    super({
      initialValue,
      minValue: 0,
      maxValue: GAME_CONSTANTS.MAX_EDUCATION,
      decayRate: 0, // Education does not decay
    });
  }

  getStatus(): string {
    const value = this._value;

    if (value >= 90) return 'PhD Level';
    if (value >= 75) return 'Masters Level';
    if (value >= 60) return 'Bachelors Level';
    if (value >= 40) return 'Some College';
    if (value >= 20) return 'High School';
    return 'Basic';
  }

  /**
   * Check if education level meets a requirement
   */
  meetsRequirement(required: number): boolean {
    return this._value >= required;
  }

  /**
   * Get education tier (1-5)
   */
  getTier(): number {
    if (this._value >= 80) return 5;
    if (this._value >= 60) return 4;
    if (this._value >= 40) return 3;
    if (this._value >= 20) return 2;
    return 1;
  }

  clone(): Education {
    const cloned = new Education(this._value);
    return cloned;
  }
}
