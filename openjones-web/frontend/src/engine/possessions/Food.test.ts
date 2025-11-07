/**
 * Unit tests for Food class
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { describe, it, expect } from 'vitest';
import { Food } from './Food';
import { PossessionType, MeasureType } from '@shared/types/contracts';

describe('Food', () => {
  describe('constructor', () => {
    it('should create food with correct properties', () => {
      const food = new Food(
        'Pizza',
        100,
        120,
        [{ measure: MeasureType.HAPPINESS, delta: 5 }],
        10
      );

      expect(food.id).toBe('food-pizza');
      expect(food.type).toBe(PossessionType.FOOD);
      expect(food.name).toBe('Pizza');
      expect(food.value).toBe(100);
      expect(food.purchasePrice).toBe(120);
      expect(food.spoilTime).toBe(10);
      expect(food.effects.length).toBe(1);
      expect(food.effects[0].measure).toBe(MeasureType.HAPPINESS);
      expect(food.effects[0].delta).toBe(5);
    });

    it('should handle multi-word food names', () => {
      const food = new Food('Fresh Bread', 50, 60, [], 5);
      expect(food.id).toBe('food-fresh-bread');
      expect(food.name).toBe('Fresh Bread');
    });

    it('should create food without spoil time', () => {
      const food = new Food('Canned Soup', 80, 90, []);
      expect(food.spoilTime).toBeUndefined();
    });

    it('should handle multiple effects', () => {
      const food = new Food(
        'Steak',
        200,
        250,
        [
          { measure: MeasureType.HEALTH, delta: 15 },
          { measure: MeasureType.HAPPINESS, delta: 10 },
        ],
        3
      );

      expect(food.effects.length).toBe(2);
    });

    it('should generate consistent IDs for same food name', () => {
      const food1 = new Food('Apple', 10, 12, [], 2);
      const food2 = new Food('Apple', 10, 12, [], 2);
      expect(food1.id).toBe(food2.id);
      expect(food1.id).toBe('food-apple');
    });
  });

  describe('isSpoiled', () => {
    it('should return false when food has not spoiled', () => {
      const food = new Food('Milk', 50, 60, [], 5);

      expect(food.isSpoiled(0)).toBe(false);
      expect(food.isSpoiled(1)).toBe(false);
      expect(food.isSpoiled(4)).toBe(false);
    });

    it('should return true when food has spoiled', () => {
      const food = new Food('Milk', 50, 60, [], 5);

      expect(food.isSpoiled(5)).toBe(true);
      expect(food.isSpoiled(6)).toBe(true);
      expect(food.isSpoiled(100)).toBe(true);
    });

    it('should handle edge case at exact spoil week', () => {
      const food = new Food('Yogurt', 30, 35, [], 7);

      expect(food.isSpoiled(6)).toBe(false);
      expect(food.isSpoiled(7)).toBe(true);
    });

    it('should return false for food without spoil time', () => {
      const food = new Food('Canned Food', 80, 90, []);

      expect(food.isSpoiled(0)).toBe(false);
      expect(food.isSpoiled(100)).toBe(false);
      expect(food.isSpoiled(1000)).toBe(false);
    });

    it('should handle spoil time of 0', () => {
      const food = new Food('Rotten Fruit', 1, 1, [], 0);

      expect(food.isSpoiled(0)).toBe(true);
      expect(food.isSpoiled(1)).toBe(true);
    });
  });

  describe('weeksUntilSpoiled', () => {
    it('should return correct weeks remaining', () => {
      const food = new Food('Cheese', 60, 70, [], 10);

      expect(food.weeksUntilSpoiled(0)).toBe(10);
      expect(food.weeksUntilSpoiled(5)).toBe(5);
      expect(food.weeksUntilSpoiled(9)).toBe(1);
    });

    it('should return 0 when food has already spoiled', () => {
      const food = new Food('Bread', 40, 45, [], 5);

      expect(food.weeksUntilSpoiled(5)).toBe(0);
      expect(food.weeksUntilSpoiled(10)).toBe(0);
    });

    it('should return undefined for non-spoiling food', () => {
      const food = new Food('Canned Beans', 70, 80, []);

      expect(food.weeksUntilSpoiled(0)).toBeUndefined();
      expect(food.weeksUntilSpoiled(100)).toBeUndefined();
    });

    it('should handle current week equal to spoil time', () => {
      const food = new Food('Salad', 50, 55, [], 3);

      expect(food.weeksUntilSpoiled(3)).toBe(0);
    });
  });

  describe('inheritance from Possession', () => {
    it('should properly inherit from Possession base class', () => {
      const food = new Food('Burger', 150, 180, [], 2);

      expect(food).toHaveProperty('id');
      expect(food).toHaveProperty('type');
      expect(food).toHaveProperty('name');
      expect(food).toHaveProperty('value');
      expect(food).toHaveProperty('purchasePrice');
      expect(food).toHaveProperty('effects');
      expect(food).toHaveProperty('spoilTime');
    });

    it('should have applyEffects method from base class', () => {
      const food = new Food('Salad', 80, 90, [], 1);
      expect(typeof food.applyEffects).toBe('function');
    });

    it('should have toJSON method from base class', () => {
      const food = new Food('Soup', 60, 70, [], 4);
      expect(typeof food.toJSON).toBe('function');

      const json = food.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('spoilTime');
    });
  });

  describe('edge cases', () => {
    it('should handle very large spoil times', () => {
      const food = new Food('Honey', 100, 110, [], 9999);

      expect(food.isSpoiled(9998)).toBe(false);
      expect(food.isSpoiled(9999)).toBe(true);
      expect(food.weeksUntilSpoiled(0)).toBe(9999);
    });

    it('should handle negative current week gracefully', () => {
      const food = new Food('Fruit', 30, 35, [], 5);

      // Even with negative week, should calculate correctly
      expect(food.weeksUntilSpoiled(-5)).toBe(10);
    });

    it('should handle empty food name', () => {
      const food = new Food('', 10, 12, [], 1);
      expect(food.id).toBe('food-');
      expect(food.name).toBe('');
    });

    it('should handle zero value and purchase price', () => {
      const food = new Food('Free Sample', 0, 0, [], 1);
      expect(food.value).toBe(0);
      expect(food.purchasePrice).toBe(0);
    });
  });
});
