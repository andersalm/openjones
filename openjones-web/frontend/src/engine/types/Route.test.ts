/**
 * Unit tests for Route class
 *
 * Part of Task A1: Position & Route Classes
 * Worker 1 - Track A (Core Engine)
 */

import { describe, it, expect } from 'vitest';
import { Route } from './Route';
import { Position } from './Position';

describe('Route', () => {
  describe('constructor - automatic Manhattan route', () => {
    it('should create route with same start and end', () => {
      const start = new Position(2, 2);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      expect(route.start.equals(start)).toBe(true);
      expect(route.end.equals(end)).toBe(true);
      expect(route.distance).toBe(0);
      expect(route.positions).toHaveLength(1);
      expect(route.positions[0].equals(start)).toBe(true);
    });

    it('should create horizontal route (east)', () => {
      const start = new Position(0, 2);
      const end = new Position(3, 2);
      const route = new Route(start, end);

      expect(route.distance).toBe(3);
      expect(route.positions).toHaveLength(4); // 0,2 -> 1,2 -> 2,2 -> 3,2
      expect(route.positions[0].equals(new Position(0, 2))).toBe(true);
      expect(route.positions[1].equals(new Position(1, 2))).toBe(true);
      expect(route.positions[2].equals(new Position(2, 2))).toBe(true);
      expect(route.positions[3].equals(new Position(3, 2))).toBe(true);
    });

    it('should create horizontal route (west)', () => {
      const start = new Position(3, 2);
      const end = new Position(0, 2);
      const route = new Route(start, end);

      expect(route.distance).toBe(3);
      expect(route.positions).toHaveLength(4);
      expect(route.positions[0].equals(new Position(3, 2))).toBe(true);
      expect(route.positions[3].equals(new Position(0, 2))).toBe(true);
    });

    it('should create vertical route (south)', () => {
      const start = new Position(2, 0);
      const end = new Position(2, 3);
      const route = new Route(start, end);

      expect(route.distance).toBe(3);
      expect(route.positions).toHaveLength(4); // 2,0 -> 2,1 -> 2,2 -> 2,3
      expect(route.positions[0].equals(new Position(2, 0))).toBe(true);
      expect(route.positions[1].equals(new Position(2, 1))).toBe(true);
      expect(route.positions[2].equals(new Position(2, 2))).toBe(true);
      expect(route.positions[3].equals(new Position(2, 3))).toBe(true);
    });

    it('should create vertical route (north)', () => {
      const start = new Position(2, 3);
      const end = new Position(2, 0);
      const route = new Route(start, end);

      expect(route.distance).toBe(3);
      expect(route.positions).toHaveLength(4);
      expect(route.positions[0].equals(new Position(2, 3))).toBe(true);
      expect(route.positions[3].equals(new Position(2, 0))).toBe(true);
    });

    it('should create diagonal route (horizontal then vertical)', () => {
      const start = new Position(0, 0);
      const end = new Position(3, 2);
      const route = new Route(start, end);

      expect(route.distance).toBe(5); // 3 + 2
      expect(route.positions).toHaveLength(6); // 0,0 -> 1,0 -> 2,0 -> 3,0 -> 3,1 -> 3,2

      // Verify horizontal movement first
      expect(route.positions[0].equals(new Position(0, 0))).toBe(true);
      expect(route.positions[1].equals(new Position(1, 0))).toBe(true);
      expect(route.positions[2].equals(new Position(2, 0))).toBe(true);
      expect(route.positions[3].equals(new Position(3, 0))).toBe(true);

      // Then vertical movement
      expect(route.positions[4].equals(new Position(3, 1))).toBe(true);
      expect(route.positions[5].equals(new Position(3, 2))).toBe(true);
    });

    it('should create route across entire grid', () => {
      const start = new Position(0, 0);
      const end = new Position(4, 4);
      const route = new Route(start, end);

      expect(route.distance).toBe(8); // 4 + 4
      expect(route.positions).toHaveLength(9); // 8 moves + starting position
      expect(route.positions[0].equals(start)).toBe(true);
      expect(route.positions[8].equals(end)).toBe(true);
    });
  });

  describe('constructor - with provided positions', () => {
    it('should create route with valid custom positions', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const positions = [
        new Position(0, 0),
        new Position(1, 0),
        new Position(2, 0),
        new Position(2, 1),
        new Position(2, 2),
      ];
      const route = new Route(start, end, positions);

      expect(route.start.equals(start)).toBe(true);
      expect(route.end.equals(end)).toBe(true);
      expect(route.positions).toHaveLength(5);
      expect(route.distance).toBe(4);
    });

    it('should throw error if positions do not start at start position', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const positions = [
        new Position(1, 0), // Wrong start!
        new Position(2, 0),
        new Position(2, 2),
      ];

      expect(() => new Route(start, end, positions)).toThrow('must start at the start position');
    });

    it('should throw error if positions do not end at end position', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const positions = [
        new Position(0, 0),
        new Position(2, 0),
        new Position(2, 1), // Wrong end!
      ];

      expect(() => new Route(start, end, positions)).toThrow('must end at the end position');
    });

    it('should handle empty positions array by calculating route', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end, []);

      expect(route.positions.length).toBeGreaterThan(0);
      expect(route.distance).toBe(4);
    });
  });

  describe('getStepCount', () => {
    it('should return 0 for same position route', () => {
      const route = new Route(new Position(2, 2), new Position(2, 2));
      expect(route.getStepCount()).toBe(0);
    });

    it('should return correct step count for simple route', () => {
      const route = new Route(new Position(0, 0), new Position(3, 0));
      expect(route.getStepCount()).toBe(3);
    });

    it('should return correct step count for diagonal route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 3));
      expect(route.getStepCount()).toBe(5); // 2 horizontal + 3 vertical
    });
  });

  describe('contains', () => {
    it('should return true for start position', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      expect(route.contains(start)).toBe(true);
    });

    it('should return true for end position', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      expect(route.contains(end)).toBe(true);
    });

    it('should return true for intermediate positions', () => {
      const start = new Position(0, 0);
      const end = new Position(3, 0);
      const route = new Route(start, end);

      expect(route.contains(new Position(1, 0))).toBe(true);
      expect(route.contains(new Position(2, 0))).toBe(true);
    });

    it('should return false for positions not on route', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 0);
      const route = new Route(start, end);

      expect(route.contains(new Position(0, 1))).toBe(false);
      expect(route.contains(new Position(4, 4))).toBe(false);
    });
  });

  describe('getPositionAtStep', () => {
    it('should return start position at step 0', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      const pos = route.getPositionAtStep(0);
      expect(pos).not.toBeNull();
      expect(pos!.equals(start)).toBe(true);
    });

    it('should return end position at last step', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 0);
      const route = new Route(start, end);

      const pos = route.getPositionAtStep(route.getStepCount());
      expect(pos).not.toBeNull();
      expect(pos!.equals(end)).toBe(true);
    });

    it('should return intermediate positions correctly', () => {
      const start = new Position(0, 0);
      const end = new Position(3, 0);
      const route = new Route(start, end);

      expect(route.getPositionAtStep(1)!.equals(new Position(1, 0))).toBe(true);
      expect(route.getPositionAtStep(2)!.equals(new Position(2, 0))).toBe(true);
    });

    it('should return null for negative step', () => {
      const route = new Route(new Position(0, 0), new Position(2, 2));
      expect(route.getPositionAtStep(-1)).toBeNull();
    });

    it('should return null for step beyond route length', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      expect(route.getPositionAtStep(10)).toBeNull();
    });
  });

  describe('create (factory method)', () => {
    it('should create route using factory method', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = Route.create(start, end);

      expect(route).toBeInstanceOf(Route);
      expect(route.start.equals(start)).toBe(true);
      expect(route.end.equals(end)).toBe(true);
    });

    it('should create route with custom positions using factory', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 0);
      const positions = [
        new Position(0, 0),
        new Position(1, 0),
        new Position(2, 0),
      ];
      const route = Route.create(start, end, positions);

      expect(route.positions).toHaveLength(3);
    });
  });

  describe('createManhattan (factory method)', () => {
    it('should create Manhattan route explicitly', () => {
      const start = new Position(0, 0);
      const end = new Position(3, 2);
      const route = Route.createManhattan(start, end);

      expect(route).toBeInstanceOf(Route);
      expect(route.distance).toBe(5);
    });
  });

  describe('toString', () => {
    it('should return formatted string for simple route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      const str = route.toString();

      expect(str).toContain('Route');
      expect(str).toContain('distance=2');
      expect(str).toContain('(0,0)');
      expect(str).toContain('(2,0)');
      expect(str).toContain('->');
    });

    it('should format diagonal route correctly', () => {
      const route = new Route(new Position(0, 0), new Position(1, 1));
      const str = route.toString();

      expect(str).toContain('distance=2');
      expect(str).toContain('(0,0)');
      expect(str).toContain('(1,1)');
    });
  });

  describe('distance calculation', () => {
    it('should calculate correct distance for L-shaped custom path', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const positions = [
        new Position(0, 0),
        new Position(0, 1),
        new Position(0, 2),
        new Position(1, 2),
        new Position(2, 2),
      ];
      const route = new Route(start, end, positions);

      expect(route.distance).toBe(4); // Total Manhattan steps
    });

    it('should have symmetric distance for reverse routes', () => {
      const route1 = new Route(new Position(0, 0), new Position(3, 2));
      const route2 = new Route(new Position(3, 2), new Position(0, 0));

      expect(route1.distance).toBe(route2.distance);
    });
  });

  describe('edge cases', () => {
    it('should handle all corner positions', () => {
      const corners = [
        new Position(0, 0),
        new Position(0, 4),
        new Position(4, 0),
        new Position(4, 4),
      ];

      for (const corner1 of corners) {
        for (const corner2 of corners) {
          const route = new Route(corner1, corner2);
          expect(route.start.equals(corner1)).toBe(true);
          expect(route.end.equals(corner2)).toBe(true);
          expect(route.distance).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should handle single-step routes', () => {
      const route = new Route(new Position(2, 2), new Position(2, 3));
      expect(route.distance).toBe(1);
      expect(route.getStepCount()).toBe(1);
      expect(route.positions).toHaveLength(2);
    });
  });
});
