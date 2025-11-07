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

import { IGame, IPosition } from '@shared/types/contracts';
import { Position } from '../engine/types/Position';
import { MovementAction } from '../engine/actions/MovementAction';
import { EnterBuildingAction } from '../engine/actions/EnterBuildingAction';

export interface InputHandlerConfig {
  canvas: HTMLCanvasElement;
  game: IGame;
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
  private game: IGame;
  private playerId: string;
  private tileSize: number;

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
    this.game = config.game;
    this.playerId = config.playerId;
    this.tileSize = config.tileSize || 32;
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
   */
  private screenToMapPosition(screenX: number, screenY: number): Position {
    const mapX = Math.floor(screenX / this.tileSize);
    const mapY = Math.floor(screenY / this.tileSize);
    return new Position(mapX, mapY);
  }

  /**
   * Convert map position to screen coordinates
   */
  mapToScreenPosition(mapPos: Position): { x: number; y: number } {
    return {
      x: mapPos.x * this.tileSize,
      y: mapPos.y * this.tileSize,
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
    const player = this.game.getPlayerById(this.playerId);
    if (!player) {
      console.warn('Player not found');
      return;
    }

    // Check if clicked on a building
    const building = this.game.map.getBuilding(position);

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
    const player = this.game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    // Check if player is at the building position
    const isAtBuilding = this.isAtPosition(player.state.position, position);

    if (isAtBuilding) {
      // Enter building (EnterBuildingAction takes position, not buildingId)
      const action = new EnterBuildingAction(position);
      this.game.processTurn(this.playerId, action);

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
    const player = this.game.getPlayerById(this.playerId);
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
    this.game.processTurn(this.playerId, action);
  }

  /**
   * Check if move is valid
   */
  private isValidMove(_from: IPosition, to: IPosition): boolean {
    // Check map bounds
    if (!this.game.map.isValidPosition(to)) {
      return false;
    }

    // Allow any distance - pathfinding will handle it
    return true;
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
    const player = this.game.getPlayerById(this.playerId);
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
    const player = this.game.getPlayerById(this.playerId);
    if (!player) {
      return;
    }

    console.log('Debug:', {
      playerPos: player.state.position,
      gameWeek: this.game.currentWeek,
      timeRemaining: this.game.timeUnitsRemaining,
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
