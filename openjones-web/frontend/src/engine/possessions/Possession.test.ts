import { describe, it, expect } from 'vitest';
import { Possession } from './Possession';
import { PossessionType, MeasureType } from '../../../../shared/types/contracts';

// Concrete test class since Possession is abstract
class TestPossession extends Possession {
  constructor(
    id: string,
    name: string,
    value: number,
    purchasePrice: number,
    effects: any[]
  ) {
    super(id, PossessionType.FOOD, name, value, purchasePrice, effects);
  }
}

describe('Possession', () => {
  it('should create possession with correct properties', () => {
    const possession = new TestPossession(
      'test-1',
      'Test Item',
      100,
      120,
      [{ measure: MeasureType.HAPPINESS, delta: 5 }]
    );

    expect(possession.id).toBe('test-1');
    expect(possession.type).toBe(PossessionType.FOOD);
    expect(possession.name).toBe('Test Item');
    expect(possession.value).toBe(100);
    expect(possession.purchasePrice).toBe(120);
    expect(possession.effects).toHaveLength(1);
  });

  it('should calculate depreciation correctly', () => {
    const possession = new TestPossession('test-1', 'Test', 80, 100, []);

    expect(possession.getDepreciation()).toBe(20);
    expect(possession.getDepreciationPercent()).toBe(20);
  });

  it('should detect effects on specific measures', () => {
    const possession = new TestPossession('test-1', 'Test', 100, 100, [
      { measure: MeasureType.HAPPINESS, delta: 10 },
      { measure: MeasureType.HEALTH, delta: 5 },
    ]);

    expect(possession.hasEffectOn(MeasureType.HAPPINESS)).toBe(true);
    expect(possession.hasEffectOn(MeasureType.HEALTH)).toBe(true);
    expect(possession.hasEffectOn(MeasureType.EDUCATION)).toBe(false);
  });

  it('should calculate effect deltas correctly', () => {
    const possession = new TestPossession('test-1', 'Test', 100, 100, [
      { measure: MeasureType.HAPPINESS, delta: 10 },
      { measure: MeasureType.HAPPINESS, delta: 5 },
    ]);

    expect(possession.getEffectDelta(MeasureType.HAPPINESS)).toBe(15);
    expect(possession.getEffectDelta(MeasureType.HEALTH)).toBe(0);
  });

  it('should generate correct string representation', () => {
    const possession = new TestPossession('test-1', 'Test Item', 100, 120, []);

    expect(possession.toString()).toBe('Test Item [FOOD] - $100');
  });

  it('should handle zero depreciation', () => {
    const possession = new TestPossession('test-1', 'Test', 100, 100, []);

    expect(possession.getDepreciation()).toBe(0);
    expect(possession.getDepreciationPercent()).toBe(0);
  });
});
