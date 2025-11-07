import { describe, it, expect } from 'vitest';
import { Stock } from './Stock';
import { PossessionType } from '../../../../shared/types/contracts';

describe('Stock', () => {
  it('should create stock with correct properties', () => {
    const stock = new Stock('Apple Inc', 10, 150);

    expect(stock.id).toBe('stock-apple-inc-10');
    expect(stock.type).toBe(PossessionType.STOCK);
    expect(stock.name).toBe('Apple Inc');
    expect(stock.companyName).toBe('Apple Inc');
    expect(stock.shares).toBe(10);
    expect(stock.pricePerShare).toBe(150);
  });

  it('should calculate value correctly', () => {
    const stock = new Stock('Tesla', 5, 200);

    expect(stock.value).toBe(1000); // 5 * 200
    expect(stock.purchasePrice).toBe(1000); // Same as value
  });

  it('should have no effects', () => {
    const stock = new Stock('Microsoft', 20, 300);

    expect(stock.effects).toHaveLength(0);
  });

  it('should generate ID from company name and shares', () => {
    const stock1 = new Stock('Amazon Inc', 15, 120);
    const stock2 = new Stock('GOOGLE LLC', 8, 2500);

    expect(stock1.id).toBe('stock-amazon-inc-15');
    expect(stock2.id).toBe('stock-google-llc-8');
  });

  it('should not have spoilTime or clothesLevel', () => {
    const stock = new Stock('Netflix', 12, 180);

    expect(stock.spoilTime).toBeUndefined();
    expect(stock.clothesLevel).toBeUndefined();
  });

  it('should handle fractional shares', () => {
    const stock = new Stock('IBM', 2.5, 140);

    expect(stock.value).toBe(350); // 2.5 * 140
    expect(stock.shares).toBe(2.5);
  });

  it('should calculate value with different prices', () => {
    const stock1 = new Stock('CompanyA', 100, 10);
    const stock2 = new Stock('CompanyB', 1, 10000);

    expect(stock1.value).toBe(1000);
    expect(stock2.value).toBe(10000);
  });

  it('should have zero depreciation (value equals purchase price)', () => {
    const stock = new Stock('Oracle', 25, 80);

    expect(stock.getDepreciation()).toBe(0);
    expect(stock.getDepreciationPercent()).toBe(0);
  });
});
