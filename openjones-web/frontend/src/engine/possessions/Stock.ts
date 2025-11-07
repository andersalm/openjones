/**
 * Stock - Represents stock market investments
 *
 * Part of Task B5: Possessions System
 * Worker 2 - Track B (Domain Logic)
 *
 * This class represents stock market possessions. Unlike other possessions,
 * stocks don't provide immediate effects but represent investment value.
 */

import { Possession } from './Possession';
import { PossessionType } from '../../../../shared/types/contracts';

export class Stock extends Possession {
  public readonly companyName: string;
  public readonly shares: number;
  public readonly pricePerShare: number;

  constructor(companyName: string, shares: number, pricePerShare: number) {
    const value = shares * pricePerShare;
    const id = `stock-${companyName.toLowerCase().replace(/\s+/g, '-')}-${shares}`;
    super(id, PossessionType.STOCK, companyName, value, value, []);
    this.companyName = companyName;
    this.shares = shares;
    this.pricePerShare = pricePerShare;
  }
}
