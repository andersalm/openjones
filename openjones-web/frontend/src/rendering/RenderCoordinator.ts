/**
 * RenderCoordinator - Orchestrates all rendering systems for OpenJones browser port
 *
 * This class coordinates:
 * - AnimationEngine for smooth transitions
 * - EffectsRenderer for visual effects
 * - Canvas rendering for game state visualization
 * - Layer management for proper draw order
 *
 * Part of Task I2: Render Pipeline Integration
 * Worker 2 - Session 5
 */

import { AnimationEngine } from './AnimationEngine';
import { EffectsRenderer } from './EffectsRenderer';
import { Easing } from './easing';
import type { IGame } from '@shared/types/contracts';

export interface RenderCoordinatorConfig {
  canvas: HTMLCanvasElement;
  game: IGame;
  pixelScale?: number; // Scale for retro pixel art (default: 2)
  showFPS?: boolean;
}

export interface RenderLayer {
  name: string;
  zIndex: number;
  visible: boolean;
}

export interface RenderStats {
  fps: number;
  frameCount: number;
  renderTime: number;
}

/**
 * Main coordinator class that manages all rendering systems
 */
export class RenderCoordinator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: IGame;
  private pixelScale: number;

  private animationEngine: AnimationEngine;
  private effectsRenderer: EffectsRenderer;

  private isRunning: boolean = false;
  private lastRenderTime: number = 0;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;
  private showFPS: boolean = false;

  // Render layers for proper draw order
  private layers: Map<string, RenderLayer> = new Map();

  // Previous game state for detecting changes
  private previousGameState: string | null = null;

  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;

  // Building images from Java graphics
  private buildingImages: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;

  // Full map background image (775x480 - 5x5 grid of 155x96 tiles)
  private mapBackgroundImage: HTMLImageElement | null = null;
  private mapBackgroundLoaded: boolean = false;

  // Map grid dimensions (5x5 grid of 155x96 tiles in Java)
  private readonly MAP_COLS = 5;
  private readonly MAP_ROWS = 5;

  // Center tile images (test06-18) - kept for fallback
  private centerTileImages: Map<string, HTMLImageElement> = new Map();
  private centerImagesLoaded: boolean = false;

  // Grass tile image - kept for fallback
  private grassTileImage: HTMLImageElement | null = null;
  private grassImageLoaded: boolean = false;

  // Clock images for time display (TODO: render in UI layer)
  private clockImages: Map<string, HTMLImageElement> = new Map();

  // Player animation state
  private playerAnimations: Map<string, {
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    startTime: number;
    duration: number; // milliseconds
  }> = new Map();

  private readonly MOVE_ANIMATION_DURATION = 500; // 500ms per move

  constructor(config: RenderCoordinatorConfig) {
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.game = config.game;
    this.pixelScale = config.pixelScale ?? 2;
    this.showFPS = config.showFPS ?? false;

    // GLOBAL FIX: Enforce pixel-perfect rendering (no anti-aliasing)
    // This ensures all sprites render sharp without blur
    this.ctx.imageSmoothingEnabled = false;
    (this.ctx as any).mozImageSmoothingEnabled = false;
    (this.ctx as any).webkitImageSmoothingEnabled = false;
    (this.ctx as any).msImageSmoothingEnabled = false;

    // Initialize rendering systems
    this.animationEngine = new AnimationEngine();
    this.effectsRenderer = new EffectsRenderer(this.canvas);

    // Set up render layers
    this.initializeLayers();

    // Load building images
    this.loadBuildingImages();

    // Load full map background image
    this.loadMapBackground();

    // Load center tile images (fallback)
    this.loadCenterTileImages();

    // Load grass tile image (fallback)
    this.loadGrassTileImage();

    // Load clock images
    this.loadClockImages();
  }

  /**
   * Initialize render layers (draw order from back to front)
   */
  private initializeLayers(): void {
    this.layers.set('background', { name: 'background', zIndex: 0, visible: true });
    this.layers.set('map', { name: 'map', zIndex: 1, visible: true });
    this.layers.set('buildings', { name: 'buildings', zIndex: 2, visible: true });
    this.layers.set('player', { name: 'player', zIndex: 3, visible: true });
    this.layers.set('effects', { name: 'effects', zIndex: 4, visible: true });
    this.layers.set('ui', { name: 'ui', zIndex: 5, visible: true });
  }

  /**
   * Load building images from Java graphics
   */
  private loadBuildingImages(): void {
    const imageMap: Record<string, string> = {
      'EMPLOYMENT_AGENCY': 'employment.png',
      'FACTORY': 'factory.png',
      'BANK': 'bank_bot.png',
      'COLLEGE': 'gt.png',
      'CLOTHES_STORE': 'zmart.png',
      'RESTAURANT': 'monolith.png',
      'RENT_AGENCY': 'rent.png',
      'LOW_COST_APARTMENT': 'lowcost.png',
      'SECURITY_APARTMENT': 'security.png',
    };

    let loadedCount = 0;
    const totalImages = Object.keys(imageMap).length;

    Object.entries(imageMap).forEach(([buildingType, filename]) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
          console.log('All building images loaded successfully');
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${filename}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
        }
      };
      img.src = `/buildings/${filename}`;
      this.buildingImages.set(buildingType, img);
    });
  }

  /**
   * Load full map background image (775x480 - authentic Java graphics)
   */
  private loadMapBackground(): void {
    const img = new Image();
    img.onload = () => {
      this.mapBackgroundLoaded = true;
      console.log('Map background loaded successfully (775x480)');
    };
    img.onerror = () => {
      console.warn('Failed to load map background, will use fallback tiles');
      this.mapBackgroundLoaded = false;
    };
    img.src = '/center/jones_map_grass.png';
    this.mapBackgroundImage = img;
  }

  /**
   * Load center tile images (3x3 grid in the middle of the 5x5 board)
   * Used as fallback if map background fails
   */
  private loadCenterTileImages(): void {
    // Map coordinates to test image numbers
    // Row 1, Col 1-3: test06, test07, test08
    // Row 2, Col 1-3: test11, test12, test13
    // Row 3, Col 1-3: test16, test17, test18
    const centerTiles = [
      { row: 1, col: 1, img: 'test06.png' },
      { row: 1, col: 2, img: 'test07.png' },
      { row: 1, col: 3, img: 'test08.png' },
      { row: 2, col: 1, img: 'test11.png' },
      { row: 2, col: 2, img: 'test12.png' },
      { row: 2, col: 3, img: 'test13.png' },
      { row: 3, col: 1, img: 'test16.png' },
      { row: 3, col: 2, img: 'test17.png' },
      { row: 3, col: 3, img: 'test18.png' },
    ];

    let loadedCount = 0;
    const totalImages = centerTiles.length;

    centerTiles.forEach(({ row, col, img }) => {
      const image = new Image();
      image.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.centerImagesLoaded = true;
          console.log('All center tile images loaded successfully');
        }
      };
      image.onerror = () => {
        console.warn(`Failed to load center tile: ${img}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          this.centerImagesLoaded = true;
        }
      };
      image.src = `/center/${img}`;
      this.centerTileImages.set(`${row},${col}`, image);
    });
  }

  /**
   * Load grass tile image for border tiles
   */
  private loadGrassTileImage(): void {
    const img = new Image();
    img.onload = () => {
      this.grassImageLoaded = true;
      console.log('Grass tile image loaded successfully');
    };
    img.onerror = () => {
      console.warn('Failed to load grass tile image');
      this.grassImageLoaded = true; // Set to true anyway to prevent blocking
    };
    img.src = '/center/Grass_small_blur.png';
    this.grassTileImage = img;
  }

  /**
   * Load clock images for time display (for future use in UI layer)
   */
  private loadClockImages(): void {
    const clockFiles = ['clock_bot.png', 'clock_top3.png'];

    clockFiles.forEach((filename) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Clock image loaded: ${filename}`);
      };
      img.onerror = () => {
        console.warn(`Failed to load clock image: ${filename}`);
      };
      img.src = `/center/${filename}`;
      const key = filename.includes('bot') ? 'bottom' : 'top';
      this.clockImages.set(key, img);
    });
  }

  /**
   * Start the rendering loop
   */
  start(): void {
    if (this.isRunning) return;

    console.log('RenderCoordinator starting...', {
      canvasSize: `${this.canvas.width}x${this.canvas.height}`,
      buildingCount: this.game.map.getAllBuildings().length,
      playerCount: this.game.players.length,
    });

    this.isRunning = true;
    this.lastRenderTime = performance.now();
    this.lastFPSUpdate = performance.now();
    this.animationEngine.start();
    this.renderLoop(performance.now());
  }

  /**
   * Stop the rendering loop
   */
  stop(): void {
    this.isRunning = false;
    this.animationEngine.stop();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Check if the render loop is running
   */
  isRendering(): boolean {
    return this.isRunning;
  }

  /**
   * Main render loop
   */
  private renderLoop(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastRenderTime;
    this.lastRenderTime = timestamp;

    // Update effects renderer
    this.effectsRenderer.update(deltaTime);

    // Update player animations
    this.updatePlayerAnimations(timestamp);

    // Clear canvas
    this.clear();

    // Render all layers in order with timestamp for animations
    this.renderAllLayers(timestamp);

    // Update FPS counter
    this.updateFPS();

    // Update frame counter
    this.frameCount++;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  /**
   * Update player movement animations
   */
  private updatePlayerAnimations(timestamp: number): void {
    // Detect and start new animations for position changes
    for (const player of this.game.players) {
      const currentAnim = this.playerAnimations.get(player.id);
      const playerPos = player.state.position;

      // If no animation or animation finished, check for position change
      if (!currentAnim || timestamp >= currentAnim.startTime + currentAnim.duration) {
        const lastPos = currentAnim ? currentAnim.endPos : playerPos;

        // Position changed - start new animation
        if (playerPos.x !== lastPos.x || playerPos.y !== lastPos.y) {
          this.playerAnimations.set(player.id, {
            startPos: { x: lastPos.x, y: lastPos.y },
            endPos: { x: playerPos.x, y: playerPos.y },
            startTime: timestamp,
            duration: this.MOVE_ANIMATION_DURATION,
          });
        }
      }
    }
  }

  /**
   * Get interpolated player position for animation
   */
  private getAnimatedPlayerPosition(playerId: string, currentPos: { x: number; y: number }, timestamp: number): { x: number; y: number } {
    const anim = this.playerAnimations.get(playerId);

    if (!anim) {
      return currentPos;
    }

    const elapsed = timestamp - anim.startTime;
    const progress = Math.min(elapsed / anim.duration, 1.0);

    // Ease out cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);

    return {
      x: anim.startPos.x + (anim.endPos.x - anim.startPos.x) * eased,
      y: anim.startPos.y + (anim.endPos.y - anim.startPos.y) * eased,
    };
  }

  /**
   * Clear the canvas
   */
  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render all layers in z-index order
   */
  private renderAllLayers(timestamp: number): void {
    // Sort layers by zIndex
    const sortedLayers = Array.from(this.layers.values())
      .filter((layer) => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      this.renderLayer(layer.name, timestamp);
    }
  }

  /**
   * Render a specific layer
   */
  private renderLayer(layerName: string, timestamp: number): void {
    switch (layerName) {
      case 'background':
        this.renderBackground();
        break;
      case 'map':
        this.renderMap();
        this.renderClock(); // Render clock (smart rendering based on map loaded state)
        break;
      case 'buildings':
        this.renderBuildings();
        break;
      case 'player':
        this.renderPlayers(timestamp);
        break;
      case 'effects':
        this.renderEffects();
        break;
      case 'ui':
        this.renderUI();
        break;
    }
  }

  /**
   * Render background layer - Retro DOS/Windows 95 style
   * Only fills when map image hasn't loaded (avoids double layer)
   */
  private renderBackground(): void {
    // FIX: Only fill background if map image hasn't loaded
    // Prevents wasteful overdraw when full map covers everything
    if (!this.mapBackgroundLoaded) {
      this.ctx.fillStyle = '#D4C4A8'; // Retro tan/beige fallback
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Render map layer - Full map background from Java (775x480)
   * Uses authentic jones_map_grass.png for proper aspect ratio
   */
  private renderMap(): void {
    this.ctx.imageSmoothingEnabled = false;

    if (this.mapBackgroundLoaded && this.mapBackgroundImage && this.mapBackgroundImage.complete) {
      // ONLY draw the full map background image (775x480)
      // This already contains everything: grass, center tiles, AND the static clock
      this.ctx.drawImage(this.mapBackgroundImage, 0, 0, this.canvas.width, this.canvas.height);

      // NO additional tiles should be drawn - the full map has everything
      return; // Early return to prevent any fallback rendering
    }

    // Fallback path only executes if full map fails to load
    console.warn('Using fallback tile rendering - full map not loaded');
    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;

    for (let y = 0; y < this.MAP_ROWS; y++) {
      for (let x = 0; x < this.MAP_COLS; x++) {
        const tx = x * tileWidth;
        const ty = y * tileHeight;

        // Check if this is a center tile (row 1-3, col 1-3)
        const isCenterTile = x >= 1 && x <= 3 && y >= 1 && y <= 3;

        if (isCenterTile && this.centerImagesLoaded) {
          const centerImg = this.centerTileImages.get(`${y},${x}`);
          if (centerImg && centerImg.complete) {
            this.ctx.drawImage(centerImg, tx, ty, tileWidth, tileHeight);
          } else {
            this.drawGrassTile(tx, ty, tileWidth, tileHeight);
          }
        } else {
          this.drawGrassTile(tx, ty, tileWidth, tileHeight);
        }
      }
    }
  }

  /**
   * Draw a grass tile (for border tiles) - supports rectangular tiles
   */
  private drawGrassTile(x: number, y: number, width: number, height: number): void {
    if (this.grassImageLoaded && this.grassTileImage && this.grassTileImage.complete) {
      // Draw grass tile image
      this.ctx.drawImage(this.grassTileImage, x, y, width, height);
    } else {
      // Fallback to subtle gradient if image not loaded
      const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, '#8BA870');
      gradient.addColorStop(1, '#6B8850');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, width, height);
    }
  }

  /**
   * Render clock at bottom center with rotating hand showing week progress
   * Full revolution = 1 week (600 time units)
   *
   * Note: jones_map_grass.png already contains the complete static clock at (2,4).
   * When using full map: Draw NOTHING (clock is already in the map image)
   * When using fallback tiles: Draw complete animated clock
   */
  private renderClock(): void {
    // FIX: Don't draw ANY clock elements when using full map
    // The full map already has a complete, perfect clock baked in
    if (this.mapBackgroundLoaded) {
      return; // Skip all clock rendering - no double layers!
    }

    // Fallback mode only: Draw complete animated clock
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;

    // Position at bottom center (tile 2, 4)
    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;
    const clockX = 2 * tileWidth + tileWidth / 2;
    const clockY = 4 * tileHeight + tileHeight / 2;

    // Get game time info - full revolution per week
    const currentWeek = this.game.currentWeek;
    const timeRemaining = this.game.timeUnitsRemaining;
    const timeUsed = 600 - timeRemaining; // 600 units per week

    // Calculate rotation angle (0-360 degrees for full week)
    const weekProgress = timeUsed / 600; // 0.0 to 1.0
    const rotationAngle = weekProgress * Math.PI * 2; // Convert to radians

    const clockRadius = Math.min(tileWidth, tileHeight) * 0.35;

    // Draw clock background image
    const clockBotImg = this.clockImages.get('bottom');

    if (clockBotImg && clockBotImg.complete) {
      this.ctx.drawImage(
        clockBotImg,
        clockX - clockRadius,
        clockY - clockRadius,
        clockRadius * 2,
        clockRadius * 2
      );
    } else {
      // Fallback: draw simple clock face
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(clockX, clockY, clockRadius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(clockX, clockY, clockRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw clock hand (starts at top, rotates clockwise)
    this.ctx.save();
    this.ctx.translate(clockX, clockY);
    this.ctx.rotate(rotationAngle - Math.PI / 2); // Start at 12 o'clock

    // Clock hand
    const handLength = clockRadius * 0.7;
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(handLength, 0);
    this.ctx.stroke();

    // Clock hand tip (arrow)
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.arc(handLength, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Center dot
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(clockX, clockY, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Week number below clock
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.roundRect(clockX - 35, clockY + clockRadius + 5, 70, 20, 5);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`Week ${currentWeek}`, clockX, clockY + clockRadius + 15);

    this.ctx.restore();
  }

  /**
   * Render buildings layer with Java graphics
   * Updated for rectangular tiles (155x96)
   */
  private renderBuildings(): void {
    // Calculate tile dimensions based on canvas size
    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;
    const buildings = this.game.map.getAllBuildings();

    if (buildings.length === 0) {
      console.warn('No buildings to render!');
    }

    const playerPositions = this.game.players.map(p => ({ x: p.state.position.x, y: p.state.position.y }));

    buildings.forEach((building) => {
      const pos = building.position;
      const x = pos.x * tileWidth;
      const y = pos.y * tileHeight;

      const isPlayerOnBuilding = playerPositions.some(p => p.x === pos.x && p.y === pos.y);

      const padding = 10;
      const bx = x + padding;
      const by = y + padding;
      const bw = tileWidth - (padding * 2);
      const bh = tileHeight - (padding * 2);

      this.ctx.save();

      // Disable image smoothing for crisp pixel art
      this.ctx.imageSmoothingEnabled = false;

      // Get building image
      const img = this.buildingImages.get(building.type);

      if (img && img.complete && this.imagesLoaded) {
        // Draw building image
        this.ctx.drawImage(img, bx, by, bw, bh);
      } else {
        // Fallback to colored rectangle if image not loaded
        const style = this.getBuildingStyle(building.type);
        const gradient = this.ctx.createLinearGradient(bx, by, bx, by + bh);
        gradient.addColorStop(0, style.colorTop);
        gradient.addColorStop(1, style.colorBottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(bx, by, bw, bh);
      }

      // Draw subtle border only if player is on building
      if (isPlayerOnBuilding) {
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);
      }

      // Draw building name label with semi-transparent background
      const namePlateHeight = 20;
      const namePlateY = by + bh - namePlateHeight;

      // Nameplate background - semi-transparent for better blending
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(bx, namePlateY, bw, namePlateHeight);

      // No border on nameplate for cleaner look

      // Building name text - bright and clear
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Truncate long names
      let displayName = building.name;
      if (displayName.length > 13) {
        displayName = displayName.substring(0, 11) + '..';
      }

      this.ctx.fillText(displayName, x + tileWidth / 2, namePlateY + namePlateHeight / 2);

      this.ctx.restore();
    });
  }

  /**
   * Get visual style for building type with gradients
   */
  private getBuildingStyle(type: string): { colorTop: string; colorBottom: string; accentColor: string } {
    const styles: Record<string, { colorTop: string; colorBottom: string; accentColor: string }> = {
      'EMPLOYMENT_AGENCY': {
        colorTop: '#5BA3E8',
        colorBottom: '#3A7BC8',
        accentColor: '#87CEEB',
      },
      'FACTORY': {
        colorTop: '#A0522D',
        colorBottom: '#6B3410',
        accentColor: '#CD853F',
      },
      'BANK': {
        colorTop: '#FFE44D',
        colorBottom: '#D4AF37',
        accentColor: '#FFD700',
      },
      'COLLEGE': {
        colorTop: '#B294E8',
        colorBottom: '#7B5DB8',
        accentColor: '#DDA0DD',
      },
      'CLOTHES_STORE': {
        colorTop: '#FF8ACC',
        colorBottom: '#E85AA0',
        accentColor: '#FFB6D9',
      },
      'RESTAURANT': {
        colorTop: '#FF7A5C',
        colorBottom: '#E8553A',
        accentColor: '#FFA07A',
      },
      'RENT_AGENCY': {
        colorTop: '#4AE864',
        colorBottom: '#2AAA3F',
        accentColor: '#90EE90',
      },
      'LOW_COST_APARTMENT': {
        colorTop: '#BEBEBE',
        colorBottom: '#888888',
        accentColor: '#D3D3D3',
      },
      'SECURITY_APARTMENT': {
        colorTop: '#8FA9B8',
        colorBottom: '#5E7A8A',
        accentColor: '#B0C4DE',
      },
    };
    return styles[type] || {
      colorTop: '#888888',
      colorBottom: '#555555',
      accentColor: '#AAAAAA',
    };
  }

  /**
   * Render players layer - Retro pixel sprites with smooth movement animation
   * Updated for rectangular tiles (155x96)
   */
  private renderPlayers(timestamp: number): void {
    // Calculate tile dimensions based on canvas size
    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;

    this.game.players.forEach((player) => {
      const pos = player.state.position;

      // Get animated position for smooth movement
      const animPos = this.getAnimatedPlayerPosition(
        player.id,
        pos,
        timestamp
      );

      this.ctx.save();
      this.ctx.imageSmoothingEnabled = false;

      // Calculate pixel-aligned position (center of tile) using animated position
      const centerX = Math.floor(animPos.x * tileWidth + tileWidth / 2);
      const centerY = Math.floor(animPos.y * tileHeight + tileHeight / 2);

      // Scale sprite based on smaller dimension to fit in tile
      const minTileDim = Math.min(tileWidth, tileHeight);
      const spriteSize = Math.floor(minTileDim * 0.4);
      const headRadius = spriteSize * 0.35;
      const bodyHeight = spriteSize * 0.5;

      // Draw player as character-like avatar
      // Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY + spriteSize * 0.4, spriteSize * 0.4, spriteSize * 0.15, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Body (rounded rectangle)
      const bodyY = centerY - bodyHeight / 4;
      const bodyWidth = spriteSize * 0.5;
      this.ctx.fillStyle = player.color;
      this.ctx.beginPath();
      this.ctx.roundRect(centerX - bodyWidth / 2, bodyY, bodyWidth, bodyHeight, 8);
      this.ctx.fill();

      // Body highlight
      const bodyGradient = this.ctx.createLinearGradient(
        centerX - bodyWidth / 2, bodyY,
        centerX + bodyWidth / 2, bodyY + bodyHeight
      );
      bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      bodyGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      this.ctx.fillStyle = bodyGradient;
      this.ctx.fill();

      // Head (circle)
      const headY = centerY - spriteSize * 0.3;
      this.ctx.fillStyle = player.color;
      this.ctx.beginPath();
      this.ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Head highlight (3D effect)
      const headGradient = this.ctx.createRadialGradient(
        centerX - headRadius * 0.3, headY - headRadius * 0.3, 0,
        centerX, headY, headRadius
      );
      headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      headGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      headGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      this.ctx.fillStyle = headGradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(centerX - headRadius * 0.3, headY - headRadius * 0.1, headRadius * 0.2, 0, Math.PI * 2);
      this.ctx.arc(centerX + headRadius * 0.3, headY - headRadius * 0.1, headRadius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Pupils
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(centerX - headRadius * 0.3, headY - headRadius * 0.1, headRadius * 0.1, 0, Math.PI * 2);
      this.ctx.arc(centerX + headRadius * 0.3, headY - headRadius * 0.1, headRadius * 0.1, 0, Math.PI * 2);
      this.ctx.fill();

      // Player name with better styling
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      // Name background (rounded)
      const nameWidth = this.ctx.measureText(player.name).width;
      const nameY = centerY + spriteSize * 0.3;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.beginPath();
      this.ctx.roundRect(centerX - nameWidth / 2 - 4, nameY, nameWidth + 8, 14, 4);
      this.ctx.fill();

      // Name text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(player.name, centerX, nameY + 2);

      this.ctx.restore();
    });
  }

  /**
   * Render effects layer
   */
  private renderEffects(): void {
    // EffectsRenderer handles its own rendering
    this.effectsRenderer.render();
  }

  /**
   * Render UI layer
   */
  private renderUI(): void {
    if (this.showFPS) {
      this.renderFPSCounter();
    }
  }

  /**
   * Render FPS counter
   */
  private renderFPSCounter(): void {
    this.ctx.save();

    // Draw background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 80, 30);

    // Draw FPS text
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 15, 15);

    this.ctx.restore();
  }

  /**
   * Update FPS counter
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFPSUpdate;

    if (elapsed >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  /**
   * Handle game state change - analyzes changes and triggers appropriate renders
   */
  onGameStateChange(game: IGame): void {
    this.game = game;

    // Serialize current state for comparison
    const currentState = this.serializeGameState(game);

    if (this.previousGameState) {
      // Detect changes and trigger effects
      this.detectAndAnimateChanges(this.previousGameState, currentState);
    }

    this.previousGameState = currentState;
  }

  /**
   * Serialize game state for change detection
   */
  private serializeGameState(game: IGame): string {
    return JSON.stringify({
      week: game.currentWeek,
      timeUnitsRemaining: game.timeUnitsRemaining,
      players: game.players.map((p) => ({
        id: p.id,
        cash: p.state.cash,
        health: p.state.health,
        happiness: p.state.happiness,
        education: p.state.education,
        career: p.state.career,
        position: { x: p.state.position.x, y: p.state.position.y },
      })),
    });
  }

  /**
   * Detect changes and trigger animations
   */
  private detectAndAnimateChanges(prevState: string, currentState: string): void {
    try {
      const prev = JSON.parse(prevState);
      const current = JSON.parse(currentState);

      // Check each player for changes
      current.players.forEach((currentPlayer: any, index: number) => {
        const prevPlayer = prev.players[index];
        if (!prevPlayer) return;

        // Position changed?
        if (
          prevPlayer.position.x !== currentPlayer.position.x ||
          prevPlayer.position.y !== currentPlayer.position.y
        ) {
          this.animatePlayerMovement(
            prevPlayer.position.x,
            prevPlayer.position.y,
            currentPlayer.position.x,
            currentPlayer.position.y,
            currentPlayer.id
          );
        }

        // Cash changed?
        if (prevPlayer.cash !== currentPlayer.cash) {
          const diff = currentPlayer.cash - prevPlayer.cash;
          const tileSize = 64 * this.pixelScale;
          const x = currentPlayer.position.x * tileSize + tileSize / 2;
          const y = currentPlayer.position.y * tileSize + tileSize / 2;
          this.effectsRenderer.createMoneyEffect(x, y, Math.abs(diff), diff > 0);
        }

        // Health/Happiness/Education changed - show sparkle effect
        if (
          prevPlayer.health !== currentPlayer.health ||
          prevPlayer.happiness !== currentPlayer.happiness ||
          prevPlayer.education !== currentPlayer.education
        ) {
          const tileSize = 64 * this.pixelScale;
          const x = currentPlayer.position.x * tileSize + tileSize / 2;
          const y = currentPlayer.position.y * tileSize + tileSize / 2;
          this.effectsRenderer.createSparkleEffect(x, y);
        }
      });
    } catch (error) {
      console.error('Error detecting state changes:', error);
    }
  }

  /**
   * Animate player movement from one position to another
   */
  animatePlayerMovement(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    playerId?: string
  ): void {
    const duration = 300; // ms
    const tweenId = playerId ? `player-move-${playerId}` : 'player-move';

    this.animationEngine.createTween(
      tweenId,
      fromX,
      fromY,
      toX,
      toY,
      duration,
      Easing.easeInOutQuad,
      undefined, // onUpdate not needed for now
      () => {
        // Movement complete
      }
    );
  }

  /**
   * Show a visual effect at a specific position
   */
  showEffect(effectType: 'sparkle' | 'glow' | 'money', x: number, y: number, data?: any): void {
    switch (effectType) {
      case 'sparkle':
        this.effectsRenderer.createSparkleEffect(x, y, data?.color);
        break;
      case 'glow':
        this.effectsRenderer.createGlowEffect(x, y, data?.color);
        break;
      case 'money':
        this.effectsRenderer.createMoneyEffect(x, y, data?.amount || 0, data?.gained ?? true);
        break;
    }
  }

  /**
   * Highlight a building at a specific position
   */
  highlightBuilding(x: number, y: number, color?: string): void {
    this.effectsRenderer.highlightBuilding(x, y, { color: color || '#FFFF00' });
  }

  /**
   * Remove highlight from a building
   */
  removeHighlight(x: number, y: number): void {
    this.effectsRenderer.removeHighlight(x, y);
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    this.effectsRenderer.clearHighlights();
  }

  /**
   * Toggle FPS display
   */
  toggleFPS(show?: boolean): void {
    this.showFPS = show ?? !this.showFPS;
    this.effectsRenderer.toggleFPS(show);
  }

  /**
   * Handle canvas resize
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Set layer visibility
   */
  setLayerVisible(layerName: string, visible: boolean): void {
    const layer = this.layers.get(layerName);
    if (layer) {
      layer.visible = visible;
    }
  }

  /**
   * Get layer configuration
   */
  getLayer(layerName: string): RenderLayer | undefined {
    return this.layers.get(layerName);
  }

  /**
   * Get all layers
   */
  getLayers(): Map<string, RenderLayer> {
    return new Map(this.layers);
  }

  /**
   * Get animation engine (for testing/debugging)
   */
  getAnimationEngine(): AnimationEngine {
    return this.animationEngine;
  }

  /**
   * Get effects renderer (for testing/debugging)
   */
  getEffectsRenderer(): EffectsRenderer {
    return this.effectsRenderer;
  }

  /**
   * Get canvas (for testing)
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get render stats
   */
  getStats(): RenderStats {
    return {
      fps: this.currentFPS,
      frameCount: this.frameCount,
      renderTime: this.lastRenderTime,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.animationEngine.clear();
    this.effectsRenderer.clear();
    this.layers.clear();
    this.previousGameState = null;
  }
}
