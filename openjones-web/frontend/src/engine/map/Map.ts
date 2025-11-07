/**
 * Map - Represents the 5x5 game board with building placements
 *
 * Part of Task B2: Map System
 * Worker 2 - Track B (Domain Logic)
 *
 * This class manages the game board grid, building placement, and route calculation.
 * It uses the Position and Route classes from Task A1 (Worker 1).
 */

import { IMap, IBuilding, IPosition, IRoute, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { Position } from '../types/Position';
import { Route } from '../types/Route';

export class Map implements IMap {
  public readonly width: number = GAME_CONSTANTS.GRID_WIDTH;
  public readonly height: number = GAME_CONSTANTS.GRID_HEIGHT;

  private buildings: IBuilding[] = [];
  private buildingGrid: (IBuilding | null)[][] = [];

  constructor() {
    // Initialize the 5x5 grid with null values
    this.buildingGrid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(null));
  }

  /**
   * Add a building to the map at the specified position
   * @throws Error if position is occupied or invalid
   */
  addBuilding(building: IBuilding): void {
    const { x, y } = building.position;

    // Validate position
    if (!this.isValidPosition(building.position)) {
      throw new Error(
        `Cannot add building at ${building.position.toString()}: position is out of bounds`
      );
    }

    // Check if position is already occupied
    if (this.buildingGrid[y][x] !== null) {
      throw new Error(
        `Cannot add building at ${building.position.toString()}: position is already occupied`
      );
    }

    // Add building to the map
    this.buildings.push(building);
    this.buildingGrid[y][x] = building;
  }

  /**
   * Remove a building from the map
   */
  removeBuilding(buildingId: string): boolean {
    const building = this.getBuildingById(buildingId);
    if (!building) {
      return false;
    }

    // Remove from grid
    const { x, y } = building.position;
    this.buildingGrid[y][x] = null;

    // Remove from buildings array
    const index = this.buildings.findIndex((b) => b.id === buildingId);
    if (index >= 0) {
      this.buildings.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get the building at a specific position
   */
  getBuilding(position: IPosition): IBuilding | null {
    if (!this.isValidPosition(position)) {
      return null;
    }

    return this.buildingGrid[position.y][position.x];
  }

  /**
   * Get all buildings on the map
   */
  getAllBuildings(): IBuilding[] {
    return [...this.buildings]; // Return a copy to prevent external modification
  }

  /**
   * Get a building by its ID
   */
  getBuildingById(id: string): IBuilding | null {
    return this.buildings.find((b) => b.id === id) || null;
  }

  /**
   * Check if a position is within the map bounds
   */
  isValidPosition(position: IPosition): boolean {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }

  /**
   * Calculate a route between two positions using Manhattan distance
   * Uses the Route class from Task A1
   */
  getRoute(from: IPosition, to: IPosition): IRoute {
    // Validate positions
    if (!this.isValidPosition(from)) {
      throw new Error(`Starting position ${from.toString()} is invalid`);
    }
    if (!this.isValidPosition(to)) {
      throw new Error(`Ending position ${to.toString()} is invalid`);
    }

    // Use the Route class to calculate Manhattan distance route
    // Route class already handles the pathfinding logic
    return Route.createManhattan(from, to);
  }

  /**
   * Get all valid adjacent positions (up, down, left, right)
   * Does not include diagonal positions
   */
  getAdjacentPositions(position: IPosition): IPosition[] {
    if (!this.isValidPosition(position)) {
      return [];
    }

    const adjacent: IPosition[] = [];
    const deltas: [number, number][] = [
      [-1, 0], // left
      [1, 0],  // right
      [0, -1], // up
      [0, 1],  // down
    ];

    for (const [dx, dy] of deltas) {
      const newX = position.x + dx;
      const newY = position.y + dy;

      if (Position.isValid(newX, newY)) {
        adjacent.push(new Position(newX, newY));
      }
    }

    return adjacent;
  }

  /**
   * Check if a position is empty (no building)
   */
  isEmpty(position: IPosition): boolean {
    return this.getBuilding(position) === null;
  }

  /**
   * Check if a player can move to a position
   * A position is moveable if it's valid (within bounds)
   * Buildings don't block movement - players can enter buildings
   */
  canMoveTo(position: IPosition): boolean {
    return this.isValidPosition(position);
  }

  /**
   * Get the distance between two positions (Manhattan distance)
   */
  getDistance(from: IPosition, to: IPosition): number {
    if (!this.isValidPosition(from) || !this.isValidPosition(to)) {
      return -1;
    }

    return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
  }

  /**
   * Static factory method to create an empty Map
   */
  static create(): Map {
    return new Map();
  }

  /**
   * Static factory method to create a Map with buildings
   */
  static createWithBuildings(buildings: IBuilding[]): Map {
    const map = new Map();
    for (const building of buildings) {
      map.addBuilding(building);
    }
    return map;
  }

  /**
   * Get a string representation of the map for debugging
   */
  toString(): string {
    let result = `Map (${this.width}x${this.height}):\n`;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const building = this.buildingGrid[y][x];
        result += building ? 'B' : '.';
        result += ' ';
      }
      result += '\n';
    }
    return result;
  }
}
