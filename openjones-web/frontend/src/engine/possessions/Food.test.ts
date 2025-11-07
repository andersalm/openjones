import { describe, it, expect } from 'vitest';
import { Food } from './Food';
import { PossessionType, MeasureType } from '../../../../shared/types/contracts';

describe('Food', () => {
  it('should create food with correct properties', () => {
    const food = new Food('Pizza', 100, 120, [
      { measure: MeasureType.HAPPINESS, delta: 5 },
    ], 10);

    expect(food.id).toBe('food-pizza');
    expect(food.type).toBe(PossessionType.FOOD);
    expect(food.name).toBe('Pizza');
    expect(food.value).toBe(100);
    expect(food.purchasePrice).toBe(120);
    expect(food.spoilTime).toBe(10);
  });

  it('should detect spoilage correctly', () => {
    const food = new Food('Milk', 50, 60, [], 5);

    expect(food.isSpoiled(4)).toBe(false);
    expect(food.isSpoiled(5)).toBe(true);
    expect(food.isSpoiled(6)).toBe(true);
  });

  it('should handle food without spoil time', () => {
    const food = new Food('Canned Food', 80, 90, []);

    expect(food.spoilTime).toBeUndefined();
    expect(food.isSpoiled(100)).toBe(false);
  });

  it('should calculate weeks until spoilage', () => {
    const food = new Food('Bread', 30, 35, [], 8);

    expect(food.weeksUntilSpoilage(5)).toBe(3);
    expect(food.weeksUntilSpoilage(8)).toBe(0);
    expect(food.weeksUntilSpoilage(10)).toBe(0);
  });

  it('should return Infinity for non-spoiling food', () => {
    const food = new Food('Honey', 50, 55, []);

    expect(food.weeksUntilSpoilage(100)).toBe(Infinity);
  });

  it('should generate ID from name correctly', () => {
    const food1 = new Food('Fresh Bread', 40, 45, [], 3);
    const food2 = new Food('PIZZA SLICE', 25, 30, [], 5);

    expect(food1.id).toBe('food-fresh-bread');
    expect(food2.id).toBe('food-pizza-slice');
  });

  it('should preserve effects', () => {
    const effects = [
      { measure: MeasureType.HAPPINESS, delta: 10 },
      { measure: MeasureType.HEALTH, delta: 5 },
    ];
    const food = new Food('Salad', 60, 70, effects, 2);

    expect(food.effects).toHaveLength(2);
    expect(food.hasEffectOn(MeasureType.HAPPINESS)).toBe(true);
    expect(food.hasEffectOn(MeasureType.HEALTH)).toBe(true);
  });
});
