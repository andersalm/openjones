/**
 * InputHandler - Manages player input (mouse clicks and keyboard)
 *
 * Part of Task I3: Input & Interaction System
 * Worker 3 - Round 5 (Integration)
 *
 * This class bridges player input to game actions by:
 * - Converting canvas clicks to map positions
 * - Handling keyboard shortcuts for movement and actions
 * - Creating and executing appropriate action instances
 * - Managing building interaction flow
 */

import { IPosition } from '@shared/types/contracts';
import { Position } from '../engine/types/Position';
import { MovementAction } from '../engine/actions/MovementAction';
import { EnterBuildingAction } from '../engine/actions/EnterBuildingAction';
import { GameController } from '../engine/GameController';

export interface InputHandlerConfig {
  canvas: HTMLCanvasElement;
  gameController: GameController;
  playerId: string;
  tileSize?: number;
  onActionSelected?: (actionType: string) => void;
  onBuildingSelected?: (buildingId: string) => void;
}

export interface InputState {
  selectedBuilding: string | null;
  availableActions: string[];
  isInteracting: boolean;
}

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private gameController: GameController;
  private playerId: string;
  private tileSize: number; // Kept for backward compatibility
  private tileWidth: number;
  private tileHeight: number;

  private readonly MAP_COLS = 5;
  private readonly MAP_ROWS = 5;

  private state: InputState = {
    selectedBuilding: null,
    availableActions: [],
    isInteracting: false,
  };

  // Event listeners
  private clickListener?: (e: MouseEvent) => void;
  private keyListener?: (e: KeyboardEvent) => void;

  // Callbacks
  private onActionSelected?: (actionType: string) => void;
  private onBuildingSelected?: (buildingId: string) => void;

  constructor(config: InputHandlerConfig) {
    this.canvas = config.canvas;
    this.gameController = config.gameController;
    this.playerId = config.playerId;
    this.tileSize = config.tileSize || 32;

    // Calculate rectangular tile dimensions based on canvas size
    this.tileWidth = this.canvas.width / this.MAP_COLS;
    this.tileHeight = this.canvas.height / this.MAP_ROWS;

    this.onActionSelected = config.onActionSelected;
    this.onBuildingSelected = config.onBuildingSelected;
  }

  /**
   * Initialize and attach event listeners
   */
  initialize(): void {
    this.clickListener = (e: MouseEvent) => this.handleClick(e);
    this.keyListener = (e: KeyboardEvent) => this.handleKeyPress(e);

    this.canvas.addEventListener('click', this.clickListener);
    document.addEventListener('keydown', this.keyListener);
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (this.clickListener) {
      this.canvas.removeEventListener('click', this.clickListener);
    }
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
    }
  }

  /**
   * Handle canvas click
   */
  private handleClick(event: MouseEvent): void {
    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to map position
    const mapPos = this.screenToMapPosition(x, y);

    // Determine what was clicked
    this.processClick(mapPos);
  }

  /**
   * Convert screen coordinates to map position
   * Updated for rectangular tiles (155x96)
   */
  private screenToMapPosition(screenX: number, screenY: number): Position {
    const mapX = Math.floor(screenX / this.tileWidth);
    const mapY = Math.floor(screenY / this.tileHeight);
    return new Position(mapX, mapY);
  }

  /**
   * Convert map position to screen coordinates
   * Updated for rectangular tiles (155x96)
   */
  mapToScreenPosition(mapPos: Position): { x: number; y: number } {
    return {
      x: mapPos.x * this.tileWidth,
      y: mapPos.y * this.tileHeight,
    };
  }

  /**
   * Get tile bounds in screen space
   */
  getTileBounds(mapPos: Position): { x: number; y: number; width: number; height: number } {
    const screen = this.mapToScreenPosition(mapPos);
    return {
      x: screen.x,
      y: screen.y,
      width: this.tileSize,
      height: this.tileSize,
    };
  }

  /**
   * Check if screen coordinates are inside tile
   */
  isInsideTile(screenX: number, screenY: number, mapPos: Position): boolean {
    const bounds = this.getTileBounds(mapPos);
    return (
      screenX >= bounds.x &&
      screenX < bounds.x + bounds.width &&
      screenY >= bounds.y &&
      screenY < bounds.y + bounds.height
    );
  }

  /**
   * Process click on map position
   */
  private processClick(position: Position): void {
    const game = this.gameController.getGame();
    const player = game.getPlayerById(this.playerId);
    if (!player) {
      console.warn('Player not found');
      return;
    }

    // Check if clicked on a building
    const building = game.map.getBuilding(position);

    if (building) {
      this.handleBuildingClick(building.id, position);
    } else {
      // Empty tile - move player
      this.handleMovementClick(position);
    }
  }

  /**
   * Handle click on building
   */
  private handleBuildingClick(buildingId: string, position: Position): void {
    const game = this.gameController.getGame();
    const player = game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    // Check if player is at the building position
    const isAtBuilding = this.isAtPosition(player.state.position, position);

    if (isAtBuilding) {
      // Enter building (EnterBuildingAction takes position, not buildingId)
      const action = new EnterBuildingAction(position);
      this.gameController.executeAction(this.playerId, action);

      // Notify UI to show building modal
      if (this.onBuildingSelected) {
        this.onBuildingSelected(buildingId);
      }

      this.state.selectedBuilding = buildingId;
      this.state.isInteracting = true;
    } else {
      // Move to building first
      this.handleMovementClick(position);
    }
  }

  /**
   * Handle click on empty tile (movement)
   */
  private handleMovementClick(position: Position): void {
    const game = this.gameController.getGame();
    const player = game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    const currentPos = player.state.position;

    // Check if position is reachable
    if (!this.isValidMove(currentPos, position)) {
      console.warn('Invalid move target');
      return;
    }

    // Create movement action (takes fromPosition and toPosition)
    const action = new MovementAction(currentPos, position);
    this.gameController.executeAction(this.playerId, action);
  }

  /**
   * Check if move is valid - only allow movement to buildings and roads
   */
  private isValidMove(_from: IPosition, to: IPosition): boolean {
    const game = this.gameController.getGame();

    // Check map bounds
    if (!game.map.isValidPosition(to)) {
      return false;
    }

    // Allow movement to buildings
    const building = game.map.getBuilding(to);
    if (building) {
      return true;
    }

    // Allow movement to road tiles (edges and adjacent to buildings)
    // Roads are on rows 0, 1, 3, 4 (not row 2 which is center)
    // Or any tile adjacent to a building
    if (this.isRoadTile(to, game)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a position is a valid road tile
   * Roads are tiles that are on the edges or adjacent to buildings
   */
  private isRoadTile(pos: IPosition, game: any): boolean {
    // Edge rows are roads (top and bottom)
    if (pos.y === 0 || pos.y === 4) {
      return true;
    }

    // Edge columns are roads (left side)
    if (pos.x === 0) {
      return true;
    }

    // Right side tiles
    if (pos.x === 4) {
      return true;
    }

    // Middle column (x=2) on rows 1 and 3 are roads
    if (pos.x === 2 && (pos.y === 1 || pos.y === 3)) {
      return true;
    }

    // Check if adjacent to any building (within 1 tile)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const adjPos = { x: pos.x + dx, y: pos.y + dy };
        if (game.map.getBuilding(adjPos)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if player is at the exact position
   */
  private isAtPosition(playerPos: IPosition, targetPos: IPosition): boolean {
    return playerPos.x === targetPos.x && playerPos.y === targetPos.y;
  }

  /**
   * Handle keyboard input
   */
  private handleKeyPress(event: KeyboardEvent): void {
    const game = this.gameController.getGame();
    const player = game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    const currentPos = player.state.position;

    // Movement keys
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (Position.isValid(currentPos.x, currentPos.y - 1)) {
          this.handleMovementClick(new Position(currentPos.x, currentPos.y - 1));
        }
        event.preventDefault();
        break;

      case 'ArrowDown':
      case 's':
      case 'S':
        if (Position.isValid(currentPos.x, currentPos.y + 1)) {
          this.handleMovementClick(new Position(currentPos.x, currentPos.y + 1));
        }
        event.preventDefault();
        break;

      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (Position.isValid(currentPos.x - 1, currentPos.y)) {
          this.handleMovementClick(new Position(currentPos.x - 1, currentPos.y));
        }
        event.preventDefault();
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        if (Position.isValid(currentPos.x + 1, currentPos.y)) {
          this.handleMovementClick(new Position(currentPos.x + 1, currentPos.y));
        }
        event.preventDefault();
        break;

      // Action shortcuts
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        this.handleActionShortcut(parseInt(event.key));
        break;

      // Exit interaction
      case 'Escape':
        this.exitInteraction();
        break;

      // Debug
      case '`':
        this.toggleDebug();
        break;
    }
  }

  /**
   * Handle action shortcut keys
   */
  private handleActionShortcut(actionIndex: number): void {
    if (this.state.isInteracting && this.state.availableActions[actionIndex - 1]) {
      const actionType = this.state.availableActions[actionIndex - 1];
      this.executeActionByType(actionType);
    }
  }

  /**
   * Execute action by type name
   */
  private executeActionByType(actionType: string): void {
    // Notify UI that action was selected
    if (this.onActionSelected) {
      this.onActionSelected(actionType);
    }
  }

  /**
   * Exit building interaction
   */
  private exitInteraction(): void {
    if (this.state.isInteracting) {
      this.state.selectedBuilding = null;
      this.state.isInteracting = false;
      this.state.availableActions = [];
    }
  }

  /**
   * Toggle debug mode
   */
  private toggleDebug(): void {
    const game = this.gameController.getGame();
    const player = game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    console.log('Debug:', {
      playerPos: player.state.position,
      gameWeek: game.currentWeek,
      timeRemaining: game.timeUnitsRemaining,
      cash: player.state.cash,
      health: player.state.health,
      happiness: player.state.happiness,
    });
  }

  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.state };
  }

  /**
   * Set available actions (called by UI)
   */
  setAvailableActions(actions: string[]): void {
    this.state.availableActions = actions;
  }
}
