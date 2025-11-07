/**
 * Unit tests for Player class
 *
 * Part of Task A3: Player State
 * Worker 3 - Track A (Core Engine)
 */

import { describe, it, expect } from 'vitest';
import { Player } from './Player';
import { PlayerState } from './PlayerState';
import { Position } from '../types/Position';

describe('Player', () => {
  describe('constructor', () => {
    it('should create a player with all required properties', () => {
      const state = PlayerState.create('player-1');
      const player = new Player({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        state,
      });

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.color).toBe('#FF0000');
      expect(player.state).toBe(state);
      expect(player.isAI).toBe(false);
    });

    it('should create an AI player when isAI is true', () => {
      const state = PlayerState.create('player-1');
      const player = new Player({
        id: 'player-1',
        name: 'AI Bot',
        color: '#00FF00',
        state,
        isAI: true,
      });

      expect(player.isAI).toBe(true);
    });

    it('should accept valid hex color codes', () => {
      const state = PlayerState.create('player-1');
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#ABCDEF', '#123456'];

      validColors.forEach((color) => {
        expect(() => {
          new Player({ id: 'p1', name: 'Test', color, state });
        }).not.toThrow();
      });
    });

    it('should throw error for invalid color format (no hash)', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: 'FF0000',
          state,
        });
      }).toThrow('Invalid color format');
    });

    it('should throw error for invalid color format (too short)', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: '#FF00',
          state,
        });
      }).toThrow('Invalid color format');
    });

    it('should throw error for invalid color format (too long)', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: '#FF00001',
          state,
        });
      }).toThrow('Invalid color format');
    });

    it('should throw error for invalid color format (invalid characters)', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: '#GGGGGG',
          state,
        });
      }).toThrow('Invalid color format');
    });

    it('should accept lowercase hex colors', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: '#abcdef',
          state,
        });
      }).not.toThrow();
    });

    it('should accept mixed case hex colors', () => {
      const state = PlayerState.create('player-1');
      expect(() => {
        new Player({
          id: 'player-1',
          name: 'Alice',
          color: '#AbCdEf',
          state,
        });
      }).not.toThrow();
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the player', () => {
      const state = PlayerState.create('player-1', {
        cash: 1000,
        health: 80,
        position: new Position(2, 3),
      });
      const original = new Player({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        state,
      });

      const cloned = original.clone();

      // Should have same values
      expect(cloned.id).toBe(original.id);
      expect(cloned.name).toBe(original.name);
      expect(cloned.color).toBe(original.color);
      expect(cloned.state.cash).toBe(original.state.cash);
      expect(cloned.state.health).toBe(original.state.health);

      // But should be different objects
      expect(cloned).not.toBe(original);
      expect(cloned.state).not.toBe(original.state);
    });

    it('should clone AI players correctly', () => {
      const state = PlayerState.create('ai-1');
      const original = new Player({
        id: 'ai-1',
        name: 'AI Bot',
        color: '#00FF00',
        state,
        isAI: true,
      });

      const cloned = original.clone();
      expect(cloned.isAI).toBe(true);
    });

    it('should deep clone state so modifications dont affect original', () => {
      const state = PlayerState.create('player-1', { cash: 1000 });
      const original = new Player({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        state,
      });

      const cloned = original.clone();

      // Modify cloned state
      cloned.state.cash = 2000;

      // Original should be unchanged
      expect(original.state.cash).toBe(1000);
      expect(cloned.state.cash).toBe(2000);
    });
  });

  describe('create (factory method)', () => {
    it('should create a player with default state', () => {
      const player = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
      });

      expect(player).toBeInstanceOf(Player);
      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.color).toBe('#FF0000');
      expect(player.state.playerId).toBe('player-1');
      expect(player.isAI).toBe(false);
    });

    it('should create a player with custom playerId for state', () => {
      const player = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        playerId: 'custom-player-id',
      });

      expect(player.state.playerId).toBe('custom-player-id');
    });

    it('should create a player with state overrides', () => {
      const player = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        stateOverrides: {
          cash: 5000,
          health: 90,
          education: 75,
        },
      });

      expect(player.state.cash).toBe(5000);
      expect(player.state.health).toBe(90);
      expect(player.state.education).toBe(75);
    });

    it('should create an AI player', () => {
      const player = Player.create({
        id: 'ai-1',
        name: 'AI Bot',
        color: '#00FF00',
        isAI: true,
      });

      expect(player.isAI).toBe(true);
    });
  });

  describe('from (factory method)', () => {
    it('should create Player from IPlayer interface', () => {
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
        experience: [],
        possessions: [],
        rentedHome: null,
        rentDebt: 0,
        clone: () => iState,
        updateMeasure: () => {},
        canAfford: () => true,
        meetsJobRequirements: () => true,
        getClothesLevel: () => 0,
        getTotalExperience: () => 0,
        getExperienceAtRank: () => 0,
      };

      const iPlayer = {
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        state: iState,
        isAI: false,
      };

      const player = Player.from(iPlayer);
      expect(player).toBeInstanceOf(Player);
      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.color).toBe('#FF0000');
      expect(player.state.cash).toBe(1000);
      expect(player.isAI).toBe(false);
    });

    it('should create AI player from IPlayer interface', () => {
      const state = PlayerState.create('ai-1');
      const iPlayer = {
        id: 'ai-1',
        name: 'AI Bot',
        color: '#00FF00',
        state,
        isAI: true,
      };

      const player = Player.from(iPlayer);
      expect(player.isAI).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should maintain state consistency when cloning', () => {
      const player = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        stateOverrides: {
          cash: 1000,
          health: 80,
          experience: [
            { rank: 1, points: 50 },
            { rank: 2, points: 30 },
          ],
        },
      });

      const cloned = player.clone();

      // Modify cloned state
      (cloned.state as PlayerState).addExperience(1, 20);

      // Original should be unchanged
      expect(player.state.getExperienceAtRank(1)).toBe(50);
      expect(cloned.state.getExperienceAtRank(1)).toBe(70);
    });

    it('should support multiple players with different states', () => {
      const player1 = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
        stateOverrides: { cash: 1000 },
      });

      const player2 = Player.create({
        id: 'player-2',
        name: 'Bob',
        color: '#00FF00',
        stateOverrides: { cash: 2000 },
      });

      expect(player1.state.cash).toBe(1000);
      expect(player2.state.cash).toBe(2000);
    });

    it('should allow state modifications after creation', () => {
      const player = Player.create({
        id: 'player-1',
        name: 'Alice',
        color: '#FF0000',
      });

      player.state.cash = 5000;
      player.state.updateMeasure('HEALTH' as any, -10);

      expect(player.state.cash).toBe(5000);
      expect(player.state.health).toBe(90);
    });
  });
});
