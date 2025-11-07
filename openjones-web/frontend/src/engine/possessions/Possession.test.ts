/**
 * Unit tests for Possession base class
 *
 * Part of Task B5: Possessions System
 * Worker 1 - Possessions Implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { Possession } from './Possession';
import {
  PossessionType,
  MeasureType,
  IPossessionEffect,
  IPlayerState,
} from '@shared/types/contracts';

// Create a concrete test implementation of the abstract Possession class
class TestPossession extends Possession {
  constructor(
    id: string,
    type: PossessionType,
    name: string,
    value: number,
    purchasePrice: number,
    effects: IPossessionEffect[]
  ) {
    super(id, type, name, value, purchasePrice, effects);
  }
}

describe('Possession', () => {
  describe('constructor', () => {
    it('should create a possession with correct properties', () => {
      const effects: IPossessionEffect[] = [
        { measure: MeasureType.HAPPINESS, delta: 5 },
        { measure: MeasureType.HEALTH, delta: 10, duration: 100 },
      ];

      const possession = new TestPossession(
        'test-id',
        PossessionType.FOOD,
        'Test Item',
        100,
        120,
        effects
      );

      expect(possession.id).toBe('test-id');
      expect(possession.type).toBe(PossessionType.FOOD);
      expect(possession.name).toBe('Test Item');
      expect(possession.value).toBe(100);
      expect(possession.purchasePrice).toBe(120);
      expect(possession.effects).toEqual(effects);
    });

    it('should create a possession with no effects', () => {
      const possession = new TestPossession(
        'test-id-2',
        PossessionType.STOCK,
        'Stock Item',
        500,
        500,
        []
      );

      expect(possession.effects).toEqual([]);
      expect(possession.effects.length).toBe(0);
    });
  });

  describe('applyEffects', () => {
    it('should apply all effects to player state', () => {
      const effects: IPossessionEffect[] = [
        { measure: MeasureType.HAPPINESS, delta: 5 },
        { measure: MeasureType.HEALTH, delta: 10 },
        { measure: MeasureType.EDUCATION, delta: -2 },
      ];

      const possession = new TestPossession(
        'test-id',
        PossessionType.FOOD,
        'Test Item',
        100,
        120,
        effects
      );

      const mockPlayer = {
        updateMeasure: vi.fn(),
      } as unknown as IPlayerState;

      possession.applyEffects(mockPlayer);

      expect(mockPlayer.updateMeasure).toHaveBeenCalledTimes(3);
      expect(mockPlayer.updateMeasure).toHaveBeenCalledWith(MeasureType.HAPPINESS, 5);
      expect(mockPlayer.updateMeasure).toHaveBeenCalledWith(MeasureType.HEALTH, 10);
      expect(mockPlayer.updateMeasure).toHaveBeenCalledWith(MeasureType.EDUCATION, -2);
    });

    it('should handle possession with no effects', () => {
      const possession = new TestPossession(
        'test-id',
        PossessionType.STOCK,
        'Stock Item',
        500,
        500,
        []
      );

      const mockPlayer = {
        updateMeasure: vi.fn(),
      } as unknown as IPlayerState;

      possession.applyEffects(mockPlayer);

      expect(mockPlayer.updateMeasure).not.toHaveBeenCalled();
    });

    it('should apply effects with duration', () => {
      const effects: IPossessionEffect[] = [
        { measure: MeasureType.HAPPINESS, delta: 5, duration: 100 },
      ];

      const possession = new TestPossession(
        'test-id',
        PossessionType.APPLIANCE,
        'TV',
        300,
        350,
        effects
      );

      const mockPlayer = {
        updateMeasure: vi.fn(),
      } as unknown as IPlayerState;

      possession.applyEffects(mockPlayer);

      expect(mockPlayer.updateMeasure).toHaveBeenCalledWith(MeasureType.HAPPINESS, 5);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const effects: IPossessionEffect[] = [
        { measure: MeasureType.HAPPINESS, delta: 5 },
      ];

      const possession = new TestPossession(
        'test-id',
        PossessionType.FOOD,
        'Pizza',
        100,
        120,
        effects
      );

      const json = possession.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        type: PossessionType.FOOD,
        name: 'Pizza',
        value: 100,
        purchasePrice: 120,
        effects: effects,
        spoilTime: undefined,
        clothesLevel: undefined,
      });
    });
  });

  describe('type safety', () => {
    it('should maintain correct types for all possession types', () => {
      const foodPossession = new TestPossession(
        'food-1',
        PossessionType.FOOD,
        'Food',
        10,
        10,
        []
      );
      expect(foodPossession.type).toBe(PossessionType.FOOD);

      const clothesPossession = new TestPossession(
        'clothes-1',
        PossessionType.CLOTHES,
        'Clothes',
        50,
        50,
        []
      );
      expect(clothesPossession.type).toBe(PossessionType.CLOTHES);

      const appliancePossession = new TestPossession(
        'appliance-1',
        PossessionType.APPLIANCE,
        'Appliance',
        200,
        200,
        []
      );
      expect(appliancePossession.type).toBe(PossessionType.APPLIANCE);

      const stockPossession = new TestPossession(
        'stock-1',
        PossessionType.STOCK,
        'Stock',
        1000,
        1000,
        []
      );
      expect(stockPossession.type).toBe(PossessionType.STOCK);
    });
  });
});
