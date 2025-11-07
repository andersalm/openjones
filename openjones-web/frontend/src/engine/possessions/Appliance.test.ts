/**
 * Unit tests for Appliance class
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { describe, it, expect } from 'vitest';
import { Appliance } from './Appliance';
import { PossessionType, MeasureType } from '@shared/types/contracts';

describe('Appliance', () => {
  describe('constructor', () => {
    it('should create appliance with correct properties', () => {
      const appliance = new Appliance('Television', 500, 600, [
        { measure: MeasureType.HAPPINESS, delta: 10 },
      ]);

      expect(appliance.id).toBe('appliance-television');
      expect(appliance.type).toBe(PossessionType.APPLIANCE);
      expect(appliance.name).toBe('Television');
      expect(appliance.value).toBe(500);
      expect(appliance.purchasePrice).toBe(600);
      expect(appliance.effects.length).toBe(1);
      expect(appliance.effects[0].measure).toBe(MeasureType.HAPPINESS);
      expect(appliance.effects[0].delta).toBe(10);
    });

    it('should handle multi-word appliance names', () => {
      const appliance = new Appliance('Washing Machine', 800, 900, []);
      expect(appliance.id).toBe('appliance-washing-machine');
      expect(appliance.name).toBe('Washing Machine');
    });

    it('should create appliance with no effects', () => {
      const appliance = new Appliance('Refrigerator', 1000, 1200, []);
      expect(appliance.effects).toEqual([]);
      expect(appliance.effects.length).toBe(0);
    });

    it('should handle multiple effects', () => {
      const appliance = new Appliance(
        'Home Theater System',
        2000,
        2400,
        [
          { measure: MeasureType.HAPPINESS, delta: 20 },
          { measure: MeasureType.HEALTH, delta: -2 },
        ]
      );

      expect(appliance.effects.length).toBe(2);
    });

    it('should generate consistent IDs for same appliance name', () => {
      const appliance1 = new Appliance('Microwave', 200, 250, []);
      const appliance2 = new Appliance('Microwave', 200, 250, []);
      expect(appliance1.id).toBe(appliance2.id);
      expect(appliance1.id).toBe('appliance-microwave');
    });
  });

  describe('getDepreciatedValue', () => {
    it('should calculate depreciated value correctly', () => {
      const appliance = new Appliance('TV', 1000, 1200, []);

      // After 1 week with 2% depreciation rate
      const value1 = appliance.getDepreciatedValue(1, 0.02);
      expect(value1).toBeCloseTo(980, 2);

      // After 10 weeks with 2% depreciation rate
      const value10 = appliance.getDepreciatedValue(10, 0.02);
      expect(value10).toBeCloseTo(817.07, 2);
    });

    it('should use default depreciation rate of 2% when not specified', () => {
      const appliance = new Appliance('Laptop', 1000, 1200, []);

      const value1 = appliance.getDepreciatedValue(1);
      expect(value1).toBeCloseTo(980, 2);
    });

    it('should return original value when weeks owned is 0', () => {
      const appliance = new Appliance('Blender', 100, 120, []);

      const value = appliance.getDepreciatedValue(0);
      expect(value).toBe(100);
    });

    it('should handle different depreciation rates', () => {
      const appliance = new Appliance('Computer', 2000, 2400, []);

      // 5% depreciation rate (faster depreciation)
      const value5pct = appliance.getDepreciatedValue(10, 0.05);
      expect(value5pct).toBeCloseTo(1197.47, 2);

      // 1% depreciation rate (slower depreciation)
      const value1pct = appliance.getDepreciatedValue(10, 0.01);
      expect(value1pct).toBeCloseTo(1808.76, 2);
    });

    it('should never go below 0', () => {
      const appliance = new Appliance('Old TV', 100, 120, []);

      // With many weeks and high depreciation, should bottom out at 0
      const value = appliance.getDepreciatedValue(1000, 0.1);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeCloseTo(0, 5);
    });

    it('should handle 0% depreciation', () => {
      const appliance = new Appliance('Artwork', 5000, 6000, []);

      const value = appliance.getDepreciatedValue(100, 0);
      expect(value).toBe(5000);
    });

    it('should handle fractional weeks', () => {
      const appliance = new Appliance('Phone', 800, 900, []);

      const value = appliance.getDepreciatedValue(0.5, 0.02);
      expect(value).toBeCloseTo(792, 1);
    });
  });

  describe('inheritance from Possession', () => {
    it('should properly inherit from Possession base class', () => {
      const appliance = new Appliance('Dishwasher', 600, 700, []);

      expect(appliance).toHaveProperty('id');
      expect(appliance).toHaveProperty('type');
      expect(appliance).toHaveProperty('name');
      expect(appliance).toHaveProperty('value');
      expect(appliance).toHaveProperty('purchasePrice');
      expect(appliance).toHaveProperty('effects');
    });

    it('should have applyEffects method from base class', () => {
      const appliance = new Appliance('Air Conditioner', 1200, 1400, []);
      expect(typeof appliance.applyEffects).toBe('function');
    });

    it('should have toJSON method from base class', () => {
      const appliance = new Appliance('Stove', 900, 1000, []);
      expect(typeof appliance.toJSON).toBe('function');

      const json = appliance.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('type');
    });
  });

  describe('realistic scenarios', () => {
    it('should create basic home appliance (TV)', () => {
      const tv = new Appliance('32-inch TV', 400, 500, [
        { measure: MeasureType.HAPPINESS, delta: 8 },
      ]);

      expect(tv.type).toBe(PossessionType.APPLIANCE);
      expect(tv.value).toBe(400);
      expect(tv.effects.length).toBe(1);
    });

    it('should create luxury appliance (Home Theater)', () => {
      const theater = new Appliance('Home Theater System', 3000, 3600, [
        { measure: MeasureType.HAPPINESS, delta: 25 },
      ]);

      expect(theater.value).toBe(3000);
      expect(theater.effects[0].delta).toBe(25);
    });

    it('should create utility appliance (Washing Machine)', () => {
      const washer = new Appliance('Washing Machine', 800, 950, [
        { measure: MeasureType.HAPPINESS, delta: 5 },
      ]);

      expect(washer.name).toBe('Washing Machine');
      expect(washer.id).toBe('appliance-washing-machine');
    });
  });

  describe('ID generation', () => {
    it('should generate IDs with lowercase and hyphens', () => {
      const appliance = new Appliance('Gaming Console', 500, 600, []);
      expect(appliance.id).toBe('appliance-gaming-console');
    });

    it('should handle names with special characters', () => {
      const appliance = new Appliance('TV & Sound System', 1500, 1800, []);
      expect(appliance.id).toBe('appliance-tv-&-sound-system');
    });

    it('should handle multiple spaces', () => {
      const appliance = new Appliance('High   End   Refrigerator', 2000, 2400, []);
      expect(appliance.id).toBe('appliance-high-end-refrigerator');
    });
  });

  describe('edge cases', () => {
    it('should handle zero value and purchase price', () => {
      const appliance = new Appliance('Broken TV', 0, 0, []);
      expect(appliance.value).toBe(0);
      expect(appliance.purchasePrice).toBe(0);
    });

    it('should handle very high values', () => {
      const appliance = new Appliance('Industrial Equipment', 50000, 60000, []);
      expect(appliance.value).toBe(50000);
      expect(appliance.purchasePrice).toBe(60000);
    });

    it('should handle negative effects', () => {
      const appliance = new Appliance('Noisy Generator', 300, 350, [
        { measure: MeasureType.HAPPINESS, delta: -5 },
      ]);

      expect(appliance.effects[0].delta).toBe(-5);
    });

    it('should handle effects with duration', () => {
      const appliance = new Appliance('Space Heater', 150, 180, [
        { measure: MeasureType.HAPPINESS, delta: 3, duration: 50 },
      ]);

      expect(appliance.effects[0].duration).toBe(50);
    });

    it('should calculate depreciation for 0 initial value', () => {
      const appliance = new Appliance('Worthless Item', 0, 100, []);
      const depreciated = appliance.getDepreciatedValue(10);
      expect(depreciated).toBe(0);
    });
  });
});
