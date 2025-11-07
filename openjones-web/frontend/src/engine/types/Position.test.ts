/**
 * Unit tests for Position class
 *
 * Part of Task A1: Position & Route Classes
 * Worker 1 - Track A (Core Engine)
 */

import { describe, it, expect } from 'vitest';
import { Position } from './Position';

describe('Position', () => {
  describe('constructor', () => {
    it('should create a position with valid coordinates', () => {
      const pos = new Position(2, 3);
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });

    it('should create a position at origin (0, 0)', () => {
      const pos = new Position(0, 0);
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it('should create a position at grid boundaries (4, 4)', () => {
      const pos = new Position(4, 4);
      expect(pos.x).toBe(4);
      expect(pos.y).toBe(4);
    });

    it('should throw error for x coordinate below 0', () => {
      expect(() => new Position(-1, 2)).toThrow('out of bounds');
    });

    it('should throw error for x coordinate above 4', () => {
      expect(() => new Position(5, 2)).toThrow('out of bounds');
    });

    it('should throw error for y coordinate below 0', () => {
      expect(() => new Position(2, -1)).toThrow('out of bounds');
    });

    it('should throw error for y coordinate above 4', () => {
      expect(() => new Position(2, 5)).toThrow('out of bounds');
    });

    it('should throw error for non-integer x coordinate', () => {
      expect(() => new Position(2.5, 3)).toThrow('must be integers');
    });

    it('should throw error for non-integer y coordinate', () => {
      expect(() => new Position(2, 3.7)).toThrow('must be integers');
    });

    it('should throw error for both non-integer coordinates', () => {
      expect(() => new Position(1.5, 2.5)).toThrow('must be integers');
    });
  });

  describe('equals', () => {
    it('should return true for identical positions', () => {
      const pos1 = new Position(2, 3);
      const pos2 = new Position(2, 3);
      expect(pos1.equals(pos2)).toBe(true);
    });

    it('should return true when comparing position to itself', () => {
      const pos = new Position(2, 3);
      expect(pos.equals(pos)).toBe(true);
    });

    it('should return false for different x coordinates', () => {
      const pos1 = new Position(1, 3);
      const pos2 = new Position(2, 3);
      expect(pos1.equals(pos2)).toBe(false);
    });

    it('should return false for different y coordinates', () => {
      const pos1 = new Position(2, 1);
      const pos2 = new Position(2, 3);
      expect(pos1.equals(pos2)).toBe(false);
    });

    it('should return false for both coordinates different', () => {
      const pos1 = new Position(1, 1);
      const pos2 = new Position(3, 4);
      expect(pos1.equals(pos2)).toBe(false);
    });

    it('should work with IPosition interface objects', () => {
      const pos1 = new Position(2, 3);
      const pos2 = { x: 2, y: 3, equals: () => false, toString: () => '' };
      expect(pos1.equals(pos2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return formatted string representation', () => {
      const pos = new Position(2, 3);
      expect(pos.toString()).toBe('(2, 3)');
    });

    it('should format origin correctly', () => {
      const pos = new Position(0, 0);
      expect(pos.toString()).toBe('(0, 0)');
    });

    it('should format grid boundaries correctly', () => {
      const pos = new Position(4, 4);
      expect(pos.toString()).toBe('(4, 4)');
    });
  });

  describe('distanceTo', () => {
    it('should return 0 for same position', () => {
      const pos1 = new Position(2, 3);
      const pos2 = new Position(2, 3);
      expect(pos1.distanceTo(pos2)).toBe(0);
    });

    it('should calculate Manhattan distance horizontally', () => {
      const pos1 = new Position(0, 2);
      const pos2 = new Position(4, 2);
      expect(pos1.distanceTo(pos2)).toBe(4);
    });

    it('should calculate Manhattan distance vertically', () => {
      const pos1 = new Position(2, 0);
      const pos2 = new Position(2, 4);
      expect(pos1.distanceTo(pos2)).toBe(4);
    });

    it('should calculate Manhattan distance diagonally', () => {
      const pos1 = new Position(0, 0);
      const pos2 = new Position(3, 2);
      expect(pos1.distanceTo(pos2)).toBe(5); // 3 + 2
    });

    it('should calculate Manhattan distance across entire grid', () => {
      const pos1 = new Position(0, 0);
      const pos2 = new Position(4, 4);
      expect(pos1.distanceTo(pos2)).toBe(8); // 4 + 4
    });

    it('should calculate distance symmetrically', () => {
      const pos1 = new Position(1, 1);
      const pos2 = new Position(3, 4);
      expect(pos1.distanceTo(pos2)).toBe(pos2.distanceTo(pos1));
    });
  });

  describe('create (factory method)', () => {
    it('should create a valid position', () => {
      const pos = Position.create(2, 3);
      expect(pos).toBeInstanceOf(Position);
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });

    it('should throw error for invalid coordinates', () => {
      expect(() => Position.create(-1, 2)).toThrow();
      expect(() => Position.create(5, 2)).toThrow();
    });
  });

  describe('from (factory method)', () => {
    it('should create Position from IPosition interface', () => {
      const iPos = { x: 2, y: 3, equals: () => false, toString: () => '' };
      const pos = Position.from(iPos);
      expect(pos).toBeInstanceOf(Position);
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });

    it('should create Position from another Position', () => {
      const original = new Position(2, 3);
      const copy = Position.from(original);
      expect(copy).not.toBe(original); // Different objects
      expect(copy.equals(original)).toBe(true); // But equal values
    });
  });

  describe('isValid (static method)', () => {
    it('should return true for valid coordinates', () => {
      expect(Position.isValid(0, 0)).toBe(true);
      expect(Position.isValid(2, 3)).toBe(true);
      expect(Position.isValid(4, 4)).toBe(true);
    });

    it('should return false for x < 0', () => {
      expect(Position.isValid(-1, 2)).toBe(false);
    });

    it('should return false for x > 4', () => {
      expect(Position.isValid(5, 2)).toBe(false);
    });

    it('should return false for y < 0', () => {
      expect(Position.isValid(2, -1)).toBe(false);
    });

    it('should return false for y > 4', () => {
      expect(Position.isValid(2, 5)).toBe(false);
    });

    it('should return false for non-integer coordinates', () => {
      expect(Position.isValid(2.5, 3)).toBe(false);
      expect(Position.isValid(2, 3.5)).toBe(false);
      expect(Position.isValid(1.5, 2.5)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should have readonly x and y coordinates (TypeScript compile-time check)', () => {
      const pos = new Position(2, 3);
      // TypeScript prevents modification at compile time with readonly modifier
      // This test verifies the coordinates are accessible but tests are compile-time safe
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);

      // Note: TypeScript's readonly is a compile-time check, not runtime enforcement
      // The following would fail TypeScript compilation:
      // pos.x = 5;  // Error: Cannot assign to 'x' because it is a read-only property
      // pos.y = 5;  // Error: Cannot assign to 'y' because it is a read-only property
    });
  });
});
