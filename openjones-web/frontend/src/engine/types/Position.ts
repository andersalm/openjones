/**
 * Position - Represents a grid position in the game world
 *
 * Part of Task A1: Position & Route Classes
 * Worker 1 - Track A (Core Engine)
 */

import { IPosition } from '../../../../shared/types/contracts';

export class Position implements IPosition {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    // Validate position is within grid bounds (0-4)
    if (x < 0 || x > 4 || y < 0 || y > 4) {
      throw new Error(`Position (${x}, ${y}) is out of bounds. Valid range is 0-4 for both x and y.`);
    }

    // Ensure position values are integers
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`Position coordinates must be integers. Got x=${x}, y=${y}`);
    }
  }

  /**
   * Check if this position equals another position
   */
  equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Get string representation of this position
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Calculate Manhattan distance to another position
   */
  distanceTo(other: IPosition): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  /**
   * Static factory method to create a Position
   */
  static create(x: number, y: number): Position {
    return new Position(x, y);
  }

  /**
   * Static factory method to create Position from an IPosition interface
   */
  static from(position: IPosition): Position {
    return new Position(position.x, position.y);
  }

  /**
   * Check if a position is valid (within game grid bounds)
   */
  static isValid(x: number, y: number): boolean {
    return x >= 0 && x <= 4 && y >= 0 && y <= 4 && Number.isInteger(x) && Number.isInteger(y);
  }
}
