/**
 * Unit tests for Clothes class
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { describe, it, expect } from 'vitest';
import { Clothes } from './Clothes';
import { PossessionType, MeasureType } from '@shared/types/contracts';

describe('Clothes', () => {
  describe('constructor', () => {
    it('should create clothes with correct properties', () => {
      const clothes = new Clothes(
        'Business Suit',
        500,
        600,
        7,
        [{ measure: MeasureType.HAPPINESS, delta: 10 }]
      );

      expect(clothes.id).toBe('clothes-level-7-business-suit');
      expect(clothes.type).toBe(PossessionType.CLOTHES);
      expect(clothes.name).toBe('Business Suit');
      expect(clothes.value).toBe(500);
      expect(clothes.purchasePrice).toBe(600);
      expect(clothes.clothesLevel).toBe(7);
      expect(clothes.effects.length).toBe(1);
    });

    it('should handle multi-word clothing names', () => {
      const clothes = new Clothes('Winter Coat', 200, 250, 5, []);
      expect(clothes.id).toBe('clothes-level-5-winter-coat');
      expect(clothes.name).toBe('Winter Coat');
    });

    it('should create clothes at minimum level (1)', () => {
      const clothes = new Clothes('T-Shirt', 10, 15, 1, []);
      expect(clothes.clothesLevel).toBe(1);
      expect(clothes.id).toBe('clothes-level-1-t-shirt');
    });

    it('should create clothes at maximum level (9)', () => {
      const clothes = new Clothes('Designer Tuxedo', 2000, 2500, 9, []);
      expect(clothes.clothesLevel).toBe(9);
      expect(clothes.id).toBe('clothes-level-9-designer-tuxedo');
    });

    it('should throw error for level below 1', () => {
      expect(() => {
        new Clothes('Invalid', 10, 10, 0, []);
      }).toThrow('Clothes level must be between 1 and 9');
    });

    it('should throw error for level above 9', () => {
      expect(() => {
        new Clothes('Invalid', 10, 10, 10, []);
      }).toThrow('Clothes level must be between 1 and 9');
    });

    it('should throw error for negative level', () => {
      expect(() => {
        new Clothes('Invalid', 10, 10, -1, []);
      }).toThrow('Clothes level must be between 1 and 9');
    });

    it('should handle multiple effects', () => {
      const clothes = new Clothes(
        'Casual Outfit',
        100,
        120,
        3,
        [
          { measure: MeasureType.HAPPINESS, delta: 5 },
          { measure: MeasureType.CAREER, delta: 2 },
        ]
      );

      expect(clothes.effects.length).toBe(2);
    });
  });

  describe('getQualityDescription', () => {
    it('should return "Luxury" for level 8-9', () => {
      const clothes8 = new Clothes('Suit', 1000, 1200, 8, []);
      const clothes9 = new Clothes('Tux', 2000, 2400, 9, []);

      expect(clothes8.getQualityDescription()).toBe('Luxury');
      expect(clothes9.getQualityDescription()).toBe('Luxury');
    });

    it('should return "Professional" for level 6-7', () => {
      const clothes6 = new Clothes('Blazer', 400, 450, 6, []);
      const clothes7 = new Clothes('Dress', 600, 700, 7, []);

      expect(clothes6.getQualityDescription()).toBe('Professional');
      expect(clothes7.getQualityDescription()).toBe('Professional');
    });

    it('should return "Casual" for level 4-5', () => {
      const clothes4 = new Clothes('Jeans', 80, 100, 4, []);
      const clothes5 = new Clothes('Sweater', 120, 140, 5, []);

      expect(clothes4.getQualityDescription()).toBe('Casual');
      expect(clothes5.getQualityDescription()).toBe('Casual');
    });

    it('should return "Basic" for level 2-3', () => {
      const clothes2 = new Clothes('Shirt', 30, 35, 2, []);
      const clothes3 = new Clothes('Pants', 50, 60, 3, []);

      expect(clothes2.getQualityDescription()).toBe('Basic');
      expect(clothes3.getQualityDescription()).toBe('Basic');
    });

    it('should return "Poor" for level 1', () => {
      const clothes1 = new Clothes('Worn Clothes', 5, 10, 1, []);

      expect(clothes1.getQualityDescription()).toBe('Poor');
    });
  });

  describe('inheritance from Possession', () => {
    it('should properly inherit from Possession base class', () => {
      const clothes = new Clothes('Jacket', 150, 180, 4, []);

      expect(clothes).toHaveProperty('id');
      expect(clothes).toHaveProperty('type');
      expect(clothes).toHaveProperty('name');
      expect(clothes).toHaveProperty('value');
      expect(clothes).toHaveProperty('purchasePrice');
      expect(clothes).toHaveProperty('effects');
      expect(clothes).toHaveProperty('clothesLevel');
    });

    it('should have applyEffects method from base class', () => {
      const clothes = new Clothes('Shirt', 50, 60, 2, []);
      expect(typeof clothes.applyEffects).toBe('function');
    });

    it('should have toJSON method from base class', () => {
      const clothes = new Clothes('Dress', 200, 250, 6, []);
      expect(typeof clothes.toJSON).toBe('function');

      const json = clothes.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('clothesLevel');
    });
  });

  describe('ID generation', () => {
    it('should generate unique IDs based on level and name', () => {
      const clothes1 = new Clothes('Suit', 500, 600, 5, []);
      const clothes2 = new Clothes('Suit', 500, 600, 7, []);

      expect(clothes1.id).toBe('clothes-level-5-suit');
      expect(clothes2.id).toBe('clothes-level-7-suit');
      expect(clothes1.id).not.toBe(clothes2.id);
    });

    it('should handle names with special characters', () => {
      const clothes = new Clothes('T-Shirt & Jeans', 60, 70, 3, []);
      expect(clothes.id).toBe('clothes-level-3-t-shirt-&-jeans');
    });

    it('should handle names with multiple spaces', () => {
      const clothes = new Clothes('Designer   Evening   Gown', 1000, 1200, 8, []);
      expect(clothes.id).toBe('clothes-level-8-designer-evening-gown');
    });
  });

  describe('realistic scenarios', () => {
    it('should create entry-level work clothes', () => {
      const clothes = new Clothes('Basic Slacks', 40, 50, 2, []);

      expect(clothes.clothesLevel).toBe(2);
      expect(clothes.getQualityDescription()).toBe('Basic');
      expect(clothes.type).toBe(PossessionType.CLOTHES);
    });

    it('should create professional business attire', () => {
      const clothes = new Clothes(
        'Business Suit',
        400,
        500,
        7,
        [
          { measure: MeasureType.HAPPINESS, delta: 8 },
          { measure: MeasureType.CAREER, delta: 5 },
        ]
      );

      expect(clothes.clothesLevel).toBe(7);
      expect(clothes.getQualityDescription()).toBe('Professional');
      expect(clothes.effects.length).toBe(2);
    });

    it('should create luxury formal wear', () => {
      const clothes = new Clothes('Designer Gown', 3000, 3500, 9, [
        { measure: MeasureType.HAPPINESS, delta: 20 },
      ]);

      expect(clothes.clothesLevel).toBe(9);
      expect(clothes.getQualityDescription()).toBe('Luxury');
    });
  });

  describe('edge cases', () => {
    it('should handle zero value and purchase price', () => {
      const clothes = new Clothes('Free Shirt', 0, 0, 1, []);
      expect(clothes.value).toBe(0);
      expect(clothes.purchasePrice).toBe(0);
    });

    it('should handle empty effects array', () => {
      const clothes = new Clothes('Plain Clothes', 50, 60, 3, []);
      expect(clothes.effects).toEqual([]);
      expect(clothes.effects.length).toBe(0);
    });

    it('should handle very high values', () => {
      const clothes = new Clothes('Rare Vintage', 100000, 120000, 9, []);
      expect(clothes.value).toBe(100000);
      expect(clothes.purchasePrice).toBe(120000);
    });
  });
});
