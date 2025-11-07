import { describe, it, expect } from 'vitest';
import { Appliance } from './Appliance';
import { PossessionType, MeasureType } from '../../../../shared/types/contracts';

describe('Appliance', () => {
  it('should create appliance with correct properties', () => {
    const appliance = new Appliance('Television', 800, 1000, [
      { measure: MeasureType.HAPPINESS, delta: 20 },
    ]);

    expect(appliance.id).toBe('appliance-television');
    expect(appliance.type).toBe(PossessionType.APPLIANCE);
    expect(appliance.name).toBe('Television');
    expect(appliance.value).toBe(800);
    expect(appliance.purchasePrice).toBe(1000);
  });

  it('should generate ID from name correctly', () => {
    const appliance1 = new Appliance('Coffee Maker', 150, 180, []);
    const appliance2 = new Appliance('WASHING MACHINE', 600, 750, []);

    expect(appliance1.id).toBe('appliance-coffee-maker');
    expect(appliance2.id).toBe('appliance-washing-machine');
  });

  it('should not have spoilTime or clothesLevel', () => {
    const appliance = new Appliance('Microwave', 300, 350, []);

    expect(appliance.spoilTime).toBeUndefined();
    expect(appliance.clothesLevel).toBeUndefined();
  });

  it('should support multiple effects', () => {
    const effects = [
      { measure: MeasureType.HAPPINESS, delta: 15 },
      { measure: MeasureType.HEALTH, delta: 10 },
    ];
    const appliance = new Appliance('Air Conditioner', 1200, 1500, effects);

    expect(appliance.effects).toHaveLength(2);
    expect(appliance.hasEffectOn(MeasureType.HAPPINESS)).toBe(true);
    expect(appliance.hasEffectOn(MeasureType.HEALTH)).toBe(true);
  });

  it('should calculate depreciation', () => {
    const appliance = new Appliance('Refrigerator', 1000, 1500, []);

    expect(appliance.getDepreciation()).toBe(500);
    expect(appliance.getDepreciationPercent()).toBeCloseTo(33.33, 1);
  });

  it('should create appliance with no effects', () => {
    const appliance = new Appliance('Toaster', 50, 60, []);

    expect(appliance.effects).toHaveLength(0);
    expect(appliance.hasEffectOn(MeasureType.HAPPINESS)).toBe(false);
  });
});
