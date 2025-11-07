/**
 * Unit tests for PlayerState class
 *
 * Part of Task A3: Player State
 * Worker 3 - Track A (Core Engine)
 */

import { describe, it, expect } from 'vitest';
import { PlayerState } from './PlayerState';
import { Position } from '../types/Position';
import {
  MeasureType,
  PossessionType,
  BuildingType,
} from '../../../../shared/types/contracts';

describe('PlayerState', () => {
  describe('constructor', () => {
    it('should create a player state with default values', () => {
      const state = new PlayerState({ playerId: 'player-1' });
      expect(state.playerId).toBe('player-1');
      expect(state.cash).toBe(0);
      expect(state.health).toBe(100);
      expect(state.happiness).toBe(100);
      expect(state.education).toBe(0);
      expect(state.career).toBe(0);
      expect(state.currentBuilding).toBeNull();
      expect(state.job).toBeNull();
      expect(state.experience).toEqual([]);
      expect(state.possessions).toEqual([]);
      expect(state.rentedHome).toBeNull();
      expect(state.rentDebt).toBe(0);
    });

    it('should create a player state with custom values', () => {
      const pos = new Position(2, 3);
      const state = new PlayerState({
        playerId: 'player-2',
        cash: 1000,
        health: 80,
        happiness: 70,
        education: 50,
        career: 100,
        position: pos,
        currentBuilding: 'building-1',
        rentDebt: 100,
      });
      expect(state.playerId).toBe('player-2');
      expect(state.cash).toBe(1000);
      expect(state.health).toBe(80);
      expect(state.happiness).toBe(70);
      expect(state.education).toBe(50);
      expect(state.career).toBe(100);
      expect(state.position).toBe(pos);
      expect(state.currentBuilding).toBe('building-1');
      expect(state.rentDebt).toBe(100);
    });

    it('should clamp health to max value', () => {
      const state = new PlayerState({ playerId: 'p1', health: 150 });
      expect(state.health).toBe(100);
    });

    it('should clamp health to min value', () => {
      const state = new PlayerState({ playerId: 'p1', health: -10 });
      expect(state.health).toBe(0);
    });

    it('should clamp happiness to valid range', () => {
      const state1 = new PlayerState({ playerId: 'p1', happiness: 150 });
      expect(state1.happiness).toBe(100);

      const state2 = new PlayerState({ playerId: 'p1', happiness: -10 });
      expect(state2.happiness).toBe(0);
    });

    it('should clamp education to valid range', () => {
      const state1 = new PlayerState({ playerId: 'p1', education: 150 });
      expect(state1.education).toBe(100);

      const state2 = new PlayerState({ playerId: 'p1', education: -10 });
      expect(state2.education).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the player state', () => {
      const original = new PlayerState({
        playerId: 'player-1',
        cash: 1000,
        health: 80,
        happiness: 70,
        education: 50,
        career: 100,
        position: new Position(2, 3),
        experience: [{ rank: 1, points: 50 }],
        possessions: [
          {
            id: 'food-1',
            type: PossessionType.FOOD,
            name: 'Burger',
            value: 10,
            purchasePrice: 15,
            effects: [],
          },
        ],
      });

      const cloned = original.clone();

      // Should have same values
      expect(cloned.playerId).toBe(original.playerId);
      expect(cloned.cash).toBe(original.cash);
      expect(cloned.health).toBe(original.health);
      expect(cloned.happiness).toBe(original.happiness);

      // But should be different objects
      expect(cloned).not.toBe(original);
      expect(cloned.position).not.toBe(original.position);
      expect(cloned.experience).not.toBe(original.experience);
      expect(cloned.possessions).not.toBe(original.possessions);
    });

    it('should deep copy arrays so modifications dont affect original', () => {
      const original = new PlayerState({
        playerId: 'player-1',
        experience: [{ rank: 1, points: 50 }],
        possessions: [
          {
            id: 'food-1',
            type: PossessionType.FOOD,
            name: 'Burger',
            value: 10,
            purchasePrice: 15,
            effects: [],
          },
        ],
      });

      const cloned = original.clone();

      // Modify cloned arrays
      cloned.experience.push({ rank: 2, points: 30 });
      cloned.possessions.push({
        id: 'food-2',
        type: PossessionType.FOOD,
        name: 'Pizza',
        value: 15,
        purchasePrice: 20,
        effects: [],
      });

      // Original should be unchanged
      expect(original.experience.length).toBe(1);
      expect(original.possessions.length).toBe(1);
      expect(cloned.experience.length).toBe(2);
      expect(cloned.possessions.length).toBe(2);
    });
  });

  describe('updateMeasure', () => {
    it('should update health within valid range', () => {
      const state = new PlayerState({ playerId: 'p1', health: 50 });
      state.updateMeasure(MeasureType.HEALTH, 20);
      expect(state.health).toBe(70);
    });

    it('should clamp health to max when updating', () => {
      const state = new PlayerState({ playerId: 'p1', health: 95 });
      state.updateMeasure(MeasureType.HEALTH, 20);
      expect(state.health).toBe(100);
    });

    it('should clamp health to min when updating', () => {
      const state = new PlayerState({ playerId: 'p1', health: 10 });
      state.updateMeasure(MeasureType.HEALTH, -20);
      expect(state.health).toBe(0);
    });

    it('should update happiness within valid range', () => {
      const state = new PlayerState({ playerId: 'p1', happiness: 50 });
      state.updateMeasure(MeasureType.HAPPINESS, 20);
      expect(state.happiness).toBe(70);
    });

    it('should clamp happiness to valid range', () => {
      const state = new PlayerState({ playerId: 'p1', happiness: 95 });
      state.updateMeasure(MeasureType.HAPPINESS, 20);
      expect(state.happiness).toBe(100);
    });

    it('should update education within valid range', () => {
      const state = new PlayerState({ playerId: 'p1', education: 30 });
      state.updateMeasure(MeasureType.EDUCATION, 20);
      expect(state.education).toBe(50);
    });

    it('should clamp education to valid range', () => {
      const state = new PlayerState({ playerId: 'p1', education: 95 });
      state.updateMeasure(MeasureType.EDUCATION, 20);
      expect(state.education).toBe(100);
    });

    it('should update career without clamping to max', () => {
      const state = new PlayerState({ playerId: 'p1', career: 500 });
      state.updateMeasure(MeasureType.CAREER, 200);
      expect(state.career).toBe(700);
    });

    it('should clamp career to 0 minimum', () => {
      const state = new PlayerState({ playerId: 'p1', career: 50 });
      state.updateMeasure(MeasureType.CAREER, -100);
      expect(state.career).toBe(0);
    });

    it('should update wealth (cash) without clamping', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 1000 });
      state.updateMeasure(MeasureType.WEALTH, 500);
      expect(state.cash).toBe(1500);
    });

    it('should allow negative cash (debt)', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 100 });
      state.updateMeasure(MeasureType.WEALTH, -200);
      expect(state.cash).toBe(-100);
    });
  });

  describe('canAfford', () => {
    it('should return true when player has enough cash', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 1000 });
      expect(state.canAfford(500)).toBe(true);
    });

    it('should return true when player has exactly the cost', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 500 });
      expect(state.canAfford(500)).toBe(true);
    });

    it('should return false when player doesnt have enough cash', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 400 });
      expect(state.canAfford(500)).toBe(false);
    });

    it('should return false when player has negative cash', () => {
      const state = new PlayerState({ playerId: 'p1', cash: -100 });
      expect(state.canAfford(500)).toBe(false);
    });

    it('should return true for zero cost', () => {
      const state = new PlayerState({ playerId: 'p1', cash: 0 });
      expect(state.canAfford(0)).toBe(true);
    });
  });

  describe('meetsJobRequirements', () => {
    it('should return true when all requirements are met', () => {
      const state = new PlayerState({
        playerId: 'p1',
        education: 50,
        experience: [{ rank: 1, points: 100 }],
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Suit',
            value: 100,
            purchasePrice: 150,
            effects: [],
            clothesLevel: 3,
          },
        ],
      });

      const job = {
        id: 'job-1',
        title: 'Manager',
        rank: 1,
        requiredEducation: 40,
        requiredExperience: 50,
        requiredClothesLevel: 2,
        wagePerHour: 20,
        experienceGainPerHour: 10,
        buildingType: BuildingType.FACTORY,
      };

      expect(state.meetsJobRequirements(job)).toBe(true);
    });

    it('should return false when education requirement not met', () => {
      const state = new PlayerState({
        playerId: 'p1',
        education: 30,
        experience: [{ rank: 1, points: 100 }],
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Suit',
            value: 100,
            purchasePrice: 150,
            effects: [],
            clothesLevel: 3,
          },
        ],
      });

      const job = {
        id: 'job-1',
        title: 'Manager',
        rank: 1,
        requiredEducation: 50,
        requiredExperience: 50,
        requiredClothesLevel: 2,
        wagePerHour: 20,
        experienceGainPerHour: 10,
        buildingType: BuildingType.FACTORY,
      };

      expect(state.meetsJobRequirements(job)).toBe(false);
    });

    it('should return false when experience requirement not met', () => {
      const state = new PlayerState({
        playerId: 'p1',
        education: 50,
        experience: [{ rank: 1, points: 30 }],
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Suit',
            value: 100,
            purchasePrice: 150,
            effects: [],
            clothesLevel: 3,
          },
        ],
      });

      const job = {
        id: 'job-1',
        title: 'Manager',
        rank: 1,
        requiredEducation: 40,
        requiredExperience: 50,
        requiredClothesLevel: 2,
        wagePerHour: 20,
        experienceGainPerHour: 10,
        buildingType: BuildingType.FACTORY,
      };

      expect(state.meetsJobRequirements(job)).toBe(false);
    });

    it('should return false when clothes requirement not met', () => {
      const state = new PlayerState({
        playerId: 'p1',
        education: 50,
        experience: [{ rank: 1, points: 100 }],
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Basic Clothes',
            value: 50,
            purchasePrice: 75,
            effects: [],
            clothesLevel: 1,
          },
        ],
      });

      const job = {
        id: 'job-1',
        title: 'Manager',
        rank: 1,
        requiredEducation: 40,
        requiredExperience: 50,
        requiredClothesLevel: 3,
        wagePerHour: 20,
        experienceGainPerHour: 10,
        buildingType: BuildingType.FACTORY,
      };

      expect(state.meetsJobRequirements(job)).toBe(false);
    });

    it('should return false when player has no clothes', () => {
      const state = new PlayerState({
        playerId: 'p1',
        education: 50,
        experience: [{ rank: 1, points: 100 }],
        possessions: [],
      });

      const job = {
        id: 'job-1',
        title: 'Manager',
        rank: 1,
        requiredEducation: 40,
        requiredExperience: 50,
        requiredClothesLevel: 1,
        wagePerHour: 20,
        experienceGainPerHour: 10,
        buildingType: BuildingType.FACTORY,
      };

      expect(state.meetsJobRequirements(job)).toBe(false);
    });
  });

  describe('getClothesLevel', () => {
    it('should return 0 when player has no possessions', () => {
      const state = new PlayerState({ playerId: 'p1' });
      expect(state.getClothesLevel()).toBe(0);
    });

    it('should return 0 when player has no clothes possessions', () => {
      const state = new PlayerState({
        playerId: 'p1',
        possessions: [
          {
            id: 'food-1',
            type: PossessionType.FOOD,
            name: 'Burger',
            value: 10,
            purchasePrice: 15,
            effects: [],
          },
        ],
      });
      expect(state.getClothesLevel()).toBe(0);
    });

    it('should return the clothes level of the only clothes item', () => {
      const state = new PlayerState({
        playerId: 'p1',
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Suit',
            value: 100,
            purchasePrice: 150,
            effects: [],
            clothesLevel: 3,
          },
        ],
      });
      expect(state.getClothesLevel()).toBe(3);
    });

    it('should return the highest clothes level when multiple clothes exist', () => {
      const state = new PlayerState({
        playerId: 'p1',
        possessions: [
          {
            id: 'clothes-1',
            type: PossessionType.CLOTHES,
            name: 'Basic Clothes',
            value: 50,
            purchasePrice: 75,
            effects: [],
            clothesLevel: 1,
          },
          {
            id: 'clothes-2',
            type: PossessionType.CLOTHES,
            name: 'Suit',
            value: 100,
            purchasePrice: 150,
            effects: [],
            clothesLevel: 3,
          },
          {
            id: 'clothes-3',
            type: PossessionType.CLOTHES,
            name: 'Nice Shirt',
            value: 75,
            purchasePrice: 100,
            effects: [],
            clothesLevel: 2,
          },
        ],
      });
      expect(state.getClothesLevel()).toBe(3);
    });
  });

  describe('getTotalExperience', () => {
    it('should return 0 when no experience', () => {
      const state = new PlayerState({ playerId: 'p1' });
      expect(state.getTotalExperience()).toBe(0);
    });

    it('should return the sum of all experience points', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [
          { rank: 1, points: 50 },
          { rank: 2, points: 30 },
          { rank: 3, points: 20 },
        ],
      });
      expect(state.getTotalExperience()).toBe(100);
    });

    it('should handle single experience entry', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [{ rank: 1, points: 75 }],
      });
      expect(state.getTotalExperience()).toBe(75);
    });
  });

  describe('getExperienceAtRank', () => {
    it('should return 0 for rank with no experience', () => {
      const state = new PlayerState({ playerId: 'p1' });
      expect(state.getExperienceAtRank(1)).toBe(0);
    });

    it('should return the experience points for the specified rank', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [
          { rank: 1, points: 50 },
          { rank: 2, points: 30 },
        ],
      });
      expect(state.getExperienceAtRank(1)).toBe(50);
      expect(state.getExperienceAtRank(2)).toBe(30);
    });

    it('should return 0 for rank not in experience list', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [{ rank: 1, points: 50 }],
      });
      expect(state.getExperienceAtRank(3)).toBe(0);
    });
  });

  describe('addExperience', () => {
    it('should add experience to a new rank', () => {
      const state = new PlayerState({ playerId: 'p1' });
      state.addExperience(1, 50);
      expect(state.getExperienceAtRank(1)).toBe(50);
      expect(state.career).toBe(50);
    });

    it('should add experience to an existing rank', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [{ rank: 1, points: 50 }],
        career: 50,
      });
      state.addExperience(1, 30);
      expect(state.getExperienceAtRank(1)).toBe(80);
      expect(state.career).toBe(80);
    });

    it('should update career when adding experience', () => {
      const state = new PlayerState({
        playerId: 'p1',
        experience: [
          { rank: 1, points: 50 },
          { rank: 2, points: 30 },
        ],
        career: 80,
      });
      state.addExperience(3, 20);
      expect(state.career).toBe(100);
    });
  });

  describe('addPossession', () => {
    it('should add a possession to empty inventory', () => {
      const state = new PlayerState({ playerId: 'p1' });
      const possession = {
        id: 'food-1',
        type: PossessionType.FOOD,
        name: 'Burger',
        value: 10,
        purchasePrice: 15,
        effects: [],
      };
      state.addPossession(possession);
      expect(state.possessions.length).toBe(1);
      expect(state.possessions[0]).toBe(possession);
    });

    it('should add multiple possessions', () => {
      const state = new PlayerState({ playerId: 'p1' });
      const food = {
        id: 'food-1',
        type: PossessionType.FOOD,
        name: 'Burger',
        value: 10,
        purchasePrice: 15,
        effects: [],
      };
      const clothes = {
        id: 'clothes-1',
        type: PossessionType.CLOTHES,
        name: 'Suit',
        value: 100,
        purchasePrice: 150,
        effects: [],
        clothesLevel: 3,
      };
      state.addPossession(food);
      state.addPossession(clothes);
      expect(state.possessions.length).toBe(2);
    });
  });

  describe('removePossession', () => {
    it('should remove a possession by id', () => {
      const state = new PlayerState({
        playerId: 'p1',
        possessions: [
          {
            id: 'food-1',
            type: PossessionType.FOOD,
            name: 'Burger',
            value: 10,
            purchasePrice: 15,
            effects: [],
          },
        ],
      });
      const removed = state.removePossession('food-1');
      expect(removed).toBe(true);
      expect(state.possessions.length).toBe(0);
    });

    it('should return false when possession not found', () => {
      const state = new PlayerState({ playerId: 'p1' });
      const removed = state.removePossession('non-existent');
      expect(removed).toBe(false);
    });

    it('should remove only the specified possession', () => {
      const state = new PlayerState({
        playerId: 'p1',
        possessions: [
          {
            id: 'food-1',
            type: PossessionType.FOOD,
            name: 'Burger',
            value: 10,
            purchasePrice: 15,
            effects: [],
          },
          {
            id: 'food-2',
            type: PossessionType.FOOD,
            name: 'Pizza',
            value: 15,
            purchasePrice: 20,
            effects: [],
          },
        ],
      });
      state.removePossession('food-1');
      expect(state.possessions.length).toBe(1);
      expect(state.possessions[0].id).toBe('food-2');
    });
  });

  describe('create (factory method)', () => {
    it('should create a player state with defaults', () => {
      const state = PlayerState.create('player-1');
      expect(state).toBeInstanceOf(PlayerState);
      expect(state.playerId).toBe('player-1');
      expect(state.cash).toBe(0);
    });

    it('should create a player state with overrides', () => {
      const state = PlayerState.create('player-1', {
        cash: 1000,
        health: 80,
        education: 50,
      });
      expect(state.playerId).toBe('player-1');
      expect(state.cash).toBe(1000);
      expect(state.health).toBe(80);
      expect(state.education).toBe(50);
    });
  });

  describe('from (factory method)', () => {
    it('should create PlayerState from IPlayerState interface', () => {
      const iState = {
        playerId: 'player-1',
        cash: 1000,
        health: 80,
        happiness: 70,
        education: 50,
        career: 100,
        position: new Position(2, 3),
        currentBuilding: null,
        job: null,
        experience: [{ rank: 1, points: 50 }],
        possessions: [],
        rentedHome: null,
        rentDebt: 0,
        clone: () => iState,
        updateMeasure: () => {},
        canAfford: () => true,
        meetsJobRequirements: () => true,
        getClothesLevel: () => 0,
        getTotalExperience: () => 50,
        getExperienceAtRank: () => 0,
      };

      const state = PlayerState.from(iState);
      expect(state).toBeInstanceOf(PlayerState);
      expect(state.playerId).toBe('player-1');
      expect(state.cash).toBe(1000);
      expect(state.health).toBe(80);
    });
  });
});
