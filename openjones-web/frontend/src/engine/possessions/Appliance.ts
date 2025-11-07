/**
 * Appliance - Represents household appliances
 *
 * Part of Task B5: Possessions System
 * Worker 2 - Track B (Domain Logic)
 *
 * This class represents appliance possessions like TVs, refrigerators, etc.
 * Appliances can provide ongoing effects to player measures.
 */

import { Possession } from './Possession';
import { PossessionType, IPossessionEffect } from '../../../../shared/types/contracts';

export class Appliance extends Possession {
  constructor(
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[]
  ) {
    const id = `appliance-${name.toLowerCase().replace(/\s+/g, '-')}`;
    super(id, PossessionType.APPLIANCE, name, value, purchasePrice, effects);
  }
}
