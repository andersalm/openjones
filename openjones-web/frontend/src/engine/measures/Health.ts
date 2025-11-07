/**
 * Health Measure - Represents player's physical health
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { Measure } from './Measure';

/**
 * Health measure (0-100)
 * - Decreases with work and time
 * - Increases with rest and food
 * - Critical for survival and job performance
 */
export class Health extends Measure {
  readonly type = MeasureType.HEALTH;
  readonly name = 'Health';

  constructor(initialValue: number = GAME_CONSTANTS.MAX_HEALTH, decayRate: number = 0) {
    super({
      initialValue,
      minValue: 0,
      maxValue: GAME_CONSTANTS.MAX_HEALTH,
      decayRate,
    });
  }

  getStatus(): string {
    const percentage = this.getPercentage();

    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    if (percentage >= 20) return 'Poor';
    return 'Critical';
  }

  /**
   * Check if health is critically low
   */
  isCritical(): boolean {
    return this._value <= 20;
  }

  /**
   * Check if health is good enough for strenuous work
   */
  canWorkHard(): boolean {
    return this._value >= 40;
  }

  clone(): Health {
    const cloned = new Health(this._value, this.decayRate);
    return cloned;
  }
}
