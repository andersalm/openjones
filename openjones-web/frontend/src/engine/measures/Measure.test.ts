/**
 * Unit tests for base Measure class
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Measure, MeasureConfig } from './Measure';
import { MeasureType } from '@shared/types/contracts';

// Concrete implementation for testing the abstract Measure class
class TestMeasure extends Measure {
  readonly type = MeasureType.HEALTH;
  readonly name = 'Test Measure';

  getStatus(): string {
    if (this._value >= 75) return 'Excellent';
    if (this._value >= 50) return 'Good';
    if (this._value >= 25) return 'Fair';
    return 'Poor';
  }

  clone(): TestMeasure {
    return new TestMeasure({
      initialValue: this._value,
      minValue: this.minValue,
      maxValue: this.maxValue,
      decayRate: this.decayRate,
    });
  }
}

describe('Measure (base class)', () => {
  let measure: TestMeasure;

  beforeEach(() => {
    measure = new TestMeasure({
      initialValue: 50,
      minValue: 0,
      maxValue: 100,
      decayRate: 5,
    });
  });

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      expect(measure.value).toBe(50);
    });

    it('should clamp initial value to max', () => {
      const m = new TestMeasure({
        initialValue: 150,
        minValue: 0,
        maxValue: 100,
      });
      expect(m.value).toBe(100);
    });

    it('should clamp initial value to min', () => {
      const m = new TestMeasure({
        initialValue: -10,
        minValue: 0,
        maxValue: 100,
      });
      expect(m.value).toBe(0);
    });

    it('should default decay rate to 0 if not provided', () => {
      const m = new TestMeasure({
        initialValue: 50,
        minValue: 0,
        maxValue: 100,
      });
      expect(m.applyDecay()).toBe(0);
    });
  });

  describe('value getter/setter', () => {
    it('should get current value', () => {
      expect(measure.value).toBe(50);
    });

    it('should set value with clamping', () => {
      measure.value = 75;
      expect(measure.value).toBe(75);
    });

    it('should clamp set value to max', () => {
      measure.value = 150;
      expect(measure.value).toBe(100);
    });

    it('should clamp set value to min', () => {
      measure.value = -10;
      expect(measure.value).toBe(0);
    });
  });

  describe('increase', () => {
    it('should increase value by amount', () => {
      const actualChange = measure.increase(20);
      expect(measure.value).toBe(70);
      expect(actualChange).toBe(20);
    });

    it('should not exceed maximum', () => {
      const actualChange = measure.increase(60);
      expect(measure.value).toBe(100);
      expect(actualChange).toBe(50); // Only increased by 50
    });

    it('should throw error for negative amount', () => {
      expect(() => measure.increase(-10)).toThrow('Cannot increase by negative amount');
    });

    it('should return 0 if already at max', () => {
      measure.value = 100;
      const actualChange = measure.increase(10);
      expect(measure.value).toBe(100);
      expect(actualChange).toBe(0);
    });
  });

  describe('decrease', () => {
    it('should decrease value by amount', () => {
      const actualChange = measure.decrease(20);
      expect(measure.value).toBe(30);
      expect(actualChange).toBe(20);
    });

    it('should not go below minimum', () => {
      const actualChange = measure.decrease(60);
      expect(measure.value).toBe(0);
      expect(actualChange).toBe(50); // Only decreased by 50
    });

    it('should throw error for negative amount', () => {
      expect(() => measure.decrease(-10)).toThrow('Cannot decrease by negative amount');
    });

    it('should return 0 if already at min', () => {
      measure.value = 0;
      const actualChange = measure.decrease(10);
      expect(measure.value).toBe(0);
      expect(actualChange).toBe(0);
    });
  });

  describe('update', () => {
    it('should update with positive delta', () => {
      const actualChange = measure.update(25);
      expect(measure.value).toBe(75);
      expect(actualChange).toBe(25);
    });

    it('should update with negative delta', () => {
      const actualChange = measure.update(-25);
      expect(measure.value).toBe(25);
      expect(actualChange).toBe(-25);
    });

    it('should clamp to max when positive', () => {
      const actualChange = measure.update(60);
      expect(measure.value).toBe(100);
      expect(actualChange).toBe(50);
    });

    it('should clamp to min when negative', () => {
      const actualChange = measure.update(-60);
      expect(measure.value).toBe(0);
      expect(actualChange).toBe(-50);
    });

    it('should handle zero delta', () => {
      const actualChange = measure.update(0);
      expect(measure.value).toBe(50);
      expect(actualChange).toBe(0);
    });
  });

  describe('applyDecay', () => {
    it('should apply decay rate', () => {
      const decayAmount = measure.applyDecay();
      expect(measure.value).toBe(45);
      expect(decayAmount).toBe(5);
    });

    it('should not decay below minimum', () => {
      measure.value = 3;
      const decayAmount = measure.applyDecay();
      expect(measure.value).toBe(0);
      expect(decayAmount).toBe(3);
    });

    it('should return 0 for measures without decay', () => {
      const m = new TestMeasure({
        initialValue: 50,
        minValue: 0,
        maxValue: 100,
        decayRate: 0,
      });
      const decayAmount = m.applyDecay();
      expect(m.value).toBe(50);
      expect(decayAmount).toBe(0);
    });
  });

  describe('status checks', () => {
    it('should identify when at max', () => {
      measure.value = 100;
      expect(measure.isAtMax()).toBe(true);
    });

    it('should identify when not at max', () => {
      measure.value = 99;
      expect(measure.isAtMax()).toBe(false);
    });

    it('should identify when at min', () => {
      measure.value = 0;
      expect(measure.isAtMin()).toBe(true);
    });

    it('should identify when not at min', () => {
      measure.value = 1;
      expect(measure.isAtMin()).toBe(false);
    });
  });

  describe('getPercentage', () => {
    it('should calculate percentage correctly', () => {
      measure.value = 50;
      expect(measure.getPercentage()).toBe(50);
    });

    it('should return 100 at max', () => {
      measure.value = 100;
      expect(measure.getPercentage()).toBe(100);
    });

    it('should return 0 at min', () => {
      measure.value = 0;
      expect(measure.getPercentage()).toBe(0);
    });

    it('should return 0 for infinite max', () => {
      const m = new TestMeasure({
        initialValue: 100,
        minValue: 0,
        maxValue: Number.POSITIVE_INFINITY,
      });
      expect(m.getPercentage()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to new initial value', () => {
      measure.value = 75;
      measure.reset(50);
      expect(measure.value).toBe(50);
    });

    it('should clamp reset value', () => {
      measure.reset(150);
      expect(measure.value).toBe(100);
    });
  });

  describe('getStatus', () => {
    it('should return correct status for different values', () => {
      measure.value = 90;
      expect(measure.getStatus()).toBe('Excellent');

      measure.value = 60;
      expect(measure.getStatus()).toBe('Good');

      measure.value = 40;
      expect(measure.getStatus()).toBe('Fair');

      measure.value = 10;
      expect(measure.getStatus()).toBe('Poor');
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = measure.clone();
      expect(cloned.value).toBe(measure.value);

      cloned.value = 75;
      expect(measure.value).toBe(50); // Original unchanged
      expect(cloned.value).toBe(75);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const json = measure.toJSON();
      expect(json).toEqual({
        type: MeasureType.HEALTH,
        value: 50,
        minValue: 0,
        maxValue: 100,
      });
    });
  });
});
