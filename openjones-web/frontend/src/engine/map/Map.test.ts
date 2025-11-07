/**
 * Unit tests for Map class
 *
 * Part of Task B2: Map System
 * Worker 2 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Map } from './Map';
import { Position } from '../types/Position';
import { IBuilding, BuildingType, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { MockBuilding, MockPosition } from '../../../../shared/mocks';

describe('Map', () => {
  describe('constructor', () => {
    it('should create an empty 5x5 map', () => {
      const map = new Map();
      expect(map.width).toBe(5);
      expect(map.height).toBe(5);
      expect(map.getAllBuildings()).toEqual([]);
    });

    it('should have correct dimensions from GAME_CONSTANTS', () => {
      const map = new Map();
      expect(map.width).toBe(GAME_CONSTANTS.GRID_WIDTH);
      expect(map.height).toBe(GAME_CONSTANTS.GRID_HEIGHT);
    });
  });

  describe('addBuilding', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
    });

    it('should add a building to an empty position', () => {
      const building = MockBuilding.create({
        id: 'factory',
        position: new Position(1, 1),
      });

      map.addBuilding(building);
      expect(map.getAllBuildings()).toHaveLength(1);
      expect(map.getBuilding(new Position(1, 1))).toBe(building);
    });

    it('should add multiple buildings to different positions', () => {
      const factory = MockBuilding.create({
        id: 'factory',
        position: new Position(1, 1),
      });
      const bank = MockBuilding.create({
        id: 'bank',
        type: BuildingType.BANK,
        position: new Position(2, 2),
      });

      map.addBuilding(factory);
      map.addBuilding(bank);

      expect(map.getAllBuildings()).toHaveLength(2);
      expect(map.getBuilding(new Position(1, 1))).toBe(factory);
      expect(map.getBuilding(new Position(2, 2))).toBe(bank);
    });

    it('should throw error when adding building to occupied position', () => {
      const building1 = MockBuilding.create({
        id: 'factory1',
        position: new Position(1, 1),
      });
      const building2 = MockBuilding.create({
        id: 'factory2',
        position: new Position(1, 1),
      });

      map.addBuilding(building1);
      expect(() => map.addBuilding(building2)).toThrow('already occupied');
    });

    it('should throw error when adding building to invalid position', () => {
      // Create a mock building with invalid position
      const building = {
        id: 'factory',
        type: BuildingType.FACTORY,
        name: 'Factory',
        description: 'Test',
        position: { x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' },
      } as IBuilding;

      expect(() => map.addBuilding(building)).toThrow('out of bounds');
    });

    it('should add buildings to all corners of the grid', () => {
      const corners = [
        new Position(0, 0),
        new Position(4, 0),
        new Position(0, 4),
        new Position(4, 4),
      ];

      corners.forEach((pos, index) => {
        map.addBuilding(
          MockBuilding.create({
            id: `building-${index}`,
            position: pos,
          })
        );
      });

      expect(map.getAllBuildings()).toHaveLength(4);
      corners.forEach((pos) => {
        expect(map.getBuilding(pos)).not.toBeNull();
      });
    });
  });

  describe('removeBuilding', () => {
    let map: Map;
    let factory: IBuilding;

    beforeEach(() => {
      map = new Map();
      factory = MockBuilding.create({
        id: 'factory',
        position: new Position(1, 1),
      });
      map.addBuilding(factory);
    });

    it('should remove a building by ID', () => {
      const removed = map.removeBuilding('factory');
      expect(removed).toBe(true);
      expect(map.getAllBuildings()).toHaveLength(0);
      expect(map.getBuilding(new Position(1, 1))).toBeNull();
    });

    it('should return false when removing non-existent building', () => {
      const removed = map.removeBuilding('nonexistent');
      expect(removed).toBe(false);
      expect(map.getAllBuildings()).toHaveLength(1);
    });

    it('should allow adding a new building after removal', () => {
      map.removeBuilding('factory');

      const newBuilding = MockBuilding.create({
        id: 'bank',
        type: BuildingType.BANK,
        position: new Position(1, 1),
      });
      map.addBuilding(newBuilding);

      expect(map.getAllBuildings()).toHaveLength(1);
      expect(map.getBuilding(new Position(1, 1))).toBe(newBuilding);
    });
  });

  describe('getBuilding', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
      map.addBuilding(
        MockBuilding.create({
          id: 'factory',
          position: new Position(2, 3),
        })
      );
    });

    it('should return building at occupied position', () => {
      const building = map.getBuilding(new Position(2, 3));
      expect(building).not.toBeNull();
      expect(building?.id).toBe('factory');
    });

    it('should return null for empty position', () => {
      const building = map.getBuilding(new Position(0, 0));
      expect(building).toBeNull();
    });

    it('should return null for invalid position', () => {
      const building = map.getBuilding({ x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' });
      expect(building).toBeNull();
    });
  });

  describe('getAllBuildings', () => {
    it('should return empty array for empty map', () => {
      const map = new Map();
      expect(map.getAllBuildings()).toEqual([]);
    });

    it('should return all buildings', () => {
      const map = new Map();
      const building1 = MockBuilding.create({ id: 'b1', position: new Position(0, 0) });
      const building2 = MockBuilding.create({ id: 'b2', position: new Position(1, 1) });
      const building3 = MockBuilding.create({ id: 'b3', position: new Position(2, 2) });

      map.addBuilding(building1);
      map.addBuilding(building2);
      map.addBuilding(building3);

      const buildings = map.getAllBuildings();
      expect(buildings).toHaveLength(3);
      expect(buildings).toContain(building1);
      expect(buildings).toContain(building2);
      expect(buildings).toContain(building3);
    });

    it('should return a copy of buildings array', () => {
      const map = new Map();
      const building = MockBuilding.create({ id: 'b1', position: new Position(0, 0) });
      map.addBuilding(building);

      const buildings1 = map.getAllBuildings();
      const buildings2 = map.getAllBuildings();

      expect(buildings1).not.toBe(buildings2); // Different array instances
      expect(buildings1).toEqual(buildings2); // Same content
    });
  });

  describe('getBuildingById', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
      map.addBuilding(MockBuilding.create({ id: 'factory', position: new Position(1, 1) }));
      map.addBuilding(MockBuilding.create({ id: 'bank', position: new Position(2, 2) }));
    });

    it('should find building by ID', () => {
      const building = map.getBuildingById('factory');
      expect(building).not.toBeNull();
      expect(building?.id).toBe('factory');
    });

    it('should return null for non-existent ID', () => {
      const building = map.getBuildingById('nonexistent');
      expect(building).toBeNull();
    });
  });

  describe('isValidPosition', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
    });

    it('should return true for valid positions', () => {
      expect(map.isValidPosition(new Position(0, 0))).toBe(true);
      expect(map.isValidPosition(new Position(4, 4))).toBe(true);
      expect(map.isValidPosition(new Position(2, 2))).toBe(true);
    });

    it('should return false for out-of-bounds positions', () => {
      expect(map.isValidPosition({ x: -1, y: 0, equals: () => false, toString: () => '(-1, 0)' })).toBe(false);
      expect(map.isValidPosition({ x: 0, y: -1, equals: () => false, toString: () => '(0, -1)' })).toBe(false);
      expect(map.isValidPosition({ x: 5, y: 0, equals: () => false, toString: () => '(5, 0)' })).toBe(false);
      expect(map.isValidPosition({ x: 0, y: 5, equals: () => false, toString: () => '(0, 5)' })).toBe(false);
    });

    it('should return true for valid positions regardless of buildings', () => {
      map.addBuilding(MockBuilding.create({ id: 'factory', position: new Position(2, 2) }));
      expect(map.isValidPosition(new Position(2, 2))).toBe(true);
    });
  });

  describe('getRoute', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
    });

    it('should calculate route from (0,0) to (2,2)', () => {
      const route = map.getRoute(new Position(0, 0), new Position(2, 2));
      expect(route.distance).toBe(4);
      expect(route.start.x).toBe(0);
      expect(route.start.y).toBe(0);
      expect(route.end.x).toBe(2);
      expect(route.end.y).toBe(2);
    });

    it('should calculate route with zero distance for same position', () => {
      const route = map.getRoute(new Position(2, 2), new Position(2, 2));
      expect(route.distance).toBe(0);
      expect(route.positions).toHaveLength(1);
    });

    it('should calculate route horizontally', () => {
      const route = map.getRoute(new Position(0, 2), new Position(4, 2));
      expect(route.distance).toBe(4);
      expect(route.positions).toHaveLength(5);
    });

    it('should calculate route vertically', () => {
      const route = map.getRoute(new Position(2, 0), new Position(2, 4));
      expect(route.distance).toBe(4);
      expect(route.positions).toHaveLength(5);
    });

    it('should throw error for invalid start position', () => {
      const invalidPos = { x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' };
      expect(() => map.getRoute(invalidPos, new Position(2, 2))).toThrow('invalid');
    });

    it('should throw error for invalid end position', () => {
      const invalidPos = { x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' };
      expect(() => map.getRoute(new Position(2, 2), invalidPos)).toThrow('invalid');
    });

    it('should use Route class from Task A1', () => {
      const route = map.getRoute(new Position(1, 1), new Position(3, 3));
      // Route class creates Manhattan paths (horizontal first, then vertical)
      expect(route.positions.length).toBeGreaterThan(2);
    });
  });

  describe('getAdjacentPositions', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
    });

    it('should return 4 adjacent positions for center position', () => {
      const adjacent = map.getAdjacentPositions(new Position(2, 2));
      expect(adjacent).toHaveLength(4);

      // Check all four directions
      const positions = adjacent.map(p => `${p.x},${p.y}`);
      expect(positions).toContain('1,2'); // left
      expect(positions).toContain('3,2'); // right
      expect(positions).toContain('2,1'); // up
      expect(positions).toContain('2,3'); // down
    });

    it('should return 2 adjacent positions for corner (0,0)', () => {
      const adjacent = map.getAdjacentPositions(new Position(0, 0));
      expect(adjacent).toHaveLength(2);

      const positions = adjacent.map(p => `${p.x},${p.y}`);
      expect(positions).toContain('1,0'); // right
      expect(positions).toContain('0,1'); // down
    });

    it('should return 2 adjacent positions for corner (4,4)', () => {
      const adjacent = map.getAdjacentPositions(new Position(4, 4));
      expect(adjacent).toHaveLength(2);

      const positions = adjacent.map(p => `${p.x},${p.y}`);
      expect(positions).toContain('3,4'); // left
      expect(positions).toContain('4,3'); // up
    });

    it('should return 3 adjacent positions for edge position', () => {
      const adjacent = map.getAdjacentPositions(new Position(0, 2));
      expect(adjacent).toHaveLength(3);

      const positions = adjacent.map(p => `${p.x},${p.y}`);
      expect(positions).toContain('1,2'); // right
      expect(positions).toContain('0,1'); // up
      expect(positions).toContain('0,3'); // down
    });

    it('should return empty array for invalid position', () => {
      const adjacent = map.getAdjacentPositions({ x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' });
      expect(adjacent).toHaveLength(0);
    });

    it('should return Position instances', () => {
      const adjacent = map.getAdjacentPositions(new Position(2, 2));
      adjacent.forEach(pos => {
        expect(pos).toBeInstanceOf(Position);
      });
    });
  });

  describe('isEmpty', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
      map.addBuilding(MockBuilding.create({ id: 'factory', position: new Position(2, 2) }));
    });

    it('should return true for empty position', () => {
      expect(map.isEmpty(new Position(0, 0))).toBe(true);
    });

    it('should return false for occupied position', () => {
      expect(map.isEmpty(new Position(2, 2))).toBe(false);
    });

    it('should return true for invalid position', () => {
      expect(map.isEmpty({ x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' })).toBe(true);
    });
  });

  describe('canMoveTo', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
      map.addBuilding(MockBuilding.create({ id: 'factory', position: new Position(2, 2) }));
    });

    it('should return true for valid empty position', () => {
      expect(map.canMoveTo(new Position(0, 0))).toBe(true);
    });

    it('should return true for valid occupied position (can enter buildings)', () => {
      expect(map.canMoveTo(new Position(2, 2))).toBe(true);
    });

    it('should return false for invalid position', () => {
      expect(map.canMoveTo({ x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' })).toBe(false);
    });
  });

  describe('getDistance', () => {
    let map: Map;

    beforeEach(() => {
      map = new Map();
    });

    it('should calculate Manhattan distance correctly', () => {
      expect(map.getDistance(new Position(0, 0), new Position(4, 4))).toBe(8);
      expect(map.getDistance(new Position(0, 0), new Position(2, 3))).toBe(5);
      expect(map.getDistance(new Position(1, 1), new Position(3, 2))).toBe(3);
    });

    it('should return 0 for same position', () => {
      expect(map.getDistance(new Position(2, 2), new Position(2, 2))).toBe(0);
    });

    it('should return -1 for invalid positions', () => {
      const invalidPos = { x: 10, y: 10, equals: () => false, toString: () => '(10, 10)' };
      expect(map.getDistance(invalidPos, new Position(2, 2))).toBe(-1);
      expect(map.getDistance(new Position(2, 2), invalidPos)).toBe(-1);
    });
  });

  describe('static factory methods', () => {
    it('should create empty map with Map.create()', () => {
      const map = Map.create();
      expect(map).toBeInstanceOf(Map);
      expect(map.getAllBuildings()).toHaveLength(0);
    });

    it('should create map with buildings using Map.createWithBuildings()', () => {
      const buildings = [
        MockBuilding.create({ id: 'b1', position: new Position(0, 0) }),
        MockBuilding.create({ id: 'b2', position: new Position(1, 1) }),
        MockBuilding.create({ id: 'b3', position: new Position(2, 2) }),
      ];

      const map = Map.createWithBuildings(buildings);
      expect(map.getAllBuildings()).toHaveLength(3);
      expect(map.getBuilding(new Position(0, 0))).toBe(buildings[0]);
      expect(map.getBuilding(new Position(1, 1))).toBe(buildings[1]);
      expect(map.getBuilding(new Position(2, 2))).toBe(buildings[2]);
    });
  });

  describe('toString', () => {
    it('should return string representation for empty map', () => {
      const map = new Map();
      const str = map.toString();
      expect(str).toContain('Map (5x5)');
      expect(str).toContain('.');
    });

    it('should show buildings as B in string representation', () => {
      const map = new Map();
      map.addBuilding(MockBuilding.create({ id: 'b1', position: new Position(0, 0) }));
      const str = map.toString();
      expect(str).toContain('B');
    });
  });

  describe('integration tests', () => {
    it('should handle full game board with 25 positions', () => {
      const map = new Map();
      let buildingCount = 0;

      // Add buildings to every other position
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if ((x + y) % 2 === 0 && buildingCount < 13) {
            map.addBuilding(
              MockBuilding.create({
                id: `building-${x}-${y}`,
                position: new Position(x, y),
              })
            );
            buildingCount++;
          }
        }
      }

      expect(map.getAllBuildings()).toHaveLength(13);
    });

    it('should handle route calculation with buildings in the path', () => {
      const map = new Map();
      map.addBuilding(MockBuilding.create({ id: 'obstacle', position: new Position(2, 2) }));

      // Route should still be calculated (buildings don't block routes)
      const route = map.getRoute(new Position(0, 0), new Position(4, 4));
      expect(route.distance).toBe(8);
    });

    it('should handle complex building management', () => {
      const map = new Map();

      // Add buildings
      const factory = MockBuilding.create({ id: 'factory', position: new Position(1, 1) });
      const bank = MockBuilding.create({ id: 'bank', position: new Position(2, 2) });
      map.addBuilding(factory);
      map.addBuilding(bank);

      // Get adjacent positions around factory
      const adjacent = map.getAdjacentPositions(new Position(1, 1));
      expect(adjacent.some(pos => pos.equals(new Position(2, 1)))).toBe(true);

      // Remove factory
      map.removeBuilding('factory');
      expect(map.getBuilding(new Position(1, 1))).toBeNull();

      // Bank should still be there
      expect(map.getBuilding(new Position(2, 2))).toBe(bank);
    });
  });
});
