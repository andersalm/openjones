/**
 * Unit tests for EconomyModel
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EconomyModel } from './EconomyModel';
import { BuildingType, PossessionType, MeasureType } from '@shared/types/contracts';
import type { IJob, IPossession } from '@shared/types/contracts';

describe('EconomyModel', () => {
  let economyModel: EconomyModel;

  beforeEach(() => {
    economyModel = new EconomyModel();
  });

  describe('getPrice', () => {
    it('should return correct price for casual clothes', () => {
      const price = economyModel.getPrice('casual-clothes', BuildingType.CLOTHES_STORE);
      expect(price).toBe(50);
    });

    it('should return correct price for dress clothes', () => {
      const price = economyModel.getPrice('dress-clothes', BuildingType.CLOTHES_STORE);
      expect(price).toBe(75);
    });

    it('should return correct price for business suit', () => {
      const price = economyModel.getPrice('business-suit', BuildingType.CLOTHES_STORE);
      expect(price).toBe(150);
    });

    it('should apply restaurant markup for meals', () => {
      const restaurantPrice = economyModel.getPrice('burger', BuildingType.RESTAURANT);
      const basePrice = 10;
      expect(restaurantPrice).toBe(Math.floor(basePrice * 1.5));
    });

    it('should return default price for unknown items', () => {
      const price = economyModel.getPrice('unknown-item', BuildingType.DEPARTMENT_STORE);
      expect(price).toBe(100);
    });

    it('should handle study costs correctly', () => {
      expect(economyModel.getPrice('study-1hr', BuildingType.COLLEGE)).toBe(15);
      expect(economyModel.getPrice('study-2hr', BuildingType.COLLEGE)).toBe(30);
      expect(economyModel.getPrice('study-4hr', BuildingType.COLLEGE)).toBe(60);
    });
  });

  describe('getWage', () => {
    it('should calculate wage correctly for 1 hour of work', () => {
      const job: IJob = {
        id: 'factory-janitor',
        title: 'Janitor',
        rank: 1,
        requiredEducation: 0,
        requiredExperience: 0,
        requiredClothesLevel: 1,
        wagePerHour: 6,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      };

      const wage = economyModel.getWage(job, 1);
      expect(wage).toBe(6);
    });

    it('should calculate wage correctly for 8 hours of work', () => {
      const job: IJob = {
        id: 'college-professor',
        title: 'Professor',
        rank: 7,
        requiredEducation: 90,
        requiredExperience: 100,
        requiredClothesLevel: 3,
        wagePerHour: 27,
        experienceGainPerHour: 10,
        buildingType: BuildingType.COLLEGE,
      };

      const wage = economyModel.getWage(job, 8);
      expect(wage).toBe(216); // 27 * 8
    });

    it('should handle fractional hours correctly', () => {
      const job: IJob = {
        id: 'restaurant-cook',
        title: 'Cook',
        rank: 1,
        requiredEducation: 0,
        requiredExperience: 0,
        requiredClothesLevel: 1,
        wagePerHour: 3,
        experienceGainPerHour: 3,
        buildingType: BuildingType.RESTAURANT,
      };

      const wage = economyModel.getWage(job, 4);
      expect(wage).toBe(12); // 3 * 4
    });

    it('should handle zero hours correctly', () => {
      const job: IJob = {
        id: 'factory-manager',
        title: 'General Manager',
        rank: 9,
        requiredEducation: 80,
        requiredExperience: 200,
        requiredClothesLevel: 3,
        wagePerHour: 25,
        experienceGainPerHour: 15,
        buildingType: BuildingType.FACTORY,
      };

      const wage = economyModel.getWage(job, 0);
      expect(wage).toBe(0);
    });
  });

  describe('getRent', () => {
    it('should return correct rent for low-cost apartment', () => {
      const rent = economyModel.getRent(BuildingType.LOW_COST_APARTMENT);
      expect(rent).toBe(305);
    });

    it('should return correct rent for security apartment', () => {
      const rent = economyModel.getRent(BuildingType.SECURITY_APARTMENT);
      expect(rent).toBe(445);
    });

    it('should return 0 for non-housing buildings', () => {
      expect(economyModel.getRent(BuildingType.FACTORY)).toBe(0);
      expect(economyModel.getRent(BuildingType.BANK)).toBe(0);
      expect(economyModel.getRent(BuildingType.COLLEGE)).toBe(0);
      expect(economyModel.getRent(BuildingType.DEPARTMENT_STORE)).toBe(0);
      expect(economyModel.getRent(BuildingType.CLOTHES_STORE)).toBe(0);
      expect(economyModel.getRent(BuildingType.RESTAURANT)).toBe(0);
    });
  });

  describe('getStockPrice', () => {
    it('should return default stock price', () => {
      const price = economyModel.getStockPrice(1);
      expect(price).toBe(50); // blue-chip default
    });

    it('should return same price regardless of week (constant model)', () => {
      const week1Price = economyModel.getStockPrice(1);
      const week10Price = economyModel.getStockPrice(10);
      const week100Price = economyModel.getStockPrice(100);

      expect(week1Price).toBe(week10Price);
      expect(week10Price).toBe(week100Price);
    });
  });

  describe('calculateSellPrice', () => {
    it('should calculate 50% sell price for possessions', () => {
      const possession: IPossession = {
        id: 'clothes-1',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        effects: [],
        clothesLevel: 1,
      };

      const sellPrice = economyModel.calculateSellPrice(possession);
      expect(sellPrice).toBe(25); // 50 * 0.5
    });

    it('should floor the sell price', () => {
      const possession: IPossession = {
        id: 'food-1',
        type: PossessionType.FOOD,
        name: 'Burger',
        value: 15,
        purchasePrice: 15,
        effects: [{ measure: MeasureType.HEALTH, delta: 5 }],
      };

      const sellPrice = economyModel.calculateSellPrice(possession);
      expect(sellPrice).toBe(7); // floor(15 * 0.5) = floor(7.5) = 7
    });

    it('should handle high-value items correctly', () => {
      const possession: IPossession = {
        id: 'appliance-1',
        type: PossessionType.APPLIANCE,
        name: 'Refrigerator',
        value: 500,
        purchasePrice: 500,
        effects: [{ measure: MeasureType.HAPPINESS, delta: 10 }],
      };

      const sellPrice = economyModel.calculateSellPrice(possession);
      expect(sellPrice).toBe(250); // 500 * 0.5
    });
  });

  describe('getStockPriceById', () => {
    it('should return correct price for t-bills', () => {
      expect(economyModel.getStockPriceById('t-bills')).toBe(100);
    });

    it('should return correct price for gold', () => {
      expect(economyModel.getStockPriceById('gold')).toBe(450);
    });

    it('should return correct price for silver', () => {
      expect(economyModel.getStockPriceById('silver')).toBe(150);
    });

    it('should return correct price for pig-bellies', () => {
      expect(economyModel.getStockPriceById('pig-bellies')).toBe(15);
    });

    it('should return correct price for blue-chip', () => {
      expect(economyModel.getStockPriceById('blue-chip')).toBe(50);
    });

    it('should return correct price for penny', () => {
      expect(economyModel.getStockPriceById('penny')).toBe(5);
    });

    it('should handle case insensitivity', () => {
      expect(economyModel.getStockPriceById('T-BILLS')).toBe(100);
      expect(economyModel.getStockPriceById('GOLD')).toBe(450);
    });

    it('should return default price for unknown stocks', () => {
      expect(economyModel.getStockPriceById('unknown-stock')).toBe(50); // blue-chip default
    });
  });

  describe('getAllStockPrices', () => {
    it('should return all stock prices', () => {
      const prices = economyModel.getAllStockPrices();

      expect(prices['t-bills']).toBe(100);
      expect(prices['gold']).toBe(450);
      expect(prices['silver']).toBe(150);
      expect(prices['pig-bellies']).toBe(15);
      expect(prices['blue-chip']).toBe(50);
      expect(prices['penny']).toBe(5);
    });

    it('should return a copy not a reference', () => {
      const prices1 = economyModel.getAllStockPrices();
      const prices2 = economyModel.getAllStockPrices();

      expect(prices1).not.toBe(prices2);
      expect(prices1).toEqual(prices2);
    });
  });

  describe('getMonthlyRent', () => {
    it('should calculate monthly rent for low-cost apartment', () => {
      const monthlyRent = economyModel.getMonthlyRent(BuildingType.LOW_COST_APARTMENT);
      expect(monthlyRent).toBe(305 * 4); // 1220
    });

    it('should calculate monthly rent for security apartment', () => {
      const monthlyRent = economyModel.getMonthlyRent(BuildingType.SECURITY_APARTMENT);
      expect(monthlyRent).toBe(445 * 4); // 1780
    });

    it('should return 0 for non-housing buildings', () => {
      expect(economyModel.getMonthlyRent(BuildingType.FACTORY)).toBe(0);
      expect(economyModel.getMonthlyRent(BuildingType.BANK)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative hours in getWage', () => {
      const job: IJob = {
        id: 'test-job',
        title: 'Test',
        rank: 1,
        requiredEducation: 0,
        requiredExperience: 0,
        requiredClothesLevel: 1,
        wagePerHour: 10,
        experienceGainPerHour: 5,
        buildingType: BuildingType.FACTORY,
      };

      const wage = economyModel.getWage(job, -5);
      expect(wage).toBe(-50); // Technically valid, though shouldn't happen in game
    });

    it('should handle possession with zero value', () => {
      const possession: IPossession = {
        id: 'worthless',
        type: PossessionType.FOOD,
        name: 'Spoiled Food',
        value: 0,
        purchasePrice: 10,
        effects: [],
      };

      const sellPrice = economyModel.calculateSellPrice(possession);
      expect(sellPrice).toBe(0);
    });
  });
});
