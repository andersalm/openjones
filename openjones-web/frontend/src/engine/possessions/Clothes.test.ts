import { describe, it, expect } from 'vitest';
import { Clothes } from './Clothes';
import { PossessionType, MeasureType } from '../../../../shared/types/contracts';

describe('Clothes', () => {
  it('should create clothes with correct properties', () => {
    const clothes = new Clothes('Business Suit', 500, 600, 5, [
      { measure: MeasureType.HAPPINESS, delta: 10 },
    ]);

    expect(clothes.id).toBe('clothes-business-suit');
    expect(clothes.type).toBe(PossessionType.CLOTHES);
    expect(clothes.name).toBe('Business Suit');
    expect(clothes.value).toBe(500);
    expect(clothes.purchasePrice).toBe(600);
    expect(clothes.clothesLevel).toBe(5);
  });

  it('should return correct clothes level', () => {
    const clothes = new Clothes('Fancy Suit', 800, 1000, 7, []);

    expect(clothes.getLevel()).toBe(7);
  });

  it('should check if clothes meet requirement', () => {
    const clothes = new Clothes('Office Wear', 300, 350, 4, []);

    expect(clothes.meetsRequirement(3)).toBe(true);
    expect(clothes.meetsRequirement(4)).toBe(true);
    expect(clothes.meetsRequirement(5)).toBe(false);
  });

  it('should handle clothes with no level set', () => {
    const clothes = new Clothes('Basic Shirt', 50, 60, 0, []);

    expect(clothes.getLevel()).toBe(0);
    expect(clothes.meetsRequirement(0)).toBe(true);
    expect(clothes.meetsRequirement(1)).toBe(false);
  });

  it('should generate ID from name correctly', () => {
    const clothes1 = new Clothes('Designer Jacket', 1200, 1500, 8, []);
    const clothes2 = new Clothes('CASUAL WEAR', 150, 180, 2, []);

    expect(clothes1.id).toBe('clothes-designer-jacket');
    expect(clothes2.id).toBe('clothes-casual-wear');
  });

  it('should not have spoilTime', () => {
    const clothes = new Clothes('Shoes', 200, 250, 3, []);

    expect(clothes.spoilTime).toBeUndefined();
  });

  it('should preserve effects', () => {
    const effects = [
      { measure: MeasureType.HAPPINESS, delta: 15 },
      { measure: MeasureType.CAREER, delta: 5 },
    ];
    const clothes = new Clothes('Executive Suit', 1000, 1200, 9, effects);

    expect(clothes.effects).toHaveLength(2);
    expect(clothes.hasEffectOn(MeasureType.HAPPINESS)).toBe(true);
    expect(clothes.hasEffectOn(MeasureType.CAREER)).toBe(true);
  });
});
