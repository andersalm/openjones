/**
 * Happiness Measure - Represents player's mental well-being
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { Measure } from './Measure';

/**
 * Happiness measure (0-100)
 * - Decreases with stress and monotony
 * - Increases with relaxation and entertainment
 * - Affects productivity and decision-making
 */
export class Happiness extends Measure {
  readonly type = MeasureType.HAPPINESS;
  readonly name = 'Happiness';

  constructor(initialValue: number = GAME_CONSTANTS.MAX_HAPPINESS, decayRate: number = 0) {
    super({
      initialValue,
      minValue: 0,
      maxValue: GAME_CONSTANTS.MAX_HAPPINESS,
      decayRate,
    });
  }

  getStatus(): string {
    const percentage = this.getPercentage();

    if (percentage >= 80) return 'Ecstatic';
    if (percentage >= 60) return 'Happy';
    if (percentage >= 40) return 'Content';
    if (percentage >= 20) return 'Unhappy';
    return 'Miserable';
  }

  /**
   * Check if happiness is critically low
   */
  isMiserable(): boolean {
    return this._value <= 20;
  }

  /**
   * Check if happiness is high
   */
  isHappy(): boolean {
    return this._value >= 60;
  }

  clone(): Happiness {
    const cloned = new Happiness(this._value, this.decayRate);
    return cloned;
  }
}
