/**
 * Base Possession class - Abstract class for all possession types
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import {
  IPossession,
  IPossessionEffect,
  PossessionType,
  IPlayerState,
} from '../../../../shared/types/contracts';

/**
 * Abstract base class for all possessions (Food, Clothes, Appliance, Stock)
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

  constructor(
    id: string,
    type: PossessionType,
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[]
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.value = value;
    this.purchasePrice = purchasePrice;
    this.effects = effects;
  }

  /**
   * Helper method to apply all effects to a player's state
   */
  applyEffects(player: IPlayerState): void {
    this.effects.forEach((effect) => {
      player.updateMeasure(effect.measure, effect.delta);
    });
  }

  /**
   * Serialize to JSON
   */
  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      value: this.value,
      purchasePrice: this.purchasePrice,
      effects: this.effects,
      spoilTime: this.spoilTime,
      clothesLevel: this.clothesLevel,
    };
  }
}
