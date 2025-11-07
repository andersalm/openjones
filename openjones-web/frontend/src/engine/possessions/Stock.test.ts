/**
 * Unit tests for Stock class
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { describe, it, expect } from 'vitest';
import { Stock } from './Stock';
import { PossessionType } from '@shared/types/contracts';

describe('Stock', () => {
  describe('constructor', () => {
    it('should create stock with correct properties', () => {
      const stock = new Stock('Apple Inc', 10, 150);

      expect(stock.id).toBe('stock-apple-inc-10');
      expect(stock.type).toBe(PossessionType.STOCK);
      expect(stock.name).toBe('Apple Inc');
      expect(stock.companyName).toBe('Apple Inc');
      expect(stock.shares).toBe(10);
      expect(stock.pricePerShare).toBe(150);
      expect(stock.value).toBe(1500); // 10 * 150
      expect(stock.purchasePrice).toBe(1500);
    });

    it('should have no effects', () => {
      const stock = new Stock('Google', 5, 200);
      expect(stock.effects).toEqual([]);
      expect(stock.effects.length).toBe(0);
    });

    it('should calculate value from shares and price', () => {
      const stock = new Stock('Tesla', 20, 250);
      expect(stock.value).toBe(5000); // 20 * 250
      expect(stock.purchasePrice).toBe(5000);
    });

    it('should handle fractional shares', () => {
      const stock = new Stock('Amazon', 2.5, 100);
      expect(stock.shares).toBe(2.5);
      expect(stock.value).toBe(250); // 2.5 * 100
    });

    it('should handle company names with spaces', () => {
      const stock = new Stock('Microsoft Corporation', 15, 300);
      expect(stock.id).toBe('stock-microsoft-corporation-15');
      expect(stock.companyName).toBe('Microsoft Corporation');
    });

    it('should throw error for zero or negative shares', () => {
      expect(() => {
        new Stock('Invalid', 0, 100);
      }).toThrow('Number of shares must be positive');

      expect(() => {
        new Stock('Invalid', -5, 100);
      }).toThrow('Number of shares must be positive');
    });

    it('should throw error for negative price per share', () => {
      expect(() => {
        new Stock('Invalid', 10, -50);
      }).toThrow('Price per share cannot be negative');
    });

    it('should allow zero price per share', () => {
      const stock = new Stock('Worthless Corp', 100, 0);
      expect(stock.pricePerShare).toBe(0);
      expect(stock.value).toBe(0);
    });
  });

  describe('getCurrentValue', () => {
    it('should calculate current value with new price', () => {
      const stock = new Stock('Apple', 10, 150);

      expect(stock.getCurrentValue(200)).toBe(2000); // 10 * 200
      expect(stock.getCurrentValue(100)).toBe(1000); // 10 * 100
    });

    it('should handle price increases', () => {
      const stock = new Stock('Tech Corp', 5, 100);
      const newValue = stock.getCurrentValue(150);
      expect(newValue).toBe(750); // 5 * 150
    });

    it('should handle price decreases', () => {
      const stock = new Stock('Oil Corp', 20, 80);
      const newValue = stock.getCurrentValue(60);
      expect(newValue).toBe(1200); // 20 * 60
    });

    it('should handle zero new price', () => {
      const stock = new Stock('Bankrupt Inc', 10, 50);
      expect(stock.getCurrentValue(0)).toBe(0);
    });

    it('should work with fractional shares and prices', () => {
      const stock = new Stock('Crypto Inc', 2.5, 100);
      expect(stock.getCurrentValue(123.45)).toBeCloseTo(308.625, 2);
    });
  });

  describe('getProfitLoss', () => {
    it('should calculate profit when price increases', () => {
      const stock = new Stock('Growth Stock', 10, 100);
      // Purchase price: 10 * 100 = 1000
      // New value: 10 * 150 = 1500
      expect(stock.getProfitLoss(150)).toBe(500);
    });

    it('should calculate loss when price decreases', () => {
      const stock = new Stock('Declining Stock', 10, 100);
      // Purchase price: 10 * 100 = 1000
      // New value: 10 * 80 = 800
      expect(stock.getProfitLoss(80)).toBe(-200);
    });

    it('should return 0 when price stays the same', () => {
      const stock = new Stock('Stable Corp', 5, 200);
      expect(stock.getProfitLoss(200)).toBe(0);
    });

    it('should calculate large gains', () => {
      const stock = new Stock('Startup', 100, 10);
      // Purchase: 100 * 10 = 1000
      // New value: 100 * 100 = 10000
      expect(stock.getProfitLoss(100)).toBe(9000);
    });

    it('should calculate total loss', () => {
      const stock = new Stock('Failed Corp', 50, 20);
      // Purchase: 50 * 20 = 1000
      // New value: 50 * 0 = 0
      expect(stock.getProfitLoss(0)).toBe(-1000);
    });
  });

  describe('getReturnPercentage', () => {
    it('should calculate positive return percentage', () => {
      const stock = new Stock('Winner Inc', 10, 100);
      // Purchase: 1000, New: 1500, Return: 50%
      expect(stock.getReturnPercentage(150)).toBeCloseTo(0.5, 5);
    });

    it('should calculate negative return percentage', () => {
      const stock = new Stock('Loser Corp', 10, 100);
      // Purchase: 1000, New: 800, Return: -20%
      expect(stock.getReturnPercentage(80)).toBeCloseTo(-0.2, 5);
    });

    it('should return 0 for no change', () => {
      const stock = new Stock('Stable Inc', 10, 100);
      expect(stock.getReturnPercentage(100)).toBe(0);
    });

    it('should calculate 100% gain (double)', () => {
      const stock = new Stock('Doubler', 5, 50);
      // Purchase: 250, New: 500, Return: 100%
      expect(stock.getReturnPercentage(100)).toBeCloseTo(1.0, 5);
    });

    it('should calculate 50% gain', () => {
      const stock = new Stock('Grower', 10, 100);
      // Purchase: 1000, New: 1500, Return: 50%
      expect(stock.getReturnPercentage(150)).toBeCloseTo(0.5, 5);
    });

    it('should calculate -100% loss (worthless)', () => {
      const stock = new Stock('Bankrupt', 10, 50);
      // Purchase: 500, New: 0, Return: -100%
      expect(stock.getReturnPercentage(0)).toBeCloseTo(-1.0, 5);
    });

    it('should handle zero purchase price', () => {
      const stock = new Stock('Free Stock', 10, 0);
      expect(stock.getReturnPercentage(100)).toBe(0);
    });

    it('should calculate small percentage changes accurately', () => {
      const stock = new Stock('Stable', 100, 100);
      // Purchase: 10000, New: 10100, Return: 1%
      expect(stock.getReturnPercentage(101)).toBeCloseTo(0.01, 5);
    });
  });

  describe('inheritance from Possession', () => {
    it('should properly inherit from Possession base class', () => {
      const stock = new Stock('IBM', 20, 140);

      expect(stock).toHaveProperty('id');
      expect(stock).toHaveProperty('type');
      expect(stock).toHaveProperty('name');
      expect(stock).toHaveProperty('value');
      expect(stock).toHaveProperty('purchasePrice');
      expect(stock).toHaveProperty('effects');
    });

    it('should have applyEffects method from base class', () => {
      const stock = new Stock('Oracle', 15, 80);
      expect(typeof stock.applyEffects).toBe('function');
    });

    it('should have toJSON method from base class', () => {
      const stock = new Stock('Netflix', 8, 350);
      expect(typeof stock.toJSON).toBe('function');

      const json = stock.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('type');
    });
  });

  describe('realistic scenarios', () => {
    it('should handle small investment in expensive stock', () => {
      const stock = new Stock('Berkshire Hathaway', 1, 450000);
      expect(stock.value).toBe(450000);
      expect(stock.shares).toBe(1);
    });

    it('should handle large investment in penny stock', () => {
      const stock = new Stock('Penny Stock', 10000, 0.5);
      expect(stock.value).toBe(5000);
    });

    it('should track realistic tech stock', () => {
      const stock = new Stock('Tech Giant', 50, 175.50);
      expect(stock.value).toBe(8775);

      // Stock goes up 10%
      const newValue = stock.getCurrentValue(193.05);
      expect(newValue).toBeCloseTo(9652.5, 1);

      const profit = stock.getProfitLoss(193.05);
      expect(profit).toBeCloseTo(877.5, 1);

      const returnPct = stock.getReturnPercentage(193.05);
      expect(returnPct).toBeCloseTo(0.1, 5);
    });
  });

  describe('ID generation', () => {
    it('should generate IDs with lowercase and hyphens', () => {
      const stock = new Stock('Apple Inc', 10, 150);
      expect(stock.id).toBe('stock-apple-inc-10');
    });

    it('should include share count in ID', () => {
      const stock1 = new Stock('Microsoft', 10, 300);
      const stock2 = new Stock('Microsoft', 20, 300);
      expect(stock1.id).toBe('stock-microsoft-10');
      expect(stock2.id).toBe('stock-microsoft-20');
      expect(stock1.id).not.toBe(stock2.id);
    });

    it('should handle company names with special characters', () => {
      const stock = new Stock('AT&T Corp', 15, 25);
      expect(stock.id).toBe('stock-at&t-corp-15');
    });

    it('should handle fractional shares in ID', () => {
      const stock = new Stock('Amazon', 2.5, 3000);
      expect(stock.id).toBe('stock-amazon-2.5');
    });
  });

  describe('edge cases', () => {
    it('should handle very small share counts', () => {
      const stock = new Stock('Expensive Stock', 0.001, 10000);
      expect(stock.value).toBe(10);
    });

    it('should handle very large share counts', () => {
      const stock = new Stock('Cheap Stock', 1000000, 0.01);
      expect(stock.value).toBe(10000);
    });

    it('should handle very high stock prices', () => {
      const stock = new Stock('Premium Stock', 1, 500000);
      expect(stock.pricePerShare).toBe(500000);
      expect(stock.value).toBe(500000);
    });

    it('should maintain precision with decimal calculations', () => {
      const stock = new Stock('Decimal Test', 33.33, 15.75);
      expect(stock.value).toBeCloseTo(524.9475, 4);
    });
  });
});
