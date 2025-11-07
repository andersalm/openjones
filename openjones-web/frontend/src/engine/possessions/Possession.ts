/**
 * Possession - Abstract base class for all possessions in the game
 *
 * Part of Task B5: Possessions System
 * Worker 2 - Track B (Domain Logic)
 *
 * This abstract class provides the foundation for all possession types in the game.
 * Each specific possession (Food, Clothes, Appliance, Stock) extends this class.
 */

import {
  IPossession,
  IPossessionEffect,
  PossessionType,
} from '../../../../shared/types/contracts';

/**
 * Abstract Possession class that all specific possessions must extend
 */
export abstract class Possession implements IPossession {
  public readonly id: string;
  public readonly type: PossessionType;
  public readonly name: string;
  public readonly value: number;
  public readonly purchasePrice: number;
  public readonly effects: IPossessionEffect[];
  public readonly spoilTime?: number;
  public readonly clothesLevel?: number;

  /**
   * Constructor for Possession base class
   * @param id Unique identifier for this possession
   * @param type Type of possession (from PossessionType enum)
   * @param name Display name of the possession
   * @param value Current worth in dollars
   * @param purchasePrice Original purchase price
   * @param effects Array of effects this possession provides
   * @param spoilTime Optional - week when food spoils (food only)
   * @param clothesLevel Optional - quality level for clothes (clothes only)
   */
  constructor(
    id: string,
    type: PossessionType,
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[],
    spoilTime?: number,
    clothesLevel?: number
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.value = value;
    this.purchasePrice = purchasePrice;
    this.effects = effects;
    this.spoilTime = spoilTime;
    this.clothesLevel = clothesLevel;
  }

  /**
   * Get a string representation of this possession for debugging
   */
  toString(): string {
    return `${this.name} [${this.type}] - $${this.value}`;
  }

  /**
   * Check if this possession has effects on a specific measure
   */
  hasEffectOn(measure: string): boolean {
    return this.effects.some((effect) => effect.measure === measure);
  }

  /**
   * Get the total effect delta for a specific measure
   */
  getEffectDelta(measure: string): number {
    return this.effects
      .filter((effect) => effect.measure === measure)
      .reduce((sum, effect) => sum + effect.delta, 0);
  }

  /**
   * Calculate depreciation (how much value is lost since purchase)
   */
  getDepreciation(): number {
    return this.purchasePrice - this.value;
  }

  /**
   * Calculate depreciation percentage
   */
  getDepreciationPercent(): number {
    if (this.purchasePrice === 0) return 0;
    return (this.getDepreciation() / this.purchasePrice) * 100;
  }
}
