/**
 * Stock class - Represents stock market investments
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { Possession } from './Possession';
import { PossessionType } from '../../../../shared/types/contracts';

/**
 * Stock possession representing shares in a company
 * Stocks don't have effects on player measures but can appreciate/depreciate in value
 */
export class Stock extends Possession {
  public readonly companyName: string;
  public readonly shares: number;
  public readonly pricePerShare: number;

  constructor(companyName: string, shares: number, pricePerShare: number) {
    if (shares <= 0) {
      throw new Error(`Number of shares must be positive, got ${shares}`);
    }
    if (pricePerShare < 0) {
      throw new Error(`Price per share cannot be negative, got ${pricePerShare}`);
    }

    const value = shares * pricePerShare;
    const id = `stock-${companyName.toLowerCase().replace(/\s+/g, '-')}-${shares}`;

    // Stocks have no effects on player measures
    super(id, PossessionType.STOCK, companyName, value, value, []);

    this.companyName = companyName;
    this.shares = shares;
    this.pricePerShare = pricePerShare;
  }

  /**
   * Calculate the current value based on a new price per share
   * @param newPricePerShare The current market price per share
   * @returns The current total value of this stock holding
   */
  getCurrentValue(newPricePerShare: number): number {
    return this.shares * newPricePerShare;
  }

  /**
   * Calculate the profit/loss based on a new price per share
   * @param newPricePerShare The current market price per share
   * @returns Positive for profit, negative for loss
   */
  getProfitLoss(newPricePerShare: number): number {
    return this.getCurrentValue(newPricePerShare) - this.purchasePrice;
  }

  /**
   * Calculate the percentage return on investment
   * @param newPricePerShare The current market price per share
   * @returns Percentage return (e.g., 0.15 for 15% gain, -0.10 for 10% loss)
   */
  getReturnPercentage(newPricePerShare: number): number {
    if (this.purchasePrice === 0) return 0;
    return (this.getCurrentValue(newPricePerShare) - this.purchasePrice) / this.purchasePrice;
  }
}
