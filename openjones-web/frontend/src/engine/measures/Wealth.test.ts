/**
 * Unit tests for Wealth measure
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Wealth } from './Wealth';
import { MeasureType } from '@shared/types/contracts';

describe('Wealth', () => {
  let wealth: Wealth;

  beforeEach(() => {
    wealth = new Wealth(1000);
  });

  describe('constructor', () => {
    it('should initialize with 0 by default', () => {
      const w = new Wealth();
      expect(w.value).toBe(0);
    });

    it('should initialize with custom value', () => {
      expect(wealth.value).toBe(1000);
    });

    it('should allow negative values (debt)', () => {
      const w = new Wealth(-500);
      expect(w.value).toBe(-500);
    });

    it('should have no upper limit', () => {
      const w = new Wealth(1000000);
      expect(w.value).toBe(1000000);
    });

    it('should have correct type', () => {
      expect(wealth.type).toBe(MeasureType.WEALTH);
    });

    it('should have correct name', () => {
      expect(wealth.name).toBe('Wealth');
    });
  });

  describe('getStatus', () => {
    it('should return Wealthy for 10000+', () => {
      wealth.value = 15000;
      expect(wealth.getStatus()).toBe('Wealthy');
    });

    it('should return Prosperous for 5000-9999', () => {
      wealth.value = 7500;
      expect(wealth.getStatus()).toBe('Prosperous');
    });

    it('should return Comfortable for 1000-4999', () => {
      wealth.value = 2000;
      expect(wealth.getStatus()).toBe('Comfortable');
    });

    it('should return Modest for 0-999', () => {
      wealth.value = 500;
      expect(wealth.getStatus()).toBe('Modest');
    });

    it('should return In Debt for -1 to -499', () => {
      wealth.value = -300;
      expect(wealth.getStatus()).toBe('In Debt');
    });

    it('should return Deep in Debt for -500 or less', () => {
      wealth.value = -700;
      expect(wealth.getStatus()).toBe('Deep in Debt');
    });
  });

  describe('isInDebt', () => {
    it('should return true when wealth is negative', () => {
      wealth.value = -1;
      expect(wealth.isInDebt()).toBe(true);

      wealth.value = -500;
      expect(wealth.isInDebt()).toBe(true);
    });

    it('should return false when wealth is zero or positive', () => {
      wealth.value = 0;
      expect(wealth.isInDebt()).toBe(false);

      wealth.value = 1000;
      expect(wealth.isInDebt()).toBe(false);
    });
  });

  describe('canAfford', () => {
    it('should return true when wealth meets cost', () => {
      wealth.value = 1000;
      expect(wealth.canAfford(1000)).toBe(true);
      expect(wealth.canAfford(500)).toBe(true);
    });

    it('should return false when wealth is below cost', () => {
      wealth.value = 500;
      expect(wealth.canAfford(1000)).toBe(false);
    });

    it('should handle negative wealth', () => {
      wealth.value = -100;
      expect(wealth.canAfford(50)).toBe(false);
      expect(wealth.canAfford(-200)).toBe(true);
    });
  });

  describe('getDebtAmount', () => {
    it('should return debt amount when in debt', () => {
      wealth.value = -500;
      expect(wealth.getDebtAmount()).toBe(500);
    });

    it('should return 0 when not in debt', () => {
      wealth.value = 1000;
      expect(wealth.getDebtAmount()).toBe(0);

      wealth.value = 0;
      expect(wealth.getDebtAmount()).toBe(0);
    });
  });

  describe('getTier', () => {
    it('should return tier 5 for 10000+', () => {
      wealth.value = 15000;
      expect(wealth.getTier()).toBe(5);
    });

    it('should return tier 4 for 5000-9999', () => {
      wealth.value = 7000;
      expect(wealth.getTier()).toBe(4);
    });

    it('should return tier 3 for 1000-4999', () => {
      wealth.value = 2000;
      expect(wealth.getTier()).toBe(3);
    });

    it('should return tier 2 for 0-999', () => {
      wealth.value = 500;
      expect(wealth.getTier()).toBe(2);
    });

    it('should return tier 1 for negative (debt)', () => {
      wealth.value = -100;
      expect(wealth.getTier()).toBe(1);
    });
  });

  describe('getPercentage', () => {
    it('should return 0 for unbounded measure', () => {
      expect(wealth.getPercentage()).toBe(0);
    });
  });

  describe('decay', () => {
    it('should not decay', () => {
      wealth.value = 1000;
      const decay = wealth.applyDecay();
      expect(wealth.value).toBe(1000);
      expect(decay).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = wealth.clone();
      expect(cloned.value).toBe(wealth.value);
      expect(cloned).toBeInstanceOf(Wealth);

      cloned.value = 2000;
      expect(wealth.value).toBe(1000);
      expect(cloned.value).toBe(2000);
    });

    it('should clone negative wealth', () => {
      wealth.value = -500;
      const cloned = wealth.clone();
      expect(cloned.value).toBe(-500);
    });
  });

  describe('wealth operations', () => {
    it('should increase from income', () => {
      wealth.value = 1000;
      wealth.increase(500);
      expect(wealth.value).toBe(1500);
    });

    it('should decrease from expenses', () => {
      wealth.value = 1000;
      wealth.decrease(300);
      expect(wealth.value).toBe(700);
    });

    it('should go negative (debt)', () => {
      wealth.value = 200;
      wealth.decrease(500);
      expect(wealth.value).toBe(-300);
      expect(wealth.isInDebt()).toBe(true);
    });

    it('should recover from debt', () => {
      wealth.value = -300;
      wealth.increase(500);
      expect(wealth.value).toBe(200);
      expect(wealth.isInDebt()).toBe(false);
    });

    it('should accumulate without limit', () => {
      wealth.value = 50000;
      wealth.increase(100000);
      expect(wealth.value).toBe(150000);
    });

    it('should handle large transactions', () => {
      const w = new Wealth(0);
      w.increase(10000);
      w.decrease(5000);
      w.increase(3000);
      w.decrease(2000);
      expect(w.value).toBe(6000);
    });
  });
});
