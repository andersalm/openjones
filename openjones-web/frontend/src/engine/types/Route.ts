/**
 * Route - Represents a path between two positions on the game grid
 *
 * Part of Task A1: Position & Route Classes
 * Worker 1 - Track A (Core Engine)
 */

import { IRoute, IPosition } from '../../../../shared/types/contracts';
import { Position } from './Position';

export class Route implements IRoute {
  public readonly start: IPosition;
  public readonly end: IPosition;
  public readonly positions: IPosition[];
  public readonly distance: number;

  constructor(start: IPosition, end: IPosition, positions?: IPosition[]) {
    this.start = start;
    this.end = end;

    // If positions are provided, use them; otherwise calculate the route
    if (positions && positions.length > 0) {
      // Validate that the provided positions form a valid path
      if (!positions[0].equals(start)) {
        throw new Error('Route must start at the start position');
      }
      if (!positions[positions.length - 1].equals(end)) {
        throw new Error('Route must end at the end position');
      }

      this.positions = positions;
      this.distance = this.calculateDistance(positions);
    } else {
      // Calculate Manhattan distance route
      this.positions = this.calculateManhattanRoute(start, end);
      this.distance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    }
  }

  /**
   * Calculate Manhattan distance from the positions array
   */
  private calculateDistance(positions: IPosition[]): number {
    if (positions.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      totalDistance += Math.abs(next.x - current.x) + Math.abs(next.y - current.y);
    }
    return totalDistance;
  }

  /**
   * Calculate a Manhattan distance route (move horizontally first, then vertically)
   */
  private calculateManhattanRoute(start: IPosition, end: IPosition): IPosition[] {
    const route: IPosition[] = [];
    let currentX = start.x;
    let currentY = start.y;

    // Add starting position
    route.push(new Position(currentX, currentY));

    // Move horizontally first
    while (currentX !== end.x) {
      if (currentX < end.x) {
        currentX++;
      } else {
        currentX--;
      }
      route.push(new Position(currentX, currentY));
    }

    // Then move vertically
    while (currentY !== end.y) {
      if (currentY < end.y) {
        currentY++;
      } else {
        currentY--;
      }
      route.push(new Position(currentX, currentY));
    }

    return route;
  }

  /**
   * Get the number of steps in this route (excluding the starting position)
   */
  getStepCount(): number {
    return this.positions.length - 1;
  }

  /**
   * Check if this route contains a specific position
   */
  contains(position: IPosition): boolean {
    return this.positions.some(p => p.equals(position));
  }

  /**
   * Get the position at a specific step index
   */
  getPositionAtStep(step: number): IPosition | null {
    if (step < 0 || step >= this.positions.length) {
      return null;
    }
    return this.positions[step];
  }

  /**
   * Static factory method to create a Route
   */
  static create(start: IPosition, end: IPosition, positions?: IPosition[]): Route {
    return new Route(start, end, positions);
  }

  /**
   * Static factory method to create a direct route using Manhattan distance
   */
  static createManhattan(start: IPosition, end: IPosition): Route {
    return new Route(start, end);
  }

  /**
   * Get string representation of this route
   */
  toString(): string {
    const pathStr = this.positions.map(p => `(${p.x},${p.y})`).join(' -> ');
    return `Route[distance=${this.distance}]: ${pathStr}`;
  }
}
