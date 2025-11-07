import type { IMap, IBuilding } from '@shared/types/contracts';
import type { RenderOptions, ViewportSize } from './types';

/**
 * Simple interface for SpriteManager (being developed in parallel by Worker 1)
 */
export interface SpriteManager {
  getSprite(spriteId: string): HTMLImageElement | null;
}

/**
 * MapRenderer - Renders the 5x5 game board with buildings and tiles
 *
 * Part of Task D3: Map Renderer
 * Worker 2 - Track D (Rendering)
 *
 * This class manages rendering the game map to an HTML5 Canvas element,
 * including background tiles, building sprites, and responsive scaling.
 */
export class MapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteManager: SpriteManager;
  private options: RenderOptions;

  constructor(
    canvas: HTMLCanvasElement,
    spriteManager: SpriteManager,
    options?: Partial<RenderOptions>
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.spriteManager = spriteManager;

    // Default options
    this.options = {
      tileWidth: 128,
      tileHeight: 96,
      gridWidth: 5,
      gridHeight: 5,
      scale: 1,
      ...options,
    };

    this.setupCanvas();
  }

  /**
   * Setup canvas size and scaling
   */
  private setupCanvas(): void {
    const width = this.options.tileWidth * this.options.gridWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.gridHeight * this.options.scale;

    this.canvas.width = width;
    this.canvas.height = height;

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Render the complete map
   */
  render(map: IMap): void {
    this.clear();
    this.renderBackground();
    this.renderBuildings(map);
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render background grid
   */
  private renderBackground(): void {
    // Fill with grass/background color
    this.ctx.fillStyle = '#4a7c59'; // Grass green
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines (optional, for development)
    this.ctx.strokeStyle = '#3a6c49';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.options.gridWidth; x++) {
      const xPos = x * this.options.tileWidth * this.options.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.options.gridHeight; y++) {
      const yPos = y * this.options.tileHeight * this.options.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
      this.ctx.stroke();
    }
  }

  /**
   * Render all buildings on the map
   */
  private renderBuildings(map: IMap): void {
    const buildings = map.getAllBuildings();

    for (const building of buildings) {
      this.renderBuilding(building);
    }
  }

  /**
   * Render a single building
   */
  private renderBuilding(building: IBuilding): void {
    // Get building sprite based on building type
    const spriteId = this.getBuildingSpriteId(building);
    const sprite = this.spriteManager.getSprite(spriteId);

    if (!sprite) {
      // Sprite not loaded yet, render placeholder
      this.renderPlaceholder(building);
      return;
    }

    const x = building.position.x * this.options.tileWidth * this.options.scale;
    const y = building.position.y * this.options.tileHeight * this.options.scale;
    const width = this.options.tileWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.scale;

    this.ctx.drawImage(sprite, x, y, width, height);
  }

  /**
   * Render placeholder for missing sprites
   */
  private renderPlaceholder(building: IBuilding): void {
    const x = building.position.x * this.options.tileWidth * this.options.scale;
    const y = building.position.y * this.options.tileHeight * this.options.scale;
    const width = this.options.tileWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.scale;

    // Draw colored rectangle
    this.ctx.fillStyle = '#888';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Draw building name
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(building.name, x + width / 2, y + height / 2);
  }

  /**
   * Map building type to sprite ID
   */
  private getBuildingSpriteId(building: IBuilding): string {
    // Map BuildingType enum to sprite IDs from manifest
    // This is a simplified mapping - adjust based on actual sprite IDs
    const typeMap: Record<string, string> = {
      FACTORY: 'factory-bot',
      BANK: 'bank-bot',
      COLLEGE: 'clock-bot', // Clock = college in original game
      EMPLOYMENT_AGENCY: 'employment-bot',
      DEPARTMENT_STORE: 'clothing', // Placeholder
      CLOTHES_STORE: 'clothing',
      APPLIANCE_STORE: 'socket-bot',
      PAWN_SHOP: 'pawn',
      RESTAURANT: 'zmart', // Placeholder
      SUPERMARKET: 'zmart',
      RENT_AGENCY: 'rent',
      LOW_COST_APARTMENT: 'lowcost',
      SECURITY_APARTMENT: 'hitech-bot',
    };

    return typeMap[building.type] || 'test00';
  }

  /**
   * Handle window resize
   */
  resize(viewportSize: ViewportSize): void {
    // Calculate scale to fit viewport
    const scaleX = viewportSize.width / (this.options.tileWidth * this.options.gridWidth);
    const scaleY = viewportSize.height / (this.options.tileHeight * this.options.gridHeight);
    this.options.scale = Math.min(scaleX, scaleY, 1); // Max scale of 1

    this.setupCanvas();
  }

  /**
   * Get canvas size
   */
  getCanvasSize(): ViewportSize {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    const gridX = Math.floor(screenX / (this.options.tileWidth * this.options.scale));
    const gridY = Math.floor(screenY / (this.options.tileHeight * this.options.scale));

    return { x: gridX, y: gridY };
  }
}
