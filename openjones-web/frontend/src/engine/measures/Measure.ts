/**
 * Base Measure class - Abstract class for all player measures
 *
 * Part of Task B4: Measures System
 * Worker 2 - Track B (Domain Logic)
 */

import { MeasureType } from '../../../../shared/types/contracts';

export interface MeasureConfig {
  initialValue: number;
  minValue: number;
  maxValue: number;
  decayRate?: number; // Amount measure decays per week (if applicable)
}

/**
 * Abstract base class for all measures (Health, Happiness, Education, Career, Wealth)
 */
export abstract class Measure {
  protected _value: number;
  protected readonly minValue: number;
  protected readonly maxValue: number;
  protected readonly decayRate: number;

  abstract readonly type: MeasureType;
  abstract readonly name: string;

  constructor(config: MeasureConfig) {
    this.minValue = config.minValue;
    this.maxValue = config.maxValue;
    this.decayRate = config.decayRate ?? 0;
    this._value = this.clamp(config.initialValue);
  }

  /**
   * Get the current value of the measure
   */
  get value(): number {
    return this._value;
  }

  /**
   * Set the value directly (with clamping)
   */
  set value(newValue: number) {
    this._value = this.clamp(newValue);
  }

  /**
   * Increase the measure by a delta amount
   */
  increase(amount: number): number {
    if (amount < 0) {
      throw new Error(`Cannot increase by negative amount: ${amount}`);
    }
    const oldValue = this._value;
    this._value = this.clamp(this._value + amount);
    return this._value - oldValue; // Return actual change
  }

  /**
   * Decrease the measure by a delta amount
   */
  decrease(amount: number): number {
    if (amount < 0) {
      throw new Error(`Cannot decrease by negative amount: ${amount}`);
    }
    const oldValue = this._value;
    this._value = this.clamp(this._value - amount);
    return oldValue - this._value; // Return actual change
  }

  /**
   * Update the measure by a delta (positive or negative)
   */
  update(delta: number): number {
    const oldValue = this._value;
    this._value = this.clamp(this._value + delta);
    return this._value - oldValue; // Return actual change
  }

  /**
   * Apply weekly decay (if applicable)
   */
  applyDecay(): number {
    if (this.decayRate === 0) {
      return 0;
    }
    return this.decrease(this.decayRate);
  }

  /**
   * Clamp a value between min and max
   */
  protected clamp(value: number): number {
    return Math.max(this.minValue, Math.min(this.maxValue, value));
  }

  /**
   * Check if the measure is at its maximum value
   */
  isAtMax(): boolean {
    return this._value >= this.maxValue;
  }

  /**
   * Check if the measure is at its minimum value
   */
  isAtMin(): boolean {
    return this._value <= this.minValue;
  }

  /**
   * Get the percentage of max (for measures with finite max)
   */
  getPercentage(): number {
    if (!isFinite(this.maxValue)) {
      return 0; // Cannot calculate percentage for infinite max
    }
    const range = this.maxValue - this.minValue;
    if (range === 0) return 100;
    return ((this._value - this.minValue) / range) * 100;
  }

  /**
   * Reset to initial value
   */
  reset(initialValue: number): void {
    this._value = this.clamp(initialValue);
  }

  /**
   * Get a status description based on current value
   */
  abstract getStatus(): string;

  /**
   * Clone this measure
   */
  abstract clone(): Measure;

  /**
   * Serialize to JSON
   */
  toJSON(): object {
    return {
      type: this.type,
      value: this._value,
      minValue: this.minValue,
      maxValue: this.maxValue,
    };
  }
}
